export const code = `// app.ts =============================================================
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
}`;
