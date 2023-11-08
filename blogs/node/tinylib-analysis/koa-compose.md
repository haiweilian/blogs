---
title: koa-compose 源码分析-洋葱模型串联中间件
date: 2021-11-09
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

先来看下洋葱中间件机制，这种灵活的中间件机制也让 `koa` 变得非常强大。

![1](https://raw.githubusercontent.com/haiweilian/tinylib-analysis/main/003.koa-compose/.doc/images/1.png)

## 源码

### 核心实现

可以看到只有短短的几十行，本质上就是一个嵌套的高阶函数，外层的中间件嵌套着内层的中间件。利用递归的机制一层嵌套一层，调用 next 之前是 _递(req)_，之后是 _归(res)_。

```js
function compose(middleware) {
  return function (context, next) {
    // last called middleware #
    let index = -1;
    // 从下标为 0 开始执行中间件。
    return dispatch(0);

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error("next() called multiple times"));
      index = i;
      // 找出数组中存放的相应的中间件
      let fn = middleware[i];

      // 不存在返回，最后一个中间件调用 next 也不会报错。
      if (i === middleware.length) fn = next;
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(
          // 执行当前中间件
          fn(
            // 第一个参数是 ctx。
            context,
            // 第二个参数是 next，代表下一个中间件。
            dispatch.bind(null, i + 1)
          )
        );
      } catch (err) {
        return Promise.reject(err);
      }
    }
  };
}
```

### Koa 示例

简单写个示例看它是如何在 `Koa` 中应用的。

首先通过 `use` 收集了所有的中间件，在执行的时候当前中间的 `next` 参数是下一个中间件，那么执行 `next` 自然就进入了下一个中间件。

其次把这种调用行为看做递归行为，当我们达到终点的时候(最后一个)，发生回溯行为直到最初的调用。

```js
const compose = require("../index");

class App {
  middlewares = [];
  use(fn) {
    this.middlewares.push(fn);
  }
  run() {
    compose(this.middlewares)();
  }
}

const app = new App();

// 收集中间件
app.use(async (ctx, next) => {
  console.log(1);
  await next();
  console.log(6);
});
app.use(async (ctx, next) => {
  console.log(2);
  await next();
  console.log(5);
});
app.use(async (ctx, next) => {
  console.log(3);
  await next();
  console.log(4);
});

// 执行中间件
app.run(); // 1->2->3->4->5->6
```

### VueRouter 示例

通过上面我们会发现调用 `next` 尤为重要，那么还在那见过 `next` 参数呢？

如果知道 VueRouter 的使用，那么在导航守卫中有 `next` 如果定义了未调用是不会进入下一个路由的。

其实在 VueRouter 并不是使用递归去实现的，而是巧妙的利用了 `Promise` 链。

如下有个简单的实现，把守卫函数都包装成 `Promise`，并且定义 `next` 函数，只有调用 `next` 函数才会执行 `resolve()`，然后使用 `reduce` 依次追加上 `promise.then` 实现串联。

```js
class VueRouter {
  guards = [];
  beforeEach(guard) {
    this.guards.push(guardToPromiseFn(guard));
  }
  run() {
    runGuardQueue(this.guards);
  }
}

const router = new VueRouter();
router.beforeEach((to, from, next) => {
  console.log(1);
  next();
});
router.beforeEach((to, from) => {
  console.log(2);
});

router.run(); // 1 -> 2

// 串行执行守卫
function runGuardQueue(guards) {
  // Promise.resolve().then(() => guard1()).then(() => guard2())
  // guard() 执行后返回的 Promise
  return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
}

// 把守卫包装成 Promise
function guardToPromiseFn(guard, to, from) {
  return () => {
    return new Promise((resolve, reject) => {
      // 定义 next ，当执行 next 的时候这个 Promise 才会从 pending -> resolve
      const next = () => resolve();
      // 执行守卫函数并把 next 函数传递过去
      guard(to, from, next);
      // 如果守卫函数没有定义 next，默认执行 next
      if (guard.length < 3) next();
    });
  };
}
```

## 总结

复习一遍，简单实现两个示例。
