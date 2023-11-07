---
title: Vben Admin 深入理解之路由、菜单、权限的设计
date: 2021-08-30
tags:
  - Vue
categories:
  - 前端
---

个人认为 [Vben Admin](https://github.com/anncwb/vue-vben-admin) 是一个很好的项目，完成度和文档都比较完善，技术栈也是一直保持最新的。当我在跟着文档操作一遍后，却对很多东西不明所以而没有立即投入项目中使用。

当然也必要等全部理解完了再去使用，用着看着呗毕竟优秀点很多。指南部分文档对怎么使用写的很清楚而源码中高度的封装，而这部分也常常是需要根据实际业务修改的地方，所以决定把先把这部分的源码看一下再使用。

### 疑问点

本部分主要分析路由、菜单、权限之间的关系，以下代码主要是流程的内容某些相关的数据处理函数和分支可自行阅读。

路由可以影响到菜单的生成，菜单根据权限模式做不同的处理、权限影响到路由的注册和登录的校验。

- 路由是怎么自动加载并生成菜单的？
- 菜单权限模式分别有什么不同，怎么做的区分和处理？
- 权限的认证流程和初始化是怎么完成的？

### 项目的初始化

因为涉及到整体的结构设计，所以先看一下项目初始化了哪些内容。

```ts
// src/main.ts
async function bootstrap() {
  const app = createApp(App);

  // 配置存储
  setupStore(app);

  // 初始化系统的配置、项目配置、样式主题、持久化缓存等等
  initAppConfigStore();

  // 注册全局组件
  registerGlobComp(app);

  // 多语言配置
  await setupI18n(app);

  // 配置路由
  setupRouter(app);

  // 路由守卫、权限判断、初始化缓存数据
  setupRouterGuard(router);

  // 注册全局指令
  setupGlobDirectives(app);

  // 配置全局错误处理
  setupErrorHandle(app);

  await router.isReady();

  app.mount("#app", true);
}
```

### 路由配置

实现自动加载 `modules` 下的路由文件并生成路由配置信息和一些通用的配置。

```ts
// src/router/routes/index.ts
import { PAGE_NOT_FOUND_ROUTE, REDIRECT_ROUTE } from "/@/router/routes/basic";
import { mainOutRoutes } from "./mainOut";

// 自动加载 `modules` 目录下的路由模块
const modules = import.meta.globEager("./modules/**/*.ts");
const routeModuleList: AppRouteModule[] = []; // routeModuleList = modules

// 读取的路由并未立即注册，而是等权限认证完后通过 router.addRoutes 添加到路由实例，实现权限的过滤
export const asyncRoutes = [PAGE_NOT_FOUND_ROUTE, ...routeModuleList];

export const RootRoute: AppRouteRecordRaw = {};
export const LoginRoute: AppRouteRecordRaw = {};

export const basicRoutes = [
  // 登录路由 /login
  LoginRoute,
  // 根路由 /
  RootRoute,
  // 新页面 /main-out
  ...mainOutRoutes,
  // 从定义 /redirect
  REDIRECT_ROUTE,
  // 404 /:path(.*)*
  PAGE_NOT_FOUND_ROUTE,
];
```

### 登录主体流程

点击登录获取用户信息，存储使用的 `pinia` 实现。

```ts
// src/views/sys/login/LoginForm.vue
const userInfo = await userStore.login(
  toRaw({
    password: data.password,
    username: data.account,
    mode: "none",
  })
);
```

```ts
// src/store/modules/user.ts
login(params){
  // 1、调用登录接口
  const data = await loginApi(loginParams, mode); // mock
  const { token } = data;

  // 2、设置 token，并存储本地缓存。
  this.setToken(token);

  // 3、获取用户信息
  const userInfo = await this.getUserInfoAction();

  // 4、获取路由配置并动态添加路由配置
  const routes = await permissionStore.buildRoutesAction();
  routes.forEach((route) => {
    router.addRoute(route);
  });
  return userInfo;
}
```

### 获取用户信息

获取 `token` 之后调用 `getUserInfoAction` 获取用户信息。

```ts
// src/store/modules/user.ts
getUserInfoAction() {
  const userInfo = await getUserInfo(); // mock
  const { roles } = userInfo;
  const roleList = roles.map((item) => item.value);
  // 设置用户信息，并存储本地缓存
  this.setUserInfo(userInfo);
  // 设置权限列表，并存储本地缓存
  this.setRoleList(roleList);
  return userInfo;
}
```

### 生成路由

登录成功之后调用 `buildRoutesAction` 获取路由配置、生成菜单配置。

```ts
// src/store/modules/permission.ts
buildRoutesAction() {
  // 获取权限模式
  const permissionMode = appStore.getProjectConfig.permissionMode;
  // 区分权限模式
  switch (permissionMode) {
    // 前端方式控制(菜单和路由分开配置)
    case PermissionModeEnum.ROLE:
      // 根据权限过滤路由
      routes = filter(asyncRoutes, routeFilter);
      routes = routes.filter(routeFilter);
      // 将多级路由转换为二级路由
      routes = flatMultiLevelRoutes(routes);
      break;

    // 前端方式控制(菜单由路由配置自动生成)
    case PermissionModeEnum.ROUTE_MAPPING:
      // 根据权限过滤路由
      routes = filter(asyncRoutes, routeFilter);
      routes = routes.filter(routeFilter);
      // 通过转换路由生成菜单
      const menuList = transformRouteToMenu(routes, true);
      // 设置保存菜单列表
      this.setFrontMenuList(menuList);
      // 将多级路由转换为二级路由
      routes = flatMultiLevelRoutes(routes);
      break;

    // 后台方式控制
    case PermissionModeEnum.BACK:
      // 获取后台返回的菜单配置 /mock/sys/menu.ts
      let routeList: AppRouteRecordRaw[] = [];
      routeList = await getMenuList();
      // 通过转换路由生成菜单
      const backMenuList = transformRouteToMenu(routeList);
      // 设置菜单列表
      this.setBackMenuList(backMenuList);
      // 设置保存菜单列表
      routeList = flatMultiLevelRoutes(routeList);
      routes = [PAGE_NOT_FOUND_ROUTE, ...routeList];
      break;
  }
}
```

### 生成菜单

根据不同的权限模式从不同的数据源获取菜单。

```ts
// src/router/menus/index.ts

// 自动加载 `modules` 目录下的菜单模块
const modules = import.meta.globEager("./modules/**/*.ts");
const staticMenus = transformMenuModule(modules); // 简化处理

async function getAsyncMenus() {
  const permissionStore = usePermissionStore();
  // 后端模式 BACK
  if (isBackMode()) {
    // 获取 this.setBackMenuList(menuList) 设置的菜单
    return permissionStore.getBackMenuList.filter((item) => !item.meta?.hideMenu && !item.hideMenu);
  }
  // 前端模式(菜单由路由配置自动生成) ROUTE_MAPPING
  if (isRouteMappingMode()) {
    // 获取 this.setFrontMenuList(menuList) 设置的菜单
    return permissionStore.getFrontMenuList.filter((item) => !item.hideMenu);
  }
  // 前端模式(菜单和路由分开配置) ROLE
  return staticMenus;
}
```

在菜单组件中获取菜单配置渲染。

```tsx
// src/layouts/default/menu/index.vue
function renderMenu() {
  const { menus, ...menuProps } = unref(getCommonProps);
  if (!menus || !menus.length) return null;
  return !props.isHorizontal ? (
    <SimpleMenu {...menuProps} isSplitMenu={unref(getSplit)} items={menus} />
  ) : (
    <BasicMenu
      {...(menuProps as any)}
      isHorizontal={props.isHorizontal}
      type={unref(getMenuType)}
      showLogo={unref(getIsShowLogo)}
      mode={unref(getComputedMenuMode as any)}
      items={menus}
    />
  );
}
```

### 路由守卫

判断是否登录以及刷新之后的初始化。

```ts
// src/router/guard/permissionGuard.ts
export function createPermissionGuard(route) {
  const userStore = useUserStoreWithOut();
  const permissionStore = usePermissionStoreWithOut();
  router.beforeEach(async (to, from, next) => {
    // 白名单
    if (whitePathList.includes(to.path)) {
      next();
      return;
    }

    // 如果 token 不存在，从定向到登录页
    const token = userStore.getToken;
    if (!token) {
      if (to.meta.ignoreAuth) {
        next();
        return;
      }

      // redirect login page
      const redirectData: { path: string; replace: boolean; query?: Recordable<string> } = {
        path: LOGIN_PATH,
        replace: true,
      };
      if (to.path) {
        redirectData.query = {
          ...redirectData.query,
          redirect: to.path,
        };
      }
      next(redirectData);
      return;
    }

    // 获取用户信息 userInfo / roleList
    if (userStore.getLastUpdateTime === 0) {
      try {
        await userStore.getUserInfoAction();
      } catch (err) {
        next();
        return;
      }
    }

    // 根据判断是否重新获取动态路由
    if (permissionStore.getIsDynamicAddedRoute) {
      next();
      return;
    }
    const routes = await permissionStore.buildRoutesAction();
    routes.forEach((route) => {
      router.addRoute(route);
    });
    router.addRoute(PAGE_NOT_FOUND_ROUTE);
    permissionStore.setDynamicAddedRoute(true);
  });
}
```

### 总结

我们知道了权限认证后通过权限过滤配置好的路由表并动态添加路由，菜单的生成根据权限模式的不同获取不同的数据源渲染菜单栏。这个流程在实际项目必会更改，所以我们应该知道更新现有的流程。
