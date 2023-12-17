export const code = `// main.ts =============================================================
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
import { BadRequestException, Controller, Get, InternalServerErrorException, Query, UseFilters, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
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
    @Query("name", new RouteParamPipe(2)) name // 在调用 @Query() 之后从全局运行
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
import { ExceptionFilter, Catch, BadRequestException, InternalServerErrorException } from '@nestjs/common';

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
}`;
