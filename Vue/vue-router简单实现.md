---
title: vue-router简单实现
date: 2020-05-10
updated: 2020-05-10
categories: Vue
---

简单实现，实现最基础的功能。

## 查看示例

[查看示例](https://github.com/haiweilian/laboratory/tree/master/Vue/vue-router-simple-imp)

## 初始化项目

先用 vue-cli 初始一个 vue 项目，router 模式要选择 `hash` 模式。

## 核心实现

### 需求分析

分析下需要实现的功能。

- 实现一个插件：创建 `VueRouter` 类并把 `$router` 挂载到 Vue 原型上。
- 具体功能实现：
  - 实现响应式的匹配。
  - 实现 `router-link` 组件。
  - 实现 `router-view` 组件。

### 实现 VueRouter

创建一个 vue-router.js 替换掉 vuex。

```js
// 在 router 文件下创建一个 vue-router.js 替换 vue-router。
// import VueRouter from 'vue-router'
import VueRouter from "./vue-router";
```

创建一个插件，并实现 `VueRouter` 类，并把 `$router` 挂载到 Vue 原型上。

```javascript
// router/vue-router.js
let Vue; // bind on install

class VueRouter {
  constructor(options) {
    this.$options = options;
  }
}

// Vue 插件的实现方式，必须导出一个 install 函数。Vue.use() 的时候自动调用。
VueRouter.install = function (_Vue) {
  Vue = _Vue;

  Vue.mixin({
    // 在实例初始化之后再执行，这里是为了延迟执行。
    // 因为是为了保证 Vue 的实例存在，用于在原型上挂载 $router。
    beforeCreate() {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router;
        Vue.prototype.$router.onHashChange();
      }
    },
  });
};

export default VueRouter;
```

### 实现响应式的匹配

```js
class VueRouter {
  constructor(options) {
    this.$options = options;

    // 定义一个响应式的 current, 如果它变了，那么使用它的组件会 render。
    // `Vue.util.defineReactive` 未公开文档，在 vue 源码的 src/core/global-api/index.js 里面。
    Vue.util.defineReactive(this, "current", "");

    // 当路由变化的时候，重新赋值当前路径
    window.addEventListener("hashchange", () => {
      this.onHashChange();
    });
  }

  onHashChange() {
    this.current = window.location.hash.slice(1) || "/";
  }
}
```

### 实现 router-link

```js
VueRouter.install = function (_Vue) {
  // 注册 router-link 组件，利用 a 标签跳转。
  Vue.component("router-link", {
    props: {
      to: {
        type: String,
        required: true,
      },
    },
    render(h) {
      return h(
        "a",
        {
          attrs: { href: `#${this.to}` },
        },
        this.$slots.default
      );
    },
  });
};
```

### 实现 router-view

```js
VueRouter.install = function (_Vue) {
  // 注册 router-view 组件，匹配对应 path 路径的 component 组件。
  Vue.component("router-view", {
    render(h) {
      let component = null;
      const { $options, current } = this.$router;
      $options.routes.forEach((item) => {
        if (item.path === current) {
          component = item.component;
        }
      });
      return h(component);
    },
  });
};
```
