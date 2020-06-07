---
title: axios全局的请求Loading
date: 2020-05-04
updated: 2020-05-04
categories: PlugIn
---

上次封装了[axios基础结构型封装](./axios基础结构型封装.md)。
基于这个结构扩展”全局的请求Loading“模块。使用 `axios` 的拦截功能实现。

## 查看示例

[查看示例](https://github.com/haiweilian/laboratory/tree/master/PlugIn/axios-global-config)

## 目录结构

```sh
├── http
│   ├── helper // 扩展模块
│   ├── http-base.js // 域名配置
│   ├── http.js // axios 封装
├── App.vue // 接口调用
```

## 封装函数

每当发请求时就触发一个全屏的 loading，多个请求合并为一次 loading。
loading插件可以根据使用的框架修改。这里使用 element-ui 做示例。

```javascript
// http/helper/http-loading-helper.js
import { Loading } from 'element-ui'

let needLoadingRequestCount = 0
let loading

/**
 * 开始 loading。注：loading 可以使用任意插件。
 */
function startLoading () {
  console.log('startLoading =============')
  loading = Loading.service({
    lock: true,
    text: '加载中……',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}

/**
 * 结束 loading
 */
function endLoading () {
  console.log('endLoading==========')
  loading.close()
}

/**
 * 当有请求的时候并且没有loading，开始 loading。并记录请求次数 + 1。
 */
export function showFullScreenLoading () {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}

/**
 * 当响应请求的时候，记录请求次数 - 1。如果请求次数为0，则关闭 loading。
 * 注：合并请求，延迟关闭(setTimeout)就能和下次请求连接上, 避免闪屏。
 */
export function tryHideFullScreenLoading () {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    setTimeout(() => {
      endLoading()
    }, 200)
  }
}
```

## 添加拦截

使用axios的请求拦截和响应拦截，当请求的时候触发 loading，当响应的关闭 loading。

```javascript
// http/helper/http-loading.js
import axios from 'axios'
import * as loadinging from './http-loading-helper'

/**
 * 请求拦截并判断此请求是否参与loading
 */
axios.interceptors.request.use(config => {
  if (config.loading) {
    loadinging.showFullScreenLoading()
  }
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截并判断此请求是否参与loading
 */
axios.interceptors.response.use(response => {
  if (response.config.loading) {
    loadinging.tryHideFullScreenLoading()
  }
  return response
}, error => {
  loadinging.tryHideFullScreenLoading()
  return Promise.reject(error)
})
```

当配置 `{ loading: false }` 可以让本次请求不参数请求。

```javascript
export function getUser (params, config = {}) {
  return http.get('/users/haiweilian', params, 1, { loading: false })
}
```

## 导入模块

这里没有在 `http.js` 里面的拦截写是为了便于扩展。以后可能还有判断权限、判断响应码等模块。

```javascript
// http/http.js
// ...
/**
 * 扩展模块
 */
import './helper/http-loading'
// ...
```

如果是项目独有的拦截逻辑，我们还可以在 `main.js` 里面导入此模块。而 `http.js` 却可以共用。

```javascript
// main.js
// ...
/**
 * 扩展模块
 */
import './helper/http-loading'
// ...
```
