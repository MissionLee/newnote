# Spring IOC 容器


之前跟着Spring官网，看了一遍Spring Core部分的介绍（官网介绍的core组件，不是单独的core包）

初次看这部分内容的时候，没有结合实际的代码，只是把英文原文翻译成中文浏览了一遍。这里再详细过一遍IOC Container部分，了解其真正的工作方式。

> ApplicationContext 与 BeanFactory

相比于BeanFactory，ApplicationContext增加了

- 集成了更便捷的Spring AOP特性
- 继承了Message resource部分功能
- Event publication
- 为Application层特化各种功能
  - 例如：WebApplicationContext增加了 web application的功能

> ApplicationContext

- ApplicationContext作为Spring IoC容器的门面，提供初始化，配置，组装beans. 
- 通过分析configuration metadata，容器获取配置bean的要求，metadata可以用xml文件，annotation等配置
- Spring提供了几个实现
  - 单机环境，通常使用ClassPathXmlApplicationContext 或 FileSystemXmlApplicationContext
  - 在多数应用场景下，用户不需要使用特定的代码来创建容器，例如web环境中只要在web.xml里面配置几行代码就按成了相关任务

