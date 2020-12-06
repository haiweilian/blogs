---
title: 红宝书笔记系列之《第 15 章-DOM 扩展》
date: 2020-11-29
updated: 2020-11-29
categories: JavaScript
---

## classList 属性

HTML5 给所有元素增加 classList 属性为操作类型提供了更简单的放大。

add(value)，向类名列表中添加指定的字符串值，如果这个值已经存在，则什么都不做。
contains(value)，返回布尔值，表示给定的字符串是否存在。
remove(value)，从列表中删除指定的字符串值。
toggle(value)，如果类名列表中已经存在指定的 value，则删除。如果不存在，则删除。

```js
div.classList.add("disabled");
```

## readyState 属性。

loading 表示文档正在加载.。
complete 表示文档加载完成。

判断文档是否加载完毕，在不支持之前，会通过 onload 事件处理程序完成后设置一个标识。

```js
var readyState = "loading";
window.onload = function () {
  readyState = "complete";
};
```

现在可以直接判断

```js
if (document.readyState === "complete") {
  // 加载完成
}
```

## insertAdjacentHTML 和 insertAdjacentText

插入标签，可以是字符串会自动解析成 html

beforebegin 插入当前元素的前面，作为前一个同胞节点。
afterbegin，插入当前元素内部，作为新的子节点或放在第一个子节点前面。
beforeend，插入当前元素内部，作为新的子节点或放在最后一个子节点前面。
afterend，插入当前元素的后面，作为下一个同胞节点。

```js
element.insertAdjacentHTML("beforebegin", "<div></div>");
element.insertAdjacentText("beforebegin", "f0hf9urhfuru");
```

## scrollIntoView()

> ps： 使用场景.
> scrollIntoView() 存在于所有的元素上，可以滚动浏览器窗口。或容器元素，一遍进入视口。

滚动元素平滑地进入视口中心位置。（更多选项可查询 mdn）

```js

// 窗口滚动后元素的顶部与视口顶部对齐
docuemnt.dic.scrollIntoView(true)
docuemnt.dic.scrollIntoView({block: 'start'})

// 窗口滚动后元素的底部部与视口底部对齐
docuemnt.dic.scrollIntoView(false)
docuemnt.dic.scrollIntoView({block: 'end'})

docuemnt.dic.scrollIntoView({
  behavior: 'smooth',
  block: 'center', // start / center / end / nearest
  inline: 'center' // 同上
})
···
```
