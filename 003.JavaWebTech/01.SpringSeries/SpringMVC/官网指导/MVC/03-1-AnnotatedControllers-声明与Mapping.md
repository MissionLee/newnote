# Annotated Controllers

Spring MVC 提供注解实现Controller，可以用来实现 request mappings/ request input / exception handing 等等

通过这些注解，我们不必局限于method的signatures 也不用继承某个class或者实现某个interface
```java
@Controller
public class HelloController {

    @GetMapping("/hello")
    public String handle(Model model) {
        model.addAttribute("message", "Hello World!");
        return "index";
    }
}
```

## Declaration

可以通过常规的 bean 定义方式在 Servlet的WebApplication里面声明Controller

也可以通过 自动检测 组件的形式查找到

```java
@Configuration
@ComponentScan("org.example.web")
public class WebConfig {

    // ...
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:p="http://www.springframework.org/schema/p"
    xmlns:context="http://www.springframework.org/schema/context"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="org.example.web"/>

    <!-- ... -->

</beans>
```

- @RestController
  - 这是个组合注解
  - @Controller + @ResponseBody

> AOP Proxies

有时候可能需要用 AOP proxy 装饰 controller。 

例如： 如果你在controller上面直接使用 @Transactional 注解，推荐使用 class-based proxying。 这也是默认的。但是如果controller一定要继承或者实现某个 非 Spring Context callback体系（InitializingBean ， *Aware 或者其他什么）的内容，就必须使用 class-based proxying.

例如： 如果配置了 `<tx:annotation-driver>` 改为： `<tx:annotation-driven proxy-target-class="true"/>`

⭐⭐ 上面这段官网的说明，看的我一脸懵逼，说法太拗口了

实际上这是一个 基于类代理，基于接口代理的参数
- true 基于类
- false （JDK基于接口代理）

实际上我自己的项目用了 AOP代理模块代理（@Aspect） Controller里的方法（把返回内容封装成标准格式）

## Request Mapping
@RequestMapping:
- @GetMapping
- @PostMapping
- @PutMapping
- @DeleteMapping
- @PatchMapping

The shortcuts are Custom Annotations that are provided because, arguably, most controller methods should be mapped to a specific HTTP method versus using @RequestMapping, which, by default, matches to all HTTP methods. At the same, a @RequestMapping is still needed at the class level to express shared mappings.

The following example has type and method level mappings:
```java
@RestController
@RequestMapping("/persons")
class PersonController {

    @GetMapping("/{id}")
    public Person getPerson(@PathVariable Long id) {
        // ...
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void add(@RequestBody Person person) {
        // ...
    }
}
```
> URI patterns
Same as in Spring WebFlux

You can map requests by using the following global patterns and wildcards:

- ? matches one character

- * matches zero or more characters within a path segment

- ** match zero or more path segments

You can also declare URI variables and access their values with @PathVariable, as the following example shows:
```java
@GetMapping("/owners/{ownerId}/pets/{petId}")
public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
    // ...
}
```
You can declare URI variables at the class and method levels, as the following example shows:
```java
@Controller
@RequestMapping("/owners/{ownerId}")
public class OwnerController {

    @GetMapping("/pets/{petId}")
    public Pet findPet(@PathVariable Long ownerId, @PathVariable Long petId) {
        // ...
    }
}
```
URI variables are automatically converted to the appropriate type, or TypeMismatchException is raised. Simple types (int, long, Date, and so on) are supported by default and you can register support for any other data type. See Type Conversion and DataBinder.

You can explicitly name URI variables (for example, @PathVariable("customId")), but you can leave that detail out if the names are the same and your code is compiled with debugging information or with the -parameters compiler flag on Java 8.

The syntax {varName:regex} declares a URI variable with a regular expression that has syntax of {varName:regex}. For example, given URL "/spring-web-3.0.5 .jar", the following method extracts the name, version, and file extension:
```java
@GetMapping("/{name:[a-z-]+}-{version:\\d\\.\\d\\.\\d}{ext:\\.[a-z]+}")
public void handle(@PathVariable String version, @PathVariable String ext) {
    // ...
}
```
URI path patterns can also have embedded ${…​} placeholders that are resolved on startup by using PropertyPlaceHolderConfigurer against local, system, environment, and other property sources. You can use this, for example, to parameterize a base URL based on some external configuration.

Spring MVC uses the PathMatcher contract and the AntPathMatcher implementation from spring-core for URI path matching.
> Pattern Comparison

Same as in Spring WebFlux

When multiple patterns match a URL, they must be compared to find the best match. This is done by using AntPathMatcher.getPatternComparator(String path), which looks for patterns that are more specific.

A pattern is less specific if it has a lower count of URI variables (counted as 1), single wildcards (counted as 1), and double wildcards (counted as 2). Given an equal score, the longer pattern is chosen. Given the same score and length, the pattern with more URI variables than wildcards is chosen.

The default mapping pattern (/**) is excluded from scoring and always sorted last. Also, prefix patterns (such as /public/**) are considered less specific than other pattern that do not have double wildcards.

For the full details, see AntPatternComparator in AntPathMatcher and also keep mind that you can customize the PathMatcher implementation. See Path Matching in the configuration section.

> Suffix Match
By default, Spring MVC performs .* suffix pattern matching so that a controller mapped to /person is also implicitly mapped to /person.*. The file extension is then used to interpret the requested content type to use for the response (that is, instead of the Accept header) — for example, /person.pdf, /person.xml, and others.

Using file extensions in this way was necessary when browsers used to send Accept headers that were hard to interpret consistently. At present, that is no longer a necessity and using the Accept header should be the preferred choice.

Over time, the use of file name extensions has proven problematic in a variety of ways. It can cause ambiguity when overlain with the use of URI variables, path parameters, and URI encoding. Reasoning about URL-based authorization and security (see next section for more details) also become more difficult.

To completely disable the use of file extensions, you must set both of the following:

- useSuffixPatternMatching(false), see PathMatchConfigurer

- favorPathExtension(false), see ContentNegotiationConfigurer

URL-based content negotiation can still be useful (for example, when typing a URL in a browser). To enable that, we recommend a query parameter-based strategy to avoid most of the issues that come with file extensions. Alternatively, if you must use file extensions, consider restricting them to a list of explicitly registered extensions through the mediaTypes property of ContentNegotiationConfigurer.

> Suffix Match and RFD
A reflected file download (RFD) attack is similar to XSS in that it relies on request input (for example, a query parameter and a URI variable) being reflected in the response. However, instead of inserting JavaScript into HTML, an RFD attack relies on the browser switching to perform a download and treating the response as an executable script when double-clicked later.

In Spring MVC, @ResponseBody and ResponseEntity methods are at risk, because they can render different content types, which clients can request through URL path extensions. Disabling suffix pattern matching and using path extensions for content negotiation lower the risk but are not sufficient to prevent RFD attacks.

To prevent RFD attacks, prior to rendering the response body, Spring MVC adds a Content-Disposition:inline;filename=f.txt header to suggest a fixed and safe download file. This is done only if the URL path contains a file extension that is neither whitelisted nor explicitly registered for content negotiation. However, it can potentially have side effects when URLs are typed directly into a browser.

Many common path extensions are whitelisted by default. Applications with custom HttpMessageConverter implementations can explicitly register file extensions for content negotiation to avoid having a Content-Disposition header added for those extensions. See Content Types.

See CVE-2015-5211 for additional recommendations related to RFD.

> Consumable Media Types
Same as in Spring WebFlux

You can narrow the request mapping based on the Content-Type of the request, as the following example shows:
```java
@PostMapping(path = "/pets", consumes = "application/json") 
public void addPet(@RequestBody Pet pet) {
    // ...
}
```
Using a consumes attribute to narrow the mapping by the content type.
The consumes attribute also supports negation expressions — for example, !text/plain means any content type other than text/plain.

You can declare a shared consumes attribute at the class level. Unlike most other request-mapping attributes, however, when used at the class level, a method-level consumes attribute overrides rather than extends the class-level declaration.

MediaType provides constants for commonly used media types, such as APPLICATION_JSON_VALUE and APPLICATION_XML_VALUE.
> Producible Media Types
Same as in Spring WebFlux

You can narrow the request mapping based on the Accept request header and the list of content types that a controller method produces, as the following example shows:
```java
@GetMapping(path = "/pets/{petId}", produces = "application/json;charset=UTF-8") 
@ResponseBody
public Pet getPet(@PathVariable String petId) {
    // ...
}
```
Using a produces attribute to narrow the mapping by the content type.
The media type can specify a character set. Negated expressions are supported — for example, !text/plain means any content type other than "text/plain".

For the JSON content type, the UTF-8 charset should be specified even if RFC7159 clearly states that “no charset parameter is defined for this registration”, because some browsers require it to correctly interpret UTF-8 special characters.
You can declare a shared produces attribute at the class level. Unlike most other request-mapping attributes, however, when used at the class level, a method-level produces attribute overrides rather than extends the class-level declaration.

MediaType provides constants for commonly used media types, such as APPLICATION_JSON_UTF8_VALUE and APPLICATION_XML_VALUE.
> Parameters, headers
Same as in Spring WebFlux

You can narrow request mappings based on request parameter conditions. You can test for the presence of a request parameter (myParam), for the absence of one (!myParam), or for a specific value (myParam=myValue). The following example shows how to test for a specific value:
```java
@GetMapping(path = "/pets/{petId}", params = "myParam=myValue") 
public void findPet(@PathVariable String petId) {
    // ...
}
```
Testing whether myParam equals myValue.
You can also use the same with request header conditions, as the following example shows:
```java
@GetMapping(path = "/pets", headers = "myHeader=myValue") 
public void findPet(@PathVariable String petId) {
    // ...
}
```
Testing whether myHeader equals myValue.
You can match Content-Type and Accept with the headers condition, but it is better to use consumes and produces instead.
> HTTP HEAD, OPTIONS
Same as in Spring WebFlux

@GetMapping (and @RequestMapping(method=HttpMethod.GET)) support HTTP HEAD transparently for request mapping. Controller methods do not need to change. A response wrapper, applied in javax.servlet.http.HttpServlet, ensures a Content-Length header is set to the number of bytes written (without actually writing to the response).

@GetMapping (and @RequestMapping(method=HttpMethod.GET)) are implicitly mapped to and support HTTP HEAD. An HTTP HEAD request is processed as if it were HTTP GET except that, instead of writing the body, the number of bytes are counted and the Content-Length header is set.

By default, HTTP OPTIONS is handled by setting the Allow response header to the list of HTTP methods listed in all @RequestMapping methods that have matching URL patterns.

For a @RequestMapping without HTTP method declarations, the Allow header is set to GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS. Controller methods should always declare the supported HTTP methods (for example, by using the HTTP method specific variants: @GetMapping, @PostMapping, and others).

You can explicitly map the @RequestMapping method to HTTP HEAD and HTTP OPTIONS, but that is not necessary in the common case.

> Custom Annotations
Same as in Spring WebFlux

Spring MVC supports the use of composed annotations for request mapping. Those are annotations that are themselves meta-annotated with @RequestMapping and composed to redeclare a subset (or all) of the @RequestMapping attributes with a narrower, more specific purpose.

@GetMapping, @PostMapping, @PutMapping, @DeleteMapping, and @PatchMapping are examples of composed annotations. They are provided because, arguably, most controller methods should be mapped to a specific HTTP method versus using @RequestMapping, which, by default, matches to all HTTP methods. If you need an example of composed annotations, look at how those are declared.

Spring MVC also supports custom request-mapping attributes with custom request-matching logic. This is a more advanced option that requires subclassing RequestMappingHandlerMapping and overriding the getCustomMethodCondition method, where you can check the custom attribute and return your own RequestCondition.

> Explicit Registrations
Same as in Spring WebFlux

You can programmatically register handler methods, which you can use for dynamic registrations or for advanced cases, such as different instances of the same handler under different URLs. The following example registers a handler method:
```java
@Configuration
public class MyConfig {

    @Autowired
    public void setHandlerMapping(RequestMappingHandlerMapping mapping, UserHandler handler) 
            throws NoSuchMethodException {

        RequestMappingInfo info = RequestMappingInfo
                .paths("/user/{id}").methods(RequestMethod.GET).build(); 

        Method method = UserHandler.class.getMethod("getUser", Long.class); 

        mapping.registerMapping(info, handler, method); 
    }

}
```
Inject the target handler and the handler mapping for controllers.
Prepare the request mapping meta data.
Get the handler method.
Add the registration.