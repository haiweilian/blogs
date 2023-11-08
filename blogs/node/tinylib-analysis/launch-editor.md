---
title: launch-editor 源码分析-在 Vue Devtools 中打开编辑器文件
date: 2021-12-01
tags:
  - Node
categories:
  - 后端
  - 源码分析
---

## 源码

### Vue Devtools

![1](https://raw.githubusercontent.com/haiweilian/tinylib-analysis/main/006.launch-editor/.docs/images/1.png)

先去看看 vue-devtools 的打开按钮事件做了什么。

<https://github.com/vuejs/devtools/blob/main/packages/app-frontend/src/features/components/SelectedComponentPane.vue#L107>

```html
<VueButton
  v-if="fileIsPath"
  v-tooltip="{ content: $t('ComponentInspector.openInEditor.tooltip', { file: data.file }), html: true }"
  icon-left="launch"
  class="flat icon-button"
  @click="openFile()"
/>
```

<https://github.com/vuejs/devtools/blob/main/packages/shared-utils/src/util.ts#L655>

```js
export function openInEditor(file) {
  const fileName = file.replace(/\\/g, "\\\\");
  const src = `fetch('${SharedData.openInEditorHost}__open-in-editor?file=${encodeURI(
    file
  )}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://devtools.vuejs.org/guide/open-in-editor.html')
    }
  })`;
  if (isChrome) {
    target.chrome.devtools.inspectedWindow.eval(src);
  } else {
    eval(src);
  }
}
```

当点击按钮的时候向我们的开发服务器发起了一个请求，`http://localhost:8080/__open-in-editor?file=src/App.vue`，那下面看看服务是怎么处理的。

### Vue Cli

找到 `vue-cli` 中的 `vue-cli-project/node_modules/@vue/cli-service/lib/commands/serve.js` 文件，通过代码看是在 `webpack` 服务中添加了一个中间件实现的。

```js
const server = new WebpackDevServer(compiler, {
  // https://v4.webpack.docschina.org/configuration/dev-server/#devserver-before
  // 在服务内部的所有其他中间件之前， 提供执行自定义中间件的功能。 这可以用来配置自定义处理程序
  before(app, server) {
    // launch editor support.
    // this works with vue-devtools & @vue/cli-overlay
    app.use(
      "/__open-in-editor",
      launchEditorMiddleware(() =>
        console.log(
          `To specify an editor, specify the EDITOR env variable or ` +
            `add "editor" field to your Vue project config.\n`
        )
      )
    );
    // allow other plugins to register middlewares, e.g. PWA
    api.service.devServerConfigFns.forEach((fn) => fn(app, server));
    // apply in project middlewares
    projectDevServerOptions.before && projectDevServerOptions.before(app, server);
  },
});
```

其实如果自己去配置就是这么简单就实现了，主要内部实现是在 `launch-editor` 这个包里。再看看 `vite` 里也是用的这个包，一行代码就搞定了，后面主要看这个包的实现。

```js
// https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/index.ts#L498
middlewares.use("/__open-in-editor", launchEditorMiddleware());
```

### Launch Editor Middleware

先看这个中间件，接收到请求后会执行中间件做一些准备工作。比如获取到当前的项目路径和解析请求参数。

```js
const url = require("url");
const path = require("path");
const launch = require("launch-editor");

module.exports = (specifiedEditor, srcRoot, onErrorCallback) => {
  if (typeof specifiedEditor === "function") {
    onErrorCallback = specifiedEditor;
    specifiedEditor = undefined;
  }

  if (typeof srcRoot === "function") {
    onErrorCallback = srcRoot;
    srcRoot = undefined;
  }

  srcRoot = srcRoot || process.cwd();

  return function launchEditorMiddleware(req, res, next) {
    // 解析 http://localhost:8080/__open-in-editor?file=src/App.vue 的参数
    const { file } = url.parse(req.url, true).query || {};
    if (!file) {
      res.statusCode = 500;
      res.end(`launch-editor-middleware: required query param "file" is missing.`);
    } else {
      // 我们拿到路径去打开文件
      launch(path.resolve(srcRoot, file), specifiedEditor, onErrorCallback);
      res.end();
    }
  };
};
```

### Launch Editor

#### 检测编辑器

```js
function launchEditor() {
  // ...
  // 猜测是哪个编辑在运行
  const [editor, ...args] = guessEditor(specifiedEditor);
  // ...
}
```

在不同的系统平台使用对应的命令查找正在运行的应用程序并返回对应的执行命令，如 `Vs Code => code` 命令。

```js
// 应用程序的枚举
const COMMON_EDITORS_OSX = ['/Applications/Visual Studio Code.app/Contents/MacOS/Electron': 'code', /* ... */]
// `ps x` and `Get-Process` 找到所有在运行的应用程序，在列举的应用程序做查找，找到则返回。
module.exports = function guessEditor(specifiedEditor) {
  // We can find out which editor is currently running by:
  // `ps x` on macOS and Linux
  // `Get-Process` on Windows
  try {
    if (process.platform === "darwin") {
      const output = childProcess.execSync("ps x").toString();
      const processNames = Object.keys(COMMON_EDITORS_OSX);
      for (let i = 0; i < processNames.length; i++) {
        const processName = processNames[i];
        if (output.indexOf(processName) !== -1) {
          return [COMMON_EDITORS_OSX[processName]];
        }
      }
    } else if (process.platform === "win32") {
      const output = childProcess
        .execSync('powershell -Command "Get-Process | Select-Object Path"', {
          stdio: ["pipe", "pipe", "ignore"],
        })
        .toString();
      // ...
    } else if (process.platform === "linux") {
      const output = childProcess
        .execSync("ps x --no-heading -o comm --sort=comm")
        .toString();
      // ...
    }
  } catch (error) {
    // Ignore...
  }

  // 如果没有匹配到，则还可以指定环境变量
  if (process.env.VISUAL) {
    return [process.env.VISUAL];
  } else if (process.env.EDITOR) {
    return [process.env.EDITOR];
  }

  return [null];
};
```

#### 打开编辑器

假设 `editor` 匹配到 `code`；`args` 是 `['/user/path/src/App.vue']`。

使用 `node` 的子进程在终端执行命令 `childProcess.spawn('code', ['/user/path/src/App.vue'], { stdio: 'inherit' })` 相当于执行了 `code /user/path/src/App.vue` 命令。

```js
function launchEditor() {
  // ....
  // 处理执行参数
  if (lineNumber) {
    const extraArgs = getArgumentsForPosition(editor, fileName, lineNumber, columnNumber);
    args.push.apply(args, extraArgs);
  } else {
    args.push(fileName);
  }

  // ....
  // 用对用的编辑器命令打开编辑器
  if (process.platform === "win32") {
    // On Windows, launch the editor in a shell because spawn can only
    // launch .exe files.
    _childProcess = childProcess.spawn("cmd.exe", ["/C", editor].concat(args), {
      stdio: "inherit",
    });
  } else {
    // 比如 editor = code args = /user/path/src/App.vue
    // code /user/path/src/App.vue
    _childProcess = childProcess.spawn(editor, args, { stdio: "inherit" });
  }
}
```
