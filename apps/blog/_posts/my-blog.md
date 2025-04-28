---
title: '博客技术揭秘：驱动这个博客的技术栈'
excerpt: '深入了解构建和维护这个博客所使用的技术和自动化流程，重点关注性能、开发者体验和内容工作流。'
date: '2025-04-28T10:44:49.816Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: 'https://ban12.com/api/og?title=blog.ban12.com'
---

大家好！经常有人问我构建和运行项目时使用了哪些工具和技术。由于这个博客是我在线形象的核心部分，我觉得分享一下驱动它的技术栈幕后细节会很有趣。

在选择技术栈时，我的主要目标是：

1.  **性能：** 快速的加载时间对用户体验和 SEO 至关重要。
2.  **开发者体验 (DX):** 使用现代化的工具，让开发过程愉快且高效。
3.  **内容工作流：** 使用熟悉的格式，让撰写、更新和发布文章变得简单。
4.  **可扩展性与可维护性：** 选择一个能够成长并且易于管理的技术栈。

那么，让我们开始吧！

## 核心框架：Next.js (基于 React)

博客的基础是 **Next.js**，一个流行的 React 框架。我选择 Next.js 有几个原因：

*   **静态站点生成 (SSG):** 大多数博客页面在构建时被预渲染成静态 HTML 文件。这意味着访问者可以获得极快的页面加载速度，因为内容是直接从 CDN 提供的，无需服务器实时渲染。
*   **[Incremental Static Regeneration (ISR)](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration):** 按需重新生成静态页面，低成本生成内容而且确保内容始终是最新的。
*   **API 路由:** Next.js 允许在同一个项目中轻松创建 Serverless API 端点。正如你将在下面看到的，这对于按需重新验证等功能至关重要。
*   **基于文件的路由:** 创建新页面和文章非常直观。
*   **丰富的生态系统:** 基于 React 构建，可以受益于庞大的组件和库生态系统。

## 内容：Markdown & MDX

博客文章主要使用 **Markdown (`.md`)** 编写。它简单、被广泛采用，并且专注于内容而非复杂的格式。这些文件直接存放在项目仓库中（`apps/blog/_posts/`）。

```
apps/
└── blog/
    ├── _posts/
    │   ├── my-first-post.md
    │   └── another-great-topic.mdx
    ├── app/
    │   └── api/revalidate/route.ts
    ├── components/
    └── ...
```

这种基于 Git 的方法充当了一个简单有效的内容管理系统 (CMS)。

## 保持内容新鲜：按需重新验证 (On-Demand Revalidation)

由 Next.js 和我的设置所实现的最酷的功能之一是 **按需重新验证**。

当我构建网站时，Next.js 会为每篇博文生成静态 HTML 页面。但是，当我更新文章或发布新文章时会发生什么呢？重新构建整个网站可能非常耗时。

取而代之的是，我使用了一个 **GitHub Actions 工作流** (`.github/workflows/blog-revalidate.yml`)。它的工作原理如下：

1.  **触发:** 每当有更改被推送到 `main` 分支，并且这些更改影响到 `apps/blog/_posts/` 目录（我的 Markdown 内容）下的文件时，该工作流就会自动运行。
2.  **检测更改:** 它会精确识别出在这次推送中哪些 `.md` 或 `.mdx` 文件被修改了。
3.  **提取 Slug:** 对于每个更改的文件，它会提取文章的 slug（例如，`my-cool-post.md` 变成 `my-cool-post`）。
4.  **调用重新验证 API:** 它向我博客上的特定 API 端点 (`/api/revalidate`) 发送一个 `PUT` 请求。该请求包含：
    *   一个需要重新验证的 URL 路径列表（例如 `/posts/my-cool-post`）。
    *   一个标签 (`posts`)，用于可能重新验证相关的索引页面。
    *   一个安全存储在 GitHub Secrets 中的密钥令牌 (`REVALIDATE_TOKEN`)，用于授权该请求。
5.  **Next.js 重新验证:** Next.js 后端接收到这个请求，验证令牌，并通知托管平台（很可能是 Vercel）为指定的路径重新生成静态页面，而**无需**进行完整的网站重建。

这意味着更新内容在推送更改后的几秒钟内就能上线，同时仍然保持静态托管的优势！

```yaml
# .github/workflows/blog-revalidate.yml 文件片段
# ... (检测更改文件的步骤) ...

- name: Call Revalidation API # 调用重新验证 API
  if: steps.changed-markdown-files.outputs.any_changed == 'true'
  env:
    ALL_CHANGED_FILES: ${{ steps.changed-markdown-files.outputs.all_changed_files }}
    REVALIDATE_TOKEN: ${{ secrets.REVALIDATE_TOKEN }} # 使用 GitHub Secret 存储令牌
    REVALIDATE_URL: 'https://blog.ban12.com/api/revalidate' # 我的生产环境 URL
  run: |
    # ... (构建包含路径/标签的 JSON 负载的脚本) ...

    # 使用 curl 发起 API 调用
    curl -X PUT \
      --url "${REVALIDATE_URL}" \
      -H "Authorization: ${REVALIDATE_TOKEN}" \
      -H "Content-Type: application/json" \
      --fail --show-error --silent \
      --data "$json_payload"
```

## 自动化与部署：GitHub Actions & Vercel

*   **GitHub Actions:** 如前所述，这是 CI/CD (持续集成/持续部署) 流程的核心，特别用于处理内容更新和重新验证触发。
*   **托管:** 虽然工作流文件中没有明确显示，但这样的设置与 **Vercel** 是完美的搭档。Vercel 由 Next.js 的创建者构建，对 SSG、API 路由和按需重新验证提供一流的支持。它提供了从 GitHub 推送直接无缝部署、全球 CDN 和开箱即用的 HTTPS。

## 未来计划

> **TODO:** 目前，博客主要使用标准的 Markdown。虽然工作流*能够*检测到 `.mdx` 文件，但我计划将来通过充分利用 **MDX** 来增强文章内容。这将允许在 Markdown 内容中直接嵌入交互式 React 组件，以获得更丰富的示例和体验。

## 总结

这个技术栈（Next.js、Markdown、GitHub Actions、Vercel）提供了性能、开发者体验和内容管理简便性的强大组合。自动化的重新验证工作流确保了内容更新能够快速反映，而不会牺牲静态站点的优势。这是一个我非常满意的设置，它让我能够专注于最重要的事情：编写内容。

如果你对这个设置有任何疑问，欢迎提出！
