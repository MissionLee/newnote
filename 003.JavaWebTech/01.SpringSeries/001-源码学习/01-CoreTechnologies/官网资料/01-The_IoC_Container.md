# Spring Core Technologies

- 1. The IoC Container / Inversion Of Control 反转控制 = Dependency jnjection DI 
- 此章节包含Spring框架对IoC原理的实现，IoC也被称为DI。当对象仅仅通过1.构造参数，2.工厂方法参数，3.构造后或由工厂方法返回后通过属性设置，定义其依赖（其工作所需的其他对象）的时候。容器会在创建bean的时候注入这些依赖。与bean自己通过创建类控制依赖的实例，或者用一些诸如服务定位器之类的机制控制实例相比，这是一个完全相反的过程（因此成为反转控制-IoC）
  - 1.1. Introduction to the Spring IoC Container and Beans
    - IOC容器的基础包
      - org.springframework.beans
      - org.springframework.context
    - BeanFactory为object的获取提供了进一步的配置机制
    - ApplicationContext是BeanFactory的子接口，在下面几个方面进行了优化
      - 方便与与Spring AOP特性整合
      - 消息资源处理（国际化）
      - 事件发布
      - 应用层特化的Contexts，例如web应用中的WebApplicationContext
    - 简而言之，BeanFactory提供了框架配置与基础功能，ApplicationContext添加了特化功能，ApplicationContext是BeanFactory的超集。在本章中，我们仅以ApplicationContext代指IoC容器。
    - Spring中把那些在容器中管理的对于项目起到基石作用的objects成为bean。
      - Bean就是哪些被容器实例化，组装或者管理的object。
      - Bean还有他们之间的依赖关系被反映在勇气使用的配置元数据中
  - 1.2. Container Overview
    - org.springframework.context.ApplicationContext接口时IoC容器的代表：创建，配置，组装beans。容器通过解析配置元数据的得知如何创建/配置/组装一个bean。配置元数据，来自配置文件，注解或者代码。你可以用这些方式来描述你的应用中的object，还有这些object之间大量的依赖关系。
    - Spring中提供了好些ApplicationContext的实现
      - ClassPathXmlApplicationContext
      - FileSystemXmlApplicationContext
      - XML是一种很传统的配置方式，你也可以用少量的XML配置来激活框架对于注解 和 代码配置方式支持。
      - 多数应用场景中，不需要直接使用代码来创建容器
        - 例如：web应用，在web.xml中添加几行配置就可以了
      - 下图展示了Spring的工作模式，通过配置元数据组织应用中的classes。当ApplicationContext创建后，你就获取了一个配置好的可执行的系统
  - 1.3. Bean Overview
    - IoC容器管理beans.
    - 在容器中，这些bean以 BeanDefinition objects的形式存储起来，其中包含这些元数据
      - 全限定类名（通常是正在定义的类的实现）
      - bean的行为配置元素，说明bean在容器中的行为方式（范围，生命周期的回调等）
      - 对于其他bean的引用。这些引用也被称为协作者或者依赖
      - 其他用来设置创建新object的参数——例如连接池链接数
    - 除了通过上述这些信息创建的bean，ApplicationContext同样接受用户从外部注册bean。
    - NamingBeans
      - 每个bean都可以由数个 identifiers。这些identifiers必须在当前container中unique。一个bean通常只有一个identifier。但是如果需要多个，那么多出来的就被称作aliases
      - 在XML中，可以使用 `id` ， `name` 属性来区分bean。
        - id 是唯一标识符 与 bean 一对一关系
        - name 按照惯例，用字母组成（允许用字符），可以用 , 半角 ; 空格来分隔多个name
        - ⭐ id 和 name都不是必须的。
        - @Bean注解以提供id name的支持
    - Instantiating Beans
      - bean definition就像是创建bean的菜谱。需要使用这个（name对应的）bean的时候，就按照菜谱做一个
      - 如果使用xml来配置，需要提供 type 或者 class（必须）。
        - 通常要指定bean的class从而让container可以直接通过反射创建，这跟我们用new创建差不多
        - 指定想要创建的class的工厂静态方法，这种情况比较少见到，容器通过调用一个class提供的静态工厂方法创建一个bean。
          - 工厂方法可能返回的是自身实例，也可能返回其他类的实例
        - 方法1：通过构造创建
          - 如果原本你要创建的类使用构造方法创建的，你不需要实现什么指定接口就可以把他交由spring容器来管理了
          - 有时候，一些特定的IoC容器可能要求至少包含一个空构造
          - 容器实际上可以管理任何class，不一定是true javabean。
            - 多数用户倾向于使用actual javaBean,并且只有一个默认的无参构造外加一些getter，setter方法。
            - 容器实际上也可以管理非标准bean形式的class，例如你需要一个并不符合当前JavaBean规范的连接池。Spring也可以管理
        - 方法2：通过静态工厂方法
          - 当定义一个原本是通过工厂静态方法创建的类的时候，你需要指定工厂的类，还有创建实例的方法名称。也要提供这个方法所需的参数。
          - 通过调用这个方法，可以获得一个object——对于object来说，实际上就是调用了其构造函数
        - 方法3：使用实例工厂方法
          - 类似于使用静态工厂方法，只是这种情况下我们要指定容器需要创建的factorybean，并且这个factorybean应该是在容器中可以找到实例的。
  - 1.4. Dependencies
    - Dependency Injection依赖注入是当一个object用构造函数（工厂方法/或者通过set方法）获取他的依赖。创建的时候，容器来提供这些依赖。
    - 使用 依赖注入，代码可以变得简洁，耦合度能够降低。
    - obejct不用自己去查找以来的位置，或者要创建一个什么样的依赖。
    - 同时，测试工作也变得更加简单，尤其是一来是基于接口或者抽象类的时候。
    - DI由两种主要变种
      - Constructor-based dependency injection
        - 容器调用构造方法，提供各个依赖参数，调用静态工厂方法实际上类似。
        - 构造器参数的处理方法
          - 如果构造方法参数定义顺序，和bean definition中没有起义，构造器就会很自然的正常调用
          - 基础类型就不是很好控制了，需要我们提供一些帮助
          ```xml
          <bean id="exampleBean" class="examples.ExampleBean">
              <constructor-arg type="int" value="7500000"/>
              <constructor-arg type="java.lang.String" value="42"/>
          </bean>
          <!-- 或者 -->
          <bean id="exampleBean" class="examples.ExampleBean">
              <constructor-arg index="0" value="7500000"/>
              <constructor-arg index="1" value="42"/>
          </bean>
          <!-- 或者 -->
          <bean id="exampleBean" class="examples.ExampleBean">
              <constructor-arg name="years" value="7500000"/>
              <constructor-arg name="ultimateAnswer" value="42"/>
          </bean>
          ```
      - Setter-based dependency injection
        - 只有setter方法进行注.这个class必须是(?)POJO
    - ApplicationContext中用这两种都可以，甚至可以同时使用。
      - 用BeanDefinition定义好了依赖，然后用一个PropertyEditor把属性改成其他的
        - 但是多数Spring用户在变成的时候不会直接使用这些class，而是使用xml bean顶柜，带有注解的组件（@Component @Controller），或者@Bean的方法，基于Java的@Configuration类，然后这些源在内部转换为BeanDefinition实例，并假造到SpringIoC容器中
      - 正因为可以结合使用这两种方法，有一条很有用的经验发法则⭐⭐：
        - 1用构造方法配置必要的依赖
        - 2用setter注入可选的依赖
        - 在setter上使用 @Required注解，可以把这个property变成required依赖
        - Spring团队比较推荐构造器注入，他能让你的应用的组成不变，确保需要的依赖都不是null，此外构造器注入的组件在被代码使用的时候，可以保证已经被完整的初始u啊过了。
          - 另外：构造器的参数过多是一种糟糕的代码风格，如果出现这种情况应该尝试去改进这部分代码
        - setter注入应该仅用于可选项注入（这些内容应该有由默认值），或者代码内部由 not-null检测
      - Dependency Resolution Process⭐⭐⭐⭐
        - ApplicationContext初始化，并通过xml，java code，annotations获取元数据
        - 每个bean的依赖用属性都是构造参数，工厂方法参数之类的形式，bean创建的时候，提供这些依赖
        - 每个property或者构造参数要么是一个确定之，要么只想container中的其他bean
        - 每个property或者构造参数都被转换成了真正需要的类型。默认情况下，Spring可以把string类型的值转为基本类型
      - 容器创建后，Spring会检测每个bean的configuratino。但是只有bean真正创建的时候，才会去set这些bean properties。单例和预初始化的bean会在容器创建后就船创建出来。
        - 注意：解析错误只有在真正第一次创建bean的时候才能被发现
      - 🔺🔺🔺🔺🔺 原文这里对各种情况举例子，这里就没做翻译
        - 各种注入的例子
        - 懒加载什么的
  - 1.5. Bean Scopes
    - bean definition就像是菜谱，定义一次，代码中所有需要用的地方都按照这个配方使用
    - 你逼近可以控制创建一个object的依赖和配置值，还可以控制从特定bean创建的对象的范围（Scope 模式？）
      - Spring框架支持6种帆威，如果使用web的ApplicationContext，由四种选择
      - singleton
        - (Default) Scopes a single bean definition to a single object instance for each Spring IoC container.
        - 全局唯一
      - prototype
        - Scopes a single bean definition to any number of object instances.
        - 全局新建
        - ⭐⭐ 这种模式下，Spring并不去监控bean的完整生命周期，当Spring创建好了bean交给用户之后，就不管这个了。
          - 这也意味着 销毁方法不会被调用
          - 客户端也要自己负责销毁bean
            - 如果想让Spring回收资源，需要使用 bean post-processor
        - 另外：Singleton Beans with Prototype-bean Dependencies
          - 给单例注入prototype bean也是遵循新建一个的原则，并且注入只发生在创建的时候，如果你想在运行时改变这个依赖，需要通过 method injection
      - 下面四个都是 web-aware，非web情况下如果用了会报错
      - request
        - Scopes a single bean definition to the lifecycle of a single HTTP request. That is, each HTTP request has its own instance of a bean created off the back of a single bean definition. Only valid       - in the context of a web-aware Spring ApplicationContext.
      - session
        - Scopes a single bean definition to the lifecycle of an HTTP Session. Only valid in the context of a web-aware Spring ApplicationContext.
      - application
        - Scopes a single bean definition to the lifecycle of a ServletContext. Only valid in the context of a web-aware Spring ApplicationContext.
      - websocket
        - Scopes a single bean definition to the lifecycle of a WebSocket. Only valid in the context of a web-aware Spring ApplicationContext.
      - Initial Web Configuration
        - 为了支持上诉四个scope，有一些次要条件要满足
        - 如何完成初始化设置与你所使用的Servlet环境有关
        - 如果在Spring WebMVC环境下（在调用DispatcherServlet里面的request的时候），没有什么需要特别设置的
        - 如果在Servlet2.5web container中，request在DispatcherServlet管辖之外（例如你再正式用JSF，Struts），你需要注册一个 RequestContextListener，ServletRequestListener；在Servlet3.0+可以用实现WebAplicationInitializer接口。或者用在web.xml里添加listener：RequestContextListener
        - ⭐ DispatcherServlet, RequestContextListener, and RequestContextFilter 都在做同一件事：把HTTP 请求对象绑定到接受这个请求的Thread里
      - Scoped Beans as Dependencies⭐⭐⭐⭐
        - 容器不光创建bean，同样也位置依赖之间的联系，如果你需要向一个长期存在的scope里面注入一个request-scoped，这时候你需要诸如一个AOP proxy来作为代替。代理和被代理的scoped object要实现同样的interface，并且把方法调用转交给real object
      - 配置
      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <beans xmlns="http://www.springframework.org/schema/beans"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:aop="http://www.springframework.org/schema/aop"
          xsi:schemaLocation="http://www.springframework.org/schema/beans
              http://www.springframework.org/schema/beans/spring-beans.xsd
              http://www.springframework.org/schema/aop
              http://www.springframework.org/schema/aop/spring-aop.xsd">

          <!-- an HTTP Session-scoped bean exposed as a proxy -->
          <bean id="userPreferences" class="com.something.UserPreferences"      scope="session">
              <!-- instructs the container to proxy the surrounding bean -->
              <aop:scoped-proxy/> 
          </bean>

          <!-- a singleton-scoped bean injected with a proxy to the above bean      -->
          <bean id="userService" class="com.something.SimpleUserService">
              <!-- a reference to the proxied userPreferences bean -->
              <property name="userPreferences" ref="userPreferences"/>
          </bean>
      </beans>
      ```
      - Choosing the Type of Proxy to Create
        - By default, when the Spring container creates a proxy for a bean that is marked up with the` <aop:scoped-proxy/>` element, a CGLIB-based class proxy is created.
        - 默认情况，让其使用cglib创建代理
      - 🔺 自定义scope没有在这里记录
  - 1.6. Customizing the Nature of a Bean
    - Spring框架提供了许多接口服务于bean
    - 如果你想interact容器对于bean的生命管理，可以实现Spring的Initializingbean 与 DisposableBean接口。容器会在afterProertiesSet()调用前者，在destory()中调用后者
    - Lifecycle Callbacks 中还有很多介绍在这里没说的
    - ApplicationContextAware and BeanNameAware
      - ⭐⭐⭐⭐ ApplicationContextAware interface
        - 实现这个接口，就可以在代码里面操作bean所处的ApplicationConetxt
        - ApplicationContext发现bean实现了这个接口，就会把自身的引用传递给这个bean
        - Spring2.5中 autowiring 提供了另一种方式来访问ApplicationContext.传统的构造器与按照类型的自动装配模式可以通过构造器或者setter方式。
          - 为了获取更大的flexibility，宝矿自动装配字段和多参数方法的能力，我们可以用新的基于注解的自动装配机制。
          - 如果你使用了这个方式来注入，ApplicationContext会自动注入到对应的field/constructor argument/method parameter在内的任何需要ApplicationContext的地方，只要这些地方需要ApplicationContext并且由@Autowired方法
        - BeanNameAware 接口。类似上面，能过去BeanName
        - 其他还有一些 Aware 类型的Interfaces，都能方便再代码中获取Spring的组件
  - 1.7. Bean Definition Inheritance
    - bean definition 可以包含许多配置信息。Spring的bean定义也支持继承机制
  - 1.8. Container Extension Points
    - 对Container进行扩展：通常情况下开发者不需要创建ApplicationContext的subclass，通常，使用SpringIoC container的插件的实现类就可以了
      - BeanPostProcessor
      - BeanFactoryPostProcessor
      - FactoryBean
      - 没有细看
  - 1.9. Annotation-based Container Configuration
    - 使用注解进行配置：注解或者xml没有绝对的优劣之分，主要还是看具体使用。  
    - @Required 标记在setter方法上，表示这是必填项
    - @Autowired 可以注解构造方法，setter方法，普通方法，field，甚至是要求容器把所有对应类型的bean都注入进来（例如用 @Autowired 注解某个类型的数组，容器类）
      - 如果你希望能够自动装备，但是不装配也可以，那么可以配合@Nullable使用
    - @Primary： 因为按照类型的自动注解可能会有很多可选的实际注入对象，我们可以用@Primary来表示在同类型中，优先注入这个。（xml配置里面也可以用 primary=true属性）
    - @Qualifier：@Primary是一种处理由多个候选者情况的好的方法。如果你需要更进一步的控制，可以用@Qualifier。加载filed上 ，参数上都可以。用的地方的qualifier与定义时候的qualifier对应上
      - bean name会被定义为default qualifier value，因此，用id来代替qualifier name也能成功匹配
      - 尽管可以用 这些方式来匹配，@Autowired 最底层是使用 type-driven（先通过类型匹配出所有可能的候选者） 然后再配以各种语义匹配。⭐⭐ 这就意味着，你所有的匹配都失败了，最终还可以使用类型匹配
    - 如果形参或者field的名字 和 bean name匹配，也能成功注入
        - 这样意味着：如果你打算通过name来注入，不要首选@Autowired，用@Resource注解——指定使用name进行匹配
        - 如果要注入的内容本身是 Map，array之类的，@Resource显然更好用
        - 还有一些特性，不在这里全都写了
        - @Autowired可以注解 fields，constructors，multi-argument methods,但是@Resource只能用在 fields，setter方法上。
        - Spring的@Qualifier可以配合自定义注解进行增强 🔺 不展开了
    - 泛型也可以作为 自动注入的qualifier：接口时泛型的，实例bean时某个类型，注入的时候时可以匹配实际类型的
    - CustomAutowireConfigurer： 这是一个 BeanFactoryPostProcessor，不展开讲了，走读代码的时候看
    - @Resource 默认情况用名称匹配，field 名或者参数名会被作为默认名称
    - @PostConstruct & @PreDestroy
      - CommonAnnotationBeanPostProcessor不知认识@Resource注解，同时也是别这两个。这个Processor注册到ApplicationContext里面，会在生命过程中调用对应的方法的
  - 1.10. Classpath Scanning and Managed Components
    - 上面提到的大多是用xml的配置，或者以xml为主，注解辅助的bean definition。
    - Spring还提供一种通过扫描类路径来发现组件的方式。这让我们可以脱离xml完成bean definition。
    - @Component 和其他注解
      - @Respository注解用于满足 对repository的role 或 stereotype的注解（DAO层注解）
      - @Component @Service @Controller :@Component时Spring组件的基础注解，@Respository @Service @Controller都是对@Component在特定场合的特例。所以可以用@Component注解所有的组件。但是如果使用其他的几个，就能够适配Spring提供的其他便捷用法。并且这些注解在之后的Spring版本中，还会开发更多功能。
    - Meta-annotations and Composed Annotations
      - Spring提供的许多注解可以当作 meta-annotation使用——注解其他注解
        - @Conponent 是用 @Service 元注释的
      - 注释组合： @RestController = @Controller + @ResponseBody
      - 组合注释有时候提供重定义 meta-annotations的功能。
        - @SessionScope注释将作用域名称硬编码为session，但仍然允许定制proxyMode
    - 自动查询/注册bean definition
      - 对@Configuration类加上@ComponentScan 或者在 xml里面配置 component-scan（component-scan 会默认开启 annotation-config）
        - 使用component-scan之后，会自动加载 AutowiredAnnotationBeanPostProcessor 和 CommonAnnotationBeanPostProcessor
    - 默认情况扫包会扫 @Component @Respository @Service @Controller这几个，也可以自定义配置，或者配置正则进行匹配
    - 在@Component类里面 也可以用 @Bean 提供Bean 
    - 自动扫描也可以由名字 例如： @Service("myService")
      - 上面提到的四个注解都有 value属性，spring会把他们作为name（默认的NameGenerator时这么做的，也可以自定义nameGenertor）
    - Providing a Scope for Autodetected Components
    - Providing Qualifier Metadata with Annotations
    - Generating an Index of Candidate Components
  - 1.11. Using JSR 330 Standard Annotations
    - Spring支持JSR 330系列Annotations， 引入 javax.inject包，尝试使用这些标准注解代替Spring注解
  - 1.12. Java-based Container Configuration
    - 用java代码配置容器
    - 需要这两个注解 @Configuration注解class + @Bean注解方法
      - @Bean ： 作用就像xml里面的bean节点，@Bean也可以用在@Component系列里面，但是通常还是放在@Configuration里面
      - @Configuration：表示这里配置的主要是 bean definition
      - 如果@Bean 不是出现在@Configuration里面，例如出现在@Component里面，甚至是一个普通类里面，这种情况被称为 ‘lite’模式
        - lite模式下，无法声明（使用）bean之间的依赖（注入）。
          - 但是有一些问题：当我们使用@Bean注解在例如@Component作用的class里面时，将会发生一种称之为注解@Bean的lite mode出现，这种不会使用CGLIB代理.所以只要我在@Bean修饰的方法之间不相互编码调用，代码将会很好的运作.
          下面是@Bean的lite mode示例：
          - 
          ```java
              @Component
              public class ConfigInComponent {
              
                  @Bean
                  public SimpleBean simpleBean() {
                      return new SimpleBean();
                  }

                  @Bean
                  public SimpleBeanConsumer simpleBeanConsumer() {
                      return new SimpleBeanConsumer(simpleBean());
                  }
              }

          //上述代码在new SimpleBeanConsumer(simpleBean())这一步实例化bean时，不会将第一          步@Bean实例化的bean自动注入到simpleBeanConsumerbean中，而是重新用simpleBean()         ，生成一个新的SimpleBean 实例.而@Configuration则不会发生上述情况,代码如下：
              @Configuration
              public class ConfigInConfiguration {
              
                  @Bean
                  public SimpleBean simpleBean() {
                      return new SimpleBean();
                  }

                  @Bean
                  public SimpleBeanConsumer simpleBeanConsumer() {
                      return new SimpleBeanConsumer(simpleBean());
                  }
              }

          //要改善上述问题，可以通过以下方式实现：
              @Component
              public class ConfigInComponent {
              
                  @Autowired
                  SimpleBean simpleBean;

                  @Bean
                  public SimpleBean simpleBean() {
                      return new SimpleBean();
                  }

                  @Bean
                  public SimpleBeanConsumer simpleBeanConsumer() {
                      return new SimpleBeanConsumer(simpleBean);
                  }
              }

          //通过将@Bean生成的bean Autowired到属性上，并在@Bean实例化          SimpleBeanConsumerbean时传入此属性，来达到目的.
          ```
    - Instantiating the Spring Container by Using AnnotationConfigApplicationContext
      - 例如：
      ```java
      public static void main(String[] args) {
        // 构造的时候，可以加入多个类
          ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
          MyService myService = ctx.getBean(MyService.class);
          myService.doStuff();
      }
      // 或者用下面这种方法
      public static void main(String[] args) {
          AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
          ctx.register(AppConfig.class, OtherConfig.class);
          ctx.register(AdditionalConfig.class);
          ctx.refresh();
          MyService myService = ctx.getBean(MyService.class);
          myService.doStuff();
      }
      ```
      - 这种模式下对web application的支持
      ```xml
        <web-app>
        <!-- Configure ContextLoaderListener to use AnnotationConfigWebApplicationContext instead of the default XmlWebApplicationContext -->
        <context-param>
            <param-name>contextClass</param-name>
            <param-value>
                org.springframework.web.context.support.AnnotationConfigWebApplicationContext
            </param-value>
        </context-param>
        <!-- Configuration locations must consist of one or more comma- or space-delimited fully-qualified @Configuration classes. Fully-qualified packages may also be   specified for component-scanning -->
        <context-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>com.acme.AppConfig</param-value>
        </context-param>
        <!-- Bootstrap the root application context as usual using ContextLoaderListener -->
        <listener>
            <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
        </listener>
        <!-- Declare a Spring MVC DispatcherServlet as usual -->
        <servlet>
            <servlet-name>dispatcher</servlet-name>
            <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
            <!-- Configure DispatcherServlet to use AnnotationConfigWebApplicationContext
                instead of the default XmlWebApplicationContext -->
            <init-param>
                <param-name>contextClass</param-name>
                <param-value>
                    org.springframework.web.context.support.AnnotationConfigWebApplicationContext
                </param-value>
            </init-param>
            <!-- Again, config locations must consist of one or more comma- or space-delimited
                and fully-qualified @Configuration classes -->
            <init-param>
                <param-name>contextConfigLocation</param-name>
                <param-value>com.acme.web.MvcConfig</param-value>
            </init-param>
        </servlet>
        <!-- map all requests for /app/* to the dispatcher servlet -->
        <servlet-mapping>
            <servlet-name>dispatcher</servlet-name>
            <url-pattern>/app/*</url-pattern>
        </servlet-mapping>
        </web-app>
        ```
      - Bean上面也能写更多的内容，例如 initMethod之类的
  - 1.13. Environment Abstraction
     - Environment接口时对容器的两个关键点的描述： profile 与 properties
       - profile 是对注册到容器中的bean的逻辑分组
       - properties 包含许多资源 ，配置文件，jvm系统参数，操作系统参数，jndi，servlet context parameters，ad-hoc peroperties object，map等等
  - 1.14. Registering a LoadTimeWeaver
    - 在类加载到jvm的时候，动态的改变他们
    - 对Spring jpa support很有用
    - Load-time Weaving with AspectJ in Spring Framework
  - 1.15. Additional Capabilities of the ApplicationContext
    - 很多特性，后面了解一下
  - 1.16. The BeanFactory

  https://docs.spring.io/spring-framework/docs/current/spring-framework-reference/core.html#beans