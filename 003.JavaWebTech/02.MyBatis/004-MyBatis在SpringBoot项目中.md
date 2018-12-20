# MyBatis 

想要真正了解MyBatis，实际上我们有两个可用来梳理 MyBatis的入手点： 从SqlSession开始，或者从 Mapper.xml文件开始。

当然我在几秒钟前有一个误区，因为一直在Spring（SpringBoot）框架中使用Mybatis，一直直接获取 SqlSession
```java
	@Resource
	protected SqlSession sqlSession;
```
这是因为`MyBatisSpringBootStarter`已经自动帮我们配置好了（我们用了SpringBoot固定的方法写配置参数，框架靠这些参数自动配置好了一切）

既然这样，还是看一下 SpringBoot里面的MyBatis配置
```bash
# 首先是关于 db的
spring.datasource.url=jdbc:mysql://ip:3306/db_name?characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull&useSSL=true
spring.datasource.username=
spring.datasource.password=
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
#####MYBATIS
mybatis.config-location=classpath:/mybatis/SqlMapConfig.xml  ## 这是MyBatis的配置
mybatis.mapper-locations=classpath:/mybatis/mapper/**/*.xml  ## 这是MyBatis的Mapper文件
### Configuration for Mysql Page
### 还有pagehelper
pagehelper.helperDialect=mysql
pagehelper.reasonable=true
pagehelper.supportMethodsArguments=true
pagehelper.params=count=countSql
```
还有对应的依赖
```xml
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>1.1.1</version>
        </dependency>
```


- 关于MyBatis的 [配置文件](./000-MyBatis学习导航.md) ，之前有过记录了，不再多说

## 自己尝试配置过一次，更有助于对源码的理解与学习

- SpringBoot 会自动为我们配置好MyBatis，即使我们不写任何配置文件，但是配置文件，非常有利于对于MyBatis的理解

```java
// ---------------------- 配置 DataSourceConfiguratiopn ------------------------

// -------------------------- MyBatis 配置 ----------------------------------------
@Configuration
@EnableTransactionManagement
public class MyBatisConfig implements TransactionManagementConfigurer {
    @Autowired
    private DataSource dataSource;

    @Override
    public PlatformTransactionManager annotationDrivenTransactionManager() {
         return new DataSourceTransactionManager(dataSource);
    }

    @Bean(name = "sqlSessionFactory")
    public SqlSessionFactory sqlSessionFactoryBean() {
        SqlSessionFactoryBean bean = new SqlSessionFactoryBean();
        bean.setDataSource(dataSource);

        try {
            return bean.getObject();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Bean
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
// ---------------------------- MyBatis 配置文件配置 -----------------------------
@Configuration
// 因为这个对象的扫描，需要在MyBatisConfig的后面注入，所以加上下面的注解
@AutoConfigureAfter(MyBatisConfig.class)
public class MyBatisMapperScannerConfig {
    @Bean
    public MapperScannerConfigurer mapperScannerConfigurer() {
        MapperScannerConfigurer mapperScannerConfigurer = new MapperScannerConfigurer();
        //获取之前注入的beanName为sqlSessionFactory的对象
        mapperScannerConfigurer.setSqlSessionFactoryBeanName("sqlSessionFactory");
        //指定xml配置文件的路径
        mapperScannerConfigurer.setBasePackage("com.framework.msg.mapper");
        return mapperScannerConfigurer;
    }
}

@RestController
@RequestMapping("/pageHelper")
public class PageHelperAction {

    @Resource
    private SqlSession sqlSession;

    @RequestMapping("/getUser")
    public ResponseBean<List<User>> getUsersByPage() {
        PageHelper.startPage(2, 3);
        List<User> pagelist = this.sqlSession.selectList("user.queryAllUserInfo");
        return ResultUtil.success(pagelist);
    }
}
```