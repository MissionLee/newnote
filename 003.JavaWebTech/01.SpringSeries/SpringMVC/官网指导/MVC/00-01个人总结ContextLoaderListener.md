
https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html

# Spring MVC

- Dispatcher / DispatcherServlet
  - tomcat把请求交给 Spring的 DispatcherServlet (可以指定一个url，也可以直接配置成 / 这样就作为默认Servlet了)
  - DispatcherServlet 自己维护一个 url mapping
    - 可以理解为： ServletPath 与 Controller中的 RequestMapping内容匹配
  - 配置 DispatcherServlet的方法有两个
    - 在 web.xml里面配置
      - 对应一个DispatcherServlet 也要配置自己的dispatcher-servlet.xml文件
    - 用Java配置
      - 实现 WebApplicationInitializer接口
      - tomcat根据 java标准，会用SPI机制调用这个WebApplicationInitializer实现对 DispatcherServlet的配置

- Context Hierarchy 上下文层级  /  ContextLoaderListener`[如果有]` -> 负责初始化父容器
  - 扩展的说一下，Web容器是真正的全局上下文环境=> ServletContaienr
  - Spring的 ContextLoaderListener 实现了ServletContextListener
    - ⭐⭐ 配置了 SpringContextLoaderListener 才有 ROOT WebApplicationContext
    - ServletContextListener 接口作用就是当其所在的 servlet context发生变化的时候，会通知这个接口（chu'fa'shi'jian）
    - 直接说一下其中实现的一个方法 contextInitialized
      - 当容器的ServletContext初始化之后 （ServletContext全局唯一）
        - tomcat里面是： org.apache.catalina.core.ApplicationContext implements ServletContext 
        - ⭐⭐⭐ 另外tomcat对于request  response的实现
          - org.apache.catalina.connector.Request
          - org.apache.catalina.connector.Response
      - 首先判断当前被初始化的ServletContext是否有`WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE` 这个 attribute
        - 如果已经有了，说明可能配置了多个 ContextLoader* (在web.xml里面)
        - ⭐ 从这里结合平时的经验可以知道
          - 容器(tomcat)负责创建 Request对象，request对象里面有 getServletContext方法
          - 获取ServletContext之后，就可以获取 对应的 Spring上下文了
      - 如果没有，继续后续操作
      - 首先判断自己的context （this.context 自己就是 root WebApplicationContext） 是否存在  
        - 不存在就初始化自己
          - 创建 WebApplicationContext
            - 从当前 ServletContext 获取其参数 contextClass
              - 这个参数写的应该是一个类的全限定名
            - 如果有这个参数，加载对应的类，如果没有这个参数，加载 XmlWebApplicationContext
          - 配置这个WebApplicationContext
            - 尝试从 servlet参数里面赵 configurationLoaction参数，作为参数地址
            - 首先 查找所有 ApplicationContextInitializer 并调用这些 ApplicationContextInitializer对 WebApplicationContext进行配置
            - 配置完了调用WebApplicationContext 的 refresh方法
              - 以： XmlWebApplication为例，会去找xml配置文件，并初始化自己
                - 默认配置文件是：public static final String DEFAULT_CONFIG_LOCATION = "/WEB-INF/applicationContext.xml";

