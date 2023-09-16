---
title: 红宝书笔记系列之《第 14 章-DOM》
date: 2020-11-29
updated: 2020-11-29
categories: JavaScript
---

## MutationObserver

使用 `MutationObserver` 可以观察这个文档，DOM 树的一部分，或某个元素，此外还可以观察元素属性、子节点、文本。

```js
// 创建 MutationObserver 实例，异步执行注册的回调
let observer = new MutationObserver((mutationRecords) => {
  console.log(mutationRecords[0]); // {type: "attributes", target: body.foe3e3o, ...}
});

// 设置观察对象
observer.observe(document.body, {
  subtree: true,
  attributes: true,
  // ...
});
document.body.className = "foo";

// 取消观察对象
setTimeout(() => {
  observer.disconnect();
  document.body.className = "bar";
  // (没有日志输出)
});

// 清空队列
setTimeout(() => {
  observer.takeRecords();
});
```
