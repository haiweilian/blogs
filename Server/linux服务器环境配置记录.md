---
title: linux服务器环境配置记录
date: 2020-06-25
updated: 2020-06-25
categories: Server
---

## 网络问题

### github资源无法访问

- 有些配置资源需要访问 github 的 raw 资源，但是访问不到。[解决方法是更改hosts文件](https://blog.csdn.net/qq_38232598/article/details/91346392)

## 服务器知识

### linux目录结构解释

- [linux.目录结构概况](../Data/linux.目录结构概况.png)

### 内置安装工具

- 一般使用 yum 安装软件非常简单，但上面的版本都比较老，如果一些不是太要求版本的还是用 yum 安装，反之就得走源码安装。

- [linux中yum和wget的区别和作用](https://blog.csdn.net/shenhaiyushitiaoyu/article/details/90341059)

## 开发环境配置

### nodejs

- 推荐使用[nvm](https://github.com/nvm-sh/nvm)下载和管理node版。按照文档写的找到用 `wget` 安装的那行命令。安装完成后重启终端。

### git

- `yum -y install git`

### nginx

- `yum -y install nginx`

- [nginx使用和部署](https://github.com/haiweilian/blog/blob/master/Server/nginx使用和部署.md)

### redis

- [Linux下安装及配置Redis后台启动和外网访问](https://blog.csdn.net/qq_38795029/article/details/80768664)

- [Redis报错struct xx redisServer](https://blog.csdn.net/realize_dream/article/details/106483499)

- [可视化管理工具AnotherRedisDesktopManager](https://gitee.com/qishibo/AnotherRedisDesktopManager)

### mongodb

- [下载地址](https://www.mongodb.com/try/download/community)

- [Linux安装mongodb总结](https://www.cnblogs.com/lemon-flm/p/11052449.html)

- [配置公网mongodb让其在外网能访问](https://www.jianshu.com/p/fc9cda52f49d)

- [可视化管理工具Navicat](http://www.navicat.com.cn)、[mac破解版](https://xclient.info/s/navicat-premium.html)
