---
title: 从 Element UI 的 Theme 源码来看命名规范 BEM 的应用
date: 2019-12-21
tags:
  - Css
  - Scss
categories:
  - 前端
---

最近自己在写自己的博客页面，想着就参考框架的组织结构，自己是对 element-ui 是比较熟悉的，就拿来参考了。[element-ui](https://github.com/ElementUI/theme-chalk) 的样式是使用 scss 预处理器，和 BEM 思想写的。整体来说组织的还是挺好的，从中可以学到一些封装思想，可以提升一下自己。

## 目录结构

你可以把[theme-chalk](https://github.com/ElementUI/theme-chalk)的源码下载下来，以便对比着看。下面是几个比较重要的文件(2019-12-21 最新版本为 v.2.13.0)。

```sh
├── gulpfile.js // 打包配置，可以把代码压缩 cssmin() 注释掉，以便查看编译后的代码。
├── lib // 打包文件存放目录。
├── src
│   ├── common
│   │   └── var.scss // 全局变量，大小、颜色。
│   ├── mixins
│   │   ├── config.scss // 定义了BEM的分隔符。
│   │   ├── function.scss
│   │   ├── mixins.scss // 主要定义了实现BEM类，也和 function.scss 相关联。
│   │   └── utils.scss
│   ├── radio-group.scss
│   ├── radio.scss
│   ├── ...其他具体的组件...
└──
```

## BEM 支持

源码中最重要的一个概念 `BEM` ，贯穿全局。

### BEM 分割符

在 `src/mixins/config.scss` 定义了命名空间以及块、元素、修饰的分割符。了解过 `BEM` 的大概都知道，`BEM` 最最重要的是思想，而分隔符可以按照一定的规范去定义，这里不再多说了。

命名空间和块。框架都会选择一个相对应的前缀，避免样式冲突，如：`.el-input`。

```scss
$namespace: "el";
```

元素。使用的 `__`  双下划线，如： `.el-input__inner`。

```scss
$element-separator: "__";
```

修饰。使用的 `--` 双连字符，如：`.el-input--small`。

```scss
$modifier-separator: "--";
```

状态。使用的 `is-` 作为前缀，如：`.el-input.is-disabled`。

```scss
$state-prefix: "is-";
```

### BEM Mixin

在 `src/mixins/mixins.scss` 定义了 `@mixin b($block)` 、`@mixin e($element)` 、 `@mixin m($modifier)` 、 `@mixin when($state)` 几个主要的 `mixin`。 用一个源码举例，`src/input.scss` 涉及到了所有的方法，也比较常用。

mixin 中涉及到的几个知识点：

- [!global](https://sass-lang.com/documentation/variables#shadowing) 把局部变量设置成全局变量。

- [@content](https://sass-lang.com/documentation/at-rules/mixin#content-blocks) 把@include mixin 包含的内容块导入到此处。

- [@at-root](https://sass-lang.com/documentation/at-rules/at-root) 忽略嵌套，从根层级书写。

#### @mixin b(\$block)

定义生成块。参数为块的名称。

```scss
@include b(input) {
  display: inline-block;
}
```

编译后。

```css
.el-input {
  display: inline-block;
}
```

#### @mixin e(\$element)

定义生成元素。参数是元素的名称，可以传入多个，`($element1, $element2, ...)`。mixin 中的 `@if hitAllSpecialNestRule` 可以先跳过，下面单说。

```scss
@include b(input) {
  @include e(inner) {
    padding: 0 15px;
  }

  @include e((suffix, suffix-inner)) {
    position: absolute;
  }
}
```

编译后。

```css
.el-input__inner {
  padding: 0 15px;
}

.el-input__suffix,
.el-input__suffix-inner {
  position: absolute;
}
```

#### @mixin m(\$modifier)

定义生成修饰。参数是修饰的名称，可以传入多个，`($modifier1, $modifier2, ...)`。

```scss
@include b(input) {
  @include m(medium) {
    height: 30px;
  }

  @include m((mini, small)) {
    height: 20px;
  }
}
```

编译后。

```css
.el-input--medium {
  height: 30px;
}

.el-input--mini,
.el-input--small {
  height: 20px;
}
```

#### @mixin when(\$state)

定义条件状态。参数是状态的名称。

```scss
@include b(input) {
  @include when(disabled) {
    cursor: not-allowed;
  }
}
```

编译后.

```css
.el-input.is-disabled {
  cursor: not-allowed;
}
```

### BEM Function

在 `@mixin e` 里面有一个判断 `@if hitAllSpecialNestRule($selector)`，它的作用是判断什么情况下使用选择器层级嵌套。

在 `bem` 的规范中，推荐的是选择器层级**尽量平级，减少嵌套** 所以也就是在上面的 mixin 中都使用了 `@at-root` 规则 。
而实际中我们不可避免使用嵌套，在不同的场景下实现样式覆盖。如在不同大小，和不同状态我们是不是应该给下级设置不同的大小和颜色。

function 涉及到的几个知识点:

- [inspect](https://sass-lang.com/documentation/modules/meta#inspect) 返回字符串的表示形式。

- [str-slice](https://sass-lang.com/documentation/modules/string#slice) 截取字符串。

- [str-index](https://sass-lang.com/documentation/modules/string#index) 包含指定字符串的索引。

#### containsModifier(\$selector)

在修饰符之下嵌套元素。

```scss
@include b(input) {
  @include m(medium) {
    @include e(inner) {
      padding: 0 10px;
    }
  }
}
```

编译后。

```css
.el-input--medium .el-input__inner {
  padding: 0 10px;
}
```

#### containWhenFlag(\$selector)

在状态下嵌套元素。

```scss
@include b(input) {
  @include when(disabled) {
    @include e(inner) {
      color: #eeeeee;
    }
  }
}
```

编译后。

```css
.el-input.is-disabled .el-input__inner {
  color: #eeeeee;
}
```

#### containPseudoClass(\$selector)

在伪类下嵌套元素。

```scss
@include b(input) {
  &:hover {
    @include e(inner) {
      border: 1px solid blue;
    }
  }
}
```

编译后。

```scss
.el-input:hover .el-input__inner {
  border: 1px solid blue;
}
```

#### hitAllSpecialNestRule(\$selector)

以上三种情况都会在特定场景下生效。最后通过或者 `or` 判断。

## 参考文献

使用 `scss` 和 `bem` 可以很好的组织我们的 css 结构，推荐学习。源码中还有栅格布局`row.scss` 和 `col.scss` 文件写的也很简洁，我现在项目就是采用的这一套生成的。

<https://sass-lang.com/documentation>

<https://en.bem.info/methodology/quick-start>
