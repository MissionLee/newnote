# Mybatis 源码

> 把源码分为三大部分：
> 1.引导层(基础层):解析配置文件，提供连接池，缓存，事务等
> 2.数据处理层：处理动态SQL
> 3.接口层：对外接口

---------------------------------
## 解析配置 与 Mapper
> 1.解析配置文件 获得 Configuration最终获得SqlSessionFactory

> 2.解析Mapper文件 (解析出来的内容也在Configuration中)获得 SqlSource / BoundSql 

- ConfigBuilder  和 MapperBuilder
  - SqlSessionFactoryBuilder
    - 让用户可以用多种方法获得SqlSessionFactory
      - 直接提供Configuration
      - （多种方式）提供配置文件
  - [XMLConfigBuilder](./source/005-2-XMLConfigBuilder.MD)
    - 用来解析Mybatis配置文件
    - [其中parse方法处理各种不同的配置](\source\005-3-XMLConfigBuilder中parse方法.md)
    - 在处理到mappers参数的位置的时候，会使用[XMLMapprBuilder](\source\005-4-XMLMapperBuilder.md)解析加载Mapper
  - [XMLMapprBuilder](\source\005-4-XMLMapperBuilder.md)
    - 用来解析Mapper配置文件
    - 如 配置的一些resultMap/SQL片段/selectKey等内容这里都会一一处理
    - 最重要的是：(默认情况下)使用[XMLanguageDriver](\source\005-8-XMLLanguageDriver.md)来解析 select/insert/update/delete等节点，生成SqlSource
  - [BaseBuilder](\source\005-5-BaseBuilder.md)
    - 上面介绍的 xxxBuilder 都是继承了BaseBuilder
    - 上面类中使用到的如：TypeAliasRegistry，也以BaseBuilder中的Configuration成员作为构造参数
    - ⭐⭐⭐这样的结果就是各个 xxxBuilder，还有注册器，最终都把处理结果汇总到了 BaseBuilder的Configuration中
  - [Configuraiton](\sourc005-7-Configuration.md)
    - 还没有详细看里面的内容 🔺🔺🔺
  - [XMLLanguageDirver](\source\005-8-XMLLanguageDriver.md)  ⭐⭐⭐
    - (默认)使用这个langDriver处理我们写的sql语句（我们一般都是按照MyBatis的标准要求写的）
    - 最终生成SqlSource
    - 使用 GenericTokenParser 对 `${} 和 #{}` 这种参数进行处理 ⭐此部分已经涉及了动态SQL
  - 附加小知识点
    - [genericTokenParser](./source/GenericTokenParser)
      - 就是用来解析 ${} #{} 标记的
```MERMAID
graph TD;
SqlSession-->|从工厂获得|SqlSessionFactory
SqlSessionFactory-->|专门有一个类用来初始化工厂|SqlSessionFactoryBuilder
SqlSessionFactoryBuilder-->|核心方法-需求参数Configuratoin|build

SqlSessionFactoryBuilder-->|参数Configuration由这个类提供|XMLConfigBuilder
XMLConfigBuilder-->|核心成员-配置文件解析器|XPathParser
XMLConfigBuilder-->|核心方法-解析配置文件内容放到Configuration里面|parseConfiguration
XMLConfigBuilder-->|继承BaseBuilder|BaseBuilder
BaseBuilder-->|核心类成员|Configuration
BaseBuilder-->|核心类成员|TypeAliasRegistry
BaseBuilder-->|核心类成员|TypeHandlerRegistry
parseConfiguration-->|里面有一个步骤来解析mapper|mapperElement
mapperElement-->|主要功能|遍历配置文件mappers的子元素
mapperElement-->|文件子元素使用XMLMapperBuilder解析|XMLMapperBuilder
mapperElement-->|类配置就创建这个类|classForName
mapperElement-->|如果是一个包就打包交给mapperRegistry加载|mapperRegistry
XMLMapperBuilder-->|继承BaseBuilder的Configuration|BaseBuilder
mapperRegistry-->|使用BaseBuilder的Configuration构造|BaseBuilder
classForName-->|创建后传递给BaseBuilder的Configuration|BaseBuilder
Configuration-->最终存储了所有MyBatis的配置参数和Mapper信息
```
------------------------------
## SqlSession 的获取

> 在配置文件处理阶段，已经通过SqlSessionFactoryBuilder获得了Configuration，并且最终创建了 SqlSessionFactory（默认是DefaultSqlSessionFactory），之后就可以用之获取SqlSession（默认DefaultSqlSession）

- 获取SqlSession的步骤（SqlSessionFactory中的方法）
  - final Environment environment = configuration.getEnvironment();
    - ⭐从配置文件获取 Environment
      - 主要存储了：ID / TrancactionFactory / DataSource （就是配置文件中Environment节点的内容）
  - final TransactionFactory transactionFactory 
    - = getTransactionFactoryFromEnvironment(environment);
    - ⭐获取Environment中的TransactionFactory
    - [TransactionFactory&Transaction](\source\005-9-TransactionFactory-Transaction.md)
  - tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
    - ⭐获取一个transaction
    - 在 [TransactionFactory&Transaction](\source\005-9-TransactionFactory-Transaction.md) 介绍了 Transaction的两个实现：
      - 一个直接使用jdbc提供的事务操作
      - 一个什么也不做，把处理权交给外部程序（Spring就有自己的事务管理器）
  - final Executor executor = configuration.newExecutor(tx, execType);
    - ⭐获取一个 [executor](./source/005-10-Executor.md)
      - ⭐⭐⭐⭐⭐ 在这里介绍了一个SQL到底是如何执行的

  - return new DefaultSqlSession(configuration, executor, autoCommit);
    - ⭐最终返回SqlSession
      - SqlSession实际上就是从mappedStatement中找到当前要用的Statement，然后调用 Executor 处理SQL语句与数据库进行交互
## Executor ParameterHandler ResultHandler
- [executor](./source/005-10-Executor.md)
  - 真正执行sql的类
    - 调度 StatmentHandler 每个步骤的执行
    - 这部分源码使用代理模式，非常值得学习
- [ParameterHandler](./source/005-12-ParameterHandler.md)
  - 用于从参数中找到我们在mapper里面写的SQL的对应参数的value
- TypeHandler
  - 当ParameterHandler找到某个参数需要放入某个值的时候，我们获取对应的TypeHandler，然后把转换好的参数放到 PreparedStatement 对应的位置
    - 例如我们要设置一个int值，就使用IntegerTypeHandler
    - IntegerTypeHandler里面会调用 ps.setInt()方法
    - 这里也是代理模式

## 其他


- [LangDriver](\006-LangDriver.md)
    - MyBatis 从 3.2 开始支持可插拔脚本语言，这允许你插入一种脚本语言驱动，并基于这种语言来编写动态 SQL 查询语句。  


> 另外有：关于 [Spring中SqlSessionTemplate](..\01.SpringSeries\SpringDataSQL\001-SqlSessionTemplate.md) 的学习,主要可以学习其代理模式，和通过代理模式实现的事务管理
