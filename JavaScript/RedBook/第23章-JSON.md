---
title: 红宝书笔记系列之《第 23 章-JSON》
date: 2020-12-06
updated: 2020-12-06
categories: JavaScript
---

## 序列化

利用第二参数，对象的每个键值对都会被函数先处理。

```js
let s = { name: "lian", age: 22, status: true };
let s1 = JSON.stringify(s, (key, value) => {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value;
});
console.log(s1); // {"name":"LIAN","age":22,"status":true}
```

有时候，在对象需要上自定义 JSON 序列化，可以在序列化的对象中添加 `toJSON()` 方法。

```js
let sto = {
  name: "lian",
  age: 22,
  status: true,
  toJSON() {
    return this.age * 2;
  },
};
console.log(JSON.stringify(sto)); // 44
```

## 解析

利用第二参数，对象的每个键值对都会被函数先处理。

```javascript
let sp = '{"name":"lian","age":22,"status":true}';
sp1 = JSON.parse(sp, function (key, value) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value;
});
console.log(sp1); // { name: 'LIAN', age: 22, status: true }
```
