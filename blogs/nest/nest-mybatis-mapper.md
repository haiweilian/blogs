---
title: 在 Nest.js 中编写 SQL 的另一种方式(MyBatisMapper)
date: 2024-01-16
tags:
  - Nest
categories:
  - 后端
---

在 Nest.js 开发中我们通常会选择 TypeORM 框架操作数据库，这对前端 SQL 弱的来说确实是有很大的帮助。但对于一些复杂的查询显得有点麻烦，甚至比直接写 SQL 更复杂。这里并不是说不能用 ORM 框架实现，而是手写 SQL 更有性价比。下面举了几个例子对比几种写法的区别和优缺点。以及如何在 Nest.js 使用 MyBatis 的语法。

## 需求

如现在有以下表结构，学生表、学科表、分数表。来表示学生的学科考了多少分这个需求。

```sql
-- ----------------------------
-- 学生表
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

BEGIN;
INSERT INTO `student` VALUES (1, '小红');
INSERT INTO `student` VALUES (2, '小黄');
INSERT INTO `student` VALUES (3, '小绿');
COMMIT;

-- ----------------------------
-- 学科表
-- ----------------------------
DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

BEGIN;
INSERT INTO `subject` VALUES (1, '语文');
INSERT INTO `subject` VALUES (2, '数学');
INSERT INTO `subject` VALUES (3, '英语');
COMMIT;

-- ----------------------------
-- 学生学科分数表
-- ----------------------------
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score` (
  `id` int NOT NULL AUTO_INCREMENT,
  `studentId` int NOT NULL,
  `subjectId` int NOT NULL,
  `score` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

BEGIN;
INSERT INTO `score` VALUES (1, 1, 1, 78);
INSERT INTO `score` VALUES (2, 1, 2, 97);
INSERT INTO `score` VALUES (3, 1, 3, 68);
INSERT INTO `score` VALUES (4, 2, 1, 92);
INSERT INTO `score` VALUES (5, 2, 2, 81);
INSERT INTO `score` VALUES (6, 2, 3, 72);
INSERT INTO `score` VALUES (7, 3, 1, 85);
INSERT INTO `score` VALUES (8, 3, 2, 79);
INSERT INTO `score` VALUES (9, 3, 3, 96);
COMMIT;
```

现有一个需求，需要一个查询列表。

- 筛选条件：学生单选、学科多选、分数排序。条件都是可选的，如果不传入值则查询全部。

```sh
/list
/list?studentId=1
/list?studentId=1&subjectId=1,2
/list?studentId=1&subjectId=1,2&scoreSort=ASC
```

- 返回结果：学生名称、学科名称、考试分数。

```json
[
  {
    "id": 2,
    "score": 97,
    "studentName": "小红",
    "subjectName": "数学"
  }
  // ...
]
```

## 实现

### QueryBuilder

当你使用 `Repository API` 难以实现查询时，你可能会使用查询构造器，上面的需求写法如下。

```ts
export class ApiService {
  list(dto: any) {
    const studentId = dto.studentId;
    const subjectId = dto.subjectId && dto.subjectId.split(",");
    const scoreSort = dto.scoreSort || "DESC";

    // 创建查询全部的语句
    const query = this.entityManager
      .createQueryBuilder()
      .select([
        "sc.id id", //
        "sc.score score",
        "st.name studentName",
        "su.name subjectName",
      ])
      .from("score", "sc")
      .leftJoin("student", "st", "sc.studentId = st.id")
      .leftJoin("subject", "su", "sc.subjectId = su.id");

    // 添加条件查询，如果不传入是不能拼条件的
    if (studentId) {
      query.andWhere("sc.studentId = :studentId", { studentId });
    }
    if (Array.isArray(subjectId) && subjectId.length) {
      query.andWhere("sc.subjectId IN (:...subjectId)", { subjectId });
    }
    query.orderBy("sc.score", scoreSort);

    return query.getRawMany();
  }
}
```

当然用这种方式实现所有功能也是可以的。看着还好是不是，确实是因为它比较简单。但是你必须使用内置的各种方法，以至于当你去调试这个 SQL 的时候，你不得不按照各个方法的作用转化一遍，调试修改完后再转化回来。当然也可以使用 `printSql()` 打印 SQL 当你运行项目并能调用接口时。

### EntityManager.query

当你厌倦了查询构造器规定的各种方法，你可能会写原生 SQL 实现，上面的需求写法如下。

```ts
export class ApiService {
  listsql(dto: any) {
    const studentId = dto.studentId;
    const subjectId = dto.subjectId && dto.subjectId.split(",");
    const scoreSort = dto.scoreSort || "DESC";

    let query = `
      SELECT
        sc.id id,
        sc.score score,
        st.name studentName,
        su.name subjectName
      FROM
        score sc
        LEFT JOIN student st ON sc.studentId = st.id
        LEFT JOIN subject su ON sc.subjectId = su.id
        WHERE 1 = 1
    `;

    // 添加条件查询，如果不传入是不能拼条件的
    const parameters = [];
    if (studentId) {
      query += `AND sc.studentId = ? `;
      parameters.push(studentId);
    }
    if (Array.isArray(subjectId) && subjectId.length) {
      query += `AND sc.subjectId IN (${Array(subjectId.length).fill("?").join(",")}) `;
      parameters.push(...subjectId);
    }

    query += `ORDER BY sc.score ${scoreSort} `;

    return this.entityManager.query(query, parameters);
  }
}
```

好了现在你可以直接复制 SQL 去调试了。但可惜的是我们无法直接使用模板字符串拼接变量，为了防止注入必须使用 `?` 占位符，你必须考虑参数的顺序，这也带来了一些麻烦。

### MyBatisMapper

在 Java 中都会使用 MyBatis 插件提供的语法在 XML 文件里写 SQL 语句。一方面它提供了动态拼接 SQL 的一种标准也处理 SQL 注入，上面的需求写法如下。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="api">
  <select id="listxml">
    SELECT
      sc.id id,
      sc.score score,
      st.name studentName,
      su.name subjectName
    FROM
      score sc
      LEFT JOIN student st ON sc.studentId = st.id
      LEFT JOIN SUBJECT su ON sc.subjectId = su.id
    <where>
      <if test="studentId != null and studentId !=''">
        AND sc.studentId = #{studentId}
      </if>
      <if test="subjectId != null and subjectId !=''">
        AND sc.subjectId IN
        <foreach collection="subjectId" item="id" open="(" separator="," close=")">
          #{id}
        </foreach>
      </if>
    </where>
    ORDER BY sc.score ${scoreSort}
  </select>
</mapper>
```

目前没有 JS 版本的解析器，有作者开源了一个解析器 [mybatis-mapper](https://github.com/OldBlackJoe/mybatis-mapper) 不包含映射部分也可以使用，可以点击文档了解下基本的用法。使用很简单对现有代码无影响，使用它生成 SQL 语句后交给数据库工具去执行。

```js
const mysql = require("mysql2");
const mybatisMapper = require("mybatis-mapper");

// 创建数据库连接
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test",
});

// 添加 xml 文件
mybatisMapper.createMapper(["./api.xml"]);

// 定义 SQL 参数
var param = {
  studentId: 1,
  subjectId: 1,
};

// 获取 SQL 语句
var format = { language: "sql", indent: "  " };
var query = mybatisMapper.getStatement("api", "listxml", param, format);

// 执行 SQL 语句
connection.query(query, function (err, results, fields) {
  console.log(results);
  console.log(fields);
});
```

如果使用 `TypeORM` 那么可以直接使用 `entityManager.query` 去执行 SQL 就可以了。

目前手动管理添加文件还是不方便。我们可以创建一个 Nest.js 模块去自动读取，并且监听到变化时自动更新。简单实现如下：使用 `fast-glob` 查询文件，使用 `chokidar` 监听文件的变化后重新读取。

```ts
// mybatis.service
import { Injectable, OnModuleInit } from "@nestjs/common";
import * as glob from "fast-glob";
import * as chokidar from "chokidar";
import * as mybatisMapper from "mybatis-mapper";

@Injectable()
export class MybatisService implements OnModuleInit {
  onModuleInit() {
    this.loadMapper();
    this.watchMapper();
  }

  /**
   * 获取 SQL 语句
   */
  getSql(namespace: string, sql: string, param?: any) {
    return mybatisMapper.getStatement(namespace, sql, param);
  }

  /**
   * 加载 Mapper 文件
   */
  private loadMapper() {
    const files = glob.globSync("**/*.mapper.xml", {
      cwd: __dirname,
      absolute: true,
    });
    mybatisMapper.createMapper(files);
  }

  /**
   * 监听 Mapper 文件
   */
  private watchMapper() {
    chokidar
      .watch("**/*.mapper.xml", {
        cwd: __dirname,
      })
      .on("all", () => {
        // TODO: 只重新加载变化的
        this.loadMapper();
      });
  }
}
```

为了便于管理可以设计一个 `xxx.mapper.ts` 层与 `xxx.mapper.xml` 相对应。

```ts
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { MybatisService } from "../mybatis.service";

@Injectable()
export class ApiMapper {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    private mybatisService: MybatisService
  ) {}

  listxml(dto: any) {
    const sql = this.mybatisService.getSql("api", "listxml", dto);
    return this.entityManager.query(sql);
  }
}
```

使用时调用 `xxx.mapper.ts` 提供的方法。

```ts
export class ApiService {
  listxml(dto: any) {
    const studentId = dto.studentId || null;
    const subjectId = dto.subjectId && dto.subjectId.split(",");
    const scoreSort = dto.scoreSort || "DESC";
    return this.apiMapper.listxml({
      studentId,
      subjectId,
      scoreSort,
    });
  }
}
```

最终一个模块的文件结构如下。

```sh
├── api
│   ├── api.controller.ts
│   ├── api.mapper.ts
│   ├── api.mapper.xml
│   ├── api.module.ts
│   └── api.service.ts
```

### 如何选择

对于单表查询、插入、更新直接用 `Repository API` 简单快速、类型提示好。对于小项目也没必要引入额外的概念，项目复杂点的是需要考虑一种更统一的管理方式，对于本就复杂的功能还写那么复杂的构建查询，如果都使用原生 SQL 去实现功能了，不如试试在 XML 写。

## 项目推荐

我开源了一个 [基于 Nest.js & React.js 的后台权限管理系统](https://github.com/haiweilian/vivy-nest-admin)，此项目实践 Nest.js 开发。

上面的实现是简单的实现，可以参考这个项目中具体的实现 [plugin-mybatis](https://github.com/haiweilian/vivy-nest-admin/tree/main/vivy-common/vivy-plugin-mybatis)，目前没有单独发布包。
