# 概念

- 官方网站中描述的SpringCore包括以下几个部分（这里对的core不是指core包，而是通用的核心概念）
  - IoC Container
    - [IoC Container章节](./官网资料/01-The_IoC_Container.md)介绍，容器的核心为 beans 和 context 两个包
      - BeanFactory
      - ApplicationContext

## Spring Core / Spring 核心组件

- 许多网上查询到的总结文章常说：Spring 核心组件  Spring Core / Spring Bean / Spring Context
- Spring官网上的SpringCore则介绍了9个大类
  - IoC Container
  - Resource
  - Validation/DataBinding/TypeConversion
  - SpEL
  - Aspect Oriented Programming with Spring
  - Spring AOP APIs
  - Null safety
  - Appendix
> 在官网的介绍中 IoC Container就是 Spring Bean 和 Spring Context两个包；而剩下的几个部分一些集成在 core这个包里面，另外还有例如 spring-aop spring-aspects spring-expression 这些并非在core内

> 所以如果我们以Spring官网提供的内容为标准，狭义上，网上部分文章的说法则有一些疏漏。

## 从高阶组件，分辨核心内容

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
  - 容器IoC Container
  - 数据与数据绑定验证等
  - SpEL
  - 其他基础内容

spring context： 
  - Application Context
  - 运行环境

看一下 ApplicationContext
```java
public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory,
		MessageSource, ApplicationEventPublisher, ResourcePatternResolver 
```
- EnvironmentCapable 
  - 可以提供 org.springframework.core.env.Environment
- ListableBeanFactory
  - 可以列举 enumerate所有bean的BeanFactory接口
- HierarchicalBeanFactory
  - 支持容器层级（父容器）
- MessageSource
  - org.springframework.context.MessageSource
  - 国际化资源 
- ApplicationEventpublisher
  - 把时间发布功能封在这里，特地给ApplicationEvent服务的
- ResourcepatternResolver
  - 资源路径字符串解析器

> 其他Spring官网认为是core的部分，实际上不是所有的Spring模块都依赖，这可能是部分开发者没有把他们当成核心组件的原因

> 此处举个例子 SpringMVC中核心组件DispatcherServlet 有一个重要组件 WebApplicationContext

> WebApplicationContext就是ApplicationContext的实现（例如：XmlWebApplicationContext，StaticWebApplication）