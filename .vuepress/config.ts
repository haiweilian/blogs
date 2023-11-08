import { resolve } from "path";
import { defineUserConfig } from "vuepress";
import recoTheme from "vuepress-theme-reco";
import { series } from "./config/index";

export default defineUserConfig({
  title: "HaiWeiLian's Blog",
  description: "HaiWeiLian's Blog",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  alias: {
    "@vicons/carbon": resolve(__dirname, "icons"),
  },
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
              { text: "源码分析", link: "/categories/yuanmafenxi/1/" },
            ],
          },
          {
            text: "系列",
            children: [
              { text: "实践 Vue3 组件库系列", link: "/blogs/vue/lib/guide" },
              { text: "分析 Node 小型库源码系列", link: "/blogs/node/tinylib-analysis/guide" },
              { text: "设计模式与开发实践系列", link: "/blogs/javascript/design-pattern/guide" },
            ],
          },
        ],
      },
      { text: "标签", icon: "Tag", link: "/tags/JavaScript/1/" },
      { text: "项目", icon: "Code", link: "/code" },
      { text: "归档", icon: "Calendar", link: "/timeline" },
      { text: "关于我", icon: "User", link: "/about" },
    ],
  }),
});
