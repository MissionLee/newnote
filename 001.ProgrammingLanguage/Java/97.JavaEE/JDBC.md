# JDBC

Java Data Base Connectivity Java数据库连接

依赖
- java.sql.*
- javax.sql.*
- 所用数据库的实现类

## 介绍

> 我们在JDK的默认包里面可以找到标准接口：rt.jar中java/javax下的Sql部分

- java.sql
  - 特殊数据类型的接口 Array / Blob / Clob / Time 等
  - Driver 接口
  - DriverManager 类
  - Statement/PreparedStatement 接口
  - Wrapper 接口
  - 其他辅助接口/类
- javax.sql
  - DataSource
  - CommonDataSource/ConnectionPoolDataSource/PooledConnection 相关接口
  - RowSet 相关接口
  - 其他接口

## 开发

>注册数据库驱动
```java
DriverManager.registerDriver(new xDB.Driver());
```
>获取Connection
```java
Connection connection = DriverManager.getConnection("数据库链接参数")
```
>Statement/ResultSet（用于管理向数据库发送的SQL）
```java
Statement st = connection.createStatement()
ResultSet rs = st.executeQuery("SQL字符串")
// 返回结果存放在ResultSet里面
```

> 释放资源