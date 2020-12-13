---
title: 红宝书笔记系列之《第 16 章-DOM2 和 DOM3》
date: 2020-11-29
updated: 2020-11-29
categories: JavaScript
---

## 比较节点

DOM3 新增了两个用于比较节点的方法 `isSameNode()` 相同 ，`isEqualNode()` 相等。

```js
let div1 = document.createElement("div");
div1.setAttribute("class", "box");

let div2 = document.createElement("div");
div2.setAttribute("class", "box");

console.log(div1.isSameNode(div1)); // true
console.log(div1.isEqualNode(div2)); // true
console.log(div1.isSameNode(div2)); // false
```

## 计算样式

DOM2 在 `document.defaultView` 上增加了 `getComputedStyle()` 方法，用于获取元素的所有计算样式。

```html
<style>
  #box {
    width: 100px;
    height: 100px;
    background-color: red;
  }
</style>
<body>
  <div id="box"></div>
  <script>
    let box = document.querySelector("#box");
    let computedStyle = document.defaultView.getComputedStyle(box, null);
    console.log(computedStyle); // CSSStyleDeclaration { width, height, color, margin, ... }
    console.log(computedStyle.width); // 100px
    console.log(computedStyle.height); // 100px
    console.log(computedStyle.color); // rgb(0, 0, 0) 不设置也会获取默认的
  </script>
</body>
```

第二个参数可以传入伪元素字符串(如：`":after"`)获取伪元素样式。

```html
<style>
  #box:after {
    font-size: 30px;
  }
</style>
<body>
  <div id="box"></div>
  <script>
    let boxAfter = document.querySelector("#box");
    let computedStyleAfter = document.defaultView.getComputedStyle(box, ":after");
    console.log(computedStyleAfter.fontSize); // 30px
  </script>
</body>
```

## 确定元素尺寸

每个元素上都有 `getBoundingClientRect()` 方法，返回一个 `DOMRect` 对象，对象上的属性给出了元素在页面中相对于视口(左、上)的位置。

```html
<style>
  * {
    margin: 0px;
    padding: 0px;
  }
  #box {
    position: absolute;
    top: 100px;
    left: 100px;
    width: 100px;
    height: 100px;
    background: red;
  }
</style>
<body>
  <div id="box"></div>
  <script>
    let DOMRect = box.getBoundingClientRect();
    console.log(DOMRect);
    // {
    //   top: 100;
    //   left: 100;
    //   width: 100;
    //   height: 100;
    //   bottom: 200; // = top + height
    //   right: 200; // = left + width
    //   x: 100;
    //   y: 100;
    // }
  </script>
</body>
```
