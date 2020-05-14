---
title: vue-router简单实现history模式
date: 2020-05-12
updated: 2020-05-12
categories: Vue
---

基于 [vue-router简单实现hash模式](./vue-router简单实现hash模式.md)改造实现。

实现方式与 hash 模式基本一致，只不过 history 模式使用 history 的 api 实现跳转。

## 更改监听方式

监听 popstate 事件，需要注意的是只有当操作前进、后退的时候才会触发。

```js
class VueRouter {
  constructor (options) {
    this.$options = options

    // 定义一个响应式的 current, 如果它变了，那么使用它的组件会 render。
    // `Vue.util.defineReactive` 未公开文档，在 vue 源码的 src/core/global-api/index.js 里面。
    Vue.util.defineReactive(this, 'current', '')

    // 当路由变化的时候，重新赋值当前路径，当操作前进、后退的时候才会触发。
    window.addEventListener('popstate', () => {
      this.onHashChange()
    })
  }

  onHashChange () {
    this.current = window.location.pathname || '/'
  }
}
```

## 更改router-link

给 router-link 绑定点击事件，使用 pushState 跳转，再更新当前路由。

```js
// 注册 router-link 组件，利用 pushState 跳转。
Vue.component('router-link', {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  render (h) {
    return h('a', {
      attrs: { href: this.to },
      on: {
        // 绑定点击事件，改变路由
        click: event => {
          event.preventDefault()
          // pushState 不会触发 popstate
          window.history.pushState({}, '', this.to)
          // 手动执行变换
          this.$router.onHashChange()
        }
      }
    },
    this.$slots.default
    )
  }
})
```

## 结语

快动手试试吧 [查看示例](https://github.com/haiweilian/laboratory/tree/Vue@vue-router-history-simple-implementation)

