---
title: "Intl.Segmenter"
excerpt: '使用 Intl.Segmenter 替代 split 方法分割文本'
date: '2025-04-28T10:27:31.155Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: 'https://ban12.com/api/og?title=Intl.Segmenter%20instead%20of%20splitText'
---

# 使用 `Intl.Segmenter` 进行智能文本分割：告别简单的 `split`

update: [GSAP](https://gsap.com/pricing/)已经面向所有人免费，包括 [SplitText](https://gsap.com/docs/v3/Plugins/SplitText) 插件，更新到 `3.13.0` 及以上就可以使用了，推荐使用成熟的方案它包含了许多边缘情况的处理

在 Web 开发中，我们经常需要将文本分割成更小的单元，例如为了实现逐字动画、文本分析或处理用户输入。传统的 JavaScript `String.prototype.split('')` 方法虽然简单，但它在处理复杂语言（如包含表情符号、组合字符的语言）时会遇到问题，因为它只是简单地按 Unicode 码位分割，而不是按用户感知的字符（字形）分割。

此外，市面上可能存在一些更高级的文本分割库或服务（有时称为 `splitText` 类功能），但它们可能存在以下缺点：

1.  **收费：** 一些功能强大的库或 API 可能是商业产品，需要付费使用。
2.  **功能简单：** 免费或简单的实现可能仍然停留在按固定字符（如空格）分割，或者像 `split('')` 一样进行简单的按码位切割，无法正确处理多语言环境下的词语或句子边界。

## `Intl.Segmenter`：原生且强大的解决方案

幸运的是，现代 JavaScript 提供了一个内置的解决方案：`Intl.Segmenter` 对象。这是一个强大的 API，属于 `Intl` (Internationalization) 命名空间，专门用于进行**语言敏感**的文本分割。

`Intl.Segmenter` 的核心优势在于：

*   **语言感知：** 它理解不同语言的规则，能够根据特定语言的语法和习惯正确地分割文本。
*   **多种分割粒度：** 你可以指定分割的粒度，将字符串分割成有意义的片段：
    *   `grapheme`：按用户感知的字符（字形）分割，能正确处理表情符号和组合字符。
    *   `word`：按单词分割，并能根据不同语言的规则识别单词边界（例如，泰语、日语等没有明显空格分隔的语言）。
    *   `sentence`：按句子分割，同样能根据语言特性识别句子结束符。
*   **原生支持：** 无需引入外部库或支付费用，它是现代浏览器和 Node.js 环境的标准组成部分。

## 示例：使用 `Intl.Segmenter` 分割 DOM 文本

下面的 TypeScript 代码演示了如何使用 `Intl.Segmenter` 来递归地分割一个 HTML 元素内所有文本节点的内容，并将每个片段包裹在 `<span>` 标签中。这对于实现文本动画或样式化非常有用。

```typescript
const splitText = (
  container: Element,
  granularity: Intl.SegmenterOptions["granularity"],
  locale = ["zh-Hans-CN", "en", "fr"],
  spanClass = `split-${granularity}`,
) => {
  // 1. Initialize the Segmenter
  // It's more efficient to create it once if processing many nodes.
  const segmenter = new Intl.Segmenter(locale, { granularity });

  // 2. Recursive function to process nodes
  function processNode(node: Node, fragment: DocumentFragment) {
    // Iterate over a *static copy* of the childNodes.
    // Modifying the DOM while iterating over the live NodeList can cause issues.
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === Node.TEXT_NODE) {
        // 3. Process Text Nodes
        const text = child.nodeValue;
        if (text && text.trim() !== "") {
          // Avoid processing empty/whitespace-only nodes if desired
          const segments = segmenter.segment(text);
          for (const { segment } of segments) {
            if (segment.trim() === "") {
              fragment.appendChild(document.createTextNode(segment));
            } else {
              const span = document.createElement("span");
              span.textContent = segment;
              span.classList.add(spanClass);
              fragment.appendChild(span);
            }
          }
        } else if (text !== null) {
          // Keep whitespace nodes if needed for layout
          fragment.appendChild(document.createTextNode(text));
          // Or skip if you want to collapse whitespace:
          // if (text && text.trim() !== '') { fragment.appendChild(document.createTextNode(text)); }
        }
        // The original text node is not added to the fragment,
        // effectively replacing it with the new spans (or nothing).
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childElement = child as Element;
        // 4. Process Element Nodes (Recursively)
        // Create a new element of the same type to append to the fragment
        const newElement = document.createElement(childElement.tagName);
        // Copy attributes
        for (let i = 0; i < childElement.attributes.length; i++) {
          const attr = childElement.attributes[i];
          newElement.setAttribute(attr.name, attr.value);
        }

        // Create a sub-fragment for this element's children
        const subFragment = document.createDocumentFragment();
        // Recurse into the original child element's children
        processNode(child, subFragment);
        // Append the processed children to the new element
        newElement.appendChild(subFragment);
        // Append the fully processed new element to the main fragment
        fragment.appendChild(newElement);
      } else {
        // 5. Preserve other node types (like comments)
        // Clone them and append to the fragment
        fragment.appendChild(child.cloneNode(true));
      }
    }
  }

  // 6. Main execution
  // Create the main DocumentFragment to build the new content
  const mainFragment = document.createDocumentFragment();

  // Start the recursive processing from the container element
  processNode(container, mainFragment);

  // 7. Replace the container's original content with the new structure
  // Using replaceChildren is generally preferred over innerHTML = '' + appendChild
  container.replaceChildren(mainFragment);
};

// --- 使用示例 ---
/*
假设 HTML 结构如下：
<div id="myText">
  这是 <span>一些</span> 示例文本，包含 English words 和 😊 表情。
  <p>这是第二段。</p>
</div>

// 按字分割（正确处理表情和多语言）
const containerElement = document.querySelector('#myText');
if (containerElement) {
  splitText(containerElement, 'grapheme');
}

// 按词分割
if (containerElement) {
  splitText(containerElement, 'word', ['zh-Hans-CN', 'en']);
}

// 按句分割
if (containerElement) {
  splitText(containerElement, 'sentence', ['zh-Hans-CN', 'en']);
}
*/
```

当需要进行超越简单字符分割的文本处理时，`Intl.Segmenter` 提供了一个强大、灵活且符合标准的本地化解决方案，是替代传统 `split` 方法或潜在付费库的理想选择。

```typescript
// 例如使用 motion 让它们动起来
animate(
  containerElement.querySelectorAll(".split-word"),
  { opacity: [0, 1], y: [10, 0] },
  {
    type: "spring",
    duration: 2,
    bounce: 0,
    delay: stagger(0.05),
  }
)
```

# Reference

[MDN Intl.Segmenter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)

[Motion](https://examples.motion.dev/react/split-text)
