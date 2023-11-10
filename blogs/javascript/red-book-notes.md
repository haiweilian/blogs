---
title: 《Javascript高级程序设计第四版》之初读笔记
date: 2020-12-23
tags:
  - JavaScript
categories:
  - 前端
---

## 前言

此次看红宝书的主要重点是测试练习和知识补充，但有些概念和理解也用文字描述了下来，所以代码占比多。[测试源码地址](https://github.com/haiweilian/demos/tree/master/JavaScript/red-book)

- 记录了哪些内容：有不熟悉的、有不知道的、还有纯粹补充章节内容的。
- 红宝书的内容远不止这些 **(建议看全书)**，阅读顺序和阅读内容参考了 [参考阅读建议](https://juejin.cn/post/6895304726822027277) 。
- 沉淀一阵子后继续读第二遍，包含剩余的部分和深入的部分。

## 《第 1 章-什么是 JavaScript》

#### JavaScript 实现

JavaScript 的实现包含三部分，分别是：`ECMAScript`（核心）、`DOM`（文档对象模型）、`BOM`（浏览器对象模型）。

- `ECMAScript` 是对语言规范的称呼，分别描述了：语法、类型、语句、关键字、保留字、操作符、全局对象。

- `DOM（Document Object Model）` 用于操作 `HTML` 的应用编程接口。

- `BOM（Browser Object Model）` 用于支持访问和操作浏览器的窗口。

## 《第 2 章-HTML 中的 JavaScript》

#### script 元素

###### async 和 defer 属性

- `async` 表示应该立即开始下载脚本，但不阻止其他页面动作（执行顺序是不定的），只对外部文件有效。

- `defer` 表示文档解析和显示完成后再执行脚本（相当于把执行放到了最底部），只对外部文件有效。

- 默认会按照 `<script>` 在页面中出现的顺序依次解析它们，前提是没有使用 `async` 和 `defer` 属性。

以下可以看出：加载顺序是固定的。

```html
<script src="./defer.js"></script>
<script src="./async.js"></script>
<script src="./default.js"></script>
<!-- defer async default -->
<!-- defer async default -->
<!-- defer async default -->
```

以下可以看出：`async` 的顺序是不固定的，`defer` 一直在 `default` 之后。

```html
<script defer src="./defer.js"></script>
<script async src="./async.js"></script>
<script src="./default.js"></script>
<!-- async default defer-->
<!-- default defer async-->
<!-- default async defer-->
```

###### type 属性指定 module

在 `<script>` 指定 `type="module"` 可以使用 ES6 的模块。

```html
<script type="module">
  import num from "./main.js";
</script>
```

#### noscript 元素

当 **浏览器不支持脚本** 和 **浏览器对脚本的支持被关闭** 的情况将会显示标签内的内容。

```html
<noscript>
  <strong>您的浏览器不支持 JavaScript 或未启用 JavaScript。</strong>
</noscript>
```

## 《第 3 章-语言基础》

#### 变量声明

- var 声明：使用 `var` 声明的变量会自动提升到函数作用域顶部，如果不在函数内会提升到全局。

- let 声明：`let` 与 `var` 的区别就是。`let` 声明的范围是块作用域，`let` 声明的变量不会在作用域中被提升。在 `let` 声明之前的执行瞬间内称为 **"暂时性死区"**，在此阶段引用后声明的变量都会报错。

- const 声明：`const` 与 `let` 基本相同，重要的区别是 `const` 声明的变量（常量）必须赋值初始值，并且后续不能修改。

#### 数据类型

- 简单数据类型：`Undefind`, `Null`, `Boolean`, `Number` , `String` , `Symbol`。
- 复杂数据类型：`Object`。

#### 标签语句

给语句加标签，以便以后调用。`break` 和 `continue` 都可以使用，在嵌套循环中的场景。

```js
let num1 = 0;
outermost: for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    if (i === 1 && j === 1) {
      break outermost; // 结束 i 层的循环。
    }
    num1++;
  }
}
console.log(num1); // 6

let num2 = 0;
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    if (i === 1 && j === 1) {
      break; // 只能结束 j 层的循环，i 层的循环还是循环了 5 次。
    }
    num2++;
  }
}
console.log(num2); // 21
```

#### with 语句

将代码的作用域设置为特定的对象，**严格模式不允许使用**。

```js
function WithThis() {
  this.name = "lian";
  this.age = 23;
  this.getUserInfo = function () {
    with (this) {
      return {
        name: name,
        age: age,
      };
    }
  };
}

const withThis = new WithThis();

console.log(withThis.getUserInfo()); // { name: 'lian', age: 23 }
```

## 《第 5 章-基本引用类型》

#### RegExp 构造函数属性

RegExp 构造函数属性本身也有属性，会根据最后执行的正则表达式的操作而变化。

如存储了 9 个捕获组，这些属性可以通过 `RegExp.$1` ~ `RegExp.$9` 来访问。

```js
let text = "2020-11-29";
let pattern = /(\d{4})-(\d{2})-(\d{2})/g;

pattern.test(text);

console.log(RegExp.$1); // 2008
console.log(RegExp.$2); // 12
console.log(RegExp.$3); // 31
console.log(RegExp.$4); // ""
```

#### 原始值包装类型

我们知道简单数据类型（也称为原始类型）包含 `Undefind`, `Null`, `Boolean`, `Number` , `String` , `Symbol`。

为了方便操作原始值，ECMAScript 提供了 3 种原始值包装类型： `Boolean`、`Number` 、`String`，它们都具有与各自原始类型对应的特殊行为。

```js
let s1 = "text";
let s2 = s1.substring(2);
console.log(s2); // xt
```

```js
let s3 = new String("text");
let s4 = s3.substring(2);
console.log(s4); // xt
```

从以上代码执行结果并无差别，但我们知道，原始值本身不是对象，因此逻辑上不应该有方法。这是因为在执行时都会执行以下 3 步。

1. 创建一个 `String` 类型的实例。
2. 调用实例上的特定方法。
3. 销毁实例。

```js
let s1 = new String("text");
let s2 = s1.substring(2);
s1 = null;
```

自动创建的原始值包装对象。只存在访问它的那行代码的执行期间，意味值不能给原始值添加属性和方法。

```js
let s5 = "text";
s5.color = "red";
console.log(s5.color); // undefined
```

手动创建的包装类型，则不会自己销毁。

```js
let s6 = new String("text");
s6.color = "red";
console.log(s6.color); // red
```

## 《第 6 章-集合引用类型》

#### 数组空位

以下是数据为长度为 5 的数组。',' 和 ',' 之间没有值来标识空位。

```js
let arr = [1, , , , 5];
```

ES6 之前的方法会忽略空位。而 ES6 之后的方法会把空位当成 `undefined` 处理。

```js
console.log(arr.indexOf(undefined)); // -1

console.log(arr.includes(undefined)); // true
```

由于处理不一样，在实际中如果需要空位，可以显式的指定为 `undefined`。

#### Set/WeakSet/Map/WeakMap

Set 和 Map 都是 ES6 新增加的数据结构。它们的操作都是使用的 [SameValueZero（同值零）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Equality_comparisons_and_sameness) 比较算法。

###### Set

它类似于数组，但是成员的值都是唯一的，没有重复的值，比如来去重。

```js
let s1 = [2, 3, 5, 4, 5, 2, 2];
let s2 = new Set(s1);

s2.add(+0);
s2.add(-0);

console.log([...s2]); // [ 2, 3, 5, 4, 0 ]
```

###### Map

它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。

```js
let m1 = new Map();
let m2 = { p: "Hello World" };

m1.set(m2, "content");

console.log(m1.get(m2)); // content
```

###### Weak

`WeakSet` 和 `WeakMap` 中 "Weak"（弱），描述的是 JavaScript 垃圾回收对待 “若映射” 中键的方式。

```js
let map = new Map();
let button = document.querySelector("button");
map.set(button, { disabled: false });
```

假设上面的 DOM 被删除了，但由于映射中还保留着按钮的引用，所以对应的 DOM 节点删除后还会保留在内存中。

如果这里使用 "若映射"，那么对应的 DOM 节点删除后，垃圾回收就会立即释放其内容（前提是没有其他地方引用这个对象）。

## 《第 10 章-函数》

#### 函数名

所有函数对象都会暴露一个只读的 name 属性。

```js
function foo() {}
let bar = function () {};
let baz = () => {};
console.log(foo.name); // foo
console.log(bar.name); // bar
console.log(baz.name); // baz
```

如果是使用 `Function` 构造函数创建的，则会标识成 "anonymous"。

```js
let anony = new Function();
console.log(anony.name); // anonymous
```

如果是一个获取函数、设置函数或使用 bind，那么标识前面会加上一个前缀。

```js
function foo() {}
console.log(foo.bind(null).name); // bound foo
```

```js
let info = {
  num: 1,
  get age() {
    return this.num;
  },
  set age(num) {
    this.num = num;
  },
};
let descriptor = Object.getOwnPropertyDescriptor(info, "age");
console.log(descriptor.get.name); // get age
console.log(descriptor.set.name); // set age
```

#### 默认参数作用域与暂时性死区

因为参数是按顺序初始化的，所有后面定义默认值的参数可以引用先定义的参数。

```js
function makeKing(name = "Henry", numerals = name) {
  return `King ${name} ${numerals}`;
}

console.log(makeKing()); // King Henry Henry
```

参数初始化顺序遵循 “暂时性死区” 规则，即前面定义的参数不能引用后面定义的。

```js
function makeKing(numerals = name, name = "Henry") {
  return `King ${name} ${numerals}`;
}

console.log(makeKing()); // ReferenceError: Cannot access 'name' before initialization
```

#### 检测函数调用方式

ES6 新增了检测函数是否使用 `new` 关键字调用的 `new.target` 属性。

如果函数式正常调用的，则 `new.target` 的值是 `undefined` ，如果是使用 `new` 关键字调用的，则 `new.target` 将引用被调用的构造函数。

```js
function Foo() {
  return new.target;
}
console.log(Foo()); // undefined
console.log(new Foo()); // function Foo() { return new.target }
```

#### 递归

递归函数通常的形式是一个函数通过名称调用自己，如下面的示例。

```js
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * factorial(num - 1);
  }
}
```

但是如果把此函数赋值给其他函数就会出问题。

```js
let otherFactorial = factorial;
factorial = null;
otherFactorial(2); // TypeError: factorial is not a function
```

可以使用 `arguments.callee` 指向正在执行的函数的指针。

```js
function factorial(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * arguments.callee(num - 1);
  }
}
```

但是 `arguments.callee` 在严格模式下不能使用，此时可以使用命名函数表达式达到目的。

```js
let factorial = function f(num) {
  if (num <= 1) {
    return 1;
  } else {
    return num * f(num - 1);
  }
};
```

#### 闭包

闭包通常在嵌套函数中实现，指的是内部函数引用了外部函数作用域中的变量，并且返回的内部函数被外部引用就会形成闭包。

```js
function outside() {
  let num = 1;
  // return function (add) {
  //   return (num += add);
  // };
  return function inner(add) {
    return (num += add);
  };
}

let inner = outside();
console.log(inner(1)); // 2
console.log(inner(1)); // 3
console.log(inner(1)); // 4

// 销毁对函数的引用，就可以释放内存。
inner = null;
```

###### 作用域链引用

在上述列子中，产生了两个作用域链 _"outside"_ 和 _"inner"_。

- 在 _"outside"_ 的作用域链中产生了一个 `num` 活动对象。

- 在 _"inner"_ 里把 _"outside"_ 作用域链中的 `num` 活动对象添加到了自己的作用域链。

- 在 `outside` 函数执行完毕后，其执行上下文的作用域链会销毁。但因为 _"inner"_ 作用域链中仍然有对 `num` 的引用，所以不能销毁会一直保留在内存中，直到 `inner` 函数被销毁后才会被销毁。

## 《第 12 章-BOM》

#### 查询字符串

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

## 《第 14 章-DOM》

#### MutationObserver

使用 `MutationObserver` 可以观察这个文档，DOM 树的一部分，或某个元素，此外还可以观察元素属性、子节点、文本。

```js
// 创建 MutationObserver 实例，异步执行注册的回调
let observer = new MutationObserver((mutationRecords) => {
  console.log(mutationRecords[0]); // {type: "attributes", target: body.foe3e3o, ...}
});

// 设置观察对象
observer.observe(document.body, {
  subtree: true,
  attributes: true,
  // ...
});
document.body.className = "foo";

// 取消观察对象
setTimeout(() => {
  observer.disconnect();
  document.body.className = "bar";
  // (没有日志输出)
});

// 清空队列
setTimeout(() => {
  observer.takeRecords();
});
```

## 《第 15 章-DOM 扩展》

#### classList

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

#### insertAdjacentHTML

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

#### insertAdjacentText

`insertAdjacentText` 与 `insertAdjacentHTML` 有相同的配置。

```html
<div id="text">insertAdjacentText</div>
<script>
  text.insertAdjacentText("afterbegin", "插入当前文本的前面。");
  console.log(text.innerHTML); // 插入当前文本的前面。insertAdjacentText
</script>
```

#### scrollIntoView

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

## 《第 17 章-事件》

#### 事件流

事件流的阶段顺序是：事件捕获(由外到内) => 到达目标 => 事件冒泡(由内到外)。使用 `addEventListener` 可以很容易控制事件在那阶段触发。

当三个参数为 `false` 时表示冒泡阶段触发（默认值）。当点击 `inner` 时触发顺序是 `inner => box`。

```html
<div id="box" style="padding: 100px; background: red">
  <button id="inner">点击</button>
</div>
<script>
  box.addEventListener(
    "click",
    () => {
      console.log("box");
    },
    false
  );
  inner.addEventListener(
    "click",
    () => {
      console.log("inner");
    },
    false
  );
</script>
```

当三个参数为 `true` 时表示捕获阶段触发。当点击 `inner` 时触发顺序是 `box => inner`。

```html
<div id="box" style="padding: 100px; background: red">
  <button id="inner">点击</button>
</div>
<script>
  box.addEventListener(
    "click",
    () => {
      console.log("box");
    },
    true
  );
  inner.addEventListener(
    "click",
    () => {
      console.log("inner");
    },
    true
  );
</script>
```

#### 事件委托

事件委托是利用事件冒泡的原理，当内部元素点击的时候，会冒泡到外层元素上，通过判断事件源处理相应的事件。

```html
<ul id="ul">
  <li>1</li>
  <li>2</li>
  <li>3</li>
</ul>
<script>
  ul.addEventListener("click", function (ev) {
    // 处理兼容
    let event = ev || window.event;
    let target = ev.target || ev.srcElement;
    // 判断事件源类型
    if (target.nodeName.toLowerCase() === "li") {
      alert(target.innerHTML);
    }
  });
</script>
```

#### 自定义事件

书上介绍的是 `createEvent` 但使用的许多方法都被废弃了。查看 MDN 的 [Event](https://developer.mozilla.org/zh-CN/docs/Web/API/Event/Event) 和 [CustomEvent](https://developer.mozilla.org/zh-CN/docs/Web/API/CustomEvent) 。

```html
<div id="div"></div>
<script>
  let event = new Event("look", { bubbles: true });
  document.dispatchEvent(event);

  // 事件可以在任何元素触发，不仅仅是document
  div.addEventListener("look", function () {
    console.log("look");
  });
  div.dispatchEvent(event); // "look"
</script>
```

## 《第 23 章-JSON》

#### 序列化

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

#### 解析

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

## 《第 24 章-网络请求与远程资源》

这章对于网络请求不是很熟悉的同学(比如我)，基本都是新知识，而且配置比较多，具体内容可以看书了。这里写下每种请求的示例，包含前后端。

#### Ajax

后端（nodejs）

```js
const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/api", function (req, res) {
  res.send("hello world");
});

app.listen(3000, function () {
  console.log("listen at 3000");
});
```

前端

```js
// 创建 XHR 对象
let xhr = new XMLHttpRequest();
// 请求阶段变化 readyState 表示在那个阶段
// 0 = 未初始化 ; 1 = 已打开 "xhr.open" ; 2 = 已发送 "xhr.send" ; 3 = 接收中 ; 4 = 完成
xhr.onreadystatechange = function (event) {
  console.log(xhr);
  if (xhr.readyState === 4) {
    console.log(xhr.response); // hello world
  }
};
// 发送定义好的请求
xhr.open("get", "/api", true);
xhr.send(null);
```

#### Fetch

后端（nodejs）

```js
const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/api", function (req, res) {
  res.send("hello world");
});

app.post("/api/json", function (req, res) {
  res.send({ hello: "world" });
});

app.listen(3000, function () {
  console.log("listen at 3000");
});
```

前端

```js
fetch("/api", {
  method: "GET",
}).then((response) => {
  // 获取 TEXT 格式
  response.text().then((text) => {
    console.log(text); // hello world
  });
});

fetch("/api/json", {
  method: "POST",
}).then((response) => {
  // 获取 JSON 格式
  response.json().then((text) => {
    console.log(text); // {hello: "world"}
  });
});
```

#### WebSocket

后端（nodejs）

```js
const express = require("express");
const app = express();
const WebSocketServer = require("ws").Server;

// 创建 Socket 服务
const wss = new WebSocketServer({ port: 4000 });
wss.on("connection", function (ws) {
  ws.on("message", function (message) {
    // 接受到消息，直接返回。
    ws.send(message);
  });
});

app.use(express.static(__dirname + "/public"));
app.listen(3000, function () {
  console.log("listen at 3000");
});
```

前端

```js
let socket = new WebSocket("ws://localhost:4000");
socket.onmessage = function (event) {
  console.log(event.data); // 监听消息
  // 1607350727238
  // 1607350732235
  // ...
};
socket.onopen = function () {
  setInterval(() => {
    socket.send(Date.now()); // 发送消息
  }, 5000);
};
```

## 《第 25 章-客户端存储》

#### Cookie

会话 `cookie` 浏览器关闭会清除。

```js
document.cookie = "name=lian";
```

设置 `expires` 过期时间。

```js
// 设置 `expires` 过期时间。
let date = new Date();
date.setDate(date.getDate() + 1);
document.cookie = "name=lian;expires=" + date;
```

`cookie` 的使用只要遵守以下大致的限制（浏览器的限制不一样），就不会在浏览器中出现问题。

- 不超过 300 个 cookie。
- 每个 cookie 不超过 4096 字节。
- 每个域不超过 20 个 cookie。
- 每个域不超过 81920 字节。

#### sessionStorage/localStorage

`sessionStorage` 对象只存储会话数据，关闭浏览器会清除，这与会话 `cookie` 类似。

```js
sessionStorage.setItem("name", "lian");
console.log(sessionStorage.getItem("name")); // lian
sessionStorage.removeItem("name");
console.log(sessionStorage.getItem("name")); // null
```

`localStorage` 持久化的数据存储，即不会随浏览器关闭清除，也没有过期时间。它和 `sessionStorage` 有同样的 API。

```js
localStorage.setItem("name", "lian");
console.log(localStorage.getItem("name")); // lian
localStorage.removeItem("name");
console.log(localStorage.getItem("name")); // null
```

`sessionStorage` 和 `localStorage` 的存储空间大多数浏览限制每个域 5M。

#### storageEvent

在同源下并且在不同页面调用 `localStorage` 的任何 `API` 都会触发 `storage` 事件。

```js
// event.html
window.addEventListener("storage", (event) => {
  console.log(event.url); // 存储变化对应的域
  console.log(event.key); // 被设置或删除的键
  console.log(event.newValue); // 键变化之后的值，若键被删除则为 null
  console.log(event.oldValue); // 键变化之前的值
});
```

```js
// submit.html
localStorage.setItem("name", Date.now());
```

## 《第 16 章-DOM2 和 DOM3》

#### 比较节点

DOM3 新增了两个用于比较节点的方法 `isSameNode()` 相同 ，`isEqualNode()` 相等。

```js
let div1 = document.createElement("div");
div1.setAttribute("class", "box");

let div2 = document.createElement("div");
div2.setAttribute("class", "box");

console.log(div1.isSameNode(div1)); // true
console.log(div1.isEqualNode(div2)); // true
console.log(div1.isSameNode(div2)); // false
```

#### 计算样式

DOM2 在 `document.defaultView` 上增加了 `getComputedStyle()` 方法，用于获取元素的所有计算样式。

```html
<style>
  #box {
    width: 100px;
    height: 100px;
    background-color: red;
  }
</style>
<body>
  <div id="box"></div>
  <script>
    let box = document.querySelector("#box");
    let computedStyle = document.defaultView.getComputedStyle(box, null);
    console.log(computedStyle); // CSSStyleDeclaration { width, height, color, margin, ... }
    console.log(computedStyle.width); // 100px
    console.log(computedStyle.height); // 100px
    console.log(computedStyle.color); // rgb(0, 0, 0) 不设置也会获取默认的
  </script>
</body>
```

第二个参数可以传入伪元素字符串(如：`":after"`)获取伪元素样式。

```html
<style>
  #box:after {
    font-size: 30px;
  }
</style>
<body>
  <div id="box"></div>
  <script>
    let boxAfter = document.querySelector("#box");
    let computedStyleAfter = document.defaultView.getComputedStyle(box, ":after");
    console.log(computedStyleAfter.fontSize); // 30px
  </script>
</body>
```

#### 确定元素尺寸

每个元素上都有 `getBoundingClientRect()` 方法，返回一个 `DOMRect` 对象，对象上的属性给出了元素在页面中相对于视口(左、上)的位置。

```html
<style>
  * {
    margin: 0px;
    padding: 0px;
  }
  #box {
    position: absolute;
    top: 100px;
    left: 100px;
    width: 100px;
    height: 100px;
    background: red;
  }
</style>
<body>
  <div id="box"></div>
  <script>
    let DOMRect = box.getBoundingClientRect();
    console.log(DOMRect);
    // {
    //   top: 100;
    //   left: 100;
    //   width: 100;
    //   height: 100;
    //   bottom: 200; // = top + height
    //   right: 200; // = left + width
    //   x: 100;
    //   y: 100;
    // }
  </script>
</body>
```

## 《第 20 章-JavaScript API》

#### File API

###### FileReader

`FileReader` 类型表示异步文件读取机制。

- `FileReader.readAsText()` 读取文件内容完成后，result 属性中保存的将是 _字符串_ 的文件内容。
- `FileReader.readAsDataURL()` 读取文件内容完成后，result 属性中保存的将是 _Base64 字符串_ 的文件内容。
- `FileReader.readAsArrayBuffer()` 读取文件内容完成后，result 属性中保存的将是 _ArrayBuffer_ 数据对象。
- `FileReader.readAsBinaryString()` 读取文件内容完成后，result 属性中保存的将是 _原始二进制数据_ 的文件内容。

###### 图片选择预览

```html
<body>
  <input id="upload" type="file" value="选择图片" />
  <img id="image" src="" alt="" />
  <script>
    upload.addEventListener("change", (event) => {
      console.log(event.target.files); // [ File ]

      let file = event.target.files[0];
      let reader = new FileReader();

      if (/image/.test(file.type)) {
        reader.readAsDataURL(file);
      }

      reader.onload = function () {
        image.src = reader.result;
        console.log(reader.result); // data:image/png;base64,iVBORw0KGg
      };
    });
  </script>
</body>
```

###### 图片拖拽预览

这里监听的是目标源事件，当拖拽元素在目标元素上就会触发以下事件。

```html
<style>
  #upload {
    width: 100px;
    height: 100px;
    line-height: 100px;
    font-size: 50px;
    text-align: center;
    border: 1px solid #cccccc;
  }
</style>
<body>
  <div id="upload">+</div>
  <img id="image" src="" alt="" />
  <script>
    // 进入 目标元素 触发
    upload.addEventListener("dragenter", function (event) {
      event.preventDefault();
      upload.style.background = "red";
    });

    // 在 目标元素 持续触发
    upload.addEventListener("dragover", function (event) {
      event.preventDefault();
    });

    // 离开 目标元素 触发
    upload.addEventListener("dragleave", function (event) {
      event.preventDefault();
      upload.style.background = "";
    });

    // 放置在 目标元素 触发
    upload.addEventListener("drop", function (event) {
      event.preventDefault();
      upload.style.background = "";

      console.log(event.dataTransfer.files); // [ File ]

      let file = event.dataTransfer.files[0];
      let reader = new FileReader();

      if (/image/.test(file.type)) {
        reader.readAsDataURL(file);
      }

      reader.onload = function () {
        image.src = reader.result;
        console.log(reader.result); // data:image/png;base64,iVBORw0KGg
      };
    });
  </script>
</body>
```

#### Web Component

###### HTML Template

定义 DOM 模板，在需要的时候再把这个模板渲染出来。

```html
<body>
  <template id="tpl">
    <h1>HTMLTemplate</h1>
  </template>
  <!-- 在浏览器审查元素可以看到 -->
  <!-- <template id="tpl">
    #document-fragment
    <h1>HTMLTemplate</h1>
  </template> -->
  <script>
    tpl = document.querySelector("#tpl").content;
    document.body.appendChild(tpl);
  </script>
</body>
```

###### Shadow DOM

可以构建一个完整的 DOM 树作为子节点添加到到父 DOM。还实现了 DOM 封装，CSS 和 JS 的作用域都在影子 Shadow DOM 内。

```html
<body>
  <div id="box"></div>
  <!-- 在浏览器审查元素可以看到 -->
  <!-- <div id="box">
    #shadow-root (open)
      <div>ShadowDOM</div>
  </div> -->
  <script>
    let ele = box.attachShadow({ mode: "open" });
    ele.innerHTML = `
      <div>ShadowDOM</div>
      <style> * { color: red; } <\/style>
      <script> var num = 0; <\/script>
    `;
    console.log(window.num); // undefined
  </script>
</body>
```

###### 自定义元素

自定义元素威力源自类定义，可以通过自定义元素的构造函数来控制这个类在 DOM 中每个实例的行为。

```html
<body>
  <x-foo>1</x-foo>
  <x-foo>2</x-foo>
  <script>
    class FooElement extends HTMLElement {
      constructor() {
        super();
        console.log(this); // x-foo：this 指向这个组件
      }
    }
    customElements.define("x-foo", FooElement);
  </script>
</body>
```

###### 综合应用/输入验证组件

HTML Template 、Shadow DOM、自定义元素 结合使用，实现输入验证。

```html
<body>
  <!-- 定义组件模板 -->
  <template id="x-input-tpl">
    <input value="" placeholder="请输入数字" />
  </template>
  <!-- 使用输入组件 -->
  <x-input id="input1"></x-input>
  <x-input id="input2"></x-input>
  <script>
    class xInput extends HTMLElement {
      constructor() {
        super();
        // 获取组件模板
        let tpl = document.querySelector("#x-input-tpl").content;
        // 添加影子DOM
        let root = this.attachShadow({ mode: "open" }).appendChild(tpl.cloneNode(true));
        // 保存输入元素
        this.$el = this.shadowRoot.querySelector("input");
        // 监听数据变化
        this.$el.addEventListener("input", (event) => {
          this.value = event.target.value;
        });
      }
      get value() {
        return this.$el.value;
      }
      set value(val = "") {
        this.$el.value = val.replace(/[^0-9]/g, "");
      }
    }
    customElements.define("x-input", xInput);
  </script>
  <script>
    // 获取组件并设置值和取值
    let input1 = document.querySelector("#input1");
    input1.value = "111.ss";
    console.log(input1.value); // 111

    // 获取组件并设置值和取值
    let input2 = document.querySelector("#input2");
    input2.value = "222.ss";
    console.log(input2.value); // 222
  </script>
</body>
```

## 《第 21 章-错误处理与调试》

#### 错误类型

```js
// Uncaught [name]: [message]
throw new Error("基类型，其他错误类型基础该类型");
throw new InternalError("底层JavaScript 引擎抛出异常时由浏览器抛出(无法手动调用)");
throw new EvalError("使用 eval 函数发生异常时抛出");
throw new RangeError("数值越界时抛出");
throw new ReferenceError("到不到对象时发生");
throw new SyntaxError("语法错误时发生");
throw new TypeError("类型不是预期类型");
throw new URIError("使用 encodeURI() 或  decodeURI() 传入了格式错误的 URI");
```

#### 自定义错误类型

```js
class CustomError extends Error {
  constrouctor(message) {
    supper(message);
    this.name = "CustomError";
    this.message = message;
  }
}
throw new CustomError("自定义错误类型"); // CustomError: 自定义错误类型
```

## 《第 28 章-最佳实践》

“最佳实践” 这个打引号，因为在这基础上并不是不可以更好。

#### 可维护性

- 容易理解：无须求助原始开发者，可以很容易的知道它是干什么，怎么实现的。
- 符合常识：代码中的一切都显得顺理成章。
- 容易适配：即使数据变化也不用完全重写。
- 容易扩展：代码架构经过认真设计，支持未来扩展核心功能。
- 容易调试：出问题时，代码可以给出明确的信息。

**可读性**

- 代码整齐，编码风格一致。
- 代码注释清晰明了。

**变量和函数命名，以下是命名的通用规则**

- 变量名应改是名词，列如 `car` 或 `person`。
- 函数名应该以动词开始，列如：`getName()`，返回布尔值的函数通常以 `isNumber()`。
- 对变量和函数都使符合逻辑的名称，尽量要使用描述性和直观的词汇，但不是过于冗余。
- 变量、函数和方法应该以小写字母开头，使用驼峰大小写(camelCase)形式。常量值应该全部大写并以下划线链接，比如 `REQUEST_TIMEOUT`。

**松散耦合**

- 解耦 HTML/CSS/JavaScript。
- 使用外部 js 文件，和外部 css 文件，不要写在 html 内。

**编码惯例**

- 不要动态给实例或原型添加属性或方法。
- 不要重新定义已有的方法。

**不声明全局变量**

- 不要随意定义全局变量值，可以使用“命名空间“的设计，把多个变量值包装在一起。

- 尽量不使用 `var`，优先使用 `let`、`const`。

#### 性能

**避免全局查找**

- 多次引用同一个对象，尽量在局部作用域保存对用的引用。作用链查找的越长越费时间。

**优化元素交互**

- 更新大量 dom 值时，应提前创建好片段，使用 `createDocumentFragment()` 或 `innerHTML` 一次性修改。
- 大量元素绑定相同事件时，应使用事件委托。

**其他优化**

- 尽量使用原生方法，原生是底层所以很快。
- switch 语句比 if 语句快。
- 位操作很快。

#### 部署

- 代码压缩混淆。
- HTTP 压缩。
- 删除不使用的代码和功能，摇树优化。

## 《第 4 章-变量、作用域与内存》

#### 作用域链

代码执行时的标识符解析是通过沿作用域链逐级搜索标识符名称完成的。如果在当前作用域中没有查到值，就会向上级作用域去查，直到查到全局作用域，这么一个查找过程形成的链条就叫做作用域链。

#### 垃圾回收

JavaScript 最常用的垃圾回收策略是 ”标记清理“（mark-and-sweep）。当变量进入上下文，比如在函数内部声明一个变量时，这个变量会被加上存在于上下文中的标记；当变量离开上下文时，也会被加上离开上下文的标记。然后再垃圾回收期间被删除。

#### 性能

垃圾回收程序会周期性运行。如果内存中分配了很多变量，则可能造成性能损失，因此垃圾回收的时间调度很重要。探测机制因浏览器而已，但基本上都是根据已分配对象的大小和数量判断的。

## 《第 7 章-迭代器与生成器》

#### 迭代器

任何实现 Iterator 接口的对象都可以作为迭代器使用，Iterator 接口主要供 `for...of` 消费。

原生实现的有 `Array` 、`Map` 、`Set` 、`String` 、`TypedArray` 、`arguments` 、`NodeList`，可以直接使用。

```js
let list = ["a", "b", "c"];
for (let item of list) {
  console.log(item);
}
// a
// b
// c
```

Iterator 的遍历过程是：每一次调用 `next` 方法，都会返回数据结构的当前成员的信息，返回一个包含 `value` 和 `done` 两个属性的对象。其中，`value` 属性是当前成员的值，`done` 属性是一个布尔值，表示遍历是否结束。

```js
let listr = list[Symbol.iterator](); // 调用内部的迭代函数
console.log(listr.next()); // { value: 'a', done: false }
console.log(listr.next()); // { value: 'b', done: false }
console.log(listr.next()); // { value: 'c', done: false }
console.log(listr.next()); // { value: undefined, done: true }
```

原生对象并没有部署 Iterator 接口，当然可以手动部署（以下的代码没有实际意义，只是为了演示）。

```js
let list = {
  a: "a",
  b: "b",
  c: "c",
  // 手动部署 Iterator 接口
  [Symbol.iterator]() {
    // 使用闭包保存所有的值，和迭代的次数
    let keys = Object.values(this);
    let count = 0;
    return {
      next() {
        // 如果本次迭代有值，次数加1，done 为 false 继续下次迭代。
        if (keys[count]) {
          return {
            value: keys[count++],
            done: false,
          };
        }
        // 如果本次迭代无值，done 为 true 结束迭代。
        else {
          return {
            value: undefined,
            done: true,
          };
        }
      },
    };
  },
};

for (let i of list) {
  console.log(i);
}
// a
// b
// c

// 和原生一样手动调用也可以实现。
let listr = list[Symbol.iterator]();
console.log(listr.next()); // { value: 'a', done: false }
console.log(listr.next()); // { value: 'b', done: false }
console.log(listr.next()); // { value: 'c', done: false }
console.log(listr.next()); // { value: undefined, done: true }
```

#### 生成器

生成器的形式是一个函数，函数名称前面加一个星号(\*) 表示它是一个生成器，只要是可以定义函数的地方，就可以定义生成器。调用生成器会产生一个生成器对象，生成器对象一开始处于暂停执行(suspended)的状态。初次调用 `next` 方法后才开始执行。

```js
function* generatorFn() {
  return "generator";
}

let generator = generatorFn();
console.log(generator); // generatorFn <suspended>
console.log(generator.next()); // { value: 'generator', done: true }
```

通过 `yield` 中断执行；此时的 `yield` 关键字有点像函数的中间返回语句，它生成的值会出现在 `yield` 方法返回的对象里，使用 `return` 关键字退出的生成器函数会处在 `done` 为 `true` 的状态（直接结束执行）。

```js
function* generatorFn() {
  yield 1;
  yield 2;
  return 3;
}

let generator = generatorFn();
console.log(generator.next()); // { value: 1, done: false }
console.log(generator.next()); // { value: 2, done: false }
console.log(generator.next()); // { value: 3, done: true }
```

`yield*` 实际上只是将一个可迭代对象序列化为一连串可以单独产出的值，所有这跟把 `yield` 放在循环里没什么区别。

```js
function* generatorFn1() {
  yield* [1, 2, 3];
}

for (let item of generatorFn1()) {
  console.log(item);
}

// = 等同于
function* generatorFn2() {
  for (let i = 1; i < 4; i++) {
    yield i;
  }
}

for (let item of generatorFn2()) {
  console.log(item);
}
```

## 《第 8 章-对象、类与面向对象编程》

#### 语法简写

在给对象添加变量的时候，如果属性名和变量名一样。可以只写属性名。

```js
let name = "lian";
let person = {
  name: name,
};

// 等同于
let name = "lian";
let person = {
  name,
};
```

可计算属性，可计算属性就是对象的属性值可以是一个表达式。

```js
let key = "name";
let person = {};
person[key] = key;

// 等同于
let key = "name";
let person = {
  [key]: key,
};
```

简写方法名。

```js
let person = {
  sayName: function (name) {
    console.log(name);
  },
};

// 等同于
let person = {
  sayName(name) {
    console.log(name);
  },
};
```

#### 构造函数

###### 构造函数

构造函数与普通函数定义无区别。区别在于构造函数执行时使用 `new` 操作符。

```js
function Person() {}

Person();
let person = new Person(); // 构造函数通常以大写开头
```

要创建 `Person` 的实例，应使用 `new` 操作符。以这种方式调用构造函数会执行如下操作：

- 1、在内存中创建一个新对象。
- 2、这个新对象内部的 [[Prototype]] 特性*被赋值*为构造函数的 prototype 属性。
- 3、构造函数内部的 this *被赋值*为这个新对象。
- 4、执行构造函数的内部的代码。
- 5、如果构造函数返回非空对象，则返回改对象；否则：返回刚创建的对象。

###### 原型模式

无论何时，只要创建一个函数，都会按照特定的规则为这个函数创建一个 `prototype` 属性(指向原型对象)。默认情况下，所有原型对象自动获得一个名为 `constructor` 的属性，指回与之关联的构造函数。

每创建一个实例，都会在实例对象上暴露 `__proto__` (对隐藏[[Prototype]]的引用) 属性指回构造函数的原型。理解一点：实例与*构造函数原型*之间有直接的联系，但实例与*构造函数*之间没有。

```js
// 声明之后，函数就有了一个与之关联的原型对象。
function Person() {
  this.name = "lian";
}
console.log(Person.prototype);
```

```js
// 如前所述：构造函数有一个 prototype 属性；
// 引用其原型对象，而这个原型对象也有一个 constructor 属性，引用这个构造函数，
// 换句话说，两者项目引用
console.log(Person.prototype.constructor === Person); // true
```

```js
// 实例通过 __proto__ 链接到原型对象(对隐藏[[Prototype]]的引用)
// 实例与构造函数没有直接联系，与原型对象有直接联系
let person = new Person();
console.log(person.__proto__ === Person.prototype); // true
console.log(person.__proto__.constructor === Person.prototype.constructor); // true
```

构造函数、prototype 、constructor、\_\_proto\_\_ 之间的关系如图。

![原型模式关系图](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/faeb5fb21daf407094ed7134de30919e~tplv-k3u1fbpfcp-watermark.image)

###### 原型继承

原型链被定义为主要的继承方式。回顾一下构造函数、原型、和实例的关系：每个构造函数都有一个原型对象，原型有一个属性指回构造函数，而实例有一个内部指针指向原型。

如果原型是另一个类型的实例呢？那就意味着这个原型本身有一个内部指针指向另一个原型，相应地另一个原型也有也有一个指针指向另一个构造函数，这样就在实例和原型之间构造了一条原型链。

```js
function SuperType() {
  this.superProperty = true;
}
SuperType.prototype.getSuperValue = function () {
  return this.superProperty;
};

function SubType() {
  this.subProperty = false;
}

// SubType 的原型被赋值为 SuperType 的实例。
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function () {
  return this.subProperty;
};

let instance = new SubType();

// __proto__ 指向 instance 的原型，而原型被赋值为 ”SuperType 实例“。
console.log(instance.__proto__);
// 继续往下 __proto__ 指向 ”SuperType 实例“ 的原型。
console.log(instance.__proto__.__proto__);
// 继续往下 原型的 "constructor" 指向构造函数
console.log(instance.__proto__.__proto__.constructor === SuperType); // true

// 在这条链上可以找到 getSubValue 和 getSuperValue 方法。
console.log(instance.getSubValue()); // false
console.log(instance.getSuperValue()); // true
```

原型链扩展了原型搜索机制，在读取实例上的属性时，首先会在实例上搜索，这个属性。如果没找到，则会继续搜索实例的原型，在通过原型链实现继承之后，搜索就可以继续向上，搜索原型的原型。

![原型继承关系图](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/376e6548b2144df493d19467d3c42324~tplv-k3u1fbpfcp-watermark.image)

#### 类

###### 把类当成特殊函数

类在底层上只不过是构造函数的语法糖，不过只能用 `new` 调用。

```js
class Person {}

let person = new Person();

console.log(typeof Person); // function
console.log(Person.prototype.constructor === Person); // true
console.log(person.__proto__ === Person.prototype); // true
console.log(person.__proto__.constructor === Person.prototype.constructor); // true
```

###### 类的继承

ES6 类支持单类继承，使用 `extends` 关键字。在派生类可以通过 `super` 关键字引用它们的原型。

```js
class Vehicle {
  constructor() {
    this.hasEngine = true;
  }
  run() {
    console.log("...run");
  }
  static identify() {
    console.log("Vehicle");
  }
}
// static 声明静态方法，可以在类上直接调用。
Vehicle.identify(); // "Vehicle"

// Bus 继承 Vehicle 类。
class Bus extends Vehicle {
  constructor() {
    // 在构造函数中使用 super 可以调用父类构造函数，将返回的实例赋值给 this。
    super();
    console.log(this);
  }
  // 在静态方法可以通过 super 调用继承的类上定义的静态方法。
  static identify() {
    super.identify();
  }
}

Bus.identify(); // "Vehicle"

let bus = new Bus();
bus.run(); // ...run

// 除语法层面更符合语义外，继承方式与构造函数的一致
console.log(bus.__proto__.constructor === Bus); // true
console.log(bus.__proto__.__proto__.constructor === Vehicle); //true
console.log(bus.__proto__.__proto__ === Vehicle.prototype); //true
console.log(bus instanceof Vehicle); // true
console.log(bus instanceof Bus); // true
```

## 《第 9 章-代理与反射》

#### 代理

在代理对象上所有的操作都会应用到目标对象上。

```js
const target = {
  id: "target",
};
const proxy = new Proxy(target, {});

console.log(proxy.id); // target
console.log(target.id); // target
```

简单的代理对象不能解决什么，所以可以在代理中配置捕获器。每当在代理对象上进行操作时，可在操作到达目标对象时调用捕获器，从而修改默认行为。

```js
const target = {
  id: "target",
};

const proxy = new Proxy(target, {
  get(target, property, receiver) {
    return target[property] + "...";
  },
  set(target, property, value, receiver) {
    return (target[property] = value);
  },
});

console.log(proxy.id); // target...
console.log(target.id); // target
```

#### 反射

虽然可以重新定义默认行为，但有些捕获器并不那么简单。这时可以使用全局的 `Reflect` 对象上（封装了原始行为）的同名方法来创建。

意思就是，虽然把 `Proxy` 默认行为重新定义了，但可以在重新定义的默认行为里，调用 `Reflect` 上的原始的默认行为。相当于做了一个转发，即能做一些其他操作，又能保证原始行为的完整。

```js
// 1、Proxy 代理，拦截对象的默认行为
// 2、包含 Proxy 上的所有方法，不管 Proxy 怎么修改。
const obj = { name: "l", location: { city: "beijing" } };
const proxyObj = new Proxy(obj, {
  get(target, property, receiver) {
    console.log(`getting ${property}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`setting ${property}, ${value}`);
    return Reflect.set(target, property, value, receiver);
  },
});

proxyObj.name;
proxyObj.name = "lian";
proxyObj.location.city = "beijing haidian"; // 只会触发一次 location 的 get，层级对象不能响应

// getting name
// setting name, lian
// getting location
```

## 《第 11 章-期约与异步函数》

#### 期约(Promise)

Promise 有三种状态，一直处在其中一个状态。

- 待定(pending)
- 兑现(fulfilled)、也叫做解决(resolved)
- 拒绝(rejected)

当创建一个 `Promise` 时，会处于 `pending` 状态.

```js
let p1 = new Promise(() => {});
console.log(p1); // Promise <pending>
```

Promise 的参数是一个函数接收两个参数，通常命名为 `resolve` 和 `reject`。

当调用 `resolve` 函数时，状态切换为 `fulfilled` 并执行 `Promise.prototype.then()` 方法。

```js
let p2 = new Promise((resolve, reject) => {
  resolve(1);
}).then((result) => {
  console.log(result); // 1
});
console.log(p2); // Promise <fulfilled>
```

当调用 `reject` 函数时，状态切换为 `rejected` 并执行 `Promise.prototype.catch()` 方法。

```js
let p3 = new Promise((resolve, reject) => {
  reject(2);
}).catch((error) => {
  console.log(error); // 2
});
console.log(p3); // Promise <rejected>
```

#### 异步函数

使用 `async` 声明一个异步函数。如果异步函数不包含 `await` 关键字，其执行和普通函数没什么区别。执行完毕后返回一个 `fulfilled` 状态的 `Promise`。

```js
function foo() {
  return 1;
}

async function fooAsync() {
  return 2;
}

console.log(foo()); // 1
console.log(fooAsync()); // Promise <fulfilled> 2

fooAsync().then((result) => {
  console.log(result); // 2
});
```

使用 `await` 后面期待是一个 `Promise` 实例，当实例返回 `fulfilled` 状态才继续往下执行。如果不是那么也会当做一个 `fulfilled` 状态的 `Promise`。

```js
async function foo() {
  console.log(2);
  console.log(await 6);
  console.log(7);
}

async function bar() {
  console.log(4);
  console.log(await Promise.resolve(8));
  console.log(9);
}

console.log(1);
foo();
console.log(3);
bar();
console.log(5);

// 123456789
```

## 《第 26 章-模块》

#### IIFE

IIFE(Immediately Ivoked Function Expression) 使用函数作用域和立即调用函数表达式将模块定义封装在匿名函数里。

```js
let Foo = (function () {
  // 私有 Foo 模块的代码
  var bar = "bar...";
  return {
    bar,
  };
})();
console.log(Foo.bar); // bar...
```

#### CJS

CJS(Commonjs) 是 nodejs 使用的标准模块。

```js
// ./add.js -- 定义模块
function add(a, b) {
  return a + b;
}
module.exports = add;
```

```js
// ./index.js -- 使用模块
const add = require("./add");
console.log(add(1, 2)); // 3
```

#### AMD

AMD(Asynchronous Module Definition) 是 requirejs 使用的标准模块，它是完全针对浏览器的模块化定义。

```js
// ./add.js -- 定义模块
define(function () {
  return function add(a, b) {
    return a + b;
  };
});
```

```html
<!-- index.html -- 使用模块 -->
<body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
  <script>
    require(["./add"], function (add) {
      console.log(add(1, 2)); // 3
    });
  </script>
</body>
```

#### UMD

UMD(Universal Module Definition)，也就是通用模块定义，是为了兼容 CJS 和 AMD 规范。实现原理就是根据不同的环境，返回不同的模块定义。

```js
(function (global, factory) {
  if (typeof exports === "object" && typeof module !== undefined) {
    // cjs
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    // amd
    define(factory);
  } else {
    // global
    global = typeof globalThis !== "undefined" ? globalThis : global || self;
    global.add = factory();
  }
})(this, function () {
  return function add(a, b) {
    return a + b;
  };
});
```

#### ESM

ESM(ES Module)，ES6 开始引入了一套原生的模块规范。

```js
export default function add(a, b) {
  return a + b;
}
```

```js
import add from "./add.js";
console.log(add(1, 2)); // 3
```
