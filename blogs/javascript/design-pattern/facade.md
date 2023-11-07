---
title: 设计模式之外观模式
date: 2021-01-24
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

为子系统中的一组接口提供一个一致的界面。

## 实现

定义一个高层接口，这个接口使子系统更加容易使用。

## 应用

**多个方法一起被调用**

```js
function start() {
  console.log("start");
}

function doing() {
  console.log("doing");
}

function end() {
  console.log("end");
}

// 外观函数，将一些处理统一起来，方便调用。
function execute() {
  start();
  doing();
  end();
}

// 此处直接调用了高层函数。
execute();
```

**处理兼容性**

涉及到兼容性，参数支持多格式，对外暴露统一的 api，对外只用一个函数，内部判断实现。

```js
const Event = {
  stop(e) {
    if (typeof e.preventDefault() === "function") {
      e.preventDefault();
    } else if (typeof e.stopPropagation() === "function") {
      e.stopPropagation();
    } else if (typeof e.returnValue === "boolean") {
      e.returnValue = true;
    } else if (typeof e.cancelBubble === "boolean") {
      e.cancelBubble = true;
    } else {
      return false;
    }
  },
  addEvent(dom, type, fn) {
    if (dom.addEventListener) {
      dom.addEventListener(type, fn, false);
    } else if (dom.attachEvent) {
      dom.attachEvent("on" + type, fn);
    } else {
      dom["on" + type] = fn;
    }
  },
};
```
