# 配置Mybatis

> SpringBoot可以自动配置好MyBatis

## SpringBoot手动配置MyBatis

> MyBatis的主要提供的就是SqlSession,我们的配置过程就是希望能够获取一个可用的SqlSession （实际上是代理和SqlSession的 SqlSessionTemplate）

```java
//  类名可能不合适，当时随意取到的
@Configuration
public class MyBatisConfig {
	// ★★★★★ Environment 可以用来获取SpringBoot中 配置文件里面的配置
    @Autowired
    private Environment env; 
	// ★★★★★ 我们需要给MyBatis提供DataSource，这里我们选择配置一个连接池
    public DataSource myDataSource1() {
        return new PooledDataSource(env.getProperty("jdbc.driverClassName"), env.getProperty("jdbc.url"), env.getProperty("jdbc.username"), env.getProperty("jdbc.password"));
    }
	// ★★★★★ 如果有多个数据源的需求，可以再配置一个
    public DataSource myDataSource2() {
        return new PooledDataSource(env.getProperty("jdbc.driverClassName2"), env.getProperty("jdbc.url2"), env.getProperty("jdbc.username2"), env.getProperty("jdbc.password2"));
    }

	// ★★★★★ org.mybatis.spring包给我们提供了一个在Spring环境中很方便的构建SqlSessionFactory的 ： SqlSessionFactoryBean 
	// ★★★★★ 在这里，我们需要设置（最少需要设置这些内容）
	// ★★★★★     1.  DataSource
	// ★★★★★     2.  Mapper文件路径
	// ★★★★★ 然后调用 .getObject() 方法，返回一个SqlSessionFactory
	// ★★★★★ 在Mybatis中自带的是 SqlSessionFactoryBuilder
    @Bean(name = "vtSqlSessionFactory")
    public SqlSessionFactory sqlSessionFactory2() throws Exception {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(myDataSource1());
        Resource[] x = new PathMatchingResourcePatternResolver().getResources("classpath:/mybatis/mapper/**/*.xml");
        bean.setMapperLocations(x);
        final SqlSessionFactory object = bean.getObject();
        System.out.println("sqlSessionFactory:"+ object);
        return object;
    }
}
// 在MyBatis独立的学习中，会有相关 SqlSessionFactoryBuilder 内容。
```
> 因为有相互依赖关系，所以我们要把配置文件写成两个。

> 注意：这里 `public class SqlSessionTemplate implements SqlSession, DisposableBean` 实际上我们是 提供一个 SqlSessionFactory，返回一个 SqlSessionTemplate

> 联系 [SqlSessionTemplate](./001-SqlSessionTemplate.md) 里面关于SqlSessionTemplate对于SqlSession的代理 与 事务管理的实现，就可以理解
```java
@Configuration
public class SqlSessionConfig {
    @Resource(name="vtSqlSessionFactory")
    SqlSessionFactory sqlSessionFactory;

    @Bean(name="sqlSession")
    public SqlSession sqlSession1(){
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
```

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