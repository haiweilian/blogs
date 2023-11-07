---
title: 实践 Vue3 组件库-介绍一下这个系列
date: 2022-08-10
tags:
  - Vue
categories:
  - 前端
---

## 前言

一开始我们项目中的通用组件是放在项目中的，基于开源组件库的扩展，补充些组件和功能。但随着项目的拆分组件也需要公用，就把组件提取成了一个 GIT 子模块来达到通用。也随着新开项目的工具链的升级不能直接引用源码的原因又把组件打包处理。

这中间也不断按照开源组件库的标准完善和补充，中间也记录了不少的知识点。所以准备把这些整理和归纳写成一个系列文章。

## 说明

本系列的所有的代码都会发布在 [vlib-starter](https://github.com/bfehub/vlib-starter) 这个模板内。每一个独立的功能都会创建一个分支。

- 此项目主要是作为学习使用，特殊特性自己修改。

- 此项目的每个分支都只包含最初必要的功能，会做必要的错误更新不会新增大的更新，保证文章中的代码和仓库中的代码不会大的出入。

- 此项目的每个分支都是相对独立的功能，每个实现不代表最好的解决方案，你可以按需参考或自行实现另一种方案。

- 此项目的代码在当前版本都是可运行的，可能由于依赖破坏性的升级导致错误(你可以反馈升级依赖)。

- 此系列的文章中涉及到的工具或类库自行提前查阅学习，并没有篇幅详细介绍如何从零使用，会给出一些学习资料，

- 由于不常写文章文笔有限写的不好的部分请见谅，不过对代码质量还是有信心的。

## 目录

全部的最新内容你可以在 [喵呜~工程化](https://juejin.cn/column/7130951037547970567) 这个专栏里查看，掘金的右边导航也可以看到专栏的目录。

### 01-lint

本章我们使用 [ESLint](https://eslint.org/)、[StyleLint](https://stylelint.io/)、[TypeScript ESLint](https://typescript-eslint.io/docs/) 这些工具和工具插件搭建项目的代码规范，并设计成一个可共享的预设配置。让你的团队共享同一份代码规范。当然也会在项目中加入列如 [Husky](https://github.com/typicode/husky)、[Commitlint](https://github.com/conventional-changelog/commitlint)、[Lint Staged](https://github.com/okonet/lint-staged) 之类的提交规范工具。

[>>> 实践 Vue3 组件库-可共享的编码规范和提交规范](./vlib-starter-2.md)

### 02-docs

本章我们基于 [VuePress](https://v2.vuepress.vuejs.org/zh/) 搭建组件文档，并且自己去实现一个解析插件来实现组件效果展示，方便你实现各种自定义的需求。如果你更喜欢 [VitePress](https://vitepress.vuejs.org/) 后面也会有单独的实现可供切换选择。

[>>> 实践 Vue3 组件库-基于 VuePress 开发组件文档](./vlib-starter-3.md)

### 03-ui

本章我们基于 [Vant](https://vant-ui.github.io/vant/#/zh-CN) 组件库去扩展一个组件(SFC + TSX)。选择一个组件库扩展的原因是我们工作中基本不会从头搭建组件，如果基于一个组件库开发是由一些需要注意点的。如果你想基于其他的组件库或者不基于组件库那也是没有问题的，后面代码中都没有强绑定。

[>>> 实践 Vue3 组件库-如何基于组件库扩展业务组件(组件篇一)](./vlib-starter-4.md)

### 04-ui-test

本章我们基于 [Vitest](https://cn.vitest.dev/) 和 [Vue Test Utils](https://test-utils.vuejs.org/) 了解单元测试的基本概念和补充组件的单元测试。

[>>> 实践 Vue3 组件库-基于 Vitest/VTU 的组件单元测试(组件篇二)](./vlib-starter-5.md)

### 05-ui-gen

本章我们开发一个组件模板并编写创建脚本，一键生成一个全新的组件模板避免开发一个组件复制组件结构。

[>>> 实践 Vue3 组件库-如何实现 Gen 一个新组件(组件篇三)](./vlib-starter-6.md)

### 06-build

本章我们使用 [Gulp](https://gulpjs.com/)、[Rollup](https://rollupjs.org/guide/en/)、[ESBuild](https://esbuild.github.io/) 编写各种子任务，打包多种格式组件产物，以及生成组件的类型声明文件。

[>>> 实践 Vue3 组件库-如何实现组件打包与组件声明文件(打包篇一)](./vlib-starter-7.md)

### 07-build-style

本章我们使用 [Gulp](https://gulpjs.com/) 生态的插件打包样式代码，并开发一个 [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components) 解析器实现组件和样式的自动导入和按需加载。

[>>> 实践 Vue3 组件库-如何实现样式打包与按需引入(打包篇二)](./vlib-starter-8.md)

### 08-build-helper

本章我们了解 VSCode 和 WebStorm 编辑器提示全局组件代码的配置原理，并实现根据文档自动生成这些配置文件优化业务开发体验。

[>>> 实践 Vue3 组件库-如何实现全局组件在代码编辑器中的智能提示(打包篇三)](./vlib-starter-9.md)

### 09-publish

本章我们发布我们的文档和组件。使用 Changesets 作为我们多包管理工具发布项目，使用 Github Pages 或 Vercel 发布项目文档。了解和使用一些 GitHub 上功能，比如 Actions 任务、Issues 标准、其他美化项目的功能。

[>>> 实践 Vue3 组件库-基于 changesets 的版本管理及自动化发布](./vlib-starter-10.md)

### 10-...

暂时规划的就这么多，后续如果有新的想法会补充进来。如果你觉得哪些必要补充可以互动交流。

## 如何开始

首先你可以把 [0-init](https://github.com/bfehub/vlib-starter/tree/0-init) 这个初始结构 Clone 下来，接下来我们就基于这个结构一步步完善。

- 你需要了解 [pnpm](https://pnpm.io/zh/installation) 的基础使用。

- 你需要了解 [vue3](https://staging-cn.vuejs.org/) 的基础使用。

- 你需要了解 [typescript](https://www.typescriptlang.org/) 的基础使用。

- 你需要了解 [nodejs](https://nodejs.org/en/) 的基础使用。

- 以及上面用到的工具都贴出了链接你可提前了解学习。

## 结尾

那么就开始我们的组件库搭建之旅吧！！！
