---
title: 设计模式之单例模式
date: 2021-01-10
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

保证一个类仅有一个实例，并提供一个访问它的全局访问点。

## 实现

实现的方法为先判断实例是否存在，如果存在则直接返回，如果不存在就创建了再返回，这就确保了一个类只有一个实例对象。

## 应用

**后续返回同样的值**

```js
function getSingle() {
  let result;
  return function (name) {
    return result || (result = name);
  };
}

let single = getSingle();
console.log(single("嘻嘻")); // 嘻嘻
console.log(single("哈哈")); // 嘻嘻
console.log(single("嘤嘤")); // 嘻嘻
```

**登录浮框的例子**

如当我们点击登录按钮的时候，页面中出现一个登录浮框。而这个登录框是唯一的，无论点击多少次按钮，这个浮框只会出现一次。那我们一开始就创建好不也是一样的吗。那如果不点击，那不就造成浪费了吗。这种当需要的时候再创建，也叫惰性单例。

```js
// 把单例的逻辑抽离出来
function getSingle(fn) {
  let result;
  return function () {
    return result || (result = fn.apply(this, arguments));
  };
}

// 登录浮框的逻辑
function createLoginLayer() {
  console.log("...登录浮框，只会初始化一次");
  let div = document.createElement("div");
  div.innerHTML = "我是登录浮框";
  div.style.display = "none";
  document.body.appendChild(div);
  return div;
}

// 事件处理
let createSingleLoginLayer = getSingle(createLoginLayer);
let loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", function () {
  let loginLayer = createSingleLoginLayer();
  loginLayer.style.display = "block";
});
```
