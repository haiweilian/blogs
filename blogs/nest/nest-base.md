---
title: 一文回顾 Nest.js 核心基础知识
date: 2023-12-14
tags:
  - Nest
categories:
  - 后端
---

本文是在学习 Nest.js 记录的总结，用一个简单的例子说明一个知识点。

## 装饰器一览

会常用得到的装饰器，大致分类以下几类。

### 模块类

- @Module：声明为模块
- @Global：声明全局模块

### 注入类

- @Injectable：声明可以由 Nest IoC 容器管理的 provider
- @Inject：通过 token 手动指定注入的 provider
- @Optional：声明注入的 provider 是可选的

### 请求类

- @Controller：声明为控制器
- @Get、@Post、@Put、@Delete、@Patch、@Options、@Head：声明请求方式
- @Body：取出请求 body 对象
- @Param：取出 url 中的参数，比如 /user/:id 中的 id
- @Query: 取出 query 中的参数，比如 /user?id=xx 中的 id
- @Req、@Request：注入 request 对象
- @Res、@Response：注入 response 对象，一旦注入 Nest 就不会把返回值作为响应了，除非指定 passthrough 为 true
- @Next：注入调用下一个 handler 的 next 方法
- @Headers：取出某个或全部请求头
- @Session：取出 session 对象，需要启用 express-session 中间件
- @Ip: 取出 ip 地址
- @HostParm：取出 host 里的参数

### 响应类

- @Header：修改响应头
- @HttpCode：修改响应的状态码
- @Redirect：指定重定向的地址
- @Render：指定渲染用的模版

### 功能类

- @Catch：声明 exception filter 处理的 exception 类型
- @UseFilters：声明控制器范围、方法范围使用 exception filter
- @UsePipes：声明控制器范围、方法范围使用 pipe
- @UseGuards：声明控制器范围、方法范围使用 guard
- @UseInterceptors：声明控制器范围、方法范围使用 interceptor
- @SetMetadata：在类或者方法上添加 metadata

## 生命周期事件

Nest.js 提供了生命周期钩子，便于在特定的时间做一些事情。我制作了一个 [在线交互流程演示](/examples/nest-lifecycle-events/index.html) 点击查看。

以下图片来源于官网示例。

![lifecycle-events](./image/nest-base/lifecycle-events.png)

### 流程

1. Nest 程序执行解析模块依赖。
2. onModuleInit：所有模块依赖解析完成后调用，遍历所有的 onModuleInit 钩子并等待执行完成。
3. onApplicationBootstrap：所有模块初始化完成后调用，遍历所有的 onApplicationBootstrap 钩子并等待执行完成。
4. 开始监听服务。
5. **接收到终止信号。**
6. onModuleDestroy：收到终止信号后调用，遍历所有的 onModuleDestroy 钩子并等待执行完成。
7. beforeApplicationShutdown：在所有 onModuleDestroy 执行完成后调用，遍历所有的 beforeApplicationShutdown 钩子并等待执行完成。
8. 停止监听服务。
9. onApplicationShutdown：服务关闭后调用，遍历所有的 onApplicationShutdown 钩子并等待执行完成。

### 演示

**完整演示代码** 我制作了一个 [在线交互流程演示](/examples/nest-lifecycle-events/index.html) 点击查看。

```ts
// app.ts =============================================================
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log("Init completed");

  app.enableShutdownHooks(); // 必须启用才能监听到信号

  await app.listen(3000, () => {
    console.log("Listener start");
  });

  setTimeout(() => {
    app.close();
    // process.kill(process.pid);
  }, 5000);
}
bootstrap();

// app.module.ts =============================================================
import {
  BeforeApplicationShutdown,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

@Module({})
export class AppModule
  implements
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy,
    BeforeApplicationShutdown,
    OnApplicationShutdown
{
  onModuleInit() {
    console.log("onModuleInit");
  }

  onApplicationBootstrap() {
    console.log("onApplicationBootstrap");
  }

  onModuleDestroy() {
    console.log("onModuleDestroy");
  }

  beforeApplicationShutdown(signal?: string) {
    console.log("beforeApplicationShutdown", signal);
  }

  onApplicationShutdown(signal?: string) {
    console.log("onApplicationShutdown", signal);
  }
}
```

## 请求生命周期

理解 Nest.js 请求生命周期非常有用，可以让你对 Nest.js 整体功能和调试程序都有很好的帮助。我制作了一个 [在线交互流程演示](/examples/nest-request-lifecycle/index.html) 点击查看。

### 流程

1. 请求进入
2. 中间件
   - 2.1. 全局绑定中间件
   - 2.2. 模块绑定中间件
3. 守卫
   - 3.1 全局守卫
   - 3.2 控制器守卫
   - 3.3 路由守卫
4. 拦截器（控制器前）（调用 next.handle()前）
   - 4.1 全局拦截器
   - 4.2 控制器拦截器
   - 4.3 路由拦截器
5. 管道
   - 5.1 全局管道
   - 5.2 控制器管道
   - 5.3 路由管道
   - 5.4 路由参数管道(多个路由参数，参数管道从右到左执行)
6. 控制器（方法处理程序）
7. 拦截器（控制器后）（调用 next.handle()后）
   - 7.1 路由拦截器
   - 7.2 控制器拦截器
   - 7.3 全局拦截器
8. 异常过滤器(一旦遇到未捕获的异常，生命周期的其余部分将被忽略，请求会直接跳转到过滤器)
   - 8.1 路由过滤器
   - 8.2 控制器过滤器
   - 8.3 全局过滤器
9. 服务器响应

### 演示

**完整演示代码** 我制作了一个 [在线交互流程演示](/examples/nest-request-lifecycle/index.html) 点击查看。

```ts
// main.ts =============================================================
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalMiddleware } from "./app.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(GlobalMiddleware);
  await app.listen(3000);
}
bootstrap();

// app.module.ts =============================================================
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { Modulemiddleware } from "./app.middleware";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { GlobalGuard } from "./app.guard";
import { GlobalInterceptor } from "./app.interceptor";
import { GlobalPipe } from "./app.pipe";
import { GlobalFilter } from "./app.filter";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GlobalGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: GlobalPipe,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Modulemiddleware).forRoutes("*");
  }
}

// app.controller.ts =============================================================
import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { AppService } from "./app.service";
import { ControllerGuard, RouteGuard } from "./app.guard";
import { ControllerInterceptor, RouteInterceptor } from "./app.interceptor";
import { ControllerPipe, RouteParamPipe, RoutePipe } from "./app.pipe";
import { ControllerFilter, RouteFilter } from "./app.filter";

@Controller()
@UseGuards(ControllerGuard)
@UseInterceptors(ControllerInterceptor)
@UsePipes(ControllerPipe)
@UseFilters(ControllerFilter)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(RouteGuard)
  @UseInterceptors(RouteInterceptor)
  @UsePipes(RoutePipe)
  @UseFilters(RouteFilter)
  getHello(
    @Query("id", new RouteParamPipe(1)) id,
    @Query("name", new RouteParamPipe(2)) name
  ): string {
    console.log("AppController.getHello: 调用控制器");

    const random = Math.random();
    if (random < 0.2) {
      throw new BadRequestException("请求异常");
    } else if (random < 0.4) {
      throw new InternalServerErrorException("内部服务器错误");
    } else if (random < 0.6) {
      throw new Error("未知异常");
    }

    return this.appService.getHello();
  }
}

// app.middleware.ts =============================================================
import { NestMiddleware } from "@nestjs/common";

export const GlobalMiddleware = (req, res, next) => {
  console.log("GlobalMiddleware: 全局绑定中间件");
  next();
};

export class Modulemiddleware implements NestMiddleware {
  use(req, res, next) {
    console.log("Modulemiddleware: 模块绑定中间件");
    next();
  }
}

// app.guard.ts =============================================================
import { CanActivate } from "@nestjs/common";

export class GlobalGuard implements CanActivate {
  canActivate() {
    console.log("GlobalGuard: 全局守卫");
    return true;
  }
}

export class ControllerGuard implements CanActivate {
  canActivate() {
    console.log("ControllerGuard: 控制器守卫");
    return true;
  }
}

export class RouteGuard implements CanActivate {
  canActivate() {
    console.log("RouteGuard: 路由守卫");
    return true;
  }
}

// app.interceptor.ts =============================================================
import { NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";

export class GlobalInterceptor implements NestInterceptor {
  intercept(context, next) {
    console.log("GlobalInterceptor: 全局拦截器-控制器前");
    return next.handle().pipe(
      tap(() => {
        console.log("GlobalInterceptor: 全局拦截器-控制器后");
      })
    );
  }
}

export class ControllerInterceptor implements NestInterceptor {
  intercept(context, next) {
    console.log("ControllerInterceptor: 控制器拦截器-控制器前");
    return next.handle().pipe(
      tap(() => {
        console.log("ControllerInterceptor: 控制器拦截器-控制器后");
      })
    );
  }
}

export class RouteInterceptor implements NestInterceptor {
  intercept(context, next) {
    console.log("RouteInterceptor: 路由拦截器-控制器前");
    return next.handle().pipe(
      tap(() => {
        console.log("RouteInterceptor: 路由拦截器-控制器后");
      })
    );
  }
}

// app.pipe.ts =============================================================
import { PipeTransform } from "@nestjs/common";

export class GlobalPipe implements PipeTransform {
  transform(value) {
    console.log("GlobalPipe: 全局管道");
    return value;
  }
}

export class ControllerPipe implements PipeTransform {
  transform(value) {
    console.log("ControllerPipe: 控制器管道");
    return value;
  }
}

export class RoutePipe implements PipeTransform {
  transform(value) {
    console.log("RoutePipe: 路由管道");
    return value;
  }
}

export class RouteParamPipe implements PipeTransform {
  constructor(private type) {}
  transform(value) {
    console.log("RouteParamPipe: 路由参数管道" + this.type);
    return value;
  }
}

// app.filter.ts =============================================================
import {
  ExceptionFilter,
  Catch,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";

@Catch()
export class GlobalFilter implements ExceptionFilter {
  catch(exception, host) {
    console.log("GlobalFilter: 全局异常过滤器", exception);
    host.switchToHttp().getResponse().json(exception.message);
  }
}

@Catch(InternalServerErrorException)
export class ControllerFilter implements ExceptionFilter {
  catch(exception, host) {
    console.log("ControllerFilter: 控制器异常过滤器", exception);
    host.switchToHttp().getResponse().json(exception.message);
  }
}

@Catch(BadRequestException)
export class RouteFilter implements ExceptionFilter {
  catch(exception, host) {
    console.log("RouteFilter: 路由异常过滤器", exception);
    host.switchToHttp().getResponse().json(exception.message);
  }
}
```

## 基础概念

使用 Nest.js 最基本的三个知识(模块、控制器、提供者)，好像没啥写的必要可以跳过。

### 模块

模块用来组织应用程序结构，一个 Nest.js 应用程序有一个根模块作为入口，根模块再引入子模块从而组织项目结构。使用 `@Module()` 装饰器声明一个模块。

```ts
import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [UserModule], // 导入其他模块
  controllers: [AppController], // 注入控制器
  providers: [AppService], // 注入提供者
  exports: [AppService], // 必须导出才能在其他模块中使用
})
export class AppModule {}
```

### 控制器

控制器用来定义和处理请求路由，使用 `@Controller()` 装饰器声明一个控制器。

```ts
import { Controller, Get } from "@nestjs/common";

@Controller("user")
export class UserController {
  @Get("/list")
  list(): string {
    return [
      /** user list */
    ];
  }
}
```

定义完控制器后，需要在模块的 `controllers` 配置中引入。

```ts
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";

@Module({
  controllers: [UserController],
})
export class UserModule {}
```

### 服务/提供者

提供者是一个基本概念，它可以被视为任意的东西。提供者的主要思想就是它可以作为依赖注入项注入到需要使用的地方。(关于依赖注入和控制反转不在本文范围内)。使用 `@Injectable()` 装饰器声明一个标准提供者，这里被视为服务。

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  list(): string {
    return [
      /** user list */
    ];
  }
}
```

定义完服务提供者后，需要在模块的 `providers` 配置中注入。

```ts
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";

@Module({
  providers: [UserService],
})
export class UserModule {}
```

然后可以基于构造函数注入或基于属性注入服务提供者来使用。

```ts
import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  // 基于构造函数注入
  constructor(private userService: UserService) {}

  // 基于属性注入
  @Inject()
  private userService2: UserService;

  @Get("/list")
  list(): string {
    return this.userService.list();
  }

  @Get("/list2")
  list2(): string {
    return this.userService2.list();
  }
}
```

## 中间件

中间件首先执行，中间件可以访问到请求和响应对象。它取决于底层框架(Express 和 Fastify)使用的中间件，

### 实现

类中间件应实现 `NestMiddleware` 接口，支持依赖注入。

```ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    console.log("Middleware Class", req.url);
    next();
    console.log("Middleware Class", Date.now() - now);
  }
}
```

函数中间件，不能依赖注入。与底层框架中间件一致，所以也可以直接复用现有的中间件。

```ts
import { Request, Response, NextFunction } from "express";

export const LoggerFnMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  console.log("Middleware Fn", req.url);
  next();
  console.log("Middleware Fn", Date.now() - now);
};
```

### 绑定

模块绑定，可以指定应用和排除的路由，支持依赖注入。

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, LoggerFnMiddleware).forRoutes("*").exclude("cats/(.*)");
  }
}
```

全局绑定中间件，使用 `app.use()` 绑定，不支持依赖注入。

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(LoggerFnMiddleware);
  app.use(new LoggerMiddleware().use);

  await app.listen(3000);
}
bootstrap();
```

## 守卫

守卫在所有中间件之后执行，但在拦截器或管道之前执行。因为它相对于中间件可以获取到执行上下文，所以适合做权限验证类的功能，如果验证失败后续的逻辑均不会执行。

### 实现

守卫应实现 `CanActivate` 接口，比如实现一个角色验证的功能，只有指定的角色才可以访问。

```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const roles = Reflect.getMetadata("roles", context.getHandler());
    if (!roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const role = req.header("role");
    if (roles.includes(role)) {
      return true;
    } else {
      throw new ForbiddenException("认证失败");
    }
  }
}
```

上面的守卫从处理方法上获取名为 `role` 的元数据，可以自定义一个装饰器实现它。

```ts
import { SetMetadata } from "@nestjs/common";
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

### 绑定

方法范围和控制器范围使用 `@UseGuards()` 绑定。

```ts
@Controller("guards")
@UseGuards(RolesGuard)
export class GuardsController {
  @Get()
  @Roles("admin")
  @UseGuards(RolesGuard)
  get() {
    return "ok";
  }
}
```

全局范围守卫使用 `APP_GUARD` 令牌注入，支持依赖注入。

```ts
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

全局范围守卫使用 `app.useGlobalGuards` 方法，不支持依赖注入。

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(new RolesGuard());

  await app.listen(3000);
}
bootstrap();
```

## 拦截器

拦截器在守卫之后执行，它可以控制路由处理程序方法的执行并能接收到响应流。所以适合做转换数据、缓存等。

### 实现

拦截器应实现 `NestInterceptor` 接口，比如实现调用日志和转换响应结构。

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map, tap } from "rxjs";

@Injectable()
export class ResInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    console.log("Interceptor Before...");

    return next.handle().pipe(
      tap(() => {
        console.log(`Interceptor After... ${Date.now() - now}ms`);
      }),
      map((data) => {
        return { data };
      })
    );
  }
}
```

### 绑定

方法范围和控制器范围使用 `@UseInterceptors()` 绑定。

```ts
@Controller("interceptors")
@UseInterceptors(ResInterceptor)
export class InterceptorsController {
  @Get()
  @UseInterceptors(ResInterceptor)
  get() {
    return "ok";
  }
}
```

全局范围守卫使用 `APP_INTERCEPTOR` 令牌注入，支持依赖注入。

```ts
@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResInterceptor,
    },
  ],
})
export class AppModule {}
```

全局范围守卫使用 `app.useGlobalInterceptors` 方法，不支持依赖注入。

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResInterceptor());

  await app.listen(3000);
}
bootstrap();
```

## 管道

管道在调用路由处理程序之前执行。管道会先拦截方法的调用参数，进行转换或是验证处理，然后用转换好或是验证好的参数调用原方法。所以适合做数据转换、数据验证等。

### 实现

管道应实现 `PipeTransform` 接口，列如将参数字符串转换为数字。

```ts
import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";

export class MyParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const val = Number(value);
    if (Number.isNaN(value)) {
      throw new BadRequestException("Validation failed");
    }
    return val;
  }
}
```

管道应实现 `PipeTransform` 接口，列如使用 `class-validator` 做基于结构的参数验证。

```ts
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidatePipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }

  // 判断参数的元类型是否做验证
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

### 绑定

参数范围使用传入参数装饰器绑定。

```ts
@Controller("pipe")
export class PipeController {
  constructor(private readonly pipeService: PipeService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.pipeService.findOne(id);
  }
}
```

方法范围和控制器范围使用 `@UsePipes()` 绑定。

```ts
@Controller("pipe")
@UsePipes(ValidatePipe)
export class PipeController {
  constructor(private readonly pipeService: PipeService) {}

  @Post()
  @UsePipes(ValidatePipe)
  create(@Body() createPipeDto: CreatePipeDto) {
    return this.pipeService.create(createPipeDto);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.pipeService.findOne(id);
  }
}
```

全局范围守卫使用 `APP_PIPE` 令牌注入，支持依赖注入。

```ts
@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidatePipe,
    },
  ],
})
export class AppModule {}
```

全局范围守卫使用 `app.useGlobalPipes` 方法，不支持依赖注入。

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidatePipe());

  await app.listen(3000);
}
bootstrap();
```

## 异常过滤器

在应用程序中抛出异常时，都会直接执行异常过滤器。Nest.js 内置了异常处理，当抛出未处理的异常时默认会返回一个响应。但往往我们需要自定义异常过滤器，列如记录日志，修改响应结构等。

### 实现

异常过滤器实现 `ExceptionFilter` 接口，列如修改响应结构。

```ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch() // @Catch(HttpException) 可以匹配异常类型
export class HttpFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const code = exception instanceof HttpException ? exception.getStatus() : 500;
    res.json({
      code,
      message: exception.message,
    });
  }
}
```

### 绑定

方法范围和控制器范围使用 `@UseFilters()` 绑定。

```ts
@Controller("exception")
@UseFilters(HttpFilter)
export class ExceptionController {
  @Get()
  @UseFilters(HttpFilter)
  get() {
    throw new ForbiddenException();
  }
}
```

全局范围守卫使用 `APP_FILTER` 令牌注入，支持依赖注入。

```ts
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpFilter,
    },
  ],
})
export class AppModule {}
```

全局范围守卫使用 `app.useGlobalFilters` 方法，不支持依赖注入。

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpFilter());

  await app.listen(3000);
}
bootstrap();
```

## 自定义提供者

Nest.js 实现了多种注入方式，便于应对不同的场景。

### 类提供者

标准提供者/类提供者直接提供一个类。由 Nest.js 内部实例化。

```ts
import { Module } from "@nestjs/common";
@Module({
  providers: [
    // 标准提供者，
    CustomProvidersService,
    // 上面实际是以下方式的简写
    {
      provide: CustomProvidersService,
      useClass: CustomProvidersService,
    },
  ],
})
export class CustomProvidersModule {}
```

非基于类的提供者令牌，提供者令牌并非只能是类，还可以是 String 或 Symbol 类型。

```ts
import { Module } from "@nestjs/common";
@Module({
  providers: [
    {
      provide: "CustomProvidersService",
      useClass: CustomProvidersService,
    },
  ],
})
export class CustomProvidersModule {}
```

它们的分别可以这样注入。

```ts
@Controller("custom-providers")
export class CustomProvidersController {
  constructor(
    private customProvidersService1: CustomProvidersService,

    @Inject("customProvidersService")
    private customProvidersService2: CustomProvidersService
  ) {}

  private customProvidersService3: CustomProvidersService;

  @Inject("customProvidersService")
  private customProvidersService4: CustomProvidersService;
}
```

### 值提供者

值提供者可以注入任意的值类型。当你需要测试目的替换实例对象或者注入配置时很方便。

```ts
class ConfigValue {}

@Module({
  providers: [
    ConfigValue,
    // 这将替换替换 ConfigValue 的实例
    {
      provide: ConfigValue,
      useValue: { name: "lian" },
    },
  ],
})
export class CustomProvidersModule {}
```

### 工厂提供者

工厂提供者可以动态的提供值，具有很高的灵活性。最主要的是它支持异步，这在读取远程配置和连接服务是很方便。

```ts
class ConfigFactory {}

@Module({
  providers: [
    {
      provide: ConfigFactory,
      async useFactory(config: ConfigValue) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              name: config.name,
              address: "China",
            });
          });
        });
      },
      inject: [ConfigValue], // 可以注入别的依赖项
    },
  ],
})
export class CustomProvidersModule {}
```

### 别名提供者

别名提供者可以为现有的提供者创建别名，与原始的提供者引用统一实例。当你需要提供多种注入方式时很方便。

```ts
class ConfigExisting {}

@Module({
  providers: [
    ConfigExisting
    // 现在你可以基于 ConfigExisting 或者 "ConfigExisting" 注入
    {
      provide: "ConfigExisting",
      useExisting: ConfigExisting,
    },
  ],
})
export class CustomProvidersModule {}
```

## 项目推荐

我开源了一个 [基于 Nest.js & React.js 的后台权限管理系统](https://github.com/haiweilian/vivy-nest-admin)，此项目实践 Nest.js 开发。
