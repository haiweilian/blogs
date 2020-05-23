---
title: vue组件的data为什么必须是函数形式
date: 2020-05-23
updated: 2020-05-23
categories: Vue
---

## 为什么必须是函数形式

是为了数据污染的问题。都知道的一个知识，对象是引用是引用的类型的，改变一个另一个也会改变。

那么 vue 内部怎么处理的呢。

```js
// src/core/instance/state.js
function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
}
```

- vue组件可能存在多个实例，如果使用对象形式定义 data ，则会导致他们公用一个 data 对象，那么状态变更将会影响所有的组件实例。
- 采用函数形式定义，在 initData 时会将其作为工厂函数返回全新 data 对象，有效避免多实例之间状态污染问题。

## 为什么根实例没限制

其实根实例必要要限制，因为根实例只有一个。

