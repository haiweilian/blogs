---
title: update-notifier 源码分析-检测 NPM 包是否更新
date: 2021-12-22
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

用于提示当前本地的 `npm` 包是否是最新版本并给予提示。<https://github.com/yeoman/update-notifier>

![1.png](https://raw.githubusercontent.com/haiweilian/tinylib-analysis/main/008.update-notifier/.docs/images/1.png)

## 源码

### 依赖

可以看到依赖了非常多的依赖包，实现是靠这些的组合这也考研了知识储备量。下面从三个阶段在解析整个的流程。

```js
const { spawn } = require("child_process");
const path = require("path");
const { format } = require("util");
// 懒加载模块
const importLazy = require("import-lazy")(require);
// 配置存储
const configstore = importLazy("configstore");
// 终端字符颜色
const chalk = importLazy("chalk");
// 语义化版本
const semver = importLazy("semver");
// 语义化版本比较差异
const semverDiff = importLazy("semver-diff");
// 获取 npm 上的最新版本号
const latestVersion = importLazy("latest-version");
// 检测运行文件的报管理工具 npm or yarn
const isNpm = importLazy("is-npm");
// 检测安装包是否全局安装
const isInstalledGlobally = importLazy("is-installed-globally");
// 检测安装包是否 yarn 全局安装
const isYarnGlobal = importLazy("is-yarn-global");
// 检测项目是否使用 yarn
const hasYarn = importLazy("has-yarn");
// 在终端创建一个框显示
const boxen = importLazy("boxen");
// 配置基础路径
const xdgBasedir = importLazy("xdg-basedir");
// 检测当前环境是否是持续集成环境
const isCi = importLazy("is-ci");
// 占位符的模板
const pupa = importLazy("pupa");
```

### 解析配置阶段

这一步主要是对传入的参数进行解析，并存储起来。并利用了 `configstore` 持久化存储信息。

```js
class UpdateNotifier {
  // 解析配置阶段
  constructor(options = {}) {
    // 解析配置，从不同参数中解析出 packageName 和 packageVersion
    this.options = options;
    options.pkg = options.pkg || {};
    options.distTag = options.distTag || "latest";

    // Reduce pkg to the essential keys. with fallback to deprecated options
    // TODO: Remove deprecated options at some point far into the future
    options.pkg = {
      name: options.pkg.name || options.packageName,
      version: options.pkg.version || options.packageVersion,
    };

    if (!options.pkg.name || !options.pkg.version) {
      throw new Error("pkg.name and pkg.version required");
    }

    this.packageName = options.pkg.name;
    this.packageVersion = options.pkg.version;

    // 检测更新的间隔时间
    this.updateCheckInterval =
      typeof options.updateCheckInterval === "number" ? options.updateCheckInterval : ONE_DAY;

    // 是否禁用
    this.disabled =
      "NO_UPDATE_NOTIFIER" in process.env ||
      process.env.NODE_ENV === "test" ||
      process.argv.includes("--no-update-notifier") ||
      isCi();

    // npm 脚本时通知
    this.shouldNotifyInNpmScript = options.shouldNotifyInNpmScript;

    if (!this.disabled) {
      try {
        // 存储配置到本地文件
        const ConfigStore = configstore();
        this.config = new ConfigStore(`update-notifier-${this.packageName}`, {
          optOut: false,
          lastUpdateCheck: Date.now(),
        });
      } catch {
        // ...
      }
    }
  }
}
```

### 检测更新阶段

这一步主要做检测判断，比如通过时间判断是否应该再次检测，通过本地的包信息和远程最新的包信息检测是否是最新版本。检测的时候开启了一个单独的子进程去检测，并通过本地存储的信息交互结果。

```js
class UpdateNotifier {
  // 检测更新阶段
  check() {
    // ....

    // 是否超过检测的间隔时间
    if (Date.now() - this.config.get("lastUpdateCheck") < this.updateCheckInterval) {
      return;
    }

    // 执行检测脚本
    spawn(process.execPath, [path.join(__dirname, "check.js"), JSON.stringify(this.options)], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }

  async fetchInfo() {
    // 获取到最新的版本信息
    const { distTag } = this.options;
    const latest = await latestVersion()(this.packageName, {
      version: distTag,
    });
    // 返回两个版本的差异信息
    return {
      latest,
      current: this.packageVersion,
      type: semverDiff()(this.packageVersion, latest) || distTag,
      name: this.packageName,
    };
  }
}
```

### 通知更新阶段

最后就是在通过 `boxen` 在总端输出提示信息。

```js
class UpdateNotifier {
  // 通知更新阶段
  notify(options) {
    const suppressForNpm = !this.shouldNotifyInNpmScript && isNpm().isNpmOrYarn;
    if (
      !process.stdout.isTTY ||
      suppressForNpm ||
      !this.update ||
      !semver().gt(this.update.latest, this.update.current)
    ) {
      return this;
    }

    options = {
      isGlobal: isInstalledGlobally(),
      isYarnGlobal: isYarnGlobal()(),
      ...options,
    };

    // 根据环境提示命令
    let installCommand;
    if (options.isYarnGlobal) {
      installCommand = `yarn global add ${this.packageName}`;
    } else if (options.isGlobal) {
      installCommand = `npm i -g ${this.packageName}`;
    } else if (hasYarn()()) {
      installCommand = `yarn add ${this.packageName}`;
    } else {
      installCommand = `npm i ${this.packageName}`;
    }

    // 创建终端的提示信息
    const defaultTemplate =
      "Update available " +
      chalk().dim("{currentVersion}") +
      chalk().reset(" → ") +
      chalk().green("{latestVersion}") +
      " \nRun " +
      chalk().cyan("{updateCommand}") +
      " to update";

    const template = options.message || defaultTemplate;

    options.boxenOptions = options.boxenOptions || {
      padding: 1,
      margin: 1,
      align: "center",
      borderColor: "yellow",
      borderStyle: "round",
    };

    const message = boxen()(
      pupa()(template, {
        packageName: this.packageName,
        currentVersion: this.update.current,
        latestVersion: this.update.latest,
        updateCommand: installCommand,
      }),
      options.boxenOptions
    );

    if (options.defer === false) {
      console.error(message);
    } else {
      process.on("exit", () => {
        console.error(message);
      });

      process.on("SIGINT", () => {
        console.error("");
        process.exit();
      });
    }

    return this;
  }
}
```

## 总结

1. 看完这个发现这一个小功能依赖的是真多，而我们也要善于通过第三方的各种小功能进行组合达到自己的需求。
