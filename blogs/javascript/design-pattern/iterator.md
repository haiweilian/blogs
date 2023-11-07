---
title: 设计模式之迭代器模式
date: 2021-01-17
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

迭代器模式是指提供一种方法顺序访问一个聚合对象中的各个元素，而又不需要暴露该对象的内部表示。

## 实现

迭代器模式可以把迭代的过程从业务逻辑中分离出来，在使用迭代器模式之后，即不关心对象的内部构造，也可以顺序访问其中的每个元素。

## 应用

**内部迭代器**

内部迭代器这个用的很多了，`forEach`、`map` 等。如下数组和对象都可以迭代。

```js
function each(obj, cb) {
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; ++i) {
      cb.call(obj[i], i, obj[i]);
    }
  } else {
    for (var i in obj) {
      cb.call(obj[i], i, obj[i]);
    }
  }
}

each([1, 2, 3], function (index, value) {
  console.log(index, value);
});
// 0 1
// 1 2
// 2 3

each({ a: 1, b: 2 }, function (index, value) {
  console.log(index, value);
});

// a 1
// b 2
```

**外部迭代器**

原生的外部迭代器；任何实现 Iterator 接口的对象都可以作为迭代器使用，Iterator 接口主要供 `for...of` 消费。

原生实现的有 `Array` 、`Map` 、`Set` 、`String` 、`TypedArray` 、`arguments` 、`NodeList`，可以直接使用。

```js
let list = ["a", "b", "c"];
for (let item of list) {
  console.log(item);
}
// a
// b
// c
```

Iterator 的遍历过程是：每一次调用 `next` 方法，都会返回数据结构的当前成员的信息，返回一个包含 `value` 和 `done` 两个属性的对象。其中，`value` 属性是当前成员的值，`done` 属性是一个布尔值，表示遍历是否结束。

```js
let listr = list[Symbol.iterator](); // 调用内部的迭代函数
console.log(listr.next()); // { value: 'a', done: false }
console.log(listr.next()); // { value: 'b', done: false }
console.log(listr.next()); // { value: 'c', done: false }
console.log(listr.next()); // { value: undefined, done: true }
```
