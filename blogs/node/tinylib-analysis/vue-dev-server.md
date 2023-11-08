---
title: vue-dev-server 源码分析-从"玩具 Vite"去理解 Vite 原理
date: 2021-11-08
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

项目地址 <https://github.com/vuejs/vue-dev-server>。

## 示例

**运行命令**

```sh
npm i @vue/dev-server
npx vue-dev-server
```

**如何工作**

- 浏览器请求导入作为原生 ES 模块导入 - 没有捆绑。

- 服务器拦截对 \*.vue 文件的请求，即时编译它们，然后将它们作为 JavaScript 发回。

- 对于提供在浏览器中工作的 ES 模块构建的库，只需直接从 CDN 导入它们。

- 导入到 .js 文件中的 npm 包（仅包名称）会即时重写以指向本地安装的文件。 目前，仅支持 vue 作为特例。 其他包可能需要进行转换才能作为本地浏览器目标 ES 模块公开。

## 环境

配置 `launch.json` 或直接在 `package.json` 调试脚本。

## 源码

### 搭建静态服务

开启一个本地服务用的 [express](https://github.com/expressjs/express)。`app.use(middleware)` 是添加中间件，每个服务都会经过此中间件。

```js
// bin/vue-dev-server.js
const express = require("express");
const { vueMiddleware } = require("../middleware");

const app = express();
const root = process.cwd();

// 自定义中间件
app.use(vueMiddleware());

// 目录作为静态资源
app.use(express.static(root));

app.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
```

### 入口请求页面

启动服务之后看 `test/index.html` 的内容当做入口去解析。这也是现在 `vite` 一直采用的方式使用 `html` 做为入口。

```html
<!-- test/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Vue Dev Server</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      // 发起入口请求
      import "./main.js";
    </script>
  </body>
</html>
```

### 处理 \*.js

在中间件里对每个请求处理，下面简写代码先不考虑缓存，后面再看怎么实现缓存。

从入口开启判断 `js` 文件，做的事情就是把 `js` 文件解析成 `ast` 并处理 `import` 语句。

```js
if (req.path.endsWith(".js")) {
  // 当前 js 结尾，这里指 main.js 入口
  // 读取文件内容并转换 import 语句，最后在加入缓存
  const result = await readSource(req);
  out = transformModuleImports(result.source);
  send(res, out, "application/javascript");
}
```

转成 `ast` 解析文件中的 `import` 语句，这里用的 [recast](https://github.com/benjamn/recast)，用什么无所谓只要能解析。如果要学习 `ast` 还是推荐从 `babel` 入手毕竟资料多点。

只处理了 `npm` 包的路径，因为在浏览器中 `import vue from 'vue'` 并不知道是一个包。通过 [validate-npm-package-name](https://github.com/npm/validate-npm-package-name) 判断是不是 `npm` 包，加一个特殊的路径标识标记用于后续的判断。

```js
// ./transformModuleImports.js
function transformModuleImports(code) {
  const ast = recast.parse(code);
  recast.types.visit(ast, {
    // 遍历所有的 Import 声明语句
    visitImportDeclaration(path) {
      const source = path.node.source.value;
      // 处理 npm 包的路径， vue -> /__modules/vue
      // 因为实际代理的没有  node_modules 文件夹的
      if (!/^\.\/?/.test(source) && isPkg(source)) {
        path.node.source = recast.types.builders.literal(`/__modules/${source}`);
      }
      this.traverse(path);
    },
  });
  // 最后再把 ast 转成成 代码字符串 返回
  return recast.print(ast).code;
}
```

### 处理 \_\_modules

请求完 `main.js` 之后，首先第一个 `import Vue from 'vue'`，经过上面的转换已经变成了 `import Vue from "/__modules/vue"` 内容了。

```js
if (req.path.startsWith("/__modules/")) {
  // 当是 __modules 开头的时候，证明是 npm 包前面已经处理过了，通过 loadPkg 从 node_modules 读取，在返回文件
  const pkg = req.path.replace(/^\/__modules\//, "");
  out = (await loadPkg(pkg)).toString();
  send(res, out, "application/javascript");
}
```

### 处理 \*.vue

接着 `vue` 文件，使用 `vue` 的 `compiler` 模块去编译 `sfc` 成 `render` 函数后返回。

```js
if (req.path.endsWith(".vue")) {
  // 把单文件组件编译成 render 函数
  const result = await bundleSFC(req);
  // 让浏览器用 JavaScript 引擎解析。
  // 小知识：浏览器不通过后缀名判断文件类型
  send(res, result.code, "application/javascript");
}
```

如果文件里再发起请求，那么还是如上述所处理的一样。

### LRU 缓存

最后再说一下里面的缓存，缓存是一种常用的优化手段，但是也不能无限的缓存，特别是大内容那内存岂不是要爆炸。所以有种方案是 _LRU（Least Recently Used）_，简单来说就是就是把最不常用的从缓存中删除掉的思想。此项目中用的 [lru-cache](https://github.com/isaacs/node-lru-cache) 可以看官方文档。下面用代码简单实现一个缓存。

如果了解 `vue` 中 `keep-alive` 组件，就知道 `keep-alive` 能缓存组件和设置最大的缓存个数，就是利用 LRU 思想实现的。

```js
// 缓存的 key 集合
const keys = new Set();
// 最大缓存个数
const max = 5;

// 添加缓存
function add(key) {
  if (keys.has(key)) {
    // 如果缓存中存在： 把这个 key 从集合中删除再添加，保持 key 的活跃度。
    // 旧：[1, 2, 3]
    // add(1)
    // 新：[2, 3, 1]
    keys.delete(key);
    keys.add(key);
  } else {
    // 如果缓存中存在：则添加一个缓存
    keys.add(key);
    // 如果缓存个数大于最大的缓存数，则删除最久不用的 key。
    // 最久是 key 集合中的第一个，因为每次命中缓存都会从新添加到后面。
    if (keys.size > max) {
      keys.delete(keys.values().next().value);
    }
  }
  console.log([...keys]);
}

add(1); // [1]
add(2); // [1, 2]
add(3); // [1, 2, 3]
add(1); // [2, 3, 1]

add(4); // [2, 3, 1, 4]
add(5); // [2, 3, 1, 4, 5]
add(6); // [3, 1, 4, 5, 6] 最大缓存 5，最久不使用 2 的删除了。
```

## 总结

1. 首先又扩展知识储备 _recast(AST 解析)_、_validate-npm-package-name(检测包名)_ 、_lru-cache(LRU 缓存)_ 的用法和用处。

2. 了解 `Vite` 的核心实现原理。
