# 概念

Spring Core / Spring 核心组件

Spring Core 是Spring框架下最基础（核心）的一个jar包。

Spring 核心组件 则是说（jar包） Spring Core / Spring Bean / Spring Context

有一个很简单的辨析方法：

我们借助maven分析以下两个比较高层级的Spring组件的结构

SpringMVC(Spring-webmvc-5.1.3.RELEASE.pom)
  - spring-aop
  - spring-beans
  - spring-core
  - spring-expression
  - spring-web
  - jackson-databind
  - 等等不在列举

SpringJDBC
  - spring-beans
  - spring-core
  - spring-tx
  - h2
  - 等等不在列举

> 从这里可以简单的看到，对于mvc与jdbc来说，如spring-core，spring-beans这些，都是基础组件

spring-aop
  - spring-core
  - spring-beans
  - jamon等等

又如这里的spring-aop也是基于spring-core 和 spring-beans

>那么为什么很多人把 core bean context称为spring 核心组件呢

首先很明显的是，许多高层模块都依赖这三个模块

其次就是这三个模块的功能

spring bean：bean的定义，解析，创建

spring core
  - 资源resource
  - 