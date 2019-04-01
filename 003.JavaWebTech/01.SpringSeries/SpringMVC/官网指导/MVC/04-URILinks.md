# URI Links

Spring 框架操作 URI
## UriComponents
UriComponentsBuilder 负责用URI templates 和一些参数构建 URI
```java
UriComponents uriComponents = UriComponentsBuilder
        .fromUriString("http://example.com/hotels/{hotel}") // URI 模板 
        .queryParam("q", "{q}")   // 添加或者替换URI components
        .encode()  // 将template 和 wariables 编码
        .build(); // build

URI uri = uriComponents.expand("Westin", "123").toUri();  // 转为URI
```
上面这个过程也可以用链式操作完成
```java
URI uri = UriComponentsBuilder
        .fromUriString("http://example.com/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123");
```
也可以把 queryParam写到 template里面
```java
URI uri = UriComponentsBuilder
        .fromUriString("http://example.com/hotels/{hotel}?q={q}")
        .build("Westin", "123");
```
## UriBuilder

UriComponentsBuilder implements UriBuilder. 也可以使用UriBuilderFactory创建一个UriBuilder

UriBuilderFactory和UriBuilder一起提供了一种插件式的使用template构建URI的方法, based on shared configuration, such as a base URL, encoding preferences, and other details.

You can configure `RestTemplate` and `WebClient` with a `UriBuilderFactory` to customize the preparation of URIs.

`DefaultUriBuilderFactory` is a default implementation of `UriBuilderFactory` that uses UriComponentsBuilder internally and exposes shared configuration options.
The following example shows how to configure a RestTemplate:
```java
// import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode;

String baseUrl = "http://example.org";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl);
factory.setEncodingMode(EncodingMode.TEMPLATE_AND_VARIABLES);

RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(factory);
```
The following example configures a WebClient:
```java
// import org.springframework.web.util.DefaultUriBuilderFactory.EncodingMode;

String baseUrl = "http://example.org";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl);
factory.setEncodingMode(EncodingMode.TEMPLATE_AND_VARIABLES);

WebClient client = WebClient.builder().uriBuilderFactory(factory).build();
```
In addition, you can also use DefaultUriBuilderFactory directly. It is similar to using UriComponentsBuilder but, instead of static factory methods, it is an actual instance that holds configuration and preferences, as the following example shows:
```java
String baseUrl = "http://example.com";
DefaultUriBuilderFactory uriBuilderFactory = new DefaultUriBuilderFactory(baseUrl);

URI uri = uriBuilderFactory.uriString("/hotels/{hotel}")
        .queryParam("q", "{q}")
        .build("Westin", "123");
```

## URI Encoding

Spring MVC and Spring WebFlux

UriComponentsBuilder exposes encoding options at two levels:

- UriComponentsBuilder#encode(): Pre-encodes the URI template first and then strictly encodes URI variables when expanded.
- UriComponents#encode(): Encodes URI components after URI variables are expanded.

这两个级别都可以用八位字节替换非ASCII码数值和非法字符. 但是第一个界别同样会转移URI variables里面的这些内容
```note
Consider ";", which is legal in a path but has reserved meaning. The first option replaces ";" with "%3B" in URI variables but not in the URI template. By contrast, the second option never replaces ";", since it is a legal character in a path. 
```

For most cases, the first option is likely to give the expected result, because it treats URI variables as opaque data to be fully encoded, while option 2 is useful only if URI variables intentionally contain reserved characters.

The following example uses the first option:
```java
URI uri = UriComponentsBuilder.fromPath("/hotel list/{city}")
            .queryParam("q", "{q}")
            .encode()
            .buildAndExpand("New York", "foo+bar")
            .toUri();

    // Result is "/hotel%20list/New%20York?q=foo%2Bbar"
```
You can shorten the preceding example by going directly to the URI (which implies encoding), as the following example shows:
```java
URI uri = UriComponentsBuilder.fromPath("/hotel list/{city}")
            .queryParam("q", "{q}")
            .build("New York", "foo+bar")
```
You can shorten it further still with a full URI template, as the following example shows:
```java
URI uri = UriComponentsBuilder.fromPath("/hotel list/{city}?q={q}")
            .build("New York", "foo+bar")
```
The WebClient and the RestTemplate expand and encode URI templates internally through the UriBuilderFactory strategy. Both can be configured with a custom strategy. as the following example shows:
```java
String baseUrl = "http://example.com";
DefaultUriBuilderFactory factory = new DefaultUriBuilderFactory(baseUrl)
factory.setEncodingMode(EncodingMode.TEMPLATE_AND_VALUES);

// Customize the RestTemplate..
RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(factory);

// Customize the WebClient..
WebClient client = WebClient.builder().uriBuilderFactory(factory).build();
```
The DefaultUriBuilderFactory implementation uses UriComponentsBuilder internally to expand and encode URI templates. As a factory, it provides a single place to configure the approach to encoding, based on one of the below encoding modes:

- TEMPLATE_AND_VALUES: Uses UriComponentsBuilder#encode(), corresponding to the first option in the earlier list, to pre-encode the URI template and strictly encode URI variables when expanded.
- VALUES_ONLY: Does not encode the URI template and, instead, applies strict encoding to URI variables through UriUtils#encodeUriUriVariables prior to expanding them into the template.
- URI_COMPONENTS: Uses UriComponents#encode(), corresponding to the second option in the earlier list, to encode URI component value after URI variables are expanded.
- NONE: No encoding is applied.

The RestTemplate is set to `EncodingMode.URI_COMPONENTS` for historic reasons and for backwards compatibility. The WebClient relies on the default value in DefaultUriBuilderFactory, which was changed from `EncodingMode.URI_COMPONENTS` in 5.0.x to `EncodingMode.TEMPLATE_AND_VALUES` in 5.1.

## Relative Servlet Requests
You can use `ServletUriComponentsBuilder` to create URIs relative to the current request, as the following example shows:
```java
HttpServletRequest request = ...

// Re-uses host, scheme, port, path and query string...

ServletUriComponentsBuilder ucb = ServletUriComponentsBuilder.fromRequest(request)
        .replaceQueryParam("accountId", "{id}").build()
        .expand("123")
        .encode();
```
You can create URIs relative to the context path, as the following example shows:
```java
// Re-uses host, port and context path...

ServletUriComponentsBuilder ucb = ServletUriComponentsBuilder.fromContextPath(request)
        .path("/accounts").build()
```
You can create URIs relative to a Servlet (for example, /main/*), as the following example shows:
```java
// Re-uses host, port, context path, and Servlet prefix...

ServletUriComponentsBuilder ucb = ServletUriComponentsBuilder.fromServletMapping(request)
        .path("/accounts").build()
```
```note
As of 5.1, ServletUriComponentsBuilder ignores information from the Forwarded and X-Forwarded-* headers, which specify the client-originated address. Consider using the ForwardedHeaderFilter to extract and use or to discard such headers. 
```

### Links to Controllers

Spring MVC provides a mechanism to prepare links to controller methods. For example, the following MVC controller allows for link creation:
```java
@Controller
@RequestMapping("/hotels/{hotel}")
public class BookingController {

    @GetMapping("/bookings/{booking}")
    public ModelAndView getBooking(@PathVariable Long booking) {
        // ...
    }
}
```
You can prepare a link by referring to the method by name, as the following example shows:

```java
UriComponents uriComponents = MvcUriComponentsBuilder
    .fromMethodName(BookingController.class, "getBooking", 21).buildAndExpand(42);

URI uri = uriComponents.encode().toUri();
```

In the preceding example, we provide actual method argument values (in this case, the long value: 21) to be used as a path variable and inserted into the URL. Furthermore, we provide the value, 42, to fill in any remaining URI variables, such as the hotel variable inherited from the type-level request mapping. If the method had more arguments, we could supply null for arguments not needed for the URL. In general, only @PathVariable and @RequestParam arguments are relevant for constructing the URL.

There are additional ways to use MvcUriComponentsBuilder. For example, you can use a technique akin to mock testing through proxies to avoid referring to the controller method by name, as the following example shows (the example assumes static import of MvcUriComponentsBuilder.on):
```java
UriComponents uriComponents = MvcUriComponentsBuilder
    .fromMethodCall(on(BookingController.class).getBooking(21)).buildAndExpand(42);

URI uri = uriComponents.encode().toUri();
```
Controller method signatures are limited in their design when they are supposed to be usable for link creation with fromMethodCall. Aside from needing a proper parameter signature, there is a technical limitation on the return type (namely, generating a runtime proxy for link builder invocations), so the return type must not be final. In particular, the common String return type for view names does not work here. You should use ModelAndView or even plain Object (with a String return value) instead. 
The earlier examples use static methods in MvcUriComponentsBuilder. Internally, they rely on ServletUriComponentsBuilder to prepare a base URL from the scheme, host, port, context path, and servlet path of the current request. This works well in most cases. However, sometimes, it can be insufficient. For example, you may be outside the context of a request (such as a batch process that prepares links) or perhaps you need to insert a path prefix (such as a locale prefix that was removed from the request path and needs to be re-inserted into links).
For such cases, you can use the static fromXxx overloaded methods that accept a UriComponentsBuilder to use a base URL. Alternatively, you can create an instance of MvcUriComponentsBuilder with a base URL and then use the instance-based withXxx methods. For example, the following listing uses withMethodCall:
```java
UriComponentsBuilder base = ServletUriComponentsBuilder.fromCurrentContextPath().path("/en");
MvcUriComponentsBuilder builder = MvcUriComponentsBuilder.relativeTo(base);
builder.withMethodCall(on(BookingController.class).getBooking(21)).buildAndExpand(42);

URI uri = uriComponents.encode().toUri();
```
As of 5.1, MvcUriComponentsBuilder ignores information from the Forwarded and X-Forwarded-* headers, which specify the client-originated address. Consider using the ForwardedHeaderFilter to extract and use or to discard such headers. 
1.4.6. Links in Views
In views such as Thymeleaf, FreeMarker, or JSP, you can build links to annotated controllers by referring to the implicitly or explicitly assigned name for each request mapping.
Consider the following example:
```java
@RequestMapping("/people/{id}/addresses")
public class PersonAddressController {

    @RequestMapping("/{country}")
    public HttpEntity getAddress(@PathVariable String country) { ... }
}
```
Given the preceding controller, you can prepare a link from a JSP, as follows:

```jsp
<%@ taglib uri="http://www.springframework.org/tags" prefix="s" %>
...
<a href="${s:mvcUrl('PAC#getAddress').arg(0,'US').buildAndExpand('123')}">Get Address</a>
```
The preceding example relies on the mvcUrl function declared in the Spring tag library (that is, META-INF/spring.tld), but it is easy to define your own function or prepare a similar one for other templating technologies.
Here is how this works. On startup, every @RequestMapping is assigned a default name through HandlerMethodMappingNamingStrategy, whose default implementation uses the capital letters of the class and the method name (for example, the getThing method in ThingController becomes "TC#getThing"). If there is a name clash, you can use @RequestMapping(name="..") to assign an explicit name or implement your own HandlerMethodMappingNamingStrategy.