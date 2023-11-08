---
title: only-allow 源码分析-强制统一规范包管理器
date: 2021-12-23
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 前言

应用场景是强制使用统一的包管理器，统一使用 `npm` or `yarn ` or `pnpm`。<https://github.com/pnpm/only-allow>

## 源码

利用 `npm` 的 `preinstall` 钩子在安装包之前执行一段检测脚本。

### 依赖

```js
// 当前运行的包管理工具 npm/yarn/pnpm
const whichPMRuns = require("which-pm-runs");
// 在总端创建一个框
const boxen = require("boxen");
```

### 运行环境

先来想一个问题，它是怎么知道我们是使用什么来运行的。

先来看 `which-pm-runs` 的实现，它是通过 `process.env.npm_config_user_agent` 来判断的，`npm_config_user_agent` 是包管理工具实现的一个环境变量字段，类似于浏览器的 `navigator.userAgent`。

通过 `npm_config_user_agent` 能得到 `yarn/1.22.17 npm/? node/v14.17.0 darwin x64`，通过解析这个字符串就可以知道通过什么来运行的。

```js
module.exports = function () {
  if (!process.env.npm_config_user_agent) {
    return undefined;
  }
  return pmFromUserAgent(process.env.npm_config_user_agent);
};

// yarn/1.22.17 npm/? node/v14.17.0 darwin x64
function pmFromUserAgent(userAgent) {
  const pmSpec = userAgent.split(" ")[0];
  const separatorPos = pmSpec.lastIndexOf("/");
  // 返回名称和版本
  return {
    name: pmSpec.substr(0, separatorPos),
    version: pmSpec.substr(separatorPos + 1),
  };
}
```

### 判断参数

所以我们只需要获取到 `process.argv` 的参数，和 `which-pm-runs` 返回的 `name` 对比是否一致，入股不一致提示出信息。

```js
// 获取命令行参数和判断解析出 npm/yarn/pnpm
const argv = process.argv.slice(2);
if (argv.length === 0) {
  console.log("Please specify the wanted package manager: only-allow <npm|pnpm|yarn>");
  process.exit(1);
}
const wantedPM = argv[0];
if (wantedPM !== "npm" && wantedPM !== "pnpm" && wantedPM !== "yarn") {
  console.log(
    `"${wantedPM}" is not a valid package manager. Available package managers are: npm, pnpm, or yarn.`
  );
  process.exit(1);
}

// 如果现在使用工具和指定的不一致则输出提示
const usedPM = whichPMRuns();
if (usedPM && usedPM.name !== wantedPM) {
  const boxenOpts = { borderColor: "red", borderStyle: "double", padding: 1 };
  switch (wantedPM) {
    case "npm":
      console.log(boxen('Use "npm install" for installation in this project', boxenOpts));
      break;
    case "pnpm":
      console.log(
        boxen(
          `Use "pnpm install" for installation in this project.

If you don't have pnpm, install it via "npm i -g pnpm".
For more details, go to https://pnpm.js.org/`,
          boxenOpts
        )
      );
      break;
    case "yarn":
      console.log(
        boxen(
          `Use "yarn" for installation in this project.

If you don't have Yarn, install it via "npm i -g yarn".
For more details, go to https://yarnpkg.com/`,
          boxenOpts
        )
      );
      break;
  }
  process.exit(1);
}
```

## 总结

1. 学到了 `npm_config_user_agent` 环境变量。

2. 强制性的规范更有助于避免错误。
