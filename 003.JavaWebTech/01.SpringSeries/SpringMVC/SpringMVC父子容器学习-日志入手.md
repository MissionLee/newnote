#

看日志里面的注释就可以了 ！！

扩展： 003.JavaWebTech\98.MissionLeeWebDemo\07.父子容器.md

在之前的父子容器研究的时候，分析（参考其他文章看到）出来，Spring 提供的 listener 加载 root application 的配置文件，作为DispatcherServlet 容器的父容器， 今天看了一下日志，验证了以下思路

```bash
##############  这一句日志是 org.springframework.web.context.ContextLoaderListener 源码里面打印的（extend ContextLoader）
00:07:15d [RMI TCP Connection(2)-127.0.0.1] INFO   o.s.w.c.ContextLoader                - Root WebApplicationContext: initialization started
2019-03-27 00:07:15,556 RMI TCP Connection(2)-127.0.0.1 DEBUG AsyncLogger.ThreadNameStrategy=UNCACHED (user specified null, default is UNCACHED)
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.w.c.s.XmlWebApplicationContext   - Refreshing Root WebApplicationContext
############   ContextLoaderListener 加载了 applicationContext.xml
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.b.f.x.XmlBeanDefinitionReader    - Loaded 0 bean definitions from URL [file:/C:/Users/Administrator/IdeaProjects/SpringMVCWebApplicationV0.2/target/SpringMVCWebApplication/WEB-INF/classes/web/applicationContext.xml]
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.u.c.s.UiApplicationContextUtils  - Unable to locate ThemeSource with name 'themeSource': using default [org.springframework.ui.context.support.ResourceBundleThemeSource@76760607]
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [java:comp/env/spring.liveBeansView.mbeanDomain]
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.j.JndiLocatorDelegate            - Converted JNDI name [java:comp/env/spring.liveBeansView.mbeanDomain] not found - trying original name [spring.liveBeansView.mbeanDomain]. javax.naming.NameNotFoundException: Name [spring.liveBeansView.mbeanDomain] is not bound in this Context. Unable to find [spring.liveBeansView.mbeanDomain].
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [spring.liveBeansView.mbeanDomain]
00:07:15d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.j.JndiPropertySource             - JNDI lookup for name [spring.liveBeansView.mbeanDomain] threw NamingException with message: Name [spring.liveBeansView.mbeanDomain] is not bound in this Context. Unable to find [spring.liveBeansView.mbeanDomain].. Returning null.
00:07:16d [RMI TCP Connection(2)-127.0.0.1] INFO   o.s.w.c.ContextLoader                - Root WebApplicationContext initialized in 442 ms
00:07:16d [RMI TCP Connection(2)-127.0.0.1] DEBUG  o.s.w.f.CharacterEncodingFilter      - Filter 'characterEncodingFilter' configured for use
[2019-03-27 12:07:16,149] Artifact SpringMVCWebApplicationDemo:war exploded: Artifact is deployed successfully
[2019-03-27 12:07:16,149] Artifact SpringMVCWebApplicationDemo:war exploded: Deploy took 7,976 milliseconds
27-Mar-2019 00:07:18.009 信息 [Catalina-utility-1] org.apache.catalina.startup.HostConfig.deployDirectory 部署 web 应用程序目录 [C:\Program Files\Tomcat\apache-tomcat-9.0.14\webapps\manager]
27-Mar-2019 00:07:20.168 信息 [Catalina-utility-1] org.apache.jasper.servlet.TldScanner.scanJars 至少有一个JAR被扫描用于TLD但尚未包含TLD。 为此记录器启用调试日志记录，以获取已扫描但未在其中找到TLD的完整JAR列表。 在扫描期间跳过不需要的JAR可以缩短启动时间和JSP编译时间。
27-Mar-2019 00:07:20.178 信息 [Catalina-utility-1] org.apache.catalina.startup.HostConfig.deployDirectory Deployment of web application directory [C:\Program Files\Tomcat\apache-tomcat-9.0.14\webapps\manager] has finished in [2,170] ms
############# 这里初始化一个 DispatcherServlet
00:11:34d [http-nio-8080-exec-5] INFO   o.s.w.s.DispatcherServlet            - Initializing Servlet 'limage-dispatcher'
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [java:comp/env/spring.profiles.active]
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiLocatorDelegate            - Converted JNDI name [java:comp/env/spring.profiles.active] not found - trying original name [spring.profiles.active]. javax.naming.NameNotFoundException: Name [spring.profiles.active] is not bound in this Context. Unable to find [spring.profiles.active].
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [spring.profiles.active]
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiPropertySource             - JNDI lookup for name [spring.profiles.active] threw NamingException with message: Name [spring.profiles.active] is not bound in this Context. Unable to find [spring.profiles.active].. Returning null.
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [java:comp/env/spring.profiles.default]
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiLocatorDelegate            - Converted JNDI name [java:comp/env/spring.profiles.default] not found - trying original name [spring.profiles.default]. javax.naming.NameNotFoundException: Name [spring.profiles.default] is not bound in this Context. Unable to find [spring.profiles.default].
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [spring.profiles.default]
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiPropertySource             - JNDI lookup for name [spring.profiles.default] threw NamingException with message: Name [spring.profiles.default] is not bound in this Context. Unable to find [spring.profiles.default].. Returning null.
00:11:34d [http-nio-8080-exec-5] DEBUG  o.s.w.c.s.XmlWebApplicationContext   - Refreshing WebApplicationContext for namespace 'limage-dispatcher-servlet'
00:11:35d [http-nio-8080-exec-5] DEBUG  o.s.c.a.ClassPathBeanDefinitionScanner - Identified candidate component class: file [C:\Users\Administrator\IdeaProjects\SpringMVCWebApplicationV0.2\target\SpringMVCWebApplication\WEB-INF\classes\pers\missionlee\web\mvc\limage\GalleryController.class]
00:11:35d [http-nio-8080-exec-5] DEBUG  o.s.c.a.ClassPathBeanDefinitionScanner - Identified candidate component class: file [C:\Users\Administrator\IdeaProjects\SpringMVCWebApplicationV0.2\target\SpringMVCWebApplication\WEB-INF\classes\pers\missionlee\web\mvc\limage\GalleryServiceImpl.class]
00:11:35d [http-nio-8080-exec-5] DEBUG  o.s.c.a.ClassPathBeanDefinitionScanner - Identified candidate component class: file [C:\Users\Administrator\IdeaProjects\SpringMVCWebApplicationV0.2\target\SpringMVCWebApplication\WEB-INF\classes\pers\missionlee\web\mvc\limage\configuration\JsonResponseFactoryConfiguration.class]
00:11:35d [http-nio-8080-exec-5] DEBUG  o.s.c.a.ClassPathBeanDefinitionScanner - Identified candidate component class: file [C:\Users\Administrator\IdeaProjects\SpringMVCWebApplicationV0.2\target\SpringMVCWebApplication\WEB-INF\classes\pers\missionlee\web\mvc\limage\monitor\AopHandlerProcessor.class]
#############   这个DispatcherServlet 从 对应的配置xml里面解析了 11个bean （实际上我实在xml里面配置了componentScan，然后扫描到了11个配置）
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.x.XmlBeanDefinitionReader    - Loaded 11 bean definitions from class path resource [limage/limage-dispatcher-servlet.xml]
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'org.springframework.context.annotation.internalConfigurationAnnotationProcessor'
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'org.springframework.context.event.internalEventListenerProcessor'
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'org.springframework.context.event.internalEventListenerFactory'
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'org.springframework.context.annotation.internalAutowiredAnnotationProcessor'
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'org.springframework.context.annotation.internalCommonAnnotationProcessor'
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'org.springframework.aop.config.internalAutoProxyCreator'
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.u.c.s.UiApplicationContextUtils  - Unable to locate ThemeSource with name 'themeSource': using default [org.springframework.ui.context.support.DelegatingThemeSource@5e2fff7c]
00:11:36d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'galleryController'
00:11:37d [http-nio-8080-exec-5] DEBUG  o.s.a.a.a.ReflectiveAspectJAdvisorFactory - Found AspectJ method: public java.lang.Object pers.missionlee.web.mvc.limage.monitor.AopHandlerProcessor.controllerMonitor(org.aspectj.lang.ProceedingJoinPoint)
00:11:37d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'responseFactory'
00:11:37d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'jsonResponseFactoryConfiguration'
00:11:37d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'galleryService'
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/C:/Users/Administrator/IdeaProjects/SpringMVCWebApplicationV0.2/target/SpringMVCWebApplication/WEB-INF/lib/log4j-slf4j-impl-2.10.0.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/C:/Users/Administrator/IdeaProjects/SpringMVCWebApplicationV0.2/target/SpringMVCWebApplication/WEB-INF/lib/slf4j-log4j12-1.7.6.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.apache.logging.slf4j.Log4jLoggerFactory]
00:11:37d [http-nio-8080-exec-5] INFO   p.m.w.m.l.GalleryServiceImpl         - init artistInfos & artworkInfos
00:12:08d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'aopHandlerProcessor'
00:12:08d [http-nio-8080-exec-5] DEBUG  o.s.b.f.s.DefaultListableBeanFactory - Creating shared instance of singleton bean 'mvcCorsConfigurations'
00:12:08d [http-nio-8080-exec-5] DEBUG  o.s.w.s.m.m.a.RequestMappingHandlerMapping - 4 mappings in 'org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping'
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.w.s.m.m.a.RequestMappingHandlerAdapter - ControllerAdvice beans: none
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.w.s.m.m.a.ExceptionHandlerExceptionResolver - ControllerAdvice beans: none
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [java:comp/env/spring.liveBeansView.mbeanDomain]
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiLocatorDelegate            - Converted JNDI name [java:comp/env/spring.liveBeansView.mbeanDomain] not found - trying original name [spring.liveBeansView.mbeanDomain]. javax.naming.NameNotFoundException: Name [spring.liveBeansView.mbeanDomain] is not bound in this Context. Unable to find [spring.liveBeansView.mbeanDomain].
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiTemplate                   - Looking up JNDI object with name [spring.liveBeansView.mbeanDomain]
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.j.JndiPropertySource             - JNDI lookup for name [spring.liveBeansView.mbeanDomain] threw NamingException with message: Name [spring.liveBeansView.mbeanDomain] is not bound in this Context. Unable to find [spring.liveBeansView.mbeanDomain].. Returning null.
00:12:09d [http-nio-8080-exec-5] DEBUG  o.s.w.s.DispatcherServlet            - enableLoggingRequestDetails='false': request parameters and headers will be masked to prevent unsafe logging of potentially sensitive data
00:12:09d [http-nio-8080-exec-5] INFO   o.s.w.s.DispatcherServlet            - Completed initialization in 34799 ms
```