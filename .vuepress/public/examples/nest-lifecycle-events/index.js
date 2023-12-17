import { code } from "./code.js";
const html = Prism.highlight(code, Prism.languages.javascript, "javascript");

const knowcess = new Knowcess({
  root: "#demo",
  code: `<pre class="language-javascript"><code>${html}</code></pre>`,
  direction: "horizontal",
  linePosition: 12,
});
const logStack = knowcess.createStack("Log");

knowcess
  .step(() => {
    knowcess.showLine().moveLine(6).showCommentary("Nest 程序执行解析模块依赖。");
  })
  .step(() => {
    knowcess.moveLine(7).updateCommentary("模块依赖解析完成。");
    logStack.push("Init completed");
  })
  .step(() => {
    knowcess
      .moveLine(42)
      .updateCommentary("所有模块依赖解析完成后调用，遍历所有的 onModuleInit 钩子并等待执行完成。");
    logStack.push("onModuleInit");
  })
  .step(() => {
    knowcess
      .moveLine(46)
      .updateCommentary(
        "所有模块初始化完成后调用，遍历所有的 onApplicationBootstrap 钩子并等待执行完成。"
      );
    logStack.push("onApplicationBootstrap");
  })
  .step(() => {
    knowcess.moveLine(12).updateCommentary("开始监听服务。");
    logStack.push("Listener start");
  })
  .step(() => {
    knowcess.moveLine(16).updateCommentary("当显式调用(app.close())或接收到终止信号。");
    logStack.push({ text: "Close", style: { background: "red", textAlign: "center" } });
  })
  .step(() => {
    knowcess
      .moveLine(50)
      .updateCommentary("收到终止信号后调用，遍历所有的 onModuleDestroy 钩子并等待执行完成。");
    logStack.push("onModuleDestroy");
  })
  .step(() => {
    knowcess
      .moveLine(54)
      .updateCommentary(
        "在所有 onModuleDestroy 执行完成后调用，遍历所有的 beforeApplicationShutdown 钩子并等待执行完成。"
      );
    logStack.push("beforeApplicationShutdown");
  })
  .step(() => {
    knowcess
      .moveLine(58)
      .updateCommentary("服务关闭后调用，遍历所有的 onApplicationShutdown 钩子并等待执行完成。");
    logStack.push("onApplicationShutdown");
  });
