import { code } from "./code.js";
const html = Prism.highlight(code, Prism.languages.javascript, "javascript");

const knowcess = new Knowcess({
  root: "#demo",
  code: `<pre class="language-javascript"><code>${html}</code></pre>`,
  direction: "horizontal",
  linePosition: 12,
});
const logStack = knowcess.createStack("Log");

const middlewareStyle = { background: "#fe3d56" };
const guardStyle = { background: "#8244d3" };
const interceptorStyle = { background: "#1da065" };
const pipeStyle = { background: "#697777" };
const filterStyle = { background: "#5dc9c3" };

let signCache;

knowcess
  // ========================== 开始 ==========================
  .step(() => {
    knowcess.showCommentary(
      "温馨提示：所有的中间件、守卫、拦截器、管道、异常过滤器都在程序解析期间绑定，演示过程中代码会定位到绑定的位置然后再定位到执行位置。"
    );
  })
  .step(() => {
    knowcess.updateCommentary("1、当收到请求后，如：Get / http://localhost:3000/");
  })
  .step(() => {
    knowcess.hideCommentary();
  })
  // ========================== 中间件 ==========================
  .step(() => {
    knowcess.showCommentary("2、中间件从全局->模块的绑定顺序执行");
  })
  .step(() => {
    knowcess.hideCommentary().showLine().moveLine(8);
  })
  .step(() => {
    knowcess.moveLine(97);
    logStack.push({ text: "GlobalMiddleware: 全局绑定中间件", style: middlewareStyle });
  })
  .step(() => {
    knowcess.moveLine(49);
  })
  .step(() => {
    knowcess.moveLine(103);
    logStack.push({ text: "Modulemiddleware: 模块绑定中间件", style: middlewareStyle });
  })
  // ========================== 守卫 ==========================
  .step(() => {
    knowcess.hideLine().showCommentary("3、守卫从全局->控制器->路由的绑定顺序执行");
  })
  .step(() => {
    knowcess.hideCommentary().showLine().moveLine(31);
  })
  .step(() => {
    knowcess.moveLine(113);
    logStack.push({ text: "GlobalGuard: 全局守卫", style: guardStyle });
  })
  .step(() => {
    knowcess.moveLine(62);
  })
  .step(() => {
    knowcess.moveLine(120);
    logStack.push({ text: "ControllerGuard: 控制器守卫", style: guardStyle });
  })
  .step(() => {
    knowcess.moveLine(70);
  })
  .step(() => {
    knowcess.moveLine(127);
    logStack.push({ text: "RouteGuard: 路由守卫", style: guardStyle });
  })
  // ========================== 拦截器（控制器前） ==========================
  .step(() => {
    knowcess
      .hideLine()
      .showCommentary(
        "4、拦截器从全局->控制器->路由的绑定顺序执行。由于拦截器控制着方法处理程序的执行，所以分为执行前和执行后"
      );
  })
  .step(() => {
    knowcess.updateCommentary("拦截器（控制器前）（调用 next.handle()前）");
  })
  .step(() => {
    knowcess.hideCommentary().showLine().moveLine(35);
  })
  .step(() => {
    knowcess.moveLine(138);
    logStack.push({ text: "GlobalInterceptor: 全局拦截器-控制器前", style: interceptorStyle });
  })
  .step(() => {
    knowcess.moveLine(63);
  })
  .step(() => {
    knowcess.moveLine(138);
    logStack.push({
      text: "ControllerInterceptor: 控制器拦截器-控制器前",
      style: interceptorStyle,
    });
  })
  .step(() => {
    knowcess.moveLine(71);
  })
  .step(() => {
    knowcess.moveLine(160);
    logStack.push({ text: "RouteInterceptor: 路由拦截器-控制器前", style: interceptorStyle });
  })
  // ========================== 管道 ==========================
  .step(() => {
    knowcess
      .hideLine()
      .showCommentary(
        "5、管道从全局->控制器->路由的绑定顺序执行。但在路由参数级别如果存在多个路由参数，参数管道从右到左执行"
      );
  })
  .step(() => {
    knowcess.hideCommentary().showLine().moveLine(39);
  })
  .step(() => {
    knowcess.moveLine(174);
    logStack.push({ text: "GlobalPipe: 全局管道", style: pipeStyle });
  })
  .step(() => {
    knowcess.moveLine(64);
  })
  .step(() => {
    knowcess.moveLine(181);
    logStack.push({
      text: "ControllerPipe: 控制器管道",
      style: pipeStyle,
    });
  })
  .step(() => {
    knowcess.moveLine(72);
  })
  .step(() => {
    knowcess.moveLine(188);
    logStack.push({
      text: "RoutePipe: 路由管道",
      style: pipeStyle,
    });
  })
  .step(() => {
    knowcess.hideLine().showCommentary("注意我们有多个路由参数，参数管道从右到左执行");
  })
  .step(() => {
    knowcess.hideCommentary().showLine().moveLine(76);
  })
  .step(() => {
    knowcess.moveLine(196);
    logStack.push({
      text: "RouteParamPipe: 路由参数管道2",
      style: pipeStyle,
    });
  })
  .step(() => {
    knowcess.moveLine(75);
  })
  .step(() => {
    knowcess.moveLine(196);
    logStack.push({
      text: "RouteParamPipe: 路由参数管道1",
      style: pipeStyle,
    });
  })
  // ========================== 控制器（方法处理程序） ==========================
  .step(() => {
    knowcess.hideLine().showCommentary("6、经过管道处理后，会调用方法处理程序并把参数传入过去。");
  })
  .step(() => {
    knowcess.hideCommentary().showLine().moveLine(74);
  })
  .step(() => {
    knowcess.moveLine(78);
    logStack.push({
      text: "AppController.getHello: 调用控制器",
    });
  })
  .step(() => {
    knowcess.hideLine().showCommentary("在业务处理过程中，我们的程序可能会成功或失败");
  })
  .step(() => {
    knowcess.hideCommentary();
    knowcess.action(() => {
      if (!signCache) {
        const sign = window.prompt(
          `
      输入控制器中的操作：
        输入 0 无错误执行成功
        输入 1 抛出 BadRequestException 错误
        输入 2 抛出 InternalServerErrorException 错误
        输入 3 抛出 Error 错误
      `,
          signCache
        );
        signCache = sign;
      }
      if (signCache === "1") {
        knowcess.skip(7);
      } else if (signCache === "2") {
        knowcess.skip(12);
      } else if (signCache === "3") {
        knowcess.skip(17);
      } else {
        knowcess.skip(1);
      }
    });
  })
  // ========================== IF 成功分支-拦截器（控制器后） ==========================
  .step(() => {
    knowcess.action(() => {
      console.log("Ok 直接跳到这里");
    });
  })
  .step(() => {
    knowcess.showLine().moveLine(89);
  })
  .step(() => {
    knowcess.showCommentary("7、由于我们的应用程序无错误，所以拦截器成功接收到响应");
  })
  .step(() => {
    knowcess.hideCommentary().moveLine(141);
    logStack.push({
      text: "GlobalInterceptor: 全局拦截器-控制器后",
      style: interceptorStyle,
    });
  })
  .step(() => {
    knowcess.moveLine(152);
    logStack.push({
      text: "ControllerInterceptor: 控制器拦截器-控制器后",
      style: interceptorStyle,
    });
  })
  .step(() => {
    knowcess.moveLine(163);
    logStack.push({
      text: "RouteInterceptor: 路由拦截器-控制器后",
      style: interceptorStyle,
    });
    knowcess.action(() => {
      knowcess.skip(16);
    });
  })
  // ========================== IF 失败分支-BadRequestException ==========================
  .step(() => {
    knowcess.action(() => {
      console.log("BadRequestException 直接跳到这里");
    });
  })
  .step(() => {
    knowcess.showLine().moveLine(82);
  })
  .step(() => {
    knowcess.showCommentary(
      "8、异常过滤器从路由->控制器->全局的绑定顺序执行，如果一个异常过滤器匹配了错误类型，那么后续的将不会再执行。由于我们的应用程序抛出 BadRequestException 错误，将匹配 RouteFilter 过滤器"
    );
  })
  .step(() => {
    knowcess.hideCommentary().moveLine(220);
  })
  .step(() => {
    knowcess.moveLine(223);
    logStack.push({
      text: "RouteFilter: 路由异常过滤器",
      style: filterStyle,
    });
    knowcess.action(() => {
      knowcess.skip(11);
    });
  })
  // ========================== IF 失败分支-InternalServerErrorException ==========================
  .step(() => {
    knowcess.action(() => {
      console.log("InternalServerErrorException 直接跳到这里");
    });
  })
  .step(() => {
    knowcess.showLine().moveLine(84);
  })
  .step(() => {
    knowcess.showCommentary(
      "8、异常过滤器从路由->控制器->全局的绑定顺序执行，如果一个异常过滤器匹配了错误类型，那么后续的将不会再执行。由于我们的应用程序抛出 InternalServerErrorException 错误，将匹配 ControllerFilter 过滤器"
    );
  })
  .step(() => {
    knowcess.hideCommentary().moveLine(212);
  })
  .step(() => {
    knowcess.moveLine(215);
    logStack.push({
      text: "ControllerFilter: 控制器异常过滤器",
      style: filterStyle,
    });
    knowcess.action(() => {
      knowcess.skip(6);
    });
  })
  // ========================== IF 失败分支-Error ==========================
  .step(() => {
    knowcess.action(() => {
      console.log("Error 直接跳到这里");
    });
  })
  .step(() => {
    knowcess.showLine().moveLine(86);
  })
  .step(() => {
    knowcess.showCommentary(
      "8、异常过滤器从路由->控制器->全局的绑定顺序执行，如果一个异常过滤器匹配了错误类型，那么后续的将不会再执行。由于我们的应用程序抛出 Error 错误，将匹配 GlobalFilter 过滤器"
    );
  })
  .step(() => {
    knowcess.hideCommentary().moveLine(204);
  })
  .step(() => {
    knowcess.moveLine(207);
    logStack.push({
      text: "GlobalFilter: 全局异常过滤器",
      style: filterStyle,
    });
    knowcess.action(() => {
      knowcess.skip(1);
    });
  })
  // ========================== 结束 ==========================
  .step(() => {
    knowcess.action(() => {
      console.log("结束直接跳到这里");
    });
  })
  .step(() => {
    knowcess.hideLine().showCommentary("9、服务器响应");
  })
  .step(() => {
    knowcess.hideCommentary("9、服务器响应");
    knowcess.action(() => {
      alert("演示结束");
    });
  });
