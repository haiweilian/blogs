---
title: 项目复盘-图片打点支持缩放移动的技术要点
date: 2021-03-18
categories:
  - 分享
---

## 项目简介

这个项目主要是用于给图片打标记用的，并有移动缩放的功能。可以先看下面的动图。

- [项目地址](https://github.com/haiweilian/taggd-manager)

- [效果预览](http://haiweilian.github.io/taggd-manager/tests/manual/basic.html)

- ![Example](https://github.com/haiweilian/taggd-manager/raw/master/docs/example.gif)

## 项目背景

当初有个需求是在后台系统给一个效果图的任意位置打上标记并添加上介绍。需要把点位的坐标和详细信息存入数据库里，并且能支持移动和缩放，然后在前台供客户查看。

当初写这个功能的时候找了好久没找到特别符合要求的。有的依赖太多、有的没缩放和移动这也是难点所在，最终找到了一个已经归档的项目结构设计的挺好，但不支持缩放和移动所以自己就进行了二次开发重构。刚开始想着挺容易了，但开发过程中还是遇到了很多问题。

## 实践过程

下面从代码设计和重点细节讲，以下代码均是精简后的。其他的逻辑都是一些功能操作方面的了代码量也挺多，有感兴趣的可以查看源码。

#### 技术选型

- 整个项目原生 `js` 写的，最近重构成 `ts` 了。
- 打包工具用的 `rollup`，支持 `umd` 和 `esm` 两种类型的。
- 样式使用 `scss` 预处理，编译用的 `gulp` 工具。
- 文档使用 `jsdoc2md` 生成工具。
- 代码规范工具都用了 `editorconfig`、`eslint`、`stylelint`、`prettier`、`commitlint`。

#### 结构设计

结构设计上分为了两个类，一个 `Taggd` 类是图片的逻辑、一个 `Tag` 类是图片下标记逻辑、样式表、工具类还有声明单独拆出来。

```sh
├── classes
│   ├── Tag.ts // 标记的操作、接口等。
│   ├── TagEffect.ts // 标记的移动、拖拽等。
│   ├── Taggd.ts // 图片的操作、接口等。
│   └── TaggdEffect.ts // 图片的移动、拖拽等。
├── index.scss // 样式表
├── index.ts // 主入口
├── types
│   └── index.ts // ts 接口声明
└── utils
    ├── event-emitter.ts // 发布订阅模式
    ├── type-error-message.ts // 错误提示函数
    └── utilities.ts // 工具类函数
```

#### 事件设计

在事件设计上使用发布订阅模式，`Taggd` 和 `Tag` 类直接继承 `EventEmitter` 类。通过实例订阅事件，内部进行操作时通知事件。

```js
import EventEmitter from "../utils/event-emitter";
class Taggd extends EventEmitter {
  constructor(image: HTMLImageElement, options: Partial<IDefaultOptions>, data: Tag[] = []) {
    super();
  }

  addTag(tag: Tag) {
    this.emit("taggd.tag.add", this, tag);

    return this;
  }
}

// 创建实例并订阅事件
let taggd = new Taggd(image);
taggd.on("taggd.tag.add", function () {});
```

这里还做了判断，订阅函数通过返回 `false` 取消事件的执行。

```js
const isCanceled = !this.emit("taggd.tag.add", this, tag);
if (!isCanceled) {
  // 这里逻辑不继续执行了
}
```

#### 拆分和关联

这时考虑 `Taggd`、`TaggdEffect`、`Tag`、`TagEffect` 怎么建立联系。

类关联 `Taggd` 需要管理着所有的 `Tag` 的更新和移动，在 `Tag` 需要知道自己是那个 `Taggd` 的获取缩放比例等信息。稍微想了一下，在添加的时候在 `Tag` 上保存下 `Taggd`。

类合并 `TaggdEffect` 和 `TagEffect` 因为两个文件单独拆出去了，所以这两个文件写成纯函数不方便，得传好多参数调用，所以自己写成了对象，通过 `assign(Taggd.prototype, TaggdEffect)` 和 `assign(Tag.prototype, TagEffect)` 直接通过原型合并到类上，调用 `this` 也比较方便。（重构成 TS 的时候这里是个大坑，一会一块说重构 TS 的问题。）

#### 初始化图片

到现在还没有开始实现移动和缩放，在实现之前肯定要保存图片的一些初始信息。

1. 初始的时候需要一个合适的缩放，让图片最大程度的显示在我们的容器内并且居中 `naturalWidth / naturalHeight`。
2. 保存图片的原始宽高，缩放后宽高，以及初始的样式销毁时恢复 `naturalWidth`、`naturalHeight`、`style.cssText`。
3. 计算初始的缩放比例 `width / naturalWidth`。

```js
newImage.onload = () => {
  // 宽高比例
  const { naturalWidth, naturalHeight } = image;
  const aspectRatio = naturalWidth / naturalHeight;

  // 初始居中
  let width = parentWidth;
  let height = parentHeight;
  if (parentHeight * aspectRatio > parentWidth) {
    height = parentWidth / aspectRatio;
  } else {
    width = parentHeight * aspectRatio;
  }

  // 初始样式
  imageData.width = width;
  imageData.height = height;
  imageData.naturalWidth = naturalWidth;
  imageData.naturalHeight = naturalHeight;
  imageData.naturalStyle = image.style.cssText;
  imageData.ratio = width / naturalWidth;
  imageData.left = (parentWidth - width) / 2;
  imageData.top = (parentHeight - height) / 2;
};
```

#### 根据图上的位置获取原始标记坐标

当我们在图片上点击的时候，它的相对于原始图片的坐标是多少了？

举个例子：图片宽高各 `1000px`，点击图片中间位置的时候坐标应该是 `x = 500`、`y = 500`，不论这个图片移动了多少，放大了多少，都不会影响。

- 公式：x = (相对于网页的 x 坐标 - 图片的 left 偏移量) \* 缩放比例。
- 公式：y = (相对于网页的 y 坐标 - 图片的 top 偏移量) \* 缩放比例。

```js
taggdClickHandler(event: MouseEvent) {
  const { imageData } = this
  const offset = getOffset(this.image)

  const position = {
    x: (event.pageX - offset.left) * this.imageData.ratio,
    y: (event.pageY - offset.top) * this.imageData.ratio,
  }

  return this
},
```

#### 根据原始标记坐标获取在图上位置

当把我们已经有的坐标，怎么渲染到现在的图片上？

举个例子：现在坐标是 `x = 500`、`y = 500`，图片是经过移动、缩放的，那渲染时候应该在什么位置？按照上面公式换算回来就行了。

- 公式：left = 相对于原始图片的 x 坐标 \* 缩放比例 + 图片的 left 。

- 公式：top = 相对于原始图片的 y 坐标 \* 缩放比例 + 图片的 top 。

```js
setPosition(x = this.position.x, y = this.position.y) {
    const isCanceled = !this.emit('taggd.tag.change', this)

    if (!isCanceled) {
      const { wrapperElement, position, Taggd } = this
      const { left, top, ratio } = Taggd.imageData

      position.left = ratio * position.x + left
      position.top = ratio * position.y + top

    }

    return this
  }
```

#### 图片的移动和缩放

各种转换处理完成了，该做缩放和移动操作了。

**事件**

需要注意一点，`mousemove` 和 `mouseup` 要绑定在 `document` 上，不然移动过快会光标丢失。

```js
enableEditorMode() {
    const isCanceled = !this.emit('taggd.editor.enable', this)

    if (!isCanceled) {
      addClass(this.wrapper, 'taggd--pointer')

      this.image.addEventListener(this.options.addEvent, ...)
      this.image.addEventListener('wheel', ...)
      this.image.addEventListener('mousedown', ...)
      document.addEventListener('mousemove', ...)
      document.addEventListener('mouseup', ...)
    }

    return this
  }
```

**移动**

移动这块比较简单，就是监听鼠标按下事件记录初始位置，移动事件更新位置，抬起事件更新最新的位置。

- 公式：left = 现在的 left + (现在的鼠标 x 坐标 - 开始的鼠标 x 坐标)。

- 公式：top =现在的 top + (现在的鼠标 y 坐标 -开始的鼠标 x 坐标)。

```js
taggdMoveHander(event: MouseEvent) {
    if (!this.action) {
      return
    }

    event.preventDefault()

    const { imageData, pointer } = this
    const { endX, endY } = getPointer(event)

    imageData.left = pointer.elX + (endX - pointer.startX)
    imageData.top = pointer.elY + (endY - pointer.startY)

    this.taggdChangeRender()

    this.emit('taggd.editor.move', this)

    return this
  },
```

**缩放**

缩放这块就需要监听滚轮事件，并且缩放的时候要以鼠标位置为中心点缩放。重点在于 _鼠标在 x, y 分别占图片的多少比，就把变更的宽高分配多少_

- 公式： left -= 缩放的宽 \* ((相对网页的 x 坐标 - 图片的 left 偏移量) / 图片的宽)。
- 公式： top -= 缩放的高 \* ((相对网页的 y 坐标 - 图片的 top 偏移量) / 图片的高)。

```js
taggdZoomHander(event: WheelEvent) {
    if (this.wheeling) {
      return
    }

    this.wheeling = true

    setTimeout(() => {
      this.wheeling = false
    }, 50)

    event.preventDefault()

    const { options, image, imageData } = this
    const { width, height, naturalWidth, naturalHeight } = imageData

    // 处理比例
    let ratio = getWheelRatio(event, options.zoomRatio)

    const zoomRatioMin = Math.max(0.01, options.zoomRatioMin)
    const zoomRatioMax = Math.min(100, options.zoomRatioMax)

    ratio = (width * ratio) / naturalWidth
    ratio = Math.min(Math.max(ratio, zoomRatioMin), zoomRatioMax)

    // 获取新的宽高
    const offset = getOffset(image)
    const newWidth = naturalWidth * ratio
    const newHeight = naturalHeight * ratio
    const offsetWidth = newWidth - width
    const offsetHeight = newHeight - height

    // 设置新的宽高
    imageData.ratio = ratio
    imageData.width = newWidth
    imageData.height = newHeight
    imageData.left -= offsetWidth * ((event.pageX - offset.left) / width)
    imageData.top -= offsetHeight * ((event.pageY - offset.top) / height)

    this.taggdChangeRender()

    this.emit('taggd.editor.zoom', this)

    return this
  },
```

#### 标记的移动

标记的移动也是同样的道理，多了一个边界判断，标记的坐标不能超出图片的元素宽高。

```js
position.x = Math.min(Math.max(0, x), naturalWidth);
position.y = Math.min(Math.max(0, y), naturalHeight);
```

#### 重构成 TS

大概是快过年的时候学的 `ts` 吧，过年的时候在家重构了一版，因为对 `ts` 还在深造，重构完没有发布最新版本。基本上各项配置都要支持对 `ts` 的支持。

- `jsdoc2md` 添加对 `ts` 的支持 [如何支持 TS](https://github.com/jsdoc2md/jsdoc-to-markdown/wiki/How-to-document-TypeScript)

- `rollup` 使用 `rollup-plugin-typescript2` 解析编译。

- `@typescript-eslint`、`prettier/@typescript-eslint` 对 `ts` 语法的支持。

- 前面不是说了一个原型合并的问题吗，其实是 `this` 的指向问题，因为在单独的文件里 `this` 指向错误，找了好久最终使用 `ThisType` 解决。

```js
const TaggdEffect: ThisType<Taggd> = {
  taggdClickHandler(event: MouseEvent) {
    // 这样 this 就指向了 Taggd
  },
};
```

## 总结思考

虽然这是一个很小的项目，但这让我对设计模式和基础知识的重要性更加肯定，做的时候翻了不少资料。后来呢还看了两本书做了总结。

- [读书.红宝书之初读笔记系列](https://github.com/haiweilian/blogs/blob/master/JavaScript/RedBook/README.md)
- [读书.设计模式与开发实践](https://github.com/haiweilian/blogs/blob/master/JavaScript/DesignPattern/README.md)

还需要升级和完善的地方还有很多。

- 单元测试没做。
- 类型声明不完善。
- ...

## 本文参与

本文正在参与「掘金 2021 春招闯关活动」, 点击查看[活动详情](https://juejin.cn/post/6933147477399109640)。
