---
title: Vben Admin 深入理解之插件、环境变量的设计
date: 2021-08-28
tags:
  - Vue
categories:
  - 前端
---

个人认为 [Vben Admin](https://github.com/anncwb/vue-vben-admin) 是一个很好的项目，完成度和文档都比较完善，技术栈也是一直保持最新的。当我在跟着文档操作一遍后，却对很多东西不明所以而没有立即投入项目中使用。

当然也必要等全部理解完了再去使用，用着看着呗毕竟优秀点很多。指南部分文档对怎么使用写的很清楚而源码中高度的封装，而这部分也常常是需要根据实际业务修改的地方，所以决定把先把这部分的源码看一下再使用。

### 疑问点

本部分主要分析环境变量的处理和怎么使用一个 Vite 插件。

在 `Vite` 中只有以 `VITE_` 开头的变量会被嵌入到客户端侧的包中。新加了一个规则是以 `VITE_GLOB_` 开头的的变量，在打包的时候会被加入 `_app.config.js`。

- 那么怎么处理的环境变量做了什么转换、做了什么扩展？
- 那么 `_app.config.js` 是怎么生成的、内容怎么写入的？

### 解析环境变量文件

首先从 `vite.config.ts` 入口开始。

使用 `loadEnv` 读取对应的环境配置文件(.env + .env.\[mode\] + .env.\[mode\].local)，可在后续配置中使用。加载方式详情[环境变量和模式](https://cn.vitejs.dev/guide/env-and-mode.html)。

```ts
// vite.config.ts
import { loadEnv } from 'vite';
import { wrapperEnv } from './build/utils';
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const root = process.cwd();

  // 加载对应模式的环境变量
  const env = loadEnv(mode, root);

  // 解析处理环境变量的值
  const viteEnv = wrapperEnv(env);
  };
};
```

使用 `wrapperEnv` 对读取到内容做进一步处理。

```ts
// build/utils.ts
export function wrapperEnv(envConf: Recordable): ViteEnv {
  const ret: any = {};

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");

    // 转化布尔值
    realName = realName === "true" ? true : realName === "false" ? false : realName;

    // 转化端口配置
    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }

    // 转化代理配置
    if (envName === "VITE_PROXY") {
      try {
        realName = JSON.parse(realName);
      } catch (error) {}
    }

    ret[envName] = realName;

    // 为什么要赋值到 process.env 呢？后续有什么用？
    if (typeof realName === "string") {
      process.env[envName] = realName;
    } else if (typeof realName === "object") {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
}
```

然后把解析后 `viteEnv` 传入插件列表中使用。

```ts
// vite.config.ts
export default ({ command, mode }: ConfigEnv): UserConfig => {
  const viteEnv = wrapperEnv(env);
  return {
    plugins: createVitePlugins(viteEnv, isBuild),
  };
};
```

### 是怎么生成 \_app.config.js

经过查找逻辑，在执行完 `build` 之后，使用 [esno](https://github.com/antfu/esno) 执行了一个脚本去生成的。

```sh
"build": "cross-env NODE_ENV=production vite build && esno ./build/script/postBuild.ts"
```

主要作用是解析环境变量文件，并把内容写入到文件中。

```ts
// build/script/buildConf.ts
function createConfig({ configName, config, configFileName = GLOB_CONFIG_FILE_NAME }) {
  try {
    // 文件内容
    const windowConf = `window.${configName}`;
    const configStr = `${windowConf}=${JSON.stringify(config)};
      Object.freeze(${windowConf});
      Object.defineProperty(window, "${configName}", {
        configurable: false,
        writable: false,
      });
    `.replace(/\s/g, "");
    fs.mkdirp(getRootPath(OUTPUT_DIR));
    // 生成文件
    writeFileSync(getRootPath(`${OUTPUT_DIR}/${configFileName}`), configStr);
  } catch (error) {
    console.log(chalk.red("configuration file configuration file failed to package:\n" + error));
  }
}

export function runBuildConfig() {
  // 获取环境变量配置文件中以 VITE_GLOB_ 开头的值，和 Vite 一样通过 dotenv 解析
  const config = getEnvConfig();
  // 获取变量配置名称 `__PRODUCTION__${env.VITE_GLOB_APP_SHORT_NAME}__CONF__`
  const configFileName = getConfigFileName(config);
  // 生成代码并写入文件
  createConfig({ config, configName: configFileName });
}
```

最后就是在 `index.html` 引入 `_app.config.js`，这里使用 [vite-plugin-html](https://github.com/anncwb/vite-plugin-html) 也是 Vben 作者自己写的。

插件都是集中管理在 `build/vite/plugin` 里的，处理完配置后返回数组并配置到 `vite` 的 `plugins` 配置上。

```ts
// build/vite/plugin/html.ts
export function configHtmlPlugin(env: ViteEnv, isBuild: boolean) {
  const { VITE_GLOB_APP_TITLE, VITE_PUBLIC_PATH } = env;

  const path = VITE_PUBLIC_PATH.endsWith("/") ? VITE_PUBLIC_PATH : `${VITE_PUBLIC_PATH}/`;

  // 获取路径配置
  const getAppConfigSrc = () => {
    return `${path || "/"}${GLOB_CONFIG_FILE_NAME}?v=${pkg.version}-${new Date().getTime()}`;
  };

  const htmlPlugin: Plugin[] = html({
    minify: isBuild,
    inject: {
      data: {
        title: VITE_GLOB_APP_TITLE,
      },
      // build 模式引入 app.config.js 文件
      tags: isBuild
        ? [
            {
              tag: "script",
              attrs: {
                src: getAppConfigSrc(),
              },
            },
          ]
        : [],
    },
  });
  return htmlPlugin;
}
```

### 环境变量的使用

首先我们还是可以使用 `vite` 提供的方式。

```ts
import.meta.env.VITE_XXX;
```

根据文档可知道通过 `useGlobSetting` 函数来进行获取动态配置。

```ts
// src/hooks/setting/index.ts
export const useGlobSetting = () => {
  const { VITE_GLOB_APP_TITLE } = getAppEnvConfig(); // 生产环境动态配置
  const glob = {
    title: VITE_GLOB_APP_TITLE,
  };
  return glob;
};
```

生产环境动态配置的实现。

```ts
// src/utils/env.ts
export function getAppEnvConfig() {
  // 获取配置的别名
  const ENV_NAME = getConfigFileName(import.meta.env);

  // 如果是开发开发环境从环境变量中获取
  // 如果是生产环境从 window 属性中获取 (_app.config.js)
  const ENV = import.meta.env.DEV ? import.meta.env : window[ENV_NAME];

  const { VITE_GLOB_APP_TITLE } = ENV;

  return {
    VITE_GLOB_APP_TITLE,
  };
}
```

### 总结

我们知道当我们配置了一个环境变量后 Vben Admin 做了哪些处理又是怎么来的。这样我们在使用的时候如果有问题或增加新的插件逻辑我们也能随心所欲。
