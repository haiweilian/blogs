---
title: promisify 源码分析-将基于 Callback 的函数转换 Promise
date: 2021-12-22
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

在 `node` 的工具函数有 [util.promisify](http://nodejs.cn/api/util/util_promisify_original.html) 函数将基于 `Callback` 的函数转换 `Promise` 使用。因为 `node` 中有依赖不方便观看，所有找了一个和它实现基本一致的 [es6-promisify](https://github.com/mikehall314/es6-promisify) 单独的实现。那么来看看怎么实现一个这样的函数吧。

## 源码

总体概括高阶函数的应用，首先就是包装原始函数，并返回一个 `Promise`，然后接管原始函数的 `callback` 参数，当原始函数调用 `callback` 的时候，就可以根据返回的信息去调用 `Promise` 的 `resolve` 或 `reject`。

### 示例

一个简单的示例。

```js
import { promisify } from "../lib/promisify.js";

// 原始函数
function load(src, callback) {
  setTimeout(() => {
    callback(null, "name");
  });
}

// 返回一个内部函数
const loadPromise = promisify(load);

// 调用函数并返回一个 Promise
loadPromise("src")
  .then((res) => {
    console.log(res); // name
  })
  .catch((err) => {
    console.log(err);
  });
```

### 实现

核心实现处理了单参数和多参数的实现。

```js
export function promisify(original) {
  // 判断是否是一个函数
  if (typeof original !== "function") {
    throw new TypeError("Argument to promisify must be a function");
  }

  // 多个参数自定义的参数名称
  const argumentNames = original[customArgumentsToken];

  // 自定义的 Promise 或者 原生 Promise
  const ES6Promise = promisify.Promise || Promise;

  // promisify(load) 返回一个函数，执行这个函数返回一个 Promise。
  return function (...args) {
    return new ES6Promise((resolve, reject) => {
      // 忘 args 里追加 callback，那么在普通函数执行回调的时候，就是直接追加的这个函数
      args.push(function callback(err, ...values) {
        // 根据 node 错误优先的写法，判断是否有错误信息
        if (err) {
          return reject(err);
        }

        // 如果参数剩余参数只有一个或者没有指定参数名称返回第一个
        if (values.length === 1 || !argumentNames) {
          return resolve(values[0]);
        }

        // 如果指定了参数名称，转化为对象返回。
        const o = {};
        values.forEach((value, index) => {
          const name = argumentNames[index];
          if (name) {
            o[name] = value;
          }
        });

        resolve(o);
      });

      // 执行调用函数
      original.apply(this, args);
    });
  };
}
```

## 总结

1. 虽然代码很少，函数的灵活性运用的很巧妙。
