---
title: 设计模式之策略模式
date: 2021-01-17
tags:
  - JavaScript
  - DesignPattern
categories:
  - 前端
---

## 定义

定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换。

## 实现

策略模式的目的就是将算法的使用和算法的实现分离开来。一个基于策略模式的程序至少由两部分组成。

第一部分是一组策略类（可变），策略类封装了具体的算法，并负责具体的计算过程。

第二部分是环境类 Context（不变），Context 接受客户的请求，然后将请求委托给某一个策略类。要做到这一点，说明 Context 中要维持对某个策略对象的引用。

## 应用

**奖金计算**

绩效为 S 的人年终奖有 4 倍工资，绩效为 A 的人年终奖有 3 倍工资，而绩效为 B 的人年终奖是 2 倍工资。

如果不使用策略模式，可能会一个一个的写判断。

```js
let calculateBonus = function (performanceLevel, salary) {
  if (performanceLevel === "S") {
    return salary * 4;
  }
  if (performanceLevel === "A") {
    return salary * 3;
  }
  if (performanceLevel === "B") {
    return salary * 2;
  }
};

console.log(calculateBonus("S", 10000)); // 40000
console.log(calculateBonus("A", 10000)); // 30000
console.log(calculateBonus("B", 10000)); // 20000
```

使用策略模式，就可以把逻辑拆开。

```js
// ~策略类 strategies
let strategies = {
  S: function (salary) {
    return salary * 4;
  },
  A: function (salary) {
    return salary * 3;
  },
  B: function (salary) {
    return salary * 2;
  },
};

// ~环境类 calculateBonus
let calculateBonus = function (level, salary) {
  return strategies[level](salary);
};

console.log(calculateBonus("S", 10000)); // 40000
console.log(calculateBonus("A", 10000)); // 30000
console.log(calculateBonus("B", 10000)); // 20000
```

**表单验证**

这里定义一组策略类用于定义验证规则，然后使用环境类添加一组验证规则。

```js
// ~策略类 strategies
let strategies = {
  isNonEmpry: function (value, error) {
    if (value === "") {
      return error;
    }
  },
  isMobile: function (value, error) {
    if (!/^(\+?0?86\-?)?1[3456789]\d{9}$/.test(value)) {
      return error;
    }
  },
};

// ~环境类 Validator
let Validator = function () {
  this.cache = [];
  this.add = function (value, rule, message) {
    // 保存一个函数，返回对应的验证结果
    this.cache.push(function () {
      return strategies[rule](value, message);
    });
  };
  this.validator = function () {
    for (let i = 0; i < this.cache.length; i++) {
      // 循环已经保存的验证规则，如果有错误的，就直接返回错误信息
      let error = this.cache[i]();
      if (error) {
        return error;
      }
    }
  };
};

// ~测试组 Validator
let validator1 = new Validator();
validator1.add("", "isNonEmpry", "不能为空");
validator1.add("123123", "isMobile", "不是一个手机号");
console.log("validator1:", validator1.validator()); // validator1: 不能为空

let validator2 = new Validator();
validator2.add("123123", "isNonEmpry", "不能为空");
validator2.add("123123", "isMobile", "不是一个手机号");
console.log("validator2:", validator2.validator()); // validator2: 不是一个手机号
```
