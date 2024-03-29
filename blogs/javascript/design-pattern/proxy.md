---
title: 设计模式之代理模式
date: 2021-01-17
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

为一个对象提供一个代用品或占位符，以便控制对它的访问。

## 实现

当不方便直接访问一个对象或者不满足需要的时候，提供一个替身对象来控制对这个对象的访问，客户实际上访问的是替身对象。

## 应用

**虚拟代理**

虚拟代理形式：某一个花销很大的操作，可以通过虚拟代理的方式延迟到这种需要它的时候才去创建执行。

_函数防抖：如果短时间内大量触发同一事件，只会执行一次函数。_

```js
function debounce(fn, delay) {
  let timer = null;

  return function () {
    let arg = arguments;

    // 每次操作时，清除上传的定时器
    clearTimeout(timer);
    timer = null;

    // 定义新的定时器，一段时间后进行操作
    timer = setTimeout(function () {
      fn.apply(this, arg);
    }, delay);
  };
}

let count = 0;
let handerCount = function () {
  count++;
};

// 代理原始函数
let debounceCount = debounce(handerCount, 500);

// 开始频繁操作，数字不会变
let timer = setInterval(() => {
  debounceCount();
  console.log(count);
}, 100);

// 停止频繁操作，500ms 后数字变化
setTimeout(() => {
  clearInterval(timer);
  setTimeout(() => {
    console.log(count);
  }, 500);
}, 2000);
```

_函数节流：如果短时间内大量触发同一事件，那么在函数执行一次之后，该函数在指定的时间期限内不再工作，直至过了这段时间才重新生效_

```js
function throttle(fn, delay) {
  let timer = null;

  return function () {
    let arg = arguments;

    // 如果上次执行的时间间隔未到，不执行下一次。
    if (timer) {
      return;
    }

    timer = setTimeout(function () {
      fn.apply(this, arg);
      clearTimeout(timer);
      timer = null;
    }, delay);
  };
}

let count = 0;
let handerCount = function () {
  count++;
};

// 代理原始函数
let throttleCount = throttle(handerCount, 500);

// 开始频繁操作，间隔 500ms 数字才会变
let timer = setInterval(() => {
  throttleCount();
  console.log(count);
}, 100);
```

**缓存代理**

为一些开销大的运算提供暂时的存储，在下次运算时，如果传递进来的参数跟之前一致，则可以直接返回前面存储的运算结果。

```js
// 乘积：脑补是一个很复杂的预算
let mult = function () {
  console.log("mult...");
  let a = 1;
  for (let i = 0; i < arguments.length; i++) {
    a = a * arguments[i];
  }
  return a;
};

// 加和：脑补是一个很复杂的预算
let plus = function () {
  console.log("plus...");
  let a = 1;
  for (let i = 0; i < arguments.length; i++) {
    a = a + arguments[i];
  }
  return a;
};

// 创建缓存代理的工厂
let createProxyFactory = function (fn) {
  let cache = {};
  return function () {
    // 以参数为 key 把计算结果存起来，如果存在就直接返回
    let args = Array.from(arguments).join(",");
    if (args in cache) {
      return cache[args];
    }
    return (cache[args] = fn.apply(this, arguments));
  };
};

let proxyMult = createProxyFactory(mult);
let proxyPlus = createProxyFactory(plus);
console.log(proxyMult(1, 2, 3, 4, 5));
console.log(proxyMult(1, 2, 3, 4, 5));
console.log(proxyPlus(1, 2, 3, 4, 5));
console.log(proxyPlus(1, 2, 3, 4, 5));
// mult...
// 120
// 120
// plus...
// 16
// 16
```
