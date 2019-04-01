## CORS

Same as in Spring WebFlux

Spring MVC lets you handle CORS (Cross-Origin Resource Sharing). This section describes how to do so.
## Introduction

Same as in Spring WebFlux

出于安全原因，浏览器禁止对当前源外的资源进行AJAX调用。 例如，您可以将您的银行帐户放在一个标签页中，将evil.com放在另一个标签页中。 来自evil.com的脚本不应该使用您的凭据向您的银行API发出AJAX请求 - 例如从您的帐户中提取资金！


Cross-Origin Resource Sharing (CORS) is a W3C specification implemented by most browsers that lets you specify what kind of cross-domain requests are authorized, rather than using less secure and less powerful workarounds based on IFRAME or JSONP.

## Processing

Same as in Spring WebFlux

对于 preflight/simple/actual request，CORS有不同的表现。 To learn how CORS works, you can read this article, among many others, or see the specification for more details.

Spring MVC里面 HandlerMapping实现类提供了内只的CORS支持. 当成功的把request映射到 handler上，HandlerMapping implementation检查 CORS配置，以此决定下一步的动作

Preflight request会被直接接受，simple 和 actual 的CORS请求会被拦截，检测，并且配置response headers set

为了支持corss-origin请求(that is, the Origin header is present and differs from the host of the request), 需要对CORS进行明确的配置. 如果没有匹配到的CORS配置, preflight requests 会被拒绝. 这样 CORS header配置就不会被加到 simple/actual请求对应的 response里面，浏览器就会 reject。

通过匹配URL,可以对handlerMapping定制 CORS. 

通常，使用 java configuration 或 xml namespace来声明这些 mapping（CORS 与 url之间），这样就可以配置一个通用的mapping了

You can combine global CORS configuration at the HandlerMapping level with more fine-grained, handler-level CORS configuration. For example, annotated controllers can use class- or method-level @CrossOrigin annotations (other handlers can implement CorsConfigurationSource).
The rules for combining global and local configuration are generally additive — for example, all global and all local origins. For those attributes where only a single value can be accepted (such as allowCredentials and maxAge), the local overrides the global value. See CorsConfiguration#combine(CorsConfiguration) for more details.
```java
To learn more from the source or make advanced customizations, check the code behind:
CorsConfiguration
CorsProcessor, DefaultCorsProcessor
AbstractHandlerMapping
```
## @CrossOrigin
Same as in Spring WebFlux

The @CrossOrigin annotation enables cross-origin requests on annotated controller methods, as the following example shows:
```java
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin
    @GetMapping("/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```
By default, @CrossOrigin allows:
- All origins.
- All headers.
- All HTTP methods to which the controller method is mapped.

allowedCredentials is not enabled by default, since that establishes a trust level that exposes sensitive user-specific information (such as cookies and CSRF tokens) and should only be used where appropriate.

maxAge is set to 30 minutes.

@CrossOrigin is supported at the class level, too, and is inherited by all methods, as the following example shows:
```java
@CrossOrigin(origins = "http://domain2.com", maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @GetMapping("/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```
You can use @CrossOrigin at both the class level and the method level, as the following example shows:
```java
@CrossOrigin(maxAge = 3600)
@RestController
@RequestMapping("/account")
public class AccountController {

    @CrossOrigin("http://domain2.com")
    @GetMapping("/{id}")
    public Account retrieve(@PathVariable Long id) {
        // ...
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {
        // ...
    }
}
```
## Global Configuration
Same as in Spring WebFlux

In addition to fine-grained, controller method level configuration, you probably want to define some global CORS configuration, too. You can set URL-based CorsConfiguration mappings individually on any HandlerMapping. Most applications, however, use the MVC Java configuration or the MVC XNM namespace to do that.

By default, global configuration enables the following:
- All origins.
- All headers.
- GET, HEAD, and POST methods.

allowedCredentials is not enabled by default, since that establishes a trust level that exposes sensitive user-specific information (such as cookies and CSRF tokens) and should only be used where appropriate.

maxAge is set to 30 minutes.

>Java Configuration

Same as in Spring WebFlux

To enable CORS in the MVC Java config, you can use the CorsRegistry callback, as the following example shows:
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/api/**")
            .allowedOrigins("http://domain2.com")
            .allowedMethods("PUT", "DELETE")
            .allowedHeaders("header1", "header2", "header3")
            .exposedHeaders("header1", "header2")
            .allowCredentials(true).maxAge(3600);

        // Add more mappings...
    }
}
```
> XML Configuration
To enable CORS in the XML namespace, you can use the `<mvc:cors>` element, as the following example shows:
```java
<mvc:cors>

    <mvc:mapping path="/api/**"
        allowed-origins="http://domain1.com, http://domain2.com"
        allowed-methods="GET, PUT"
        allowed-headers="header1, header2, header3"
        exposed-headers="header1, header2" allow-credentials="true"
        max-age="123" />

    <mvc:mapping path="/resources/**"
        allowed-origins="http://domain1.com" />

</mvc:cors>
```
## CORS Filter

Same as in Spring WebFlux

You can apply CORS support through the built-in CorsFilter.
```note
If you try to use the CorsFilter with Spring Security, keep in mind that Spring Security has built-in support for CORS.
```

To configure the filter, pass a CorsConfigurationSource to its constructor, as the following example shows:
```java
CorsConfiguration config = new CorsConfiguration();

// Possibly...
// config.applyPermitDefaultValues()

config.setAllowCredentials(true);
config.addAllowedOrigin("http://domain1.com");
config.addAllowedHeader("*");
config.addAllowedMethod("*");

UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
source.registerCorsConfiguration("/**", config);

CorsFilter filter = new CorsFilter(source);
```