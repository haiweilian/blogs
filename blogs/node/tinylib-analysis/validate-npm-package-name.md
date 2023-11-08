---
title: validate-npm-package-name 源码分析-检测 NPM 包是否符合标准
date: 2021-12-22
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

这个包是 `npm` 官方出的一个检测 `npm` 包是否符合标准。<https://github.com/npm/validate-npm-package-name>

## 源码

### 依赖

依赖了一个模块 [builtins](https://github.com/juliangruber/builtins/blob/master/index.js) 里面枚举了 `node` 的核心模块，我们不能和内置模块起一样的名字，不然不就冲突了吗。

```js
var builtins = require("builtins");
```

### 变量

有一个 `scopedPackagePattern` 长正则是用来验证 _命名空间_ 格式的，用 [regulex](https://jex.im/regulex) 来解析下比较清楚。以 `@` 开头，中间 `一或多个字符`，然后包含 `/`，最后以 `一或多个字符` 结尾。

![1.png](https://raw.githubusercontent.com/haiweilian/tinylib-analysis/main/009.validate-npm-package-name/.docs/images/1.png)

```js
// 命名空间的格式验证
var scopedPackagePattern = new RegExp("^(?:@([^/]+?)[/])?([^/]+?)$");
// 黑名单列表
var blacklist = ["node_modules", "favicon.ico"];
```

### 判断

然后就是对名称各种判断了，都是能看得懂的常规判断。

```js
var validate = (module.exports = function (name) {
  // 警告信息
  var warnings = [];
  // 错误信息
  var errors = [];

  // 名称不能为 null
  if (name === null) {
    errors.push("name cannot be null");
    return done(warnings, errors);
  }

  // 名称不能为 undefined
  if (name === undefined) {
    errors.push("name cannot be undefined");
    return done(warnings, errors);
  }

  // 名称必须是一个字符串
  if (typeof name !== "string") {
    errors.push("name must be a string");
    return done(warnings, errors);
  }

  // 名称不能为空
  if (!name.length) {
    errors.push("name length must be greater than zero");
  }

  // 名称不能以 . 开头
  if (name.match(/^\./)) {
    errors.push("name cannot start with a period");
  }

  // 名称不能以 _ 开头
  if (name.match(/^_/)) {
    errors.push("name cannot start with an underscore");
  }

  // 名称前后不能包含空格
  if (name.trim() !== name) {
    errors.push("name cannot contain leading or trailing spaces");
  }

  // 名称不能是黑名单列表的
  blacklist.forEach(function (blacklistedName) {
    if (name.toLowerCase() === blacklistedName) {
      errors.push(blacklistedName + " is a blacklisted name");
    }
  });

  // 名称不能是内置核心模块
  builtins.forEach(function (builtin) {
    if (name.toLowerCase() === builtin) {
      warnings.push(builtin + " is a core module name");
    }
  });

  // 名称最大长度不能超过 214
  if (name.length > 214) {
    warnings.push("name can no longer contain more than 214 characters");
  }

  // 名称不能包含大小字符
  if (name.toLowerCase() !== name) {
    warnings.push("name can no longer contain capital letters");
  }

  // 不能包含特殊字符
  if (/[~'!()*]/.test(name.split("/").slice(-1)[0])) {
    warnings.push('name can no longer contain special characters ("~\'!()*")');
  }

  // 如果是命名空间
  if (encodeURIComponent(name) !== name) {
    // Maybe it's a scoped package name, like @user/package
    var nameMatch = name.match(scopedPackagePattern);
    if (nameMatch) {
      var user = nameMatch[1];
      var pkg = nameMatch[2];
      if (encodeURIComponent(user) === user && encodeURIComponent(pkg) === pkg) {
        return done(warnings, errors);
      }
    }

    errors.push("name can only contain URL-friendly characters");
  }

  return done(warnings, errors);
});
```

## 总结

1. 实话看源码比看文档的规则清楚多了。

2. 如果要写一个脚手架啥的也可以查看这种规则去写或者可以直接使用。
