import { resolve } from "path";
import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import recoTheme from "vuepress-theme-reco";

export default defineUserConfig({
  lang: "zh-CN",
  title: "HaiWeiLian's Blog",
  description: "HaiWeiLian's Blog",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  alias: {
    "@vicons/carbon": resolve(__dirname, "icons"),
  },
  bundler: viteBundler({}),
  theme: recoTheme({
    style: "@vuepress-reco/style-default",
    logo: "/logo.png",
    author: "haiweilian",
    authorAvatar: "/head.png",
    docsRepo: "https://github.com/haiweilian/blogs",
    docsBranch: "master",
    editLinkText: "编辑此页面",
    lastUpdatedText: "最后更新时间",
    navbar: [
      { text: "首页", icon: "Home", link: "/" },
      {
        text: "分类",
        icon: "Categories",
        children: [
          {
            text: "分类",
            children: [
              { text: "前端", link: "/categories/qianduan/1" },
              { text: "后端", link: "/categories/houduan/1" },
              { text: "源码分析", link: "/categories/yuanmafenxi/1" },
            ],
          },
        ],
      },
      { text: "标签", icon: "Tag", link: "/tags/JavaScript/1" },
      { text: "项目", icon: "Code", link: "/code" },
      { text: "归档", icon: "Calendar", link: "/timeline" },
      { text: "留言板", icon: "Chat", link: "/message" },
      { text: "关于我", icon: "User", link: "/about" },
    ],
    algolia: {
      appId: "94TMHLGIH3",
      apiKey: "75161c78510900b859429e0122e77a5b",
      indexName: "haiweilian",
      insights: true,
    },
    commentConfig: {
      type: "giscus",
      options: {
        repo: "haiweilian/blogs",
        repoId: "MDEwOlJlcG9zaXRvcnkyNDQxMTI5Nzc=",
        category: "Announcements",
        categoryId: "DIC_kwDODozeUc4Caz_p",
        mapping: "pathname",
      },
    },
  }),
});
