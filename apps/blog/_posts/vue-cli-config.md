---
title: '在 Vue CLI 愉快的配置 CDN'
excerpt: '📝 搬砖积累下来的实用配置，持续更新哈！！！webpack externals cdn 依赖 package.json 自动获取版本生成链接'
coverImage: 'https://cli.vuejs.org/cli-new-project.png'
date: '2021-05-23T10:50:11.181Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: 'https://cli.vuejs.org/cli-new-project.png'
---

# `vue.config.js`

搬砖时候时常有需要提取外部依赖使用 CDN 来加载的情况， 可以加快构建（build）速度和为线上产品提升加载速度（使用 CDN 后浏览器会缓存对应地址的资源）。如果你也有对应的需求可以共同探讨探讨对应实现。

---

如果你不了解下面列出来的构建配置，可以点击来细细挖坑

- [CDN](https://developer.mozilla.org/en-US/docs/Glossary/CDN)

- [semver(Semantic Versioning)](https://semver.org/)
  > 版本格式：主版本号.次版本号.修订号，版本号递增规则如下：
  >
  > 1. 主版本号：当你做了不兼容的 API 修改，
  > 2. 次版本号：当你做了向下兼容的功能性新增，
  > 3. 修订号：当你做了向下兼容的问题修正。
  >
  > 先行版本号及版本编译信息可以加到“主版本号.次版本号.修订号”的后面，作为延伸。
- [webpack externals](https://webpack.js.org/configuration/externals/)

- [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

---

## 要实现我们的功能大致有这几个步骤

1. 有个 `assets` 来配置哪些是需要提出来使用 CDN 的依赖
2. 获取 `assets` 内的依赖根据 `package.json` 的版本生成 CDN 链接
3. 在生产环境（开发环境不使用是应为开发需要使用源文件来提供报错信息方便调试，当然如果你不需要可以不根据环境使用提升开发构建速度）的时候使用 `html-webpack-plugin` 提供的接口输出到 `dist/index.html`。

---

## 我的实现(欢迎 [GitHub](https://github.com/NavOrange/blog/issues) 交流学习哈 这个是地址可以直接提交 `issues` [https://github.com/NavOrange/blog/issues](https://github.com/NavOrange/blog/issues) 如果有错误请友好指出 🙏 感谢大佬！

---

## `vue.config.js`

```javascript
'use strict'

const isProd = process.env.NODE_ENV === 'production' // 是否是生产环境

/**
 * 获取版本的工具函数
 * @params {string} packageName
 * @return {string} version
 */
const getVersion = ((dependencies) => (packageName) => {
  if (dependencies[packageName]) {
    // https://docs.npmjs.com/cli/v6/using-npm/semver#ranges
    return semver.minVersion(dependencies[packageName])
  } else {
    throw new Error(`not found package: ${packageName}`)
  }
})(require('./package.json').dependencies)

/**
 * 生成 CDN 域名的 preconnect dns-prefetch links
 * https://developer.mozilla.org/zh-CN/docs/Web/Performance/dns-prefetch
 * @return {string[]}
 */
const genLinks = () => {
  const rels = ['preconnect', 'dns-prefetch']
  const hrefs = ['https://cdnjs.cloudflare.com/', 'https://unpkg.com/']

  return rels.reduce(
    (result, rel) =>
      result.concat(hrefs.map((href) => `<link href="${href}" rel="${rel}">`)),
    [],
  )
}

const assetsCDN = {
  links: [...genLinks()],
  // webpack externals
  externals: {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    vuex: 'Vuex',
    axios: 'axios',
    nprogress: 'NProgress',
  },
  css: [
    `https://cdnjs.cloudflare.com/ajax/libs/nprogress/${getVersion(
      'nprogress',
    )}/nprogress.min.css`,
  ],
  js: [
    `https://cdnjs.cloudflare.com/ajax/libs/vue/${getVersion(
      'vue',
    )}/vue.runtime.min.js`,
    `https://unpkg.com/vue-router@${getVersion(
      'vue-router',
    )}/dist/vue-router.min.js`,
    `https://unpkg.com/vuex@${getVersion('vuex')}/dist/vuex.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/axios/${getVersion(
      'axios',
    )}/axios.min.js`,
    `https://cdnjs.cloudflare.com/ajax/libs/nprogress/${getVersion(
      'nprogress',
    )}/nprogress.min.js`,
  ],
}

module.exports = {
  // ... other code

  chainWebpack(config) {
    // 添加 assets 到 html-webpack-plugin(题外话这个好像是使用的 ejs 的模版语法, 如有不对请告知)
    config.when(isProd, (config) => {
      config.plugin('html').tap((args) => {
        args[0].cdn = assetsCDN
        args[0].info = `app-version: ${
          process.env.npm_package_version
        } build-date: ${new Date().toLocaleString()}`
        return args
      })

      config.externals(assetsCDN.externals)
    })
  },

  // ... other code
}
```

## `public/index.html`

```html
<!doctype html>
<html lang="en" data-info="<%= htmlWebpackPlugin.options.info %>">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1.0,viewport-fit=cover"
    />
    <link rel="icon" href="<%= BASE_URL %>favicon.ico" />
    <title><%= webpackConfig.name %></title>
    <!-- links -->
    <% for (var i in htmlWebpackPlugin.options.cdn &&
    htmlWebpackPlugin.options.cdn.links) { %> <%=
    htmlWebpackPlugin.options.cdn.links[i] %> <% } %>
    <!-- CDN css -->
    <% for (var i in htmlWebpackPlugin.options.cdn &&
    htmlWebpackPlugin.options.cdn.css) { %>
    <link rel="stylesheet" href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" />
    <% } %>
  </head>
  <body>
    <noscript>
      <strong
        >We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work
        properly without JavaScript enabled. Please enable it to
        continue.</strong
      >
    </noscript>
    <div id="app"></div>
    <!-- CDN js -->
    <% for (var i in htmlWebpackPlugin.options.cdn &&
    htmlWebpackPlugin.options.cdn.js) { %>
    <script src="<%= htmlWebpackPlugin.options.cdn.js[i] %>"></script>
    <% } %>
    <!-- built files will be auto injected -->
  </body>
</html>
```

---

### ⚠️ 需要注意：更新依赖的时候需要确认 `package.json` 的对应版本号是正确的，不然开发和线上版本不一致可能造成事故！！！

至此，所有工作已经完成，又可以水一天了，快去看看生成的 `dist/index.html` 吧

have a nice day!

![473](/assets/blog/vue-cli-config/IMG_7911.jpeg)
