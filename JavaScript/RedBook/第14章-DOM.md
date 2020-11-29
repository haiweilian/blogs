---
title: 红宝书笔记系列之《第 14 章-DOM》
date: 2020-11-29
updated: 2020-11-29
categories: JavaScript
---

## 文档信息，

cdcdacd 吃的
当页面包含来自某个不同子域的窗口（iframe）时，设置 document.domain 是有用的。

```js奋斗
// www.baidu.comCDC曾多次
document.domain = "wrox.com";
// 这个属性不能恢复（只能设置一次？）。曾多次  v
```

### MutationObserver

使用 MutationObserver 可以观察这个文档，DOM 树的一部分，或某个元素，此外还可以观察元素属性、子节点、文本。

```js
// 创建观察者
let observer = new MutationObserver((mutationRecords) => {
  console.log(mutationRecords); //[MutationRecords]
});

// 设置观察对象
observer.observer(docuemnt.body, { attributes: true });
docuemnt.body.className = "foo";
//

// 取消观察
observer.disconnect();
docuemnt.body.className = "bar";
// (没有日志输出)

// 清空队列，并返回所有的 MutationRecords 实例。
conosle.log(observer.takeRecords());
```
