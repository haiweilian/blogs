---
title: Vuex 原理分析，实现响应式的状态管理
date: 2020-05-08
tags:
  - Vue
  - Vuex
categories:
  - 前端
  - 源码分析
---

简单实现，实现最基础的功能。先来一张官网图加深下印象。

![](./image/vue2-vuex-analysis/vuex.png)

## 查看示例

[查看示例](https://github.com/haiweilian/demos/tree/master/Vue/vuex-simple-imp)

## 初始化项目

先用 vue-cli 初始一个 vue 项目，简单的编写一下 vuex 的代码，使它能够正常的运行起来。

```js
// store/index.js
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    counter: 0,
  },
  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
  },
  mutations: {
    add(state) {
      state.counter++;
    },
  },
  actions: {
    add({ commit }) {
      setTimeout(() => {
        commit("add");
      }, 1000);
    },
  },
});
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <h2 class="">state：{{ $store.state.counter }}</h2>
    <h2 class="">getters：{{ $store.getters.doubleCount }}</h2>
    <div class="">
      <button @click="$store.commit('add')">触发mutations</button>
      <button @click="$store.dispatch('add')">触发actions</button>
    </div>
  </div>
</template>
<script>
export default {};
</script>
```

## 核心概念

分析下上面的代码都是什么作用。

- state

`state` 保存状态，初始值是定义在 `state` 里的。使用 `$store.state.xxx` 访问。

- mutations

`mutations` 同步修改状态。使用 `$store.commit('add')` 触发。

- actions

`actions` 异步修改状态。使用 `$store.dispatch('add')` 触发。

- getters

`getters` 派生出新状态。使用 `$store.getters.xxx` 访问。

## 核心实现

### 需求分析

好了，已经知道了 vuex 的用法了，分析下需要实现的功能。

- 实现一个插件：创建 `Store` 类并把 `$store` 挂载到 Vue 原型上。
- 具体功能实现：
  - 实现响应式的 `state`。
  - 实现 `commit('type')` 方法，根据 `type` 执行对应的 `mutations`。
  - 实现 `dispatch('type')` 方法，根据 `type` 执行对应的 `actions`。
  - 实现 `getters`，对`state` 做派生。

### 实现 Store

创建一个 vuex.js 替换掉 vuex。

```js
// 在 store 文件下创建一个 vuex.js 替换vuex。
// import Vuex from 'vuex'
import Vuex from "./vuex";
```

创建一个插件，并实现 `Store` 类，并把 `$store` 挂载到 Vue 原型上。

```javascript
// store/vuex.js
let Vue; // bind on install

class Store {
  constructor(options = {}) {}
}

// Vue 插件的实现方式，必须导出一个 install 函数。Vue.use() 的时候自动调用。
function install(_Vue) {
  Vue = _Vue;

  Vue.mixin({
    // 在实例初始化之后再执行，这里是为了延迟执行。
    // 因为是为了保证 Vue 的实例存在，用于在原型上挂载 $store。
    beforeCreate() {
      if (this.$options.store) {
        Vue.prototype.$store = this.$options.store;
      }
    },
  });
}

export default { Store, install };
```

### 实现 state

`vuex` 是利用 `vue` 在做数据响应机制的，所以只需要创建一个 `vue` 实例。

```js
class Store {
  constructor(options = {}) {
    // 利用 Vue 实现数据响应。
    this.vm = new Vue({
      data: {
        // $ 和 _ 开头的属性不会被代理，也就是不能通过 vm.xxx 访问。
        $$state: options.state,
      },
    });
  }

  // 当访问 $store.state 的时候返回隐藏在内部的状态。
  get state() {
    return this.vm._data.$$state;
  }

  // 当尝试直接取修改 state 的时候，抛出错误。
  set state(v) {
    console.error("不能修改State");
  }
}
```

### 实现 mutations

`mutations` 是通过 `commit` 执行触发的。

```js
class Store {
  constructor(options = {}) {
    this._mutations = options.mutations;
  }
  // 实现 commit 方法，执行 mutations 中的处理函数。
  commit = (type, payload) => {
    const fn = this._mutations[type];
    if (fn) {
      fn(this.state, payload);
    } else {
      console.error("未知mutations类型");
    }
  };
}
```

### 实现 actions

`actions` 是通过 `dispatch` 执行触发的。

```js
class Store {
  constructor(options = {}) {
    this._actions = options.actions;
  }
  // 实现 dispatch 方法，执行 actions 中的处理函数。
  dispatch = (type, payload) => {
    const fn = this._actions[type];
    if (fn) {
      fn(this, payload);
    } else {
      console.error("未知actions类型");
    }
  };
}
```

### 实现 getters

当 `getters` 依赖的 `state` 的时候会自动会触发更新，其实就是一个计算属性。

```js
class Store {
  constructor(options = {}) {
    this.getters = {};

    // 把 getters 的属性添加为计算属性。
    // 当依赖的 state 变化的时候，getters 就会更新。
    const computed = {};
    Object.entries(options.getters).forEach(([key, value]) => {
      computed[key] = () => value(this.state);
      // 当访问 getters.xxx 的时候，返回对应的计算属性。
      Object.defineProperty(this.getters, key, {
        get: () => this.vm[key],
      });
    });

    // 利用 Vue 实现数据响应。
    this.vm = new Vue({
      computed,
    });
  }
}
```
