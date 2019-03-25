# 

## 创建项目

idea

- new project
  - Spring Initializr

  - 配置以下选项
    - core
      - Aspects： Aop AspectJ
    - web
      - Web ： Servlet web application with Spring MVC and Tomcat
      - WebSocket ： WebSocket application with SockJS and STOMP
    - SQL
      - MySQL
      - JDBC
      - MyBatis
    - NoSQL
      - Redis

## @EnableAutoConfiguration

这个注解告诉SpringBoot，它会根据加载的jar包依赖推测如何配置Spring，我们添加了 spring-boot-starter-web（Spring MVC + Tomcat），springboot以此判断这是个web application

> Starters/Auto-configuration : 自动配置与Starters配合能够完成自动配置，但是这两者不是绑定的，使用starters之外的其他依赖，也可以完成配置

> main ： 我们在main方法中使用SpringApplication.run执行，可以在命令行中给 args传递一些启动参数

## Run /  Creating an Executable Jar

使用spring boot方式创建的应用，我们创建了一个 self-contained executable jar （所有的依赖都在这个jar内 - 也被成为 fat jars）。

这依赖于 maven中的一个插件(这个插件需要 spring-boot-starter-parent 这个POM里面提供的 excutions节点的配置，如果没有使用spring-boot-starter-parent 就需要自行定义这些配置)

spring-boot-maven-plugin

## 使用 Spring Boot

### 创建系统

- 依赖管理：（我用maven）
  - 使用 starter parent（使用parent的好处是，只要一个version，spring系列的jar包都使用这个版本）
    - 当然我们也可以通过 properties 覆盖 spring里面的一些版本属性参数
    - 但是！ parent只能由一个，有时候需要多继承
    - 如果不想使用 starter parent（例如有自己熟悉的标准依赖版本），可以用 scope=import来实现多重继承
      - 
      ```xml
      <dependencyManagement>
        <dependencies>
        <dependency>
         <!-- Import dependency management from Spring Boot -->
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-dependencies</artifactId>
         <version>2.1.3.RELEASE</version>
         <type>pom</type>
         <scope>import</scope>
        </dependency>
        <!-- ！！！ 我们可以在这里继续写其他的依赖 -->
       </dependencies>
      </dependencyManagement>
      ```
      - 通过这个配置，可以继承 2.1.3.RELEASE
      - Maven的继承和Java的继承一样，是无法实现多重继承的，如果10个、20个甚至更多模块继承自同一个模块，那么按照我们之前的做法，这个父模块的dependencyManagement会包含大量的依赖。如果你想把这些依赖分类以更清晰的管理，那就不可能了，import scope依赖能解决这个问题。你可以把dependencyManagement放到单独的专门用来管理依赖的pom中，然后在需要使用依赖的模块中通过import scope依赖，就可以引入dependencyManagement。例如可以写这样一个用于依赖管理的pom：
      - 
      ```xml
        <project>
        	<modelVersion>4.0.0</modelVersion>
        	<groupId>com.test.sample</groupId>
        	<artifactId>base-parent1</artifactId>
        	<packaging>pom</packaging>
        	<version>1.0.0-SNAPSHOT</version>
        	<dependencyManagement>
        		<dependencies>
        			<dependency>
        				<groupId>junit</groupId>
        				<artifactid>junit</artifactId>
        				<version>4.8.2</version>
        			</dependency>
        			<dependency>
        				<groupId>log4j</groupId>
        				<artifactid>log4j</artifactId>
        				<version>1.2.16</version>
        			</dependency>
        		</dependencies>
        	</dependencyManagement>
        </project>
      ```
      - 然后通过非继承方式引入这段依赖
      ```xml
      <dependencyManagement>
      	<dependencies>
      		<dependency>
      			<groupId>com.test.sample</groupId>
      			<artifactid>base-parent1</artifactId>
      			<version>1.0.0-SNAPSHOT</version>
      			<type>pom</type>
      			<scope>import</scope>
      		</dependency>
      	</dependencies>
      </dependencyManagement>

      <dependency>
      	<groupId>junit</groupId>
      	<artifactid>junit</artifactId>
      </dependency>
      <dependency>
      	<groupId>log4j</groupId>
      	<artifactid>log4j</artifactId>
      </dependency>
      ```
      - ⭐ 注意： import = scope 只能在 dependencyManagement里面使用
### starters

starters 是为了方便构建application设置的一组依赖，打包管理，很方便。

### Structuring Your Code

Spring boot 本身对代码结构没有要求，但是有一些最佳方案：

- “default” package

如果某个class不在任何package里面，那么把它放到也给“default”包里面，但是不鼓励这么做。这会导致在使用 @ConponentScan， @EntityScan 或者 @SpringBootApplication 这届的时候发生一些问题。

- Main application class 放置位置

推荐放在项目其他所有类的“相对root位置”

- Configuration Classes 配置类
  - 可以通过XML配置，但是 spring boot 模式下用 java-based configuration更好一些
  - @Configuration
    - 如果所有的配置都放在同一个 @Configuration 类里面了，那么可以使用 @Import引入这个配置类
    - 当然也可以使用 @ComponentScan来检测所有Spring components ，其中包括 @Configuration
  - ⭐ 我们还是可以使用 XML配置文件的
    - 可以在一个注解了 @Configuration 的class中，使用 @ImportResource注解加载configuration文件
## Auto-configuration 自动配置

- spring boot 可以通过以来中的jar包推测配置，例如classpath里面由HSQLDB，但是没有配置 database connection beans，springboot会自动配置一个 in-memory database
- 通过把下面两个注解加到某个@Configuration类上都可以激活自动配置
  - @SpringBootApplication
  - @EnableAutoConfiguration
  - ⭐ 只需要加上一个就可以了，推荐加到主配置类上

- 逐步替换自动配置
  - 只要你自己配置了某个内容，例如DataSource，自动配置就会被屏蔽掉
  - 开启 debug日志，你就能看到当前自动配置了那些内容
- 关闭特定的自动配置
 - @EnableAutoConfiguration(exclude={DataSourceAutoConfiguration.class})
 - exclude语法也可以，使用 property也可以
- spring beans 与 di
  - 就如同普通的spring一样
  - @ConponentScan会找到所有的组件，注册为bean
    - @Component
    - @Service
    - @Respository
    - @Controller
    - 等等
  - 使用 @Autowired就可以使用了
## 使用 @SpringBootApplication 注解
```java
@SpringBootApplication = 
    @EnableAutoConfiguration  //开启自动配置
    + @ConponentScan   // 自动查找组件
    + @Configuration  // 允许在context中注册额外的bean或import额外的配置类
```
> 注意，使用@SpringBootApplication 会强制引入这些特性，如果你不想这么做，还是要自己组合

- 例如我们不希望 自动搜索组件
```java
@Configuration
@EnableAutoConfiguration
@Import({ MyConfig.class, MyAnotherConfig.class })
```

## Running Your Application

把真个application打包成一个jar包，使用内置HTTP SERVER 的好处是你可以方便的运行，调试，也不需要其他什么IDE插件

## 开发工具

```xml
<dependencies>
 <dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <optional>true</optional>
 </dependency>
</dependencies>
```
### Property Defaults

spring boot支持的libraries里面由许多支持使用caches来提升性能，例如 模板引擎，spring mvc的一些缓存功能。缓存对生产很有利，但是对开发不方便，因此 spring-boot-devtools默认禁用缓存。

通常缓存设置在 application.properties 文件中，使用开发工具，你可以不用修改配置，开发工具自动禁用缓存。

### 自动重启

发现类路径上的文件改动之后，自动重启

### Logging changes in condition evaluation

默认每次重启应用，都会记录环境报告，可以金庸

### Excluding Resources

可以不把一些内容打包进去，例如 网站的静态资源

### MissionLee 其他不介绍了

-------------------------

## SpringBoot 特性

##  Startup Failure

启动失败的时候，可以看到为什么启动失败

## Customizing the Banner

通过添加 banner.txt 文件到 classpath，可以替换启动 banner

##  Customizing SpringApplication

```java
public static void main(String[] args) {
 SpringApplication app = new SpringApplication(MySpringConfiguration.class);
 app.setBannerMode(Banner.Mode.OFF);
 app.run(args);
}
```
###  Fluent Builder API 流利的创建API

如果想要构建 父/子 层级的ApplicationContext，或者使用 流畅接口（接口字面含义与业务相同之类的叫法），可以使用 SpringApplicationBuilder

通过其链式操作，可以配置父子关系
```java
new SpringApplicationBuilder()
  .sources(Parent.class)
  .child(Application.class)
  .bannerMode(Banner.Mode.OFF)
  .run(args)
```

###  Application Events and Listeners

在需要使用 Spring Framework events的时候，例如 ContextRefreshedEvent， SpringApplication需要发送一些额外的 application events

> Note: 有些事件需要在 ApplicationContext创建之前触发，所以不能通过 @Bean的方法注册listener，可以使用 SpringApplication.addListeners()
```note
如果希望 listener可以自动注册，而不在意applicaiton创建的额方式，你可以添加

 you can add a META-INF/spring.factories file to your project and reference your listener(s) by using the org.springframework.context.ApplicationListener key, as shown in the following example:
org.springframework.context.ApplicationListener=com.example.project.MyListener
```
Application events are sent in the following order, as your application runs:
1. An ApplicationStartingEvent is sent at the start of a run but before any processing, except for the registration of listeners and initializers.
2. An ApplicationEnvironmentPreparedEvent is sent when the Environment to be used in the context is known but before the context is created.
3. An ApplicationPreparedEvent is sent just before the refresh is started but after bean definitions have been loaded.
4. An ApplicationStartedEvent is sent after the context has been refreshed but before any application and command-line runners have been called.
5. An ApplicationReadyEvent is sent after any application and command-line runners have been called. It indicates that the application is ready to service requests.
6. An ApplicationFailedEvent is sent if there is an exception on startup.

###  Web Environment

创建web类型应用的时候，遵循以下原则

• If Spring MVC is present, an AnnotationConfigServletWebServerApplicationContext is used
• If Spring MVC is not present and Spring WebFlux is present, an AnnotationConfigReactiveWebServerApplicationContext is used
• Otherwise, AnnotationConfigApplicationContext is used

###  Accessing Application Arguments 获取应用参数

###  Using the ApplicationRunner or CommandLineRunner

###  Application Exit

###  Admin Features

###  Externalized Configuration

### 省略了一些其他暂时不急着用的

###  Application Property Files

SpringApplication 从以下这些路径尝试加载 application.properties文件

1. A /config subdirectory of the current directory
2. The current directory
3. A classpath /config package
4. The classpath root

The list is ordered by precedence (properties defined in locations higher in the list override those defined in lower locations).

> 注意，由配置参数会影响配置查找

###  Profile-specific Properties

In addition to application.properties files, profile-specific properties can also be defined by using the following naming convention: application-{profile}.properties. 

### Placeholders in Properties
```conf
app.name=MyApp
app.description=${app.name} is a Spring Boot application
```

### 配置参数还有一些其他不常用的内容，没写在这里

###  Type-safe Configuration Properties
```note
Using the @Value("${property}") annotation to inject configuration properties can sometimes be cumbersome, especially if you are working with multiple properties or your data is hierarchical in nature
使用 @Value注入有时候会比较笨重，尤其是要处理的参数多，而且数据本身是带有层级的
```
SpringBoot 提供更好的处理方式
- 具体使用自己再去搜索 ⭐ 不在这里大段粘贴了
- @ConfigurationProperties("acme")
- @EnableConfigurationProperties(AcmeProperties.class)
- @ConfigurationProperties(prefix="acme")

### 还有跟上面这部分相关的内容，也不再粘贴了


## Profiles ： 用于将应用配置区分成不同部分（例如分为 生产/测试）

⭐⭐⭐ 这里应该很好用，但是不是本次看的总店
```java
@Configuration
@Profile("production")
public class ProductionConfiguration {
 // ...
}

```
spring.profiles.active=dev,hsqldb

## Logging

Spring Boot uses Commons Logging for all internal logging but leaves the underlying log implementation open. Default configurations are provided for Java Util Logging, Log4J2, and Logback. In each case, loggers are pre-configured to use console output with optional file output also available.

### 日志等级
```conf
logging.level.root=WARN
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate=ERROR
```
⭐⭐ 日志部分省略很多

## Internationalization

没看

## JSON

## Developing Web Applications

### Spring Web MVC Framework

- 自动配置以下内容

- • Inclusion of ContentNegotiatingViewResolver and BeanNameViewResolver beans.
- • Support for serving static resources, including support for WebJars (covered later in this document)).
- • Automatic registration of Converter, GenericConverter, and Formatter beans.
- • Support for HttpMessageConverters (covered later in this document).
- • Automatic registration of MessageCodesResolver (covered later in this document).
- • Static index.html support.
- • Custom Favicon support (covered later in this document).
- • Automatic use of a ConfigurableWebBindingInitializer bean (covered later in this document).

> 如果你想要保持SpringBootMVC自动配置的东西，并且添加额外的MVC配置（inteceptor，formatter，view controller等），你可以对某个 WebMvcConfigurer添加@Configuration注解，但是⭐不要添加@EnableWebMVc注解。

> If you wish to provide custom instances of RequestMappingHandlerMapping, RequestMappingHandlerAdapter, or ExceptionHandlerExceptionResolver, you can declare a WebMvcRegistrationsAdapter instance to provide such components.

> 如果你希望自己配置整套的SpringMVC ： you can add your own @Configuration annotated with @EnableWebMvc.

更详细内容查看：各种web mvc相关内容
P104 —— P126



## 配置 DataSource

- javax.sql.DataSource

Production database connections can also be auto-configured by using a pooling DataSource. Spring Boot uses the following algorithm for choosing a specific implementation:
1. We prefer HikariCP for its performance and concurrency. If HikariCP is available, we always choose it.
2. Otherwise, if the Tomcat pooling DataSource is available, we use it.
3. If neither HikariCP nor the Tomcat pooling datasource are available and if Commons DBCP2 is available, we use it.
If you use the spring-boot-starter-jdbc or spring-boot-starter-data-jpa “starters”, you automatically get a dependency to HikariCP

DataSource configuration is controlled by external configuration properties in spring.datasource.*. For example, you might declare the following section in application.properties:
spring.datasource.url=jdbc:mysql://localhost/test
spring.datasource.username=dbuser
spring.datasource.password=dbpass
spring.datasource.driver-class-name=com.mysql.jdbc.Driver
Note
You should at least specify the URL by setting the spring.datasource.url property. Otherwise, Spring Boot tries to auto-configure an embedded database.

## NoSQL

### Redis

spring-boot-starter-data-redis 
- 默认 Luttuce链接