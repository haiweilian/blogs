---
title: Vben Admin 深入理解之动态主题切换的设计
date: 2021-09-05
tags:
  - Vue
categories:
  - 前端
---

上周研究了 [Vben Admin](https://github.com/anncwb/vue-vben-admin) 的环境变量和权限的设计，现在项目已经在用了还在搭建页面结构阶段，在主题这需要修改遇到了疑惑所以就把这部分的实现也看看。

### 疑问点

本部分主要分析主题相关的配置、主题切换的逻辑已经怎么定义修改主题。

- 主题是怎么切换的逻辑是什么？
- 怎么定义主题需要修改哪些配置？

### 主题定义

点开设置里，可以设置 _主题_、_系统主题_、_顶栏主题_、_菜单主题_ 先来看看配置订单在那。

可用的颜色列表的配置。

```ts
// src/settings/designSetting.ts
// app theme preset color
export const APP_PRESET_COLOR_LIST: string[] = [
  /* ... */
];

// header preset color
export const HEADER_PRESET_BG_COLOR_LIST: string[] = [
  /* ... */
];

// sider preset color
export const SIDE_BAR_BG_COLOR_LIST: string[] = [
  /* ... */
];
```

和主题相关的项目配置，主题变化的时候会更新这些值。

```ts
// src/settings/projectSetting.ts
const setting = {
  // 项目主题色
  themeColor: primaryColor,
  // 网站灰色模式
  grayMode: false,
  // 色弱模式
  colorWeak: false,
  // 头部配置
  headerSetting: {
    // 背景色
    bgColor: '#ffffff',
    // 主题
    theme: MenuThemeEnum.LIGHT,
  }
  // 菜单配置
  menuSetting: {
    // 背景色
    bgColor: '#273352',
  	// 菜单主题
    theme: MenuThemeEnum.DARK
  }
}
```

### 主题插件配置

在分析实现之前先看一下 [vite-plugin-theme](https://github.com/anncwb/vite-plugin-theme) 插件，因为基于此实现的。

此插件主要做了两个事情：加载 `ant-design-vue` 的暗黑主题配置和把一个颜色值替换成另一个颜色值。

基于 `ant-design-vue` 的官网文档[定制主题-使用暗黑主题](https://2x.antdv.com/docs/vue/customize-theme-cn) 中提供的 `getThemeVariables` 实现暗黑主题再额外做一些定制。

```js
// build/generate/generateModifyVars.ts
import { getThemeVariables } from 'ant-design-vue/dist/theme';
export function generateModifyVars(dark = false) {
  const modifyVars = getThemeVariables({ dark });
  return {
    ...modifyVars
  };
}

// build/vite/plugin/theme
import { antdDarkThemePlugin } from 'vite-plugin-theme';
export function configThemePlugin() {
  const plugin = [
    antdDarkThemePlugin({
      darkModifyVars: {
        ...generateModifyVars(true)
      }
    });
  ]
  return plugin
}
```

还有一个配置是把一个颜色值替换成另一个颜色值，源码中处理的比较复杂用一个简化的例子来看。假设现有一个样式定义。

```css
.test {
  color: #e72528;
}
```

定义插件并设置匹配需要修改的颜色。

```js
// build/vite/plugin/theme
import { viteThemePlugin } from 'vite-plugin-theme';
export function configThemePlugin() {
  const plugin = [
    viteThemePlugin({
      // 匹配需要修改的颜色
      colorVariables: ["#e72528"]
    });
  ]
  return plugin
}
```

然后实现一个函数用于替换样式表的颜色值。

```js
import { replaceStyleVariables } from "vite-plugin-theme/es/client";
export async function changeThemeColor(color: string) {
  return await replaceStyleVariables({
    colorVariables: [color],
  });
}
```

当调用 `changeThemeColor("#1d1b1b")` 最后实现的效果如下。

```css
.test {
  color: #e72528;
}
/* 多一个样式，覆盖之前的 */
.test {
  color: #e72528;
}
```

### 主题切换处理

在主题切换的时候发现都是经过一个函数处理，那么重点看这个函数怎么处理的即可。

```ts
// src/layouts/default/setting/SettingDrawer.tsx
function renderHeaderTheme() {
  // ...
  baseHandler(event, value);
}
function renderSiderTheme() {
  // ...
  baseHandler(event, value);
}
function renderMainTheme() {
  // ...
  baseHandler(event, value);
}
```

在每个分支调用不同的函数进行单独的处理，下面看看每个函数的实现。

```ts
// src/layouts/default/setting/handler.ts
export function baseHandler(event: HandlerEnum, value: any) {
  const appStore = useAppStore();
  // 处理设置类型
  const config = handler(event, value);
  // 更新项目配置
  appStore.setProjectConfig(config);
}

export function handler(event: HandlerEnum, value: any): DeepPartial<ProjectConfig> {
  const appStore = useAppStore();
  const { getThemeColor, getDarkMode } = useRootSetting();
  switch (event) {
    // 更新系统颜色
    case HandlerEnum.CHANGE_THEME_COLOR:
      if (getThemeColor.value === value) {
        return {};
      }
      changeTheme(value);

      return { themeColor: value };

    // 更新系统主题
    case HandlerEnum.CHANGE_THEME:
      if (getDarkMode.value === value) {
        return {};
      }
      updateDarkTheme(value);

      return {};

    // 更新菜单主题
    case HandlerEnum.MENU_THEME:
      updateSidebarBgColor(value);
      return { menuSetting: { bgColor: value } };

    // 更新顶栏主题
    case HandlerEnum.HEADER_THEME:
      updateHeaderBgColor(value);
      return { headerSetting: { bgColor: value } };
  }
}
```

### 系统主题

调用 `changeTheme` 更新系统主题就是利用上面替换样式表的颜色值方式实现的，配置方式同上。

```ts
// src/logics/theme/index.ts
export async function changeTheme(color: string) {
  const colors = generateColors({
    mixDarken,
    mixLighten,
    tinycolor,
    color,
  });

  return await replaceStyleVariables({
    colorVariables: [...getThemeColors(color), ...colors],
  });
}
```

### 默认主题和黑暗主题

调用 `updateDarkTheme` 更新暗黑主题，通过改变 `html` 标签的 `data-theme` 属性来进行黑暗主题切换。

```ts
// src/logics/theme/dark.ts
export async function updateDarkTheme(mode: string | null = "light") {
  const htmlRoot = document.getElementById("htmlRoot");
  if (mode === "dark") {
    if (import.meta.env.PROD && !darkCssIsReady) {
      await loadDarkThemeCss();
    }
    htmlRoot.setAttribute("data-theme", "dark");
  } else {
    htmlRoot.setAttribute("data-theme", "light");
  }
}
```

使用示例列子。

```css
[data-theme="dark"] {
  /* 黑暗主题主题时的样式 */
}
[data-theme="light"] {
  /* 亮色主题主题时的样式 */
}
```

### 顶栏主题和菜单主题

顶栏和菜单样式是使用 `css` 函数 `var` 获取样式变量，并更新 `html` 属性上的变量值实现的。

```ts
// src/logics/theme/updateBackground.ts
export function updateHeaderBgColor(color) {
  setCssVar("--header-bg-color", color);
  // ...
}

export function updateSidebarBgColor(color) {
  setCssVar("--sider-dark-bg-color", color);
  // ...
}
```

使用示例列子。

```css
html {
  --header-bg-color: #394664;
  --sider-dark-bg-color: #273352;
}

.ant-layout-sider-dark {
  background-color: var(--sider-dark-bg-color);
}

.vben-layout-header--dark {
  background-color: var(--header-bg-color);
}
```

### 色弱模式和灰色模式

还有两个主题模式是整体改变项目颜色，使用滤镜实现。

```ts
// src/logics/theme/updateColorWeak.ts
export function updateColorWeak(colorWeak: boolean) {
  toggleClass(colorWeak, "color-weak", document.documentElement);
}

// src/logics/theme/updateGrayMode.ts
export function updateGrayMode(gray: boolean) {
  toggleClass(gray, "gray-mode", document.documentElement);
}
```

```css
.color-weak {
  filter: invert(80%);
}

.gray-mode {
  filter: grayscale(100%);
  filter: progid:dximagetransform.microsoft.basicimage(grayscale=1);
}
```

### 总结

没有总结了，现有的 Vben Admin 常用的情况已经处理好了新写组件的时候应尽量使用定义好的变量，善用现有的主题规则。
