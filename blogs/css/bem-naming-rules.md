---
title: 使用 BEM 命名思想来组织和描述更加清晰的结构
date: 2020-01-16
tags:
  - Css
  - Scss
categories:
  - 前端
---

[BEM](https://en.bem.info/methodology/quick-start/)是什么？BEM 是一种 CSS 命名思想，用于组织 HTML 中选择器的结构，利于 CSS 代码的维护，使得代码结构更清晰。其背后的想法是将用户界面分为独立的块。即使使用复杂的 UI，也使得结构变的清晰和简洁。

## 核心思想

BEM 的意思就是块（block）、元素（element）、修饰符（modifier)。依次举例。

### 块（block）

块在功能、逻辑和视觉上而不依赖其它组件的部分独立的组件，可以重复使用。语法：`B`。

如一个 `header` 就是一个块。

```html
<div class="header"></div>
```

块可以嵌套块, 如 `header`、`nav` 都是一个独立的块。

```html
<div class="header">
  <div class="nav"></div>
</div>
```

### 元素（element）

元素依赖属于块的某部分，不能单独使用。语法：`B__E` 使用双下划线 `__` 分隔。

如 `nav__item` 就是 `nav` 的元素。

```html
<div class="header">
  <ul class="nav">
    <li class="nav__item"></li>
    <li class="nav__item"></li>
  </ul>
</div>
```

### 修饰符（modifier)

用于修饰块或元素，体现出外形行为状态等特征的。比如我们常定义的 `.active` `.current`。语法：`B--M`、`B__E--M` 用双连字符 `--` 分隔。

如用 `nav--small` 修饰 `nav` 的大小，用 `nav__item--active` 修饰 `nav__item` 的选中状态。

```html
<div class="header">
  <ul class="nav nav--small">
    <li class="nav__item nav__item--active"></li>
    <li class="nav__item"></li>
  </ul>
</div>
```

## BEM 规范

### 命名规范

在 BEM 中每个 E（元素）只能出现一次，不存在 `B__E__E`（元素的元素）。

```css
.nav__item {
}

/* 不允许 */
.nav__item__item {
}
```

单词之间你可用 kebab-case（短横线命名）命名或 camelCased (驼峰式)。

```css
/* camelCased */
.elNav {
}

/* kebab-case */
.el-nav {
}
```

### 选择器规范

不允许使用 id 选择器。如果使用 id 选择器，就失去了复用的价值。

```css
/* 不允许使用id选择器作为css的样式名 */
#nav {
}
```

不允许使用元素选择器，必要时必须使用子选择器(基本没有规范会推荐使用的)。

```css
/* 不能使用元素选择器 */
.nav li {
}

/* 必要时必须使用子选择器 */
.nav > li {
}
```

选择器层级尽量平级。（名字以及够长，冲突的可能性不大。可以减少渲染时间）。

```css
/* 尽量不要嵌套使用 */
.nav {
}
.nav .nav__item {
}

/* 应该尽量平级 */
.nav {
}
.nav__item {
}
```

## 使用预编译工具

使用 scss、less 可以减少我们的前缀编写量。

```scss
// index.scss
.nav {
  &__item {
    display: inline-block;
    &--active {
      color: blue;
    }
  }
  &--small {
    font-size: 12px;
  }
}
```

编译后展开。

```css
.nav {
  display: flex;
}
.nav--small {
  font-size: 12px;
}
.nav__item {
  display: inline-block;
}
.nav__item--active {
  color: blue;
}
```

## BEM 变体，其他命名方案

BEM 重要的是思想，具体使用哪种连字符有多种方案。[官方也采用了社区的命名方案](https://en.bem.info/methodology/naming-convention/#alternative-naming-schemes)。不管哪种风格根据自己的团队或喜好选择一种风格。

## 实践理论

- BEM 块的划分，与层级无关。

- BEM 最难的部分之一是明确作用域是从哪开始和到哪结束的，以及什么时候使用（不使用）它。

## 如何看待 BEM

每一种解决方案总会有人反对和支持或许它适用于某些场景，[如何看待 CSS 中 BEM 的命名方式？](https://www.zhihu.com/question/2193515)，就像文中说的“取其精华去其糟粕，BEM 的规范不一定是最佳实践，如果真的毫无价值,是会马上被历史所淹没的”。

而近年来的基于 Vue、React 的前端 ui 框架，也有使用 BEM 命名，您可以到官网审查元素查看 Html 源代码。[element-ui](https://element.eleme.cn/#/zh-CN/component/installation)、[vant](https://youzan.github.io/vant/#/zh-CN/intro) ...

## 参考资料

<https://en.bem.info/methodology/quick-start>

<https://www.w3cplus.com/css/mindbemding-getting-your-head-round-bem-syntax.html>
