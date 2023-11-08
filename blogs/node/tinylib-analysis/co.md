---
title: co 源码分析-异步编程之 Generator 自动执行
date: 2021-11-11
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

co 库用于 Generator 函数的自动执行。<https://github.com/tj/co>。

## 源码

### 手动执行

如果一个 `Generator` 函数，我们想让它执行完毕，就需要要不断的调用 `next` 方法。

```js
function* gen() {
  console.log(1);

  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(2);
    });
  });

  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(3);
    });
  });

  console.log(4);
}

// 生成器对象
let g = gen();

// 1、执行一步 输出 1
// 2、返回 Promise，成功后执行 then，输出 2
g.next().value.then(() => {
  // 3、再执行一步，返回 Promise，成功后执行 then，输出 3
  g.next().value.then(() => {
    // 4、再执行一步，结束 输出 4
    g.next();
  });
});
```

### Co

那么 `co` 怎么自动执行的，主要点在 `next` 函数，会把多种格式 `value` 转化为 `Promise` ，给这个 `Promise` 对象添加 `then` 方法，当异步操作成功时执行 `then` 中的 `onFullfilled` 函数，`onFullfilled` 函数中又去执行 `g.next`，从而让 `Generator` 继续执行，然后再返回一个 `Promise`，再在成功时执行 `g.next`，然后再返回直到结束。

```js
function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1);

  return new Promise(function (resolve, reject) {
    if (typeof gen === "function") {
      // 生成器对象
      gen = gen.apply(ctx, args);
    }
    if (!gen || typeof gen.next !== "function") return resolve(gen);

    // 执行一次
    onFulfilled();

    function onFulfilled(res) {
      var ret;
      try {
        // 执行下一步，指针指向下一个，传入参数传入上次 yield 表达式的值。
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
      // return null;
    }

    function next(ret) {
      // 是否结束，结束直接返回
      if (ret.done) return resolve(ret.value);
      // 把各种值包装成 Promise
      var value = toPromise.call(ctx, ret.value);
      // 添加 then 方法，当前 Promise 完成后调用 onFulfilled 再次调用 next
      if (value && isPromise(value)) {
        return value.then(onFulfilled, onRejected);
      }
    }
  });
}
```

```js
co(function* () {
  console.log(1);

  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(2);
    });
  });

  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(3);
    });
  });

  console.log(4);
});
```

### Async Await

`async ... await` 是现在的终极方案，简单明了。

```js
(async () => {
  console.log(1);

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(2);
    });
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(3);
    });
  });

  console.log(4);
})();
```

### Babel

到这里我有点好奇 `babel` 是怎么转码 `async ... await`，所以我在[官网](https://babeljs.io/repl)把上面代码转码了一下，发现实现方式和 `co` 的方式基本一致。

```js
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  // 判断是否结束
  if (info.done) {
    resolve(value);
  } else {
    // 当前 Promise 完成后调用 then 再次调用 next
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      // 对象生成器对象
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      // 执行一次
      _next(undefined);
    });
  };
}

// 由于 babel 只是完整的模拟了 生成器函数 所有我们把 babel 实现的 regeneratorRuntime 函数直接替换原生的 生成器函数 是可以的。
_asyncToGenerator(function* () {
  console.log(1);

  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(2);
    });
  });

  yield new Promise((resolve) => {
    setTimeout(() => {
      resolve();
      console.log(3);
    });
  });

  console.log(4);
})();

// Generator 的实现，内部实现复杂我们替换成 Generator。
// _asyncToGenerator(
//   /*#__PURE__*/ regeneratorRuntime.mark(function _callee() {
//     return regeneratorRuntime.wrap(function _callee$(_context) {
//       while (1) {
//         switch ((_context.prev = _context.next)) {
//           case 0:
//             console.log(1);
//             _context.next = 3;
//             return new Promise(function (resolve) {
//               setTimeout(function () {
//                 resolve();
//                 console.log(2);
//               });
//             });

//           case 3:
//             _context.next = 5;
//             return new Promise(function (resolve) {
//               setTimeout(function () {
//                 resolve();
//                 console.log(3);
//               });
//             });

//           case 5:
//             console.log(4);

//           case 6:
//           case "end":
//             return _context.stop();
//         }
//       }
//     }, _callee);
//   })
// )();
```

## 总结

1. 从开始就一直用的 `async` 没怎么关注过 `generator`，这次也算是了解了。

2. 从最初 `callback`，到现在使用 `promise`、`generator`、`async` 尽量把异步编程同步写法。_个人理解_：再到 `co` 和 `babel` 转码的源码理解到我们的同步写法是对以前回调写法进一步的封装。
