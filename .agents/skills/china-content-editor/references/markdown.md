# 已核对的内容格式

依据：`apps/two-weeks-in-china/lib/content/{core,types}.ts`、
`app/[lang]/[...slug]/page.tsx`、`mdx-components.tsx`、`scripts/content/check.ts`。
修改渲染器后重新核对本表。

| 能力 | 当前支持与限制 |
| --- | --- |
| Frontmatter | `---` 包裹严格 JSON，不能写普通 YAML、注释或尾逗号 |
| 字段 | `path`, `title`, `subtitle`, `metadata`, `createdAt`, `updatedAt`, `draft`，旧文章可含 `id`；未知顶层字段拒绝 |
| 路径 | 文件名与 `path` 精确对应；en/zh；不可使用 eligibility 路径；不能让 `.md` 和 `.mdx` 占同一路径 |
| Metadata | 菜单使用 icon/order；tags 可用；任意新增字段不会自动显示或获得业务校验 |
| Markdown | 标题、段落、强调、引用、列表、链接、图片、代码块 |
| GFM | 表格、任务列表、删除线、自动链接、脚注语法；不是 Mermaid 渲染器 |
| `.md` 安全边界 | 按 Markdown 编译；不能靠 JSX、import、表达式或原始 HTML 调用组件 |
| `.mdx` | 可执行代码，仅审查过的仓库内容使用；不要为纯排版转换旧文件格式 |
| InfoBox | `type="info\|warning\|success"`（选择一个）、可选 title、children |
| LinkCard | title、href 必填；description、icon 可选 |
| Section | title、children；已有标题层级应保持合理 |
| 图像 | Markdown `![alt](/content/topic/image.webp)`；路径相对于 app 的 public，不写 public 前缀 |
| 来源/图注 | 用普通段落、链接或脚注；当前没有自动来源卡片、图库、图片许可或日期校验 |
| 样式 | 标题、段落、列表、链接、引用有映射；表格/图片没有专用映射，必须实际检查窄屏表现 |

当前链接组件仅透传 href/children，未保留脚注生成的 id 等属性，因此不能假定
脚注返回跳转和无障碍关联完整。默认使用普通来源链接；采用脚注前应修复属性透传
并进行浏览器验证。模板使用普通链接，不依赖脚注回跳。

页面已经渲染 frontmatter 标题为 h1，正文从 h2 开始。菜单分组：plan-trip、
destinations、digital-survival、itineraries、entry-logistics、k-visa-business。
新文章放在已有分组；新分组需要代码与字典配套变更。

LinkCard 可用图标：plane、train、smartphone、wallet、map-pin、info、check、warning。
这与菜单图标集合不同，不要直接套用菜单 icon。

## 可复制语法（占位符，不是旅游事实）

```markdown
## 三步完成

1. 准备材料。[S1](OFFICIAL_ARTICLE_URL)
2. 在官方渠道核对适用条件。
3. 按官方步骤办理。

> 注意：在这里解释来源中确实存在的限制。

![图中步骤的文字概述](/content/topic/steps.svg)

图：依据 [发布机构的具体页面](OFFICIAL_ARTICLE_URL) 绘制的示意图；
编者绘制，核验于 YYYY-MM-DD。下方提供同样步骤的文字说明。

| 情形 | 需要做什么 |
| --- | --- |
| 来源明确支持的情形 | 与来源一致的操作 |

- **S1** — 发布机构，《具体页面标题》，发布于 YYYY-MM-DD（或未标注）；
    [官方原文](OFFICIAL_ARTICLE_URL)，核验于 YYYY-MM-DD。
```

提交文章前替换所有占位符并创建真实图像文件。正文中不要写“已核验”而没有实际取证。
若必须加入图组、可折叠步骤、来源卡片等，先给出当前组件无法满足的具体需求；
同步组件、类型、格式文档与针对安全/溢出/无障碍的验证，不引入远程执行内容。
