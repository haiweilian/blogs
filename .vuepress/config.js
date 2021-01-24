module.exports = {
  title: "Lian's blog",
  description: "记录工作和学习中的总结和经验",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  // 为当前的主题提供一些配置 https://www.vuepress.cn/theme/default-theme-config.html
  themeConfig: {
    nav: [
      { text: "Home", link: "https://www.haiweilian.com/" },
      { text: "GitHub", link: "https://github.com/haiweilian" }
    ],
    sidebar: "auto",
    smoothScroll: true
  },
  // 中文路径解析错误 https://segmentfault.com/a/1190000022275001
  markdown: {
    extendMarkdown: md => {
      md.use(require("markdown-it-disable-url-encode"));
    }
  }
};
