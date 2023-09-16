---
title: 红宝书笔记系列之《第 18 章-动画与 Canvas 图形》
date: 2021-06-17 23:17:18
updated: 2021-06-17 23:17:18
categories: JavaScript
---

## requestAnimationFrame

为了解决动画间隔不准确的问题而出现的 `requestAnimationFrame`。因为 `setTimeout` 和 `setInterval` 不能和电脑的刷新频率一致导致丢帧现象，具体的对比可查看 <https://www.cnblogs.com/luoyanan/p/8436127.html>。

比如以下要改变进度条的长度，就会在每次刷新屏幕之前执行 `updateProgress`。

```js
function updateProgress() {
  box.style.width = parseInt(box.style.width) + 5 + "px";
  if (box.style.width != "500px") {
    requestAnimationFrame(updateProgress);
  }
}
requestAnimationFrame(updateProgress);
```
