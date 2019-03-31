## Exceptions
Same as in Spring WebFlux

@Controller and @ControllerAdvice classes can have @ExceptionHandler methods to handle exceptions from controller methods, as the following example shows:
```java
@Controller
public class SimpleController {

    // ...

    @ExceptionHandler
    public ResponseEntity<String> handle(IOException ex) {
        // ...
    }
}
```
The exception may match against a top-level exception being propagated (that is, a direct IOException being thrown) or against the immediate cause within a top-level wrapper exception (for example, an IOException wrapped inside an IllegalStateException).

最好是像上面例子那样，把想要匹配的错误作为方法参数. 

如果要匹配多个错误，那么匹配其上级错误最好

. More specifically, the ExceptionDepthComparator is used to sort exceptions based on their depth from the thrown exception type.

通过在@ExceptionHandler里配置class可以缩小错误匹配的范围:
```java
@ExceptionHandler({FileSystemException.class, RemoteException.class})
public ResponseEntity<String> handle(IOException ex) {
    // ...
}
```
You can even use a list of specific exception types with a very generic argument signature, as the following example shows:
```java
@ExceptionHandler({FileSystemException.class, RemoteException.class})
public ResponseEntity<String> handle(Exception ex) {
    // ...
}
```

```note
The distinction between root and cause exception matching can be surprising.

In the IOException variant shown earlier, the method is typically called with the actual FileSystemException or RemoteException instance as the argument, since both of them extend from IOException. However, if any such matching exception is propagated within a wrapper exception which is itself an IOException, the passed-in exception instance is that wrapper exception.

The behavior is even simpler in the handle(Exception) variant. This is always invoked with the wrapper exception in a wrapping scenario, with the actually matching exception to be found through ex.getCause() in that case. The passed-in exception is the actual FileSystemException or RemoteException instance only when these are thrown as top-level exceptions.
```

We generally recommend that you be as specific as possible in the argument signature, reducing the potential for mismatches between root and cause exception types. Consider breaking a multi-matching method into individual @ExceptionHandler methods, each matching a single specific exception type through its signature.

In a multi-@ControllerAdvice arrangement, we recommend declaring your primary root exception mappings on a @ControllerAdvice prioritized with a corresponding order. While a root exception match is preferred to a cause, this is defined among the methods of a given controller or @ControllerAdvice class. This means a cause match on a higher-priority @ControllerAdvice bean is preferred to any match (for example, root) on a lower-priority @ControllerAdvice bean.

Last but not least, an @ExceptionHandler method implementation can choose to back out of dealing with a given exception instance by rethrowing it in its original form. This is useful in scenarios where you are interested only in root-level matches or in matches within a specific context that cannot be statically determined. A rethrown exception is propagated through the remaining resolution chain, as though the given @ExceptionHandler method would not have matched in the first place.

Support for @ExceptionHandler methods in Spring MVC is built on the DispatcherServlet level, HandlerExceptionResolver mechanism.

### Method Arguments

@ExceptionHandler methods support the following arguments:

- Exception type

For access to the raised exception.

- HandlerMethod

For access to the controller method that raised the exception.

- WebRequest, NativeWebRequest

Generic access to request parameters and request and session attributes without direct use of the Servlet API.

- javax.servlet.ServletRequest, javax.servlet.ServletResponse

Choose any specific request or response type (for example, ServletRequest or HttpServletRequest or or Spring’s MultipartRequest or MultipartHttpServletRequest).

- javax.servlet.http.HttpSession

Enforces the presence of a session. As a consequence, such an argument is never null.
Note that session access is not thread-safe. Consider setting the RequestMappingHandlerAdapter instance’s synchronizeOnSession flag to true if multiple requests are allowed to access a session concurrently.

- java.security.Principal

Currently authenticated user — possibly a specific Principal implementation class if known.

- HttpMethod

The HTTP method of the request.

- java.util.Locale

The current request locale, determined by the most specific LocaleResolver available — in effect, the configured LocaleResolver or LocaleContextResolver.

- java.util.TimeZone, java.time.ZoneId

The time zone associated with the current request, as determined by a LocaleContextResolver.

- java.io.OutputStream, java.io.Writer

For access to the raw response body, as exposed by the Servlet API.

- java.util.Map, org.springframework.ui.Model, org.springframework.ui.ModelMap

For access to the model for an error response. Always empty.

- RedirectAttributes

Specify attributes to use in case of a redirect — (that is to be appended to the query string) and flash attributes to be stored temporarily until the request after the redirect. See Redirect Attributes and Flash Attributes.

- @SessionAttribute

For access to any session attribute, in contrast to model attributes stored in the session as a result of a class-level @SessionAttributes declaration. See @SessionAttribute for more details.

- @RequestAttribute

For access to request attributes. See @RequestAttribute for more details.

### Return Values
@ExceptionHandler methods support the following return values:


- @ResponseBody

The return value is converted through HttpMessageConverter instances and written to the response. See @ResponseBody.

- HttpEntity<B>, ResponseEntity<B>

The return value specifies that the full response (including the HTTP headers and the body) be converted through HttpMessageConverter instances and written to the response. See ResponseEntity.

- String

A view name to be resolved with ViewResolver implementations and used together with the implicit model — determined through command objects and @ModelAttribute methods. The handler method can also programmatically enrich the model by declaring a Model argument (described earlier).

- View

A View instance to use for rendering together with the implicit model — determined through command objects and @ModelAttribute methods. The handler method may also programmatically enrich the model by declaring a Model argument (descried earlier).

- java.util.Map, org.springframework.ui.Model

Attributes to be added to the implicit model with the view name implicitly determined through a RequestToViewNameTranslator.

- @ModelAttribute

An attribute to be added to the model with the view name implicitly determined through a RequestToViewNameTranslator.

Note that @ModelAttribute is optional. See “Any other return value” at the end of this table.

- ModelAndView object

The view and model attributes to use and, optionally, a response status.

- void

A method with a void return type (or null return value) is considered to have fully handled the response if it also has a ServletResponse an OutputStream argument, or a @ResponseStatus annotation. The same is also true if the controller has made a positive ETag or lastModified timestamp check (see Controllers for details).

If none of the above is true, a void return type can also indicate “no response body” for REST controllers or default view name selection for HTML controllers.

- Any other return value

If a return value is not matched to any of the above and is not a simple type (as determined by BeanUtils#isSimpleProperty), by default, it is treated as a model attribute to be added to the model. If it is a simple type, it remains unresolved.

### ⭐⭐REST API exceptions
Same as in Spring WebFlux

A common requirement for REST services is to include error details in the body of the response. The Spring Framework does not automatically do this because the representation of error details in the response body is application-specific. However, a @RestController may use @ExceptionHandler methods with a ResponseEntity return value to set the status and the body of the response. Such methods can also be declared in @ControllerAdvice classes to apply them globally.

Applications that implement global exception handling with error details in the response body should consider extending ResponseEntityExceptionHandler, which provides handling for exceptions that Spring MVC raises and provides hooks to customize the response body. To make use of this, create a subclass of ResponseEntityExceptionHandler, annotate it with @ControllerAdvice, override the necessary methods, and declare it as a Spring bean.