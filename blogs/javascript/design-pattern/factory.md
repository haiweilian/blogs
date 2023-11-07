---
title: 设计模式之工厂模式
date: 2021-01-24
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

当需要根据不同参数产生不同实例，这些实例都有相同的行为。

## 实现

提供创建对象的接口，把成员对象的创建工作转交为一个外部对象，好出在于消除对象之间的耦合（也就是相互影响）。

## 应用

**消息通知**

如一个工厂函数，根据参数提示不同的消息类型。

```js
let Notification = function (options = {}) {
  let instance = new Object();
  instance.type = options.type;
  instance.message = `消息类型-${options.message}`;
  instance.visible = true;
  return instance;
};

const n = Notification({
  type: "success",
  message: "success",
});
console.log(n.message); // 消息类型-success

const m = Notification({
  type: "error",
  message: "error",
});
console.log(m.message); // 消息类型-error
```
