---
title: 红宝书笔记系列之《第2章-HTML中的JavaScript》
date: 2020-11-20
updated: 2020-11-20
categories: JavaScript
---

## script 元素

#### async 和 defer 属性

- `async` 表示应该立即开始下载脚本，但不阻止其他页面动作（执行顺序是不定的），只对外部文件有效。

- `defer` 表示文档解析和显示完成后再执行脚本（相当于把执行放到了最底部），只对外部文件有效。

- 默认会按照 `<script>` 在页面中出现的顺序依次解析它们，前提是没有使用 `async` 和 `defer` 属性。

[在以下三个脚本分别输出内容，观察顺序。](https://github.com/haiweilian/laboratory/tree/master/JavaScript/red-book/%E7%AC%AC2%E7%AB%A0-HTML%E4%B8%AD%E7%9A%84JavaScript/async%E5%92%8Cdefer)

以下可以看出：加载顺序是固定的。

```html
<script src="./defer.js"></script>
<script src="./async.js"></script>
<script src="./default.js"></script>
<!-- defer async default -->
<!-- defer async default -->
<!-- defer async default -->
```

以下可以看出：`async` 的顺序是不固定的，`defer` 一直在 `default` 之后。

```html
<script defer src="./defer.js"></script>
<script async src="./async.js"></script>
<script src="./default.js"></script>
<!-- async default defer-->
<!-- default defer async-->
<!-- default async defer-->
```

#### type 属性指定 module

在 `<script>` 指定 `type="module"` 可以使用 ES6 的模块。

```html
<script type="module">
  import num from "./main.js";
</script>
```

## noscript 元素

当**浏览器不支持脚本**和**浏览器对脚本的支持被关闭**的情况将会显示标签内的内容。

```html
<noscript>
  <strong>您的浏览器不支持 JavaScript 或未启用 JavaScript。</strong>
</noscript>
```
