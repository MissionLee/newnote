# 配置Mybatis

> SpringBoot可以自动配置好MyBatis

##

## SpringBoot自动配置MyBatis的一些要求

> Maven 依赖
```xml
<!-- 数据库使用的 mysql  -->
<dependency>
	<groupId>mysql</groupId>
	<artifactId>mysql-connector-java</artifactId>
	<scope>runtime</scope>
</dependency>
<!-- 对数据源进行封装，提供JDBCTemplate -->
<dependency>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<!-- mybatis -->
<dependency>
	<groupId>org.mybatis.spring.boot</groupId>
	<artifactId>mybatis-spring-boot-starter</artifactId>
	<version>1.3.2</version>
</dependency>
<!-- 分页插件 -->
<dependency>
	<groupId>com.github.pagehelper</groupId>
	<artifactId>pagehelper-spring-boot-starter</artifactId>
	<version>1.2.5</version>
</dependency>
```
> Spring配置参数
```conf
## 这些配置会帮助Spring构建DataSource（Pool）
spring.datasource.url=jdbc:mysql://10.1.2.49:3306/db_base_platform_two?characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull&useSSL=true
spring.datasource.username=root
spring.datasource.password=123456

spring.datasource.auto-commit=false
spring.datasource.pool-name=mrg_pool
spring.datasource.maximum-pool-size=1000
spring.datasource.minimum-idle=10
spring.datasource.max-lifetime=28800000
spring.datasource.rollback-on-return=true
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
spring.datasource.pool-prepared-statements=true
spring.datasource.validation-query=select 1
spring.datasource.test-while-idle=true
spring.datasource.test-on-borrow=true
spring.datasource.test-on-connect=true
```
> 代码中使用 
```java
@Resource()
protected SqlSession sqlSession;
```