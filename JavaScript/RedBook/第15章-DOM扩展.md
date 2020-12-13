---
title: 红宝书笔记系列之《第 15 章-DOM 扩展》
date: 2020-11-29
updated: 2020-11-29
categories: JavaScript
---

## classList

HTML5 给所有元素增加 `classList` 属性为操作类型提供了更简单的方法。

- add：向类名列表中添加指定的字符串值，如果这个值已经存在，则什么都不做。
- contains：返回布尔值，表示给定的字符串是否存在。
- remove：从列表中删除指定的字符串值。
- toggle：如果类名列表中已经存在指定的 value 则删除。如果不存在，则添加。

```html
<div id="box"></div>
<script>
  box.classList.add("disabled");
  console.log(box.classList.contains("disabled")); // true
  box.classList.remove("disabled");
  console.log(box.classList.contains("disabled")); // false
</script>
```

## insertAdjacentHTML

插入标签，可以是字符串会自动解析成 html。

- beforebegin：插入当前元素的前面，作为前一个同胞节点。
- afterbegin：插入当前元素内部，作为新的子节点或放在第一个子节点前面。
- beforeend：插入当前元素内部，作为新的子节点或放在最后一个子节点前面。
- afterend：插入当前元素的后面，作为下一个同胞节点。

```html
<ul id="ul">
  <li id="li"></li>
</ul>
<script>
  li.insertAdjacentHTML("beforebegin", "<li>插入当前元素的前面，作为前一个同胞节点。</li>");
  console.log(ul.innerHTML); // <li>插入当前元素的前面，作为前一个同胞节点。</li> <li id="li"></li>
</script>
```

## insertAdjacentText

`insertAdjacentText` 与 `insertAdjacentHTML` 有相同的配置。

```html
<div id="text">insertAdjacentText</div>
<script>
  text.insertAdjacentText("afterbegin", "插入当前文本的前面。");
  console.log(text.innerHTML); // 插入当前文本的前面。insertAdjacentText
</script>
```

## scrollIntoView

`scrollIntoView` 存在于所有的元素上，可以滚动浏览器窗口，或容器。使元素进入视口。

- behavior：定义过渡动画，可选 "smooth" / "auto" 。
- block：定义垂直方向的对齐，可选 "start" / "center" / "end" / "nearest" 。
- inline：定义水平方向的对齐，可选 "start" / "center" / "end" / "nearest" 。

```html
<div style="height: 2000px">
  <button id="button" style="margin-top: 1000px">出现在可视区域</button>
</div>
<script>
  // 窗口滚动后元素的顶部与视口顶部对齐
  button.scrollIntoView(true);
  button.scrollIntoView({ block: "start" });

  // 窗口滚动后元素的底部部与视口底部对齐
  button.scrollIntoView(false);
  button.scrollIntoView({ block: "end" });

  button.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
</script>
```
