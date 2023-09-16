---
title: 红宝书笔记系列之《第 20 章-JavaScript API》
date: 2020-12-13
updated: 2020-12-13
categories: JavaScript
---

## File API

#### FileReader

`FileReader` 类型表示异步文件读取机制。

- `FileReader.readAsText()` 读取文件内容完成后，result 属性中保存的将是 _字符串_ 的文件内容。
- `FileReader.readAsDataURL()` 读取文件内容完成后，result 属性中保存的将是 _Base64 字符串_ 的文件内容。
- `FileReader.readAsArrayBuffer()` 读取文件内容完成后，result 属性中保存的将是 _ArrayBuffer_ 数据对象。
- `FileReader.readAsBinaryString()` 读取文件内容完成后，result 属性中保存的将是 _原始二进制数据_ 的文件内容。

#### 图片选择预览

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

#### 图片拖拽预览

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

## Web Component

#### HTML Template

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

#### Shadow DOM

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

#### 自定义元素

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

#### 综合应用/输入验证组件

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
