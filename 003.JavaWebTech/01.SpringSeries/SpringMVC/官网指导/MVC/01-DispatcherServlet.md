# DispatcherServlet

> Dispatcher : 调度/发报机/收发

- DispatcherServlet（调度Servlet）和普通的Servlet一样，需要在web.xml里面声明/映射。
- DispatcherServlet 通过Spring自身的配置对下面的组件进行管理（包括 请求映射，视图处理，错误处理等等）

## 使用 类/xml 文件配置 DispatcherServlet的方法

- 这是一个使用java配置注册和初始化DispatcherServlet的例子
  - [原理在这里，挺有意思的](../../WebApplicationInitializer.md)
- WebApplicationInitializer 是 web
```java
// 
public class MyWebApplicationInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletCxt) {

        // Load Spring web application configuration
        AnnotationConfigWebApplicationContext ac = new AnnotationConfigWebApplicationContext();
        ac.register(AppConfig.class);
        ac.refresh();

        // Create and register the DispatcherServlet
        DispatcherServlet servlet = new DispatcherServlet(ac);
        ServletRegistration.Dynamic registration = servletCxt.addServlet("app", servlet);
        registration.setLoadOnStartup(1);
        registration.addMapping("/app/*");
    }
}
```

```xml
<web-app>

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/app-context.xml</param-value>
    </context-param>

    <servlet>
        <servlet-name>app</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value></param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>app</servlet-name>
        <url-pattern>/app/*</url-pattern>
    </servlet-mapping>

</web-app>
```

## Context Hierarchy 上下文层级

- 配置 DispatcherServlet需要一个 WebApplicationContext （applicationContext扩展）来完成自己的配置
  - `WebApplicationContext` WebApplicationContext有一个指向ServletContext的链接以及与之关联的Servlet。 它还绑定到ServletContext，以便应用程序可以在RequestContextUtils上使用静态方法，以便在需要访问WebApplicationContext时查找它。

对于很多应用，只有一个 WebApplicationContext是相对简单便捷的，但是也有可能存在一个 root WebApplicationContext 被多个DispatcherServlet（或Servlet）公用。

root层级通常放一些基础bean，例如数据库，事务服务之类的。

![](./res/mvc-context-hierarchy.png)

> 下面是配置 带有层级的 上下文的方法

- 代码配置
```java
public class MyWebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class<?>[] { RootConfig.class };
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[] { App1Config.class };
    }

    @Override
    protected String[] getServletMappings() {
        return new String[] { "/app1/*" };
    }
}
```

- xml配置方法
```xml
<web-app>

    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/root-context.xml</param-value>
    </context-param>

    <servlet>
        <servlet-name>app1</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>/WEB-INF/app1-context.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>

    <servlet-mapping>
        <servlet-name>app1</servlet-name>
        <url-pattern>/app1/*</url-pattern>
    </servlet-mapping>

</web-app>
```

## Special Bean Types

DispatcherServlet 需要委托（代表？）几个特定的bean来处理请求/返回。

这里所说的特殊的bean都是Spring框架下的Bean。这些Bean一般有默认实现，不过我们可以设置其参数，或者 extend/replace


- HandlerMapping

把请求映射到处理器上，同时完成 interceptor操作。映射操作基于一些规则（根据不同的实现，有一些差距）

两个主要实现：

> RequestMappingHandlerMapping( 通过 @RequestMapping 注解方法来实现)

> SimpleUrlHandlerMapping （不怎么用）
Map a request to a handler along with a list of interceptors for pre- and post-processing. The mapping is based on some criteria, the details of which vary by HandlerMapping implementation.

The two main HandlerMapping implementations are RequestMappingHandlerMapping (which supports @RequestMapping annotated methods) and SimpleUrlHandlerMapping (which maintains explicit registrations of URI path patterns to handlers).

- HandlerAdapter

帮助DispatcherServlet调用映射到 request上的handler（代理执行，不用在乎handler具体是怎么调用的）

例如：处理注解开发的Controller的时候，要去解析注解，DispatcherServlet不用知道具体怎么解析的

Help the DispatcherServlet to invoke a handler mapped to a request, regardless of how the handler is actually invoked. For example, invoking an annotated controller requires resolving annotations. The main purpose of a HandlerAdapter is to shield the DispatcherServlet from such details.

- HandlerExceptionResolver

处理错误的解决方案，可能把他们映射到Handler，或者错误页面html views，或者其他什么

Strategy to resolve exceptions, possibly mapping them to handlers, to HTML error views, or other targets. See Exceptions.

- ViewResolver

Resolve logical String-based view names returned from a handler to an actual View with which to render to the response. See View Resolution and View Technologies.

- LocaleResolver, LocaleContextResolver

Resolve the Locale a client is using and possibly their time zone, in order to be able to offer internationalized views. See Locale.

- ThemeResolver

Resolve themes your web application can use — for example, to offer personalized layouts. See Themes.

- MultipartResolver

处理一些Multi-part相关的工作，比如上传文件

Abstraction for parsing a multi-part request (for example, browser form file upload) with the help of some multipart parsing library. See Multipart Resolver.

- FlashMapManager

Store and retrieve the “input” and the “output” FlashMap that can be used to pass attributes from one request to another, usually across a redirect. See Flash Attributes.

## Web MVC Config

Application 可以声明上面介绍的基础bean （Special bean ）。DispatcherServlet 会在WebApplicatoinContext里面寻找这些bean，如果没有匹配的选项，会使用默认值 DispatcherServlet.properties

> 这个配置文件和 DispatcherServlet在同一个包里面

```conf
# Default implementation classes for DispatcherServlet's strategy interfaces.
# Used as fallback when no matching beans are found in the DispatcherServlet context.
# Not meant to be customized by application developers.

org.springframework.web.servlet.LocaleResolver=org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver

org.springframework.web.servlet.ThemeResolver=org.springframework.web.servlet.theme.FixedThemeResolver

org.springframework.web.servlet.HandlerMapping=org.springframework.web.servlet.handler.BeanNameUrlHandlerMapping,\
	org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping,\
	org.springframework.web.servlet.function.support.RouterFunctionMapping

org.springframework.web.servlet.HandlerAdapter=org.springframework.web.servlet.mvc.HttpRequestHandlerAdapter,\
	org.springframework.web.servlet.mvc.SimpleControllerHandlerAdapter,\
	org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter,\
	org.springframework.web.servlet.function.support.HandlerFunctionAdapter


org.springframework.web.servlet.HandlerExceptionResolver=org.springframework.web.servlet.mvc.method.annotation.ExceptionHandlerExceptionResolver,\
	org.springframework.web.servlet.mvc.annotation.ResponseStatusExceptionResolver,\
	org.springframework.web.servlet.mvc.support.DefaultHandlerExceptionResolver

org.springframework.web.servlet.RequestToViewNameTranslator=org.springframework.web.servlet.view.DefaultRequestToViewNameTranslator

org.springframework.web.servlet.ViewResolver=org.springframework.web.servlet.view.InternalResourceViewResolver

org.springframework.web.servlet.FlashMapManager=org.springframework.web.servlet.support.SessionFlashMapManager
```

