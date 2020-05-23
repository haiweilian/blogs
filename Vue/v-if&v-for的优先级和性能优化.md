---
title: v-if&v-for的优先级和性能优化
date: 2020-05-23
updated: 2020-05-23
categories: Vue
---

## v-if 和 v-for 的优先级

[v-if与v-for一起使用](https://cn.vuejs.org/v2/guide/conditional.html#v-if-%E4%B8%8E-v-for-%E4%B8%80%E8%B5%B7%E4%BD%BF%E7%94%A8) vue官网在这部分有明确的说明，`v-for` 具有比 `v-if` 更高的优先级。

为什么会这样呢？我们可以在源码中找到答案，就是它们的编译顺序的优先级。

```js
// src/compiler/codegen/index.js
if (el.for && !el.forProcessed) {
  // v-for
  return genFor(el, state)
} else if (el.if && !el.ifProcessed) {
  // v-if
  return genIf(el, state)
} 
```

## v-if 和 v-for 的性能优化

vue不建议 `v-if` 和 ` v-for` 用在一起，这是出于性能考虑。可以通过渲染函数 `render` 的内容结果来比较。

获取通过实例的 `vm.$options.render` 获取。

```js
const vm = new Vue ({
  el: '#app',
  data () {
    return {
      isShow: true,
      data: [{id: 1, isShow: false}, {id: 2, isShow: true}]
    }
  }
})
console.log(vm.$options.render) // 输出 render 函数
```

### 外部值判断

如当我们要根据一个外部值 `isShow` 来判断列表是否展示，如果这样式写。

```html
<div v-for="item in data" :key="item.id" v-if="isShow"></div>
```

生成的函数

```js
function anonymous() {
  with (this) {
    return _c(
      "div",
      { attrs: { id: "app" } },
      // _l 无论怎么都会先循环
      _l(data, function (item) {
      	// 在根据判断 isShow 是否展示
        return isShow ? _c("div", { key: item.id }) : _e();
      }),
      0
    );
  }
}
```

如果把 `v-if `提取到外面。

```html
<template v-if="isShow">
	<div v-for="item in data" :key="item.name"></div>
</template>
```

这样就避免了 `isShow` 为 `fasle` 的时候还需要循环的问题。

```js
function anonymous() {
  with (this) {
    return _c(
      "div",
      { attrs: { id: "app" } },
      [
        // 先判断 isShow 是否展示，再进行必要的循环
        isShow
          ? _l(data, function (item) {
              return _c("div", { key: item.name });
            })
          : _e(),
      ],
      2
    );
  }
}
```

### 列表内部值判断

可能需要根据列表内部的某个值判断是否会显示如何解决呢。

```html
<div v-for="item in data" :key="item.id" v-if="item.isShow"></div>
```

可以先过滤数据在进行渲染，提高渲染效率。

```js
computed: {
  dataFilter() {
  	return this.data.filter(item => item.isShow)
  }
}
```

## 总结

- `v-for` 比 `v-if` 的优先级高，在源码中的编译里找到的答案。
- 如果同时出现，每次渲染都会先先执行循环在执行判断，无论无和循环都不可避免，浪费了性能。
- 如果根据外部值判断，则在外出嵌套 `template` 标签，在这一层进行 `v-if` 判断，然后在内部进行 `v-for` 循环。
- 如果根据列表内部的值判断是否展示，可以先过滤数据在进行渲染。

