## MVC Config

Same as in Spring WebFlux

The MVC Java configuration and the MVC XML namespace provide default configuration suitable for most applications and a configuration API to customize it.

For more advanced customizations, which are not available in the configuration API, see Advanced Java Config and Advanced XML Config.

You do not need to understand the underlying beans created by the MVC Java configuration and the MVC namespace. If you want to learn more, see Special Bean Types and Web MVC Config.

## Enable MVC Configuration
Same as in Spring WebFlux

In Java configuration, you can use the @EnableWebMvc annotation to enable MVC configuration, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig {
}
```
In XML configuration, you can use the `<mvc:annotation-driven>` element to enable MVC configuration, as the following example shows:
```java
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven/>

</beans>
```

The preceding example registers a number of Spring MVC infrastructure beans and adapts to dependencies available on the classpath (for example, payload converters for JSON, XML, and others).
## MVC Config API
Same as in Spring WebFlux

In Java configuration, you can implement the WebMvcConfigurer interface, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    // Implement configuration methods...
}
```
In XML, you can check attributes and sub-elements of `<mvc:annotation-driven/>`. You can view the [Spring MVC XML schema](https://schema.spring.io/mvc/spring-mvc.xsd) or use the code completion feature of your IDE to discover what attributes and sub-elements are available.

## Type Conversion
Same as in Spring WebFlux

By default formatters, for Number and Date types are installed, including support for the @NumberFormat and @DateTimeFormat annotations. Full support for the Joda-Time formatting library is also installed if Joda-Time is present on the classpath.

In Java configuration, you can register custom formatters and converters, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        // ...
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven conversion-service="conversionService"/>

    <bean id="conversionService"
            class="org.springframework.format.support.FormattingConversionServiceFactoryBean">
        <property name="converters">
            <set>
                <bean class="org.example.MyConverter"/>
            </set>
        </property>
        <property name="formatters">
            <set>
                <bean class="org.example.MyFormatter"/>
                <bean class="org.example.MyAnnotationFormatterFactory"/>
            </set>
        </property>
        <property name="formatterRegistrars">
            <set>
                <bean class="org.example.MyFormatterRegistrar"/>
            </set>
        </property>
    </bean>

</beans>
```
See the FormatterRegistrar SPI and the FormattingConversionServiceFactoryBean for more information on when to use FormatterRegistrar implementations. 
## Validation

Same as in Spring WebFlux

By default, if Bean Validation is present on the classpath (for example, Hibernate Validator), the LocalValidatorFactoryBean is registered as a global Validator for use with @Valid and Validated on controller method arguments.
In Java configuration, you can customize the global Validator instance, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public Validator getValidator(); {
        // ...
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:mvc="http://www.springframework.org/schema/mvc"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <mvc:annotation-driven validator="globalValidator"/>

</beans>
```
Note that you can also register Validator implementations locally, as the following example shows:
```java
@Controller
public class MyController {

    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        binder.addValidators(new FooValidator());
    }

}
```
If you need to have a LocalValidatorFactoryBean injected somewhere, create a bean and mark it with @Primary in order to avoid conflict with the one declared in the MVC configuration. 

## Interceptors

In Java configuration, you can register interceptors to apply to incoming requests, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LocaleChangeInterceptor());
        registry.addInterceptor(new ThemeChangeInterceptor()).addPathPatterns("/**").excludePathPatterns("/admin/**");
        registry.addInterceptor(new SecurityInterceptor()).addPathPatterns("/secure/*");
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:interceptors>
    <bean class="org.springframework.web.servlet.i18n.LocaleChangeInterceptor"/>
    <mvc:interceptor>
        <mvc:mapping path="/**"/>
        <mvc:exclude-mapping path="/admin/**"/>
        <bean class="org.springframework.web.servlet.theme.ThemeChangeInterceptor"/>
    </mvc:interceptor>
    <mvc:interceptor>
        <mvc:mapping path="/secure/*"/>
        <bean class="org.example.SecurityInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```
## Content Types

Same as in Spring WebFlux

You can configure how Spring MVC determines the requested media types from the request (for example, Accept header, URL path extension, query parameter, and others).

By default, the URL path extension is checked first — with json, xml, rss, and atom registered as known extensions (depending on classpath dependencies). The Accept header is checked second.

Consider changing those defaults to Accept header only, and, if you must use URL-based content type resolution, consider using the query parameter strategy over path extensions. See Suffix Match and Suffix Match and RFD for more details.

In Java configuration, you can customize requested content type resolution, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.mediaType("json", MediaType.APPLICATION_JSON);
        configurer.mediaType("xml", MediaType.APPLICATION_XML);
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:annotation-driven content-negotiation-manager="contentNegotiationManager"/>

<bean id="contentNegotiationManager" class="org.springframework.web.accept.ContentNegotiationManagerFactoryBean">
    <property name="mediaTypes">
        <value>
            json=application/json
            xml=application/xml
        </value>
    </property>
</bean>
```
## Message Converters
Same as in Spring WebFlux

You can customize HttpMessageConverter in Java configuration by overriding configureMessageConverters() (to replace the default converters created by Spring MVC) or by overriding extendMessageConverters() (to customize the default converters or add additional converters to the default ones).

The following example adds XML and Jackson JSON converters with a customized ObjectMapper instead of the default ones:
```java
@Configuration
@EnableWebMvc
public class WebConfiguration implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        Jackson2ObjectMapperBuilder builder = new Jackson2ObjectMapperBuilder()
                .indentOutput(true)
                .dateFormat(new SimpleDateFormat("yyyy-MM-dd"))
                .modulesToInstall(new ParameterNamesModule());
        converters.add(new MappingJackson2HttpMessageConverter(builder.build()));
        converters.add(new MappingJackson2XmlHttpMessageConverter(builder.createXmlMapper(true).build()));
    }
}
```
In the preceding example, Jackson2ObjectMapperBuilder is used to create a common configuration for both MappingJackson2HttpMessageConverter and MappingJackson2XmlHttpMessageConverter with indentation enabled, a customized date format, and the registration of jackson-module-parameter-names, Which adds support for accessing parameter names (a feature added in Java 8).

This builder customizes Jackson’s default properties as follows:
- `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES` is disabled.
- `MapperFeature.DEFAULT_VIEW_INCLUSION` is disabled.

It also automatically registers the following well-known modules if they are detected on the classpath:
- `jackson-datatype-jdk7`: Support for Java 7 types, such as java.nio.file.Path.
- `jackson-datatype-joda`: Support for Joda-Time types.
- `jackson-datatype-jsr310`: Support for Java 8 Date and Time API types.
- `jackson-datatype-jdk8`: Support for other Java 8 types, such as Optional.
```note
Enabling indentation with Jackson XML support requires woodstox-core-asl dependency in addition to jackson-dataformat-xml one. 
```

Other interesting Jackson modules are available:
- `jackson-datatype-money`: Support for javax.money types (unofficial module).
- `jackson-datatype-hibernate`: Support for Hibernate-specific types and properties (including lazy-loading aspects).

The following example shows how to achieve the same configuration in XML:
```xml
<mvc:annotation-driven>
    <mvc:message-converters>
        <bean class="org.springframework.http.converter.json.MappingJackson2HttpMessageConverter">
            <property name="objectMapper" ref="objectMapper"/>
        </bean>
        <bean class="org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter">
            <property name="objectMapper" ref="xmlMapper"/>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>

<bean id="objectMapper" class="org.springframework.http.converter.json.Jackson2ObjectMapperFactoryBean"
      p:indentOutput="true"
      p:simpleDateFormat="yyyy-MM-dd"
      p:modulesToInstall="com.fasterxml.jackson.module.paramnames.ParameterNamesModule"/>

<bean id="xmlMapper" parent="objectMapper" p:createXmlMapper="true"/>
```
## View Controllers

This is a shortcut for defining a ParameterizableViewController that immediately forwards to a view when invoked. You can use it in static cases when there is no Java controller logic to execute before the view generates the response.

The following example of Java configuration forwards a request for / to a view called home:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("home");
    }
}
```
The following example achieves the same thing as the preceding example, but with XML, by using the `<mvc:view-controller>` element:
```xml
<mvc:view-controller path="/" view-name="home"/>
```
## View Resolvers
Same as in Spring WebFlux

The MVC configuration simplifies the registration of view resolvers.

The following Java configuration example configures content negotiation view resolution by using JSP and Jackson as a default View for JSON rendering:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.enableContentNegotiation(new MappingJackson2JsonView());
        registry.jsp();
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:view-resolvers>
    <mvc:content-negotiation>
        <mvc:default-views>
            <bean class="org.springframework.web.servlet.view.json.MappingJackson2JsonView"/>
        </mvc:default-views>
    </mvc:content-negotiation>
    <mvc:jsp/>
</mvc:view-resolvers>
```
Note, however, that FreeMarker, Tiles, Groovy Markup, and script templates also require configuration of the underlying view technology.
The MVC namespace provides dedicated elements. The following example works with FreeMarker:
```xml
<mvc:view-resolvers>
    <mvc:content-negotiation>
        <mvc:default-views>
            <bean class="org.springframework.web.servlet.view.json.MappingJackson2JsonView"/>
        </mvc:default-views>
    </mvc:content-negotiation>
    <mvc:freemarker cache="false"/>
</mvc:view-resolvers>

<mvc:freemarker-configurer>
    <mvc:template-loader-path location="/freemarker"/>
</mvc:freemarker-configurer>
```
In Java configuration, you can add the respective Configurer bean, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        registry.enableContentNegotiation(new MappingJackson2JsonView());
        registry.freeMarker().cache(false);
    }

    @Bean
    public FreeMarkerConfigurer freeMarkerConfigurer() {
        FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
        configurer.setTemplateLoaderPath("/freemarker");
        return configurer;
    }
}
```
## Static Resources
Same as in Spring WebFlux

This option provides a convenient way to serve static resources from a list of Resource-based locations.
In the next example, given a request that starts with /resources, the relative path is used to find and serve static resources relative to /public under the web application root or on the classpath under /static. The resources are served with a one-year future expiration to ensure maximum use of the browser cache and a reduction in HTTP requests made by the browser. The Last-Modified header is also evaluated and, if present, a 304 status code is returned.

The following listing shows how to do so with Java configuration:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
            .addResourceLocations("/public", "classpath:/static/")
            .setCachePeriod(31556926);
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:resources mapping="/resources/**"
    location="/public, classpath:/static/"
    cache-period="31556926" />
```
See also HTTP caching support for static resources.
The resource handler also supports a chain of ResourceResolver implementations and ResourceTransformer implementations, which you can use to create a toolchain for working with optimized resources.
You can use the VersionResourceResolver for versioned resource URLs based on an MD5 hash computed from the content, a fixed application version, or other. A ContentVersionStrategy (MD5 hash) is a good choice — with some notable exceptions, such as JavaScript resources used with a module loader.

The following example shows how to use VersionResourceResolver in Java configuration:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/resources/**")
                .addResourceLocations("/public/")
                .resourceChain(true)
                .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
    }
}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:resources mapping="/resources/**" location="/public/">
    <mvc:resource-chain>
        <mvc:resource-cache/>
        <mvc:resolvers>
            <mvc:version-resolver>
                <mvc:content-version-strategy patterns="/**"/>
            </mvc:version-resolver>
        </mvc:resolvers>
    </mvc:resource-chain>
</mvc:resources>
```
You can then use ResourceUrlProvider to rewrite URLs and apply the full chain of resolvers and transformers — for example, to insert versions. The MVC configuration provides a ResourceUrlProvider bean so that it can be injected into others. You can also make the rewrite transparent with the ResourceUrlEncodingFilter for Thymeleaf, JSPs, FreeMarker, and others with URL tags that rely on HttpServletResponse#encodeURL.

Note that, when using both EncodedResourceResolver (for example, for serving gzipped or brotli-encoded resources) and VersionedResourceResolver, you must register them in this order. That ensures content-based versions are always computed reliably, based on the unencoded file.

WebJars is also supported through WebJarsResourceResolver and is automatically registered when org.webjars:webjars-locator is present on the classpath. The resolver can re-write URLs to include the version of the jar and can also match to incoming URLs without versions — for example, /jquery/jquery.min.js to /jquery/1.2.0/jquery.min.js.

## Default Servlet

Spring MVC allows for mapping the DispatcherServlet to / (thus overriding the mapping of the container’s default Servlet), while still allowing static resource requests to be handled by the container’s default Servlet. It configures a DefaultServletHttpRequestHandler with a URL mapping of /** and the lowest priority relative to other URL mappings.

This handler forwards all requests to the default Servlet. Therefore, it must remain last in the order of all other URL HandlerMappings. That is the case if you use `<mvc:annotation-driven>`. Alternatively, if you set up your own customized HandlerMapping instance, be sure to set its order property to a value lower than that of the DefaultServletHttpRequestHandler, which is Integer.MAX_VALUE.

The following example shows how to enable the feature by using the default setup:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }
}
```
The following example shows how to achieve the same configuration in XML:

`<mvc:default-servlet-handler/>`

The caveat to overriding the / Servlet mapping is that the RequestDispatcher for the default Servlet must be retrieved by name rather than by path. The DefaultServletHttpRequestHandler tries to auto-detect the default Servlet for the container at startup time, using a list of known names for most of the major Servlet containers (including Tomcat, Jetty, GlassFish, JBoss, Resin, WebLogic, and WebSphere). If the default Servlet has been custom-configured with a different name, or if a different Servlet container is being used where the default Servlet name is unknown, then you must explicitly provide the default Servlet’s name, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable("myCustomDefaultServlet");
    }

}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:default-servlet-handler default-servlet-name="myCustomDefaultServlet"/>
```
## Path Matching

Same as in Spring WebFlux

You can customize options related to path matching and treatment of the URL. For details on the individual options, see the PathMatchConfigurer javadoc.

The following example shows how to customize path matching in Java configuration:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer
            .setUseSuffixPatternMatch(true)
            .setUseTrailingSlashMatch(false)
            .setUseRegisteredSuffixPatternMatch(true)
            .setPathMatcher(antPathMatcher())
            .setUrlPathHelper(urlPathHelper())
            .addPathPrefix("/api",
                    HandlerTypePredicate.forAnnotation(RestController.class));
    }

    @Bean
    public UrlPathHelper urlPathHelper() {
        //...
    }

    @Bean
    public PathMatcher antPathMatcher() {
        //...
    }

}
```
The following example shows how to achieve the same configuration in XML:
```xml
<mvc:annotation-driven>
    <mvc:path-matching
        suffix-pattern="true"
        trailing-slash="false"
        registered-suffixes-only="true"
        path-helper="pathHelper"
        path-matcher="pathMatcher"/>
</mvc:annotation-driven>

<bean id="pathHelper" class="org.example.app.MyPathHelper"/>
<bean id="pathMatcher" class="org.example.app.MyPathMatcher"/>
```
## Advanced Java Config
Same as in Spring WebFlux

`@EnableWebMvc` imports `DelegatingWebMvcConfiguration`, which:
- Provides default Spring configuration for Spring MVC applications
- Detects and delegates to WebMvcConfigurer implementations to customize that configuration.

For advanced mode, you can remove @EnableWebMvc and extend directly from DelegatingWebMvcConfiguration instead of implementing WebMvcConfigurer, as the following example shows:
```java
@Configuration
public class WebConfig extends DelegatingWebMvcConfiguration {

    // ...

}
```
You can keep existing methods in WebConfig, but you can now also override bean declarations from the base class, and you can still have any number of other WebMvcConfigurer implementations on the classpath.

## Advanced XML Config

`The MVC namespace does not have an advanced mode`. If you need to customize a property on a bean that you cannot change otherwise, you can use the BeanPostProcessor lifecycle hook of the Spring ApplicationContext, as the following example shows:
```java
@Component
public class MyPostProcessor impleme[nts BeanPostProcessor {

    public Object postProcessBeforeInitialization(Object bean, String name) throws BeansException {
        // ...
    }
}
```
Note that you need to declare MyPostProcessor as a bean, either explicitly in XML or by letting it be detected through a `<component-scan/>` declaration.