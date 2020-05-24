---
title: vue中diff算法的理解
date: 2020-05-24
updated: 2020-05-24
categories: Vue
---

## 什么是diff算法

![diff过程](../Images/Vue/vue-diff-01.png)

`diff` 算法是 **虚拟DOM技术** 的必然产物，通过新旧虚拟dom作对比，将变化的地方更新在真实的dom上。另外，也需要 `diff` 高效的执行对比过程，从而降低复杂度。

## vue中的diff

vue 2.x 中为了降低 `watcher` 粒度，每个组件只有一个 `watcher` 与之对应，只有引入 `diff` 才能精确找到发生变化的地方。

## vue中的patch

vue中 `diff` 执行的时刻是组件实例执行其更新函数时，它会对比上一次渲染结果 `oldVnode` 和新的结果 `newVnode`，此过程称为 `patch`。

## vue中的diff和patch和过程

![虚拟DOM](../Map/Vue/5.虚拟DOM.png)

整体 `diff` 过程遵循**深度优先**、**同层比较**的策略,两个节点之间比较会根据它们是否拥有子节点或者文本节点做不同操作。

比较两组子节点是算法的重点，首先假设头尾节点可能相同做4次比对尝试，如果没有找到相同节点才按照通用方式遍历查找，查找完结果在按情况处理剩下的节点。

借助 `key` 通常可以非常精确找到相同节点，因此整个 `patch` 过程非常高效。

