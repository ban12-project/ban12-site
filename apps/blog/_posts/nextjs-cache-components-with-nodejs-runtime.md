---
title: "Next.js 16 缓存组件回归 Node.js 运行时深度解析"
excerpt: "深入了解 Next.js 16 缓存组件的底层原理，以及为什么它目前仅支持 Node.js 运行时。"
date: "2026-02-24T11:16:14.816Z"
author:
  name: Coda
  picture: "https://avatars.githubusercontent.com/u/23135654?v=4"
ogImage:
  url: "https://ban12.com/api/og?title=blog.ban12.com"
---

# 为什么 Next.js 16 的 Cache Components 不支持 Edge Runtime？

Next.js 16 引入了 `use cache` 指令，这套新架构允许开发者在同一个页面里混用静态和动态内容。虽然听起来很美好，但如果你尝试在开启 `use cache` 的同时把 runtime 改成 `edge`，Next.js 会直接报错：该特性目前仅支持 Node.js。

在大家都在推崇 Edge Computing 的今天，Next.js 为什么要“锁死”在 Node.js 上？翻开 [`packages/next/src/server/app-render`](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app-render/) 的源码，你会发现这其实是一个关于事件循环（Event Loop）微操的故事。

## 1. 背后原理：两阶段渲染与 PPR

要搞清楚 runtime 的限制，得先看 `use cache` 是怎么跑的。它其实是部分预渲染（PPR）的一环，将渲染过程拆成了两步：

1.  **静态阶段**：先把能确定的数据塞进 HTML 壳子，直接发给浏览器。
2.  **动态阶段**：处理那些被 Suspense 包裹或者标记为动态的数据（比如 cookies），等数据准备好后再把剩下的 RSC Payload 流式传过去。

为了实现这种“先给壳、后填肉”的效果，Next.js 玩了一些骚操作。它利用 `AsyncLocalStorage` 来监控当前的渲染上下文，一旦碰到调用动态 API，就抛出一个特殊的错误（`React.unstable_postpone`）或者给一个永远不返回的 Promise，强行让 React 在那儿“挖个坑”等填补。

## 2. 关键难点：怎么保证“肉”不迟到

问题在于，浏览器拿到 HTML 壳之后，服务器必须紧接着把动态数据传过去。如果中间断了或者卡了，用户就会看着白屏发呆。

在服务器端，这两步是独立的异步任务。Node.js 的事件循环调度有一个坑：如果你连着调两次 `setTimeout(fn, 0)`，并不能保证它们在同一次 Tick 里连着执行。Node.js 内部会给定时器打个时间戳（`_idleStart`），如果此时并发量很高，处理完第一个定时器后，Node.js 可能会跑去处理其他用户的请求，把你的第二个任务推到下一轮甚至更晚。

## 3. 底层 Hack：对齐时间戳

为了解决这个“任务插队”问题，Next.js 团队在 PR [#86093](https://github.com/vercel/next.js/pull/86093) 里直接去修改了 Node.js 定时器的私有属性。

代码逻辑大概是这样的：

```typescript
// https://github.com/vercel/next.js/blob/31b62520366aefef9d6800cd519157a16f958052/packages/next/src/server/app-render/app-render-scheduling.ts#L171
if (firstTimerIdleStart === null) {
  firstTimerIdleStart = timer._idleStart;
} else {
  // 强行把后续任务的时间戳改成跟第一个完全一致
  timer._idleStart = firstTimerIdleStart;
}
```

通过把时间戳改得一模一样，Node.js 底层的定时器堆（Timer Heap）就会认为这些任务是同时到达的，从而强制它们在同一个 Tick 里排他性地连贯执行。

## 4. 为什么 Edge Runtime 做不到？

理解了上面的底层逻辑，你就明白 Edge 为什么被抛弃了：

- **无法触及底层 API**：Edge Runtime（如 Cloudflare Workers 等基于 V8 Isolates 的环境）遵循的是 Web 标准 API，根本没有暴露 `_idleStart` 这种私有属性。你没法像在 Node.js 里那样去精细控制宏任务的执行时机。
- **AsyncLocalStorage 的深度依赖**：Next.js 全程靠 `AsyncLocalStorage` 追踪渲染状态。虽然 Edge 现在也支持这个 API，但在处理复杂的跨模块单例和混合加载机制时，原生的 Node.js 环境依然是最稳定的保证。
- **计算压力大**：`use cache` 缓存的是整个 React 组件树序列化后的 RSC Payload。为了安全，这些数据往往需要进行加密处理。Edge Runtime 通常有严格的 CPU 执行时间限制（比如 50ms），面对大型组件树的序列化和加解密，很容易因为超时而挂掉。

## 结语

Next.js 16 放弃 Edge Runtime 并不是技术倒退，而是一种清醒的权衡。为了追求极致的流式渲染体验，他们把 Node.js 的事件循环压榨到了极致，甚至不惜去修改私有属性。在 Web 标准 API 还无法提供这种高精度调度能力的今天，原生的 Node.js 依然是支撑这种复杂渲染架构的唯一选择。
