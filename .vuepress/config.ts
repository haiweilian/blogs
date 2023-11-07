import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { series } from "./config/index";

export default defineUserConfig({
  title: "HaiWeiLian's Blog",
  description: "HaiWeiLian's Blog",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "/logo.png",
    author: "haiweilian",
    authorAvatar: "/head.png",
    docsRepo: "https://github.com/haiweilian/blogs",
    docsBranch: "master",
    lastUpdatedText: "最后更新时间",
    series,
    navbar: [
      { text: "首页", icon: "Home", link: "/" },
      {
        text: "分类",
        icon: "Categories",
        children: [
          {
            text: "分类",
            children: [
              { text: "前端", link: "/categories/qianduan/1/" },
              { text: "算法", link: "/categories/suanfa/1/" },
            ],
          },
          {
            text: "系列",
            children: [
              { text: "实践 Vue3 组件库", link: "/blogs/vue/lib/vlib-starter-1" },
              { text: "设计模式与开发实践总结", link: "/blogs/javascript/design-pattern/" },
            ],
          },
        ],
      },
      { text: "标签", icon: "Tag", link: "/tags/JavaScript/1/" },
      { text: "项目", icon: "Code", link: "/code" },
      { text: "归档", icon: "Calendar", link: "/timeline" },
      { text: "关于我", icon: "User", link: "/about" },
    ],
    // commentConfig: {
    //   type: 'valie',
    //   // options 与 1.x 的 valineConfig 配置一致
    //   options: {
    //     // appId: 'xxx',
    //     // appKey: 'xxx',
    //     // placeholder: '填写邮箱可以收到回复提醒哦！',
    //     // verify: true, // 验证码服务
    //     // notify: true,
    //     // recordIP: true,
    //     // hideComments: true // 隐藏评论
    //   },
    // },
  }),
});
