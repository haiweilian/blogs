---
title: 设计模式之适配器模式
date: 2021-01-24
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

适配模式的作用是解决两个软件实体间的接口不兼容的问题。使用适配器模式之后，原本由于接口不兼容而不能工作的两个软件实体可以一起工作。

## 实现

使用适配器对能改的接口进行包装，转换成另一个接口的所需。

## 应用

**数据格式转换**

如有一个渲染函数接收以下数据格式，这个函数在业务内部，不希望改动它。

```js
// let sku = [
//   {
//     name: "大小",
//     value: [
//       { name: "大", id: "100" },
//       { name: "小", id: "200" },
//     ],
//   },
// ]
function renderData(data) {
  data.forEach((item) => {
    console.log(item.name, item.value);
  });
}
```

而现有的数据格式不满足渲染函数，这时就需要一个适配器去转换它。

```js
let sku = [
  { id: "100", name: "大小", value: "大" },
  { id: "100", name: "大小", value: "小" },
];
function arrayAdapter(data) {
  let maps = {};

  data.forEach((item) => {
    if (maps[item.name] === void 0) {
      maps[item.name] = [];
    }
    maps[item.name].push(item);
  });

  return Object.entries(maps).map(([name, value]) => {
    return {
      name,
      value,
    };
  });
}

// 先用适配器进行数据转换，在调用渲染函数。
renderData(arrayAdapter(sku));
```
