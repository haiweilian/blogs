---
title: 红宝书笔记系列之《第 12 章-BOM》
date: 2020-11-29
updated: 2020-11-29
categories: JavaScript
---

## 查询字符串

查询字符串解析成对象。

```js
function getQueryString() {
  let qs = location.search.length > 0 ? location.search.substring(1) : "";
  let args = {};
  for (let item of qs.split("&").map((kv) => kv.split("="))) {
    let name = decodeURIComponent(item[0]);
    let value = decodeURIComponent(item[1]);
    args[value] = name;
  }
  return args;
}
console.log(getQueryString()); // {1: "id", 2: "name"}
```

如果使用 `URLSearchParams` 提供了一组标准方法。

```js
// location.search = "?id=1&name=2"
let searchParams = new URLSearchParams(location.search);
console.log(searchParams.get("id")); // 1
searchParams.set("id", "11");
console.log(searchParams.get("id")); // 11
searchParams.delete("id");
console.log(searchParams.get("id")); // null
```
