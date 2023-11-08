---
title: 学完 Vue3、TypeScript 干什么，先来一个"网抑云"
date: 2021-07-09
categories:
  - 技术分享
---

## 1、前言

没错又是仿网易云，那么多了网易云项目了还写？纯粹是为了学习罢了。

之前学习的 `Vue3`、`Vite2`、`TypeScript` 一直没有新项目可用，控制不住自己的小手了必须写写，也为了要看源码熟悉熟悉语法。

整体代码写的比较简洁，功能也比较简洁，想练习的可以继续扩展，很多功能都没做。

**项目地址**

<https://github.com/haiweilian/vnext-netease-music>

**项目 UI 也不知道怎么设计(部分逻辑也是)，这里参考了 ssh 的开源项目**

<https://github.com/sl1673495/vue-netease-music>

**接口使用的 Binaryify 的开源项目。**

<https://github.com/Binaryify/NeteaseCloudMusicApi>

## 2、项目准备

> 之后的内容都是开发的过程中随手记录的笔记整理了一下，到这一步可以跑起来项目写写了。

#### 扩展工具

- 使用 [Vite](https://cn.vitejs.dev/guide/) 初始化一个项目。

- 安装 Vue3 的 VSCode 插件 [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)。

- 安装 Vue3 的 Chorme 扩展 [Vue Devtools 6.x](https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg) 同时支持 2 和 3 版本。

#### 项目依赖

```json
"dependencies": {
  "@vueuse/core": "5.1.0",
  "axios": "^0.21.1",
  "dayjs": "^1.10.5",
  "element-plus": "^1.0.2-beta.54",
  "lrc-kit": "^1.1.1",
  "vue": "^3.1.4",
  "vue-lazyload-next": "^0.0.2",
  "vue-router": "^4.0.10",
  "vuex": "4.0.2"
}
```

#### 插件统一注册

把插件都放到 `modules` 目录下，利用 `Vite` 的 `import.meta.globEager` 加载注册。

在 `modules` 下的文件都返回一个 `install` 函数。

```js
// src/modules/element-plus.ts
import type { App } from "vue";
import "element-plus/lib/theme-chalk/base.css";

export const install = (app: App) => {
  app.config.globalProperties.$ELEMENT = { size: "mini" };
};
```

在 `main.ts` 中使用 Glob 导入统一注册。

```js
// src/main.ts
Object.values(import.meta.globEager("./modules/*.ts")).map((i) => i.install?.(app));
```

#### Vue3

整体使用的 `script setup` 语法，在写的时候还没有定稿，写完之后发现定稿了看了看只有部分不兼容。详情查看 [script setup](https://github.com/vuejs/rfcs/pull/227#issuecomment-870105222)。

需要全部更新下依赖包，替换成新的语法即可。更新依赖推荐使用 `npm-check-updates` 整个项目进行更新。

比如涉及到的变更：

- `defineEmit` => `defineEmits`。

- `useContext()` -> `useSlots()` + `useAttrs()`。

- `defineEmits` 和 `defineProps` 不再需要导入。

#### Vuex4

`Vuex4` 变更不大，只是对 `ts` 的支持基本上任何改变，比如 `store`、 `commit`、`dispatch` 都不是很好的提示。

关于 `store` 有一遍文章 [Vue3 中让 Vuex 的 useStore 具有完整的 state 和 modules 类型推测](https://juejin.cn/post/6896367626441654279)，不过也得单独处理。

而对 `commit`、`dispatch` 源码中的类型直接就是 `string`。

```ts
export interface Dispatch {
  (type: string, payload?: any, options?: DispatchOptions): Promise<any>;
  <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<any>;
}

export interface Commit {
  (type: string, payload?: any, options?: CommitOptions): void;
  <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;
}
```

最后期待一下 `Vuex5`，后续先用 `pinia` 改一版试试。

#### VueRouter4

路由这部分变化还是挺大的移除了多个功能，不过大部分移除的功能都能使用 `custom` 和 `v-slot` 来做。

比如使用任意的标签跳转：

```html
<RouterLink v-slot="{ navigate, isExactActive }" :to="menu.link" custom>
  <li class="menu-song__item" :class="{'is-active': isExactActive}" @click="navigate">
    <Icon :name="menu.icon" />
    <span class="menu-song__value"> {{ menu.name }} </span>
  </li>
</RouterLink>
```

#### TypeScript

在看完官网的教程之后在写业务上基本上没什么问题，在和 Vue 结合使用主要几点。

导入类型使用 `type` 指定导入类型，如果不加在 `xx.ts` 文件里是没问题的，但在 `script setup` 因为会自动收集顶层变量，所以会报错 `“PropType”仅表示类型，但在此处却作为值使用。`。使用 `type` 也便于区分逻辑与类型。

```ts
import { onMounted, ref, watch } from "vue";
import type { PropType } from "vue";
```

在项目中避免不了使用库定义的类型，我们根据调用的函数点进去，查看里面的声明关系就可以找到没有在文档中指出的子类型之类的。

```js
import { ElLoading } from "element-plus";
import type { ILoadingInstance } from "element-plus/packages/loading/src/loading.type";

let needLoadingRequestCount = 0;
let loading: ILoadingInstance;
```

#### VueUse

在这个项目中用到了这个库，这个库绝对能让你感受到 `Vue3` 好在那。

比如用到的 `useStorage`、`onClickOutside`、`useMediaControls` 极大的方便了开发。

## 3、代码规范

#### 编码规范

各种规范集成没想折腾，是直接使用 [antfu](https://github.com/antfu/eslint-config) 提炼出的常用的配置。就是把各种规则和插件给组合了形成一套插件，不想折腾的可以快速使用。可以参照这种方式封装一套公用的配置。

```sh
npm i eslint @typescript-eslint/eslint-plugin @antfu/eslint-config --save-dev
```

在 `.eslintrc` 文件，添加以下内容。就可以获得 `eslint & typescript & vue3 & react` 的格式化了。

```js
{
  "extends": "@antfu",
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off"
  }
}
```

#### 提交规范

提交规范使用 `husky`、`commitlint`、`commitizen`、`standard-version` 配置也很简单看官方文档即可。之前总结过各种配置方便使用[编码规范、提交规范](https://github.com/haiweilian/blogs/blob/master/Tools/2020-08-10.md)。

## 4、CSS 命名

命名风格使用的 `BEM` 规范，里面用到了 `element-plus` 源码中的 `mixins` 函数，具体查看[element-plus/theme-chalk](https://github.com/element-plus/element-plus/blob/dev/packages/theme-chalk/src/mixins/mixins.scss#L70)。

在 `vite` 中使用 `scss` 全局导入，可以导入文件路径。**注意后面的分号(;)**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "src/styles/additional.scss";',
      },
    },
  },
});
```

简单说下 `element-plus` 源码中的 `@mixin b($block)` 、`@mixin e($element)` 、 `@mixin m($modifier)` 、 `@mixin when($state)` 几个主要的 `mixin`。

**@mixin b(\$block)**

定义生成块。参数为块的名称。

```scss
@include b(input) {
  display: inline-block;
}
```

```css
.el-input {
  display: inline-block;
}
```

**@mixin e(\$element)**

定义生成元素。参数是元素的名称，可以传入多个。

```scss
@include b(input) {
  @include e(inner) {
    padding: 0 15px;
  }

  @include e((suffix, suffix-inner)) {
    position: absolute;
  }
}
```

```css
.el-input__inner {
  padding: 0 15px;
}

.el-input__suffix,
.el-input__suffix-inner {
  position: absolute;
}
```

**@mixin m(\$modifier)**

定义生成修饰。参数是修饰的名称，可以传入多个，`($modifier1, $modifier2, ...)`。

```scss
@include b(input) {
  @include m(medium) {
    height: 30px;
  }

  @include m((mini, small)) {
    height: 20px;
  }
}
```

```css
.el-input--medium {
  height: 30px;
}

.el-input--mini,
.el-input--small {
  height: 20px;
}
```

**@mixin when(\$state)**

定义条件状态。参数是状态的名称。

```scss
@include b(input) {
  @include when(disabled) {
    cursor: not-allowed;
  }
}
```

```css
.el-input.is-disabled {
  cursor: not-allowed;
}
```

## 5、SVG 图标

单独处理 `SVG` 是希望以组件的方式使用，做状态切换的时候也方便。使用 [vite-plugin-svg-icons](https://github.com/anncwb/vite-plugin-svg-icons) 做的处理，使用方式可查看文档。

在配置好依赖和图标目录之后，创建一个 `Icon` 组件。

```vue
<template>
  <svg :style="getStyle" class="icon" aria-hidden="true">
    <use :xlink:href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CSSProperties } from "vue";

const props = defineProps({
  prefix: {
    type: String,
    default: "icon",
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 16,
  },
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
const getStyle = computed((): CSSProperties => {
  const { size } = props;
  let s = `${size}`;
  s = `${s.replace("px", "")}px`;
  return {
    width: s,
    height: s,
  };
});
</script>
```

导入或全局注册就可以用了。

```html
<Icon :name="menu.icon" />
```

## 6、请求处理

把接口过了一遍，发现数据不好处理层级也比较深不利于渲染(因为做的简单，大部分都用不到)。所以所有的字段在使用之前使用 `map()` 统一做了字段的转化。

举个简单的 🌰 ：

```js
// 字段是 namea
[{ namea: "lian" }].map((user) => {
  name: user.namea;
});

// 字段是 nameb
[{ nameb: "lian" }].map((user) => {
  name: user.nameb;
});

// 经过转化后是一致的，有些层级深的也直接拉成平级。
[{ name: "lian" }];
```

所有的接口都写了 [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) 的配置文件。

```sh
@hostname = http://localhost:3000

# 查询对应资源热门评论
GET {{hostname}}/comment/hot?id=186016&type=0 HTTP/1.1

# 查询对应资源的评论
GET {{hostname}}/comment/new?id=186016&type=0&sortType=3 HTTP/1.1
```

## 7、歌词解析

接口返回的歌词是一个字符串，用一个插件去解析的 [lrc-kit](https://github.com/weirongxu/lrc-kit)，会返回解析后的数组，解析完后直接循环可以了，我们需要做的就是定位歌词和自动滚动到居中。

在使用 `lrc-kit` 中可以通过 `curIndex()` 获取当前时间的行数，通过行数获取到歌词所在元素的偏移量并计算滚动距离[v-for 中的 Ref 数组](https://v3.cn.vuejs.org/guide/migration/array-refs.html)。

```js
/**
 * 获取歌词列表 ref，在检测到当前行变化的时候，定位歌词到内容中间
 */
const scroller = ref()
const lyricLineRefs = ref<HTMLElement[]>([])
const setItemRef = (el: HTMLElement): void => {
  lyricLineRefs.value.push(el)
}

watch(lineActive, (num: number) => {
  const curDom = lyricLineRefs.value[num]
  scroller.value.scrollTop = curDom.offsetTop - 130 + curDom.offsetHeight / 2
})
```

## 8、项目部署

两个项目都是部署在 `vercel` 上的。

- [前端项目部署](https://cn.vitejs.dev/guide/static-deploy.html#vercel)

- [后端项目部署](https://neteasecloudmusicapi.vercel.app/#/?id=vercel-%e9%83%a8%e7%bd%b2)

## 9、结尾总结

[感谢阅读，喜欢点个 ✨✨](https://github.com/haiweilian/vnext-netease-music)

经过这次的实践，在写业务应该没什么问题。对于 `Ts` 的一些高级类型还是用的比较少。接下来的空余时间研究 `Ts` 高级类型和 `Vue3` 源码。
