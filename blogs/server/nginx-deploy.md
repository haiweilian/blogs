---
title: Nginx 的基础使用和部署
date: 2020-01-22
updated: 2020-01-22
tags:
  - Nginx
categories:
  - 后端
---

## 安装

安装使用各平台默认包管理安装比较好，会自动解决依赖，比源码安装方便很多。

- CentOS

```sh
sudo yum install nginx
```

- Ubuntu

```sh
sudo apt install nginx
```

安装完成之后执行 `sudo nginx` 启动。就可以通过服务器的 _公网 ip_ ，访问到 nginx 的默认页面。

## 常用命令

启动

```sh
nginx
```

重新加载配置

```sh
nginx -s reload
```

重启（重新打开日志文件）

```sh
nginx -s reopen
```

停止（快速停止）

```sh
nginx -s stop
```

退出（完整有序的停止）

```sh
nginx -s quit
```

测试配置是否有错误（测试通过后，就可以放心重新启动了）。

```sh
nginx -t
```

## 目录结构

如果通过包管理安装默认路径在 `/etc/nginx`。

在 `nginx.conf` 默认配置文件里面，有这么一句是把文件配置文件拆分了。

```sh
# ...
include /etc/nginx/conf.d/*.conf;
# ...
```

这样我们就可以不修改主配置，在 `/etc/nginx/conf.d` 文件夹下建立一个 `xxx.com.conf`文件， 把一个站点的配置分开来便于管理。

## 部署&https

https 证书各大云服务商都有免费申请的，相关教程可以看提供的文档。

这里如阿里云[阿里云申请免费 SSL 证书](https://yq.aliyun.com/articles/637307) & [在 Nginx/Tengine 服务器上安装证书](https://help.aliyun.com/document_detail/98728.html)

下面就直接放*代理静态*和*代理端口*两种代理的配置示例。**示例是我的真实域名，按照自己的修改即可**

### 代理静态

代理静态，在 `/etc/nginx/conf.d` 下新建 `www.haiweilian.com.conf`，写入以下内容。

```sh
# For more information on configuration, see:
#   * Official English Documentation: http://nginx.org/en/docs/
#   * Official Russian Documentation: http://nginx.org/ru/docs/

server {
    # 监听的端口
    listen       80;
    listen       [::]:80;
    # 访问的域名
    server_name  haiweilian.com www.haiweilian.com;
    # 静态资源目录
    root         /home/haiweilian.github.io;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    # 将所有http请求通过rewrite重定向到https。
    # 如果不开启https，注释掉此配置即可。
    rewrite ^(.*)$ https://$host$1 permanent;

    location / {

    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}

# Settings for a TLS enabled server.
# 如果不开启https，注释掉此配置即可。

server {
    # 监听的端口
    listen       443 ssl http2;
    listen       [::]:443 ssl http2;
    # 访问的域名
    server_name  haiweilian.com www.haiweilian.com;
    # 静态资源目录
    root         /home/haiweilian.github.io;

    # https 证书相关
    ssl_certificate "/etc/nginx/cert/www.haiweilian.com.pem";
    ssl_certificate_key "/etc/nginx/cert/www.haiweilian.com.key";
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
        # 如果找不到资源从定向到，如 vue 开启 history 模式。
        try_files $uri $uri/ /index.html;
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}
```

## 代理端口

代理端口，在 `/etc/nginx/conf.d` 下新建 `api.haiweilian.com.conf`，写入以下内容。

```sh
# For more information on configuration, see:
#   * Official English Documentation: http://nginx.org/en/docs/
#   * Official Russian Documentation: http://nginx.org/ru/docs/

server {
    # 监听的端口
    listen       80;
    listen       [::]:80;
    # 访问的域名
    server_name  api.haiweilian.com;
    # root         _;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    # 将所有http请求通过rewrite重定向到https。
    # 如果不开启https，注释掉此配置即可。
    rewrite ^(.*)$ https://$host$1 permanent;

    location / {

    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}

# Settings for a TLS enabled server.
# 如果不开启https，注释掉此配置即可。

server {
    # 监听的端口
    listen       443 ssl http2;
    listen       [::]:443 ssl http2;
    # 访问的域名
    server_name  api.haiweilian.com;
    # root         _;

    # https 证书相关
    ssl_certificate "/etc/nginx/cert/api.haiweilian.com.pem";
    ssl_certificate_key "/etc/nginx/cert/api.haiweilian.com.key";
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    # Load configuration files for the default server block.
    include /etc/nginx/default.d/*.conf;

    location / {
        # 增加代理指向端口
        proxy_pass http://localhost:7001;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    error_page 404 /404.html;
        location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
        location = /50x.html {
    }
}
```

添加完后执行 `nginx -t` 测试配置，成功之后执行 `nginx -s reload` 重新加载配置。

## 结束总结

在搞懂 nginx 的目录和部署步骤之后遇到的错误和优化查资料就可以自己解决了。
