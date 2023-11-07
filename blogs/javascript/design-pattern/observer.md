---
title: 设计模式之发布订阅模式
date: 2021-01-17
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

发布-订阅模式又叫观察者模式，在这种模式中，并不是一个对象调用另一个对象的方法，而是一个对象订阅另一个对象的特定活动并在状态改变后获得通知。订阅者也成为观察者，而被观察的对象成为发布者，当发生了一个事件的时候，发布者会通知（调用）所有订阅者并传递消息。

## 实现

首先要指定谁充当发布者。然后给发布者添加一个缓存列表，用于存放回调函数以便通知订阅者。最后发布消息的时候，发布者会遍历这个缓存列表，依次触发里面存放的订阅者的回调函数。

## 应用

**DOM 事件**

原生 dom 事件本身就是发布-订阅模式。

```js
// 订阅 点击事件
document.body.addEventListener("click", function () {
  alert(1);
});

// 模拟用户点击，发布 点击事件
document.body.click();
```

**发布-订阅**

下面是一个简单的通用的发布订阅模式。

```js
class Event {
  constructor() {
    this.callbacks = {};
  }

  // 解绑
  off(name) {
    this.callbacks[name] = null;
  }

  // 订阅
  on(name, fn) {
    (this.callbacks[name] || (this.callbacks[name] = [])).push(fn);
  }

  // 发布
  emit(name, args) {
    let cbs = this.callbacks[name];
    if (cbs) {
      cbs.forEach((cb) => {
        cb.call(this, args);
      });
    }
  }
}

let events = new Event();

// 订阅 do 事件
events.on("do", (doing) => {
  console.log(`正在${doing}...`);
});

// 发布 do 事件
events.emit("do", "学习"); // 正在学习...
events.emit("do", "看书"); // 正在看书...

// 解绑 do 事件后，不会再通知
events.off("do");
events.emit("do", "学习");
events.emit("do", "看书");
```
