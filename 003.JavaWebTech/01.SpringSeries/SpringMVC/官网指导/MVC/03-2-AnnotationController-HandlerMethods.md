# Handler Methods

@RequestMapping handler 有一大堆可选的入参与返回值

## Method Arguments
Same as in Spring WebFlux

The next table describes the supported controller method arguments. Reactive types are not supported for any arguments.

JDK 8’s java.util.Optional is supported as a method argument in combination with annotations that have a required attribute (for example, @RequestParam, @RequestHeader, and others) and is equivalent to required=false.

> 下面时 可选的入参
- WebRequest, NativeWebRequest
Generic access to request parameters and request and session attributes, without direct use of the Servlet API.

- javax.servlet.ServletRequest, javax.servlet.ServletResponse

Choose any specific request or response type — for example, `ServletRequest`, `HttpServletRequest`, or Spring’s `MultipartRequest`, `MultipartHttpServletRequest`.

- javax.servlet.http.HttpSession

Enforces the presence of a session. As a consequence, such an argument is never null. Note that session access is not thread-safe. Consider setting the RequestMappingHandlerAdapter instance’s synchronizeOnSession flag to true if multiple requests are allowed to concurrently access a session.

- javax.servlet.http.PushBuilder

Servlet 4.0 push builder API for programmatic HTTP/2 resource pushes. Note that, per the Servlet specification, the injected PushBuilder instance can be null if the client does not support that HTTP/2 feature.

- java.security.Principal

Currently authenticated user — possibly a specific Principal implementation class if known.

- HttpMethod

The HTTP method of the request.

- java.util.Locale

The current request locale, determined by the most specific LocaleResolver available (in effect, the configured LocaleResolver or LocaleContextResolver).

- java.util.TimeZone + java.time.ZoneId

The time zone associated with the current request, as determined by a LocaleContextResolver.

- java.io.InputStream, java.io.Reader

For access to the raw request body as exposed by the Servlet API.

- java.io.OutputStream, java.io.Writer

For access to the `raw response body` as exposed by the Servlet API.

- @PathVariable

For access to URI template variables. See URI patterns.

- @MatrixVariable

For access to name-value pairs in URI path segments. See Matrix Variables.

- @RequestParam

For access to the Servlet request parameters, including multipart files. Parameter values are converted to the declared method argument type. See @RequestParam as well as Multipart.

Note that use of @RequestParam is optional for simple parameter values. See “Any other argument”, at the end of this table.

- @RequestHeader

For access to request headers. Header values are converted to the declared method argument type. See @RequestHeader.

- @CookieValue

For access to cookies. Cookies values are converted to the declared method argument type. See @CookieValue.

- @RequestBody

For access to the HTTP request body. Body content is converted to the declared method argument type by using HttpMessageConverter implementations. See @RequestBody.

- HttpEntity<B>

For access to `request headers and body`. The body is converted with an HttpMessageConverter. See HttpEntity.

- @RequestPart

For access to a part in a multipart/form-data request, converting the part’s body with an HttpMessageConverter. See Multipart.

- java.util.Map, org.springframework.ui.Model, org.springframework.ui.ModelMap

For access to the model that is used in HTML controllers and exposed to templates as part of view rendering.

- RedirectAttributes

Specify attributes to use in case of a redirect (that is, to be appended to the query string) and flash attributes to be stored temporarily until the request after redirect. See Redirect Attributes and Flash Attributes.

- @ModelAttribute

For access to an existing attribute in the model (instantiated if not present) with data binding and validation applied. See @ModelAttribute as well as Model and DataBinder.

Note that use of @ModelAttribute is optional (for example, to set its attributes). See “Any other argument” at the end of this table.

- Errors, BindingResult

For access to errors from validation and data binding for a command object (that is, a @ModelAttribute argument) or errors from the validation of a @RequestBody or @RequestPart arguments. You must declare an Errors, or BindingResult argument immediately after the validated method argument.

- SessionStatus + class-level @SessionAttributes

For marking form processing complete, which triggers cleanup of session attributes declared through a class-level @SessionAttributes annotation. See @SessionAttributes for more details.

- UriComponentsBuilder

For preparing a URL relative to the current request’s host, port, scheme, context path, and the literal part of the servlet mapping. See URI Links.

- @SessionAttribute

For access to any session attribute, in contrast to model attributes stored in the session as a result of a class-level @SessionAttributes declaration. See @SessionAttribute for more details.

- @RequestAttribute

For access to request attributes. See @RequestAttribute for more details.

- Any other argument

If a method argument is not matched to any of the earlier values in this table and it is a simple type (as determined by BeanUtils#isSimpleProperty, it is a resolved as a @RequestParam. Otherwise, it is resolved as a @ModelAttribute.

## Return Values
Same as in Spring WebFlux

The next table describes the supported controller method return values. Reactive types are supported for all return values.


- @ResponseBody

The return value is converted through HttpMessageConverter implementations and written to the response. See @ResponseBody.

- HttpEntity<B>, ResponseEntity<B>

The return value that specifies the full response (including HTTP headers and body) is to be converted through HttpMessageConverter implementations and written to the response. See ResponseEntity.

- HttpHeaders

For returning a response with headers and no body.

- String

A view name to be resolved with ViewResolver implementations and used together with the implicit model — determined through command objects and @ModelAttribute methods. The handler method can also programmatically enrich the model by declaring a Model argument (see Explicit Registrations).

- View

A View instance to use for rendering together with the implicit model — determined through command objects and @ModelAttribute methods. The handler method can also programmatically enrich the model by declaring a Model argument (see Explicit Registrations).

- java.util.Map, org.springframework.ui.Model

Attributes to be added to the implicit model, with the view name implicitly determined through a RequestToViewNameTranslator.

- @ModelAttribute

An attribute to be added to the model, with the view name implicitly determined through a RequestToViewNameTranslator.

Note that @ModelAttribute is optional. See "Any other return value" at the end of this table.

- ModelAndView object

The view and model attributes to use and, optionally, a response status.

- void

A method with a void return type (or null return value) is considered to have fully handled the response if it also has a ServletResponse, an OutputStream argument, or an @ResponseStatus annotation. The same is also true if the controller has made a positive ETag or lastModified timestamp check (see Controllers for details).

If none of the above is true, a void return type can also indicate “no response body” for REST controllers or a default view name selection for HTML controllers.

- DeferredResult<V>

Produce any of the preceding return values asynchronously from any thread — for example, as a result of some event or callback. See Asynchronous Requests and DeferredResult.

- Callable<V>

Produce any of the above return values asynchronously in a Spring MVC-managed thread. See Asynchronous Requests and Callable.

- ListenableFuture<V>, java.util.concurrent.CompletionStage<V>, java.util.concurrent.CompletableFuture<V>

Alternative to DeferredResult, as a convenience (for example, when an underlying service returns one of those).

- ResponseBodyEmitter, SseEmitter

Emit a stream of objects asynchronously to be written to the response with HttpMessageConverter implementations. Also supported as the body of a ResponseEntity. See Asynchronous Requests and HTTP Streaming.

- StreamingResponseBody

Write to the response OutputStream asynchronously. Also supported as the body of a ResponseEntity. See Asynchronous Requests and HTTP Streaming.

- Reactive types — Reactor, RxJava, or others through ReactiveAdapterRegistry

Alternative to DeferredResult with multi-value streams (for example, Flux, Observable) collected to a List.

For streaming scenarios (for example, text/event-stream, application/json+stream), SseEmitter and ResponseBodyEmitter are used instead, where ServletOutputStream blocking I/O is performed on a Spring MVC-managed thread and back pressure is applied against the completion of each write.

See Asynchronous Requests and Reactive Types.

- Any other return value

Any return value that does not match any of the earlier values in this table and that is a String or void is treated as a view name (default view name selection through RequestToViewNameTranslator applies), provided it is not a simple type, as determined by BeanUtils#isSimpleProperty. Values that are simple types remain unresolved.

## Type Conversion
Same as in Spring WebFlux

一些 annotated controller 方法的入参本身时 String类型的，这些参数可以使用 类型转换

Some annotated controller method arguments that represent String-based request input (such as @RequestParam, @RequestHeader, @PathVariable, @MatrixVariable, and @CookieValue) can require type conversion if the argument is declared as something other than String.

For such cases, type conversion is automatically applied based on the configured converters. By default, simple types (int, long, Date, and others) are supported. You can customize type conversion through a WebDataBinder (see DataBinder) or by registering Formatters with the FormattingConversionService. See Spring Field Formatting.

## Matrix Variables  矩阵变量

Same as in Spring WebFlux

RFC 3986 discusses name-value pairs in path segments. In Spring MVC, we refer to those as “matrix variables” based on an “old post” by Tim Berners-Lee, but they can be also be referred to as URI path parameters.

Matrix variables can appear in any path segment, with each variable separated by a semicolon and multiple values separated by comma `(for example, /cars;color=red,green;year=2012)`. Multiple values can also be specified through repeated variable names `(for example, color=red;color=green;color=blue)`.

If a URL is expected to contain matrix variables, the request mapping for a controller method must use a URI variable to mask that variable content and ensure the request can be matched successfully independent of matrix variable order and presence. The following example uses a matrix variable:
```java
// GET /pets/42;q=11;r=22

@GetMapping("/pets/{petId}")
public void findPet(@PathVariable String petId, @MatrixVariable int q) {

    // petId == 42
    // q == 11
}
```
Given that all path segments may contain matrix variables, you may sometimes need to disambiguate which path variable the matrix variable is expected to be in. The following example shows how to do so:
```java
// GET /owners/42;q=11/pets/21;q=22

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable(name="q", pathVar="ownerId") int q1,
        @MatrixVariable(name="q", pathVar="petId") int q2) {

    // q1 == 11
    // q2 == 22
}
```
A matrix variable may be defined as optional and a default value specified, as the following example shows:
```java
// GET /pets/42

@GetMapping("/pets/{petId}")
public void findPet(@MatrixVariable(required=false, defaultValue="1") int q) {

    // q == 1
}
```
To get all matrix variables, you can use a MultiValueMap, as the following example shows:
```java
// GET /owners/42;q=11;r=12/pets/21;q=22;s=23

@GetMapping("/owners/{ownerId}/pets/{petId}")
public void findPet(
        @MatrixVariable MultiValueMap<String, String> matrixVars,
        @MatrixVariable(pathVar="petId") MultiValueMap<String, String> petMatrixVars) {

    // matrixVars: ["q" : [11,22], "r" : 12, "s" : 23]
    // petMatrixVars: ["q" : 22, "s" : 23]
}
```
Note that you need to enable the use of matrix variables. In the MVC Java configuration, you need to set a UrlPathHelper with removeSemicolonContent=false through Path Matching. In the MVC XML namespace, you can set `<mvc:annotation-driven enable-matrix-variables="true"/>`.

## @RequestParam
Same as in Spring WebFlux

You can use the @RequestParam annotation to bind Servlet request parameters (that is, query parameters or form data) to a method argument in a controller.

The following example shows how to do so:
```java
@Controller
@RequestMapping("/pets")
public class EditPetForm {

    // ...

    @GetMapping
    public String setupForm(@RequestParam("petId") int petId, Model model) { 
        Pet pet = this.clinic.loadPet(petId);
        model.addAttribute("pet", pet);
        return "petForm";
    }

    // ...

}
```
Using @RequestParam to bind petId.
By default, method parameters that use this annotation are required, but you can specify that a method parameter is optional by setting the @RequestParam annotation’s required flag to false or by declaring the argument with an java.util.Optional wrapper.

Type conversion is automatically applied if the target method parameter type is not String. See Type Conversion.

Declaring the argument type as an array or list allows for resolving multiple parameter values for the same parameter name.

When an @RequestParam annotation is declared as a Map<String, String> or MultiValueMap<String, String>, without a parameter name specified in the annotation, then the map is populated with the request parameter values for each given parameter name.

Note that use of @RequestParam is optional (for example, to set its attributes). By default, any argument that is a simple value type (as determined by BeanUtils#isSimpleProperty) and is not resolved by any other argument resolver, is treated as if it were annotated with @RequestParam.

## @RequestHeader

Same as in Spring WebFlux

You can use the @RequestHeader annotation to bind a request header to a method argument in a controller.

Consider the following request, with headers:
```header
Host                    localhost:8080
Accept                  text/html,application/xhtml+xml,application/xml;q=0.9
Accept-Language         fr,en-gb;q=0.7,en;q=0.3
Accept-Encoding         gzip,deflate
Accept-Charset          ISO-8859-1,utf-8;q=0.7,*;q=0.7
Keep-Alive              300
```
The following example gets the value of the Accept-Encoding and Keep-Alive headers:
```java
@GetMapping("/demo")
public void handle(
        @RequestHeader("Accept-Encoding") String encoding, 
        @RequestHeader("Keep-Alive") long keepAlive) { 
    //...
}
```
- Get the value of the Accept-Encoding header.
- Get the value of the Keep-Alive header.
If the target method parameter type is not String, type conversion is automatically applied. See Type Conversion.

When an @RequestHeader annotation is used on a Map<String, String>, MultiValueMap<String, String>, or HttpHeaders argument, the map is populated with all header values.

> Built-in support is available for converting a comma-separated string into an array or collection of strings or other types known to the type conversion system. For example, a method parameter annotated with @RequestHeader("Accept") can be of type String but also String[] or List<String>.
## @CookieValue
Same as in Spring WebFlux

You can use the @CookieValue annotation to bind the value of an HTTP cookie to a method argument in a controller.

Consider a request with the following cookie:
```java
JSESSIONID=415A4AC178C59DACE0B2C9CA727CDD84
```
The following example shows how to get the cookie value:
```java
@GetMapping("/demo")
public void handle(@CookieValue("JSESSIONID") String cookie) { 
    //...
}
```
Get the value of the JSESSIONID cookie.

if the target method parameter type is not String, type conversion is applied automatically. See Type Conversion.

## @ModelAttribute
Same as in Spring WebFlux

You can use the @ModelAttribute annotation on a method argument to access an attribute from the model or have it be instantiated if not present. The model attribute is also overlain with values from HTTP Servlet request parameters whose names match to field names. This is referred to as data binding, and it saves you from having to deal with parsing and converting individual query parameters and form fields. The following example shows how to do so:
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute Pet pet) { } 
```
Bind an instance of Pet.
- The Pet instance above is resolved as follows:

- From the model if already added by using Model.

- From the HTTP session by using @SessionAttributes.

- From a URI path variable passed through a Converter (see the next example).

- From the invocation of a default constructor.

From the invocation of a “primary constructor” with arguments that match to Servlet request parameters. Argument names are determined through JavaBeans @ConstructorProperties or through runtime-retained parameter names in the bytecode.

While it is common to use a Model to populate the model with attributes, one other alternative is to rely on a Converter<String, T> in combination with a URI path variable convention. In the following example, the model attribute name, account, matches the URI path variable, account, and the Account is loaded by passing the String account number through a registered Converter<String, Account>:
```java
@PutMapping("/accounts/{account}")
public String save(@ModelAttribute("account") Account account) {
    // ...
}
```
After the model attribute instance is obtained, data binding is applied. The WebDataBinder class matches Servlet request parameter names (query parameters and form fields) to field names on the target Object. Matching fields are populated after type conversion is applied, where necessary. For more on data binding (and validation), see Validation. For more on customizing data binding, see DataBinder.

Data binding can result in errors. By default, a BindException is raised. However, to check for such errors in the controller method, you can add a BindingResult argument immediately next to the @ModelAttribute, as the following example shows:
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@ModelAttribute("pet") Pet pet, BindingResult result) { 
    if (result.hasErrors()) {
        return "petForm";
    }
    // ...
}
```
Adding a BindingResult next to the @ModelAttribute.
In some cases, you may want access to a model attribute without data binding. For such cases, you can inject the Model into the controller and access it directly or, alternatively, set @ModelAttribute(binding=false), as the following example shows:
```java
@ModelAttribute
public AccountForm setUpForm() {
    return new AccountForm();
}

@ModelAttribute
public Account findAccount(@PathVariable String accountId) {
    return accountRepository.findOne(accountId);
}

@PostMapping("update")
public String update(@Valid AccountForm form, BindingResult result,
        @ModelAttribute(binding=false) Account account) { 
    // ...
}
```
Setting @ModelAttribute(binding=false).

You can automatically apply validation after data binding by adding the javax.validation.Valid annotation or Spring’s @Validated annotation ( Bean validation and Spring validation). The following example shows how to do so:
```java
@PostMapping("/owners/{ownerId}/pets/{petId}/edit")
public String processSubmit(@Valid @ModelAttribute("pet") Pet pet, BindingResult result) { 
    if (result.hasErrors()) {
        return "petForm";
    }
    // ...
}
```
Validate the Pet instance.

Note that using @ModelAttribute is optional (for example, to set its attributes). By default, any argument that is not a simple value type (as determined by BeanUtils#isSimpleProperty) and is not resolved by any other argument resolver is treated as if it were annotated with @ModelAttribute.

## @SessionAttributes

Same as in Spring WebFlux

@SessionAttributes is used to store model attributes in the HTTP Servlet session between requests. It is a type-level annotation that declares the session attributes used by a specific controller. This typically lists the names of model attributes or types of model attributes that should be transparently stored in the session for subsequent requests to access.

The following example uses the @SessionAttributes annotation:
```java
@Controller
@SessionAttributes("pet") 
public class EditPetForm {
    // ...
}
```
Using the @SessionAttributes annotation.
On the first request, when a model attribute with the name, pet, is added to the model, it is automatically promoted to and saved in the HTTP Servlet session. It remains there until another controller method uses a SessionStatus method argument to clear the storage, as the following example shows:
```java
@Controller
@SessionAttributes("pet") 
public class EditPetForm {

    // ...

    @PostMapping("/pets/{id}")
    public String handle(Pet pet, BindingResult errors, SessionStatus status) {
        if (errors.hasErrors) {
            // ...
        }
            status.setComplete(); 
            // ...
        }
    }
}
```
Storing the Pet value in the Servlet session.
Clearing the Pet value from the Servlet session.
@SessionAttribute
Same as in Spring WebFlux

If you need access to pre-existing session attributes that are managed globally (that is, outside the controller — for example, by a filter) and may or may not be present, you can use the @SessionAttribute annotation on a method parameter, as the following example shows:

@RequestMapping("/")
public String handle(@SessionAttribute User user) { 
    // ...
}
Using a @SessionAttribute annotation.
For use cases that require adding or removing session attributes, consider injecting org.springframework.web.context.request.WebRequest or javax.servlet.http.HttpSession into the controller method.

For temporary storage of model attributes in the session as part of a controller workflow, consider using @SessionAttributes as described in @SessionAttributes.

@RequestAttribute
Same as in Spring WebFlux

Similar to @SessionAttribute, you can use the @RequestAttribute annotations to access pre-existing request attributes created earlier (for example, by a Servlet Filter or HandlerInterceptor):

@GetMapping("/")
public String handle(@RequestAttribute Client client) { 
    // ...
}
Using the @RequestAttribute annotation.
Redirect Attributes
By default, all model attributes are considered to be exposed as URI template variables in the redirect URL. Of the remaining attributes, those that are primitive types or collections or arrays of primitive types are automatically appended as query parameters.

Appending primitive type attributes as query parameters can be the desired result if a model instance was prepared specifically for the redirect. However, in annotated controllers, the model can contain additional attributes added for rendering purposes (for example, drop-down field values). To avoid the possibility of having such attributes appear in the URL, a @RequestMapping method can declare an argument of type RedirectAttributes and use it to specify the exact attributes to make available to RedirectView. If the method does redirect, the content of RedirectAttributes is used. Otherwise, the content of the model is used.

The RequestMappingHandlerAdapter provides a flag called ignoreDefaultModelOnRedirect, which you can use to indicate that the content of the default Model should never be used if a controller method redirects. Instead, the controller method should declare an attribute of type RedirectAttributes or, if it does not do so, no attributes should be passed on to RedirectView. Both the MVC namespace and the MVC Java configuration keep this flag set to false, to maintain backwards compatibility. However, for new applications, we recommend setting it to true.

Note that URI template variables from the present request are automatically made available when expanding a redirect URL, and you don’t need to explicitly add them through Model or RedirectAttributes. The following example shows how to define a redirect:

@PostMapping("/files/{path}")
public String upload(...) {
    // ...
    return "redirect:files/{path}";
}
Another way of passing data to the redirect target is by using flash attributes. Unlike other redirect attributes, flash attributes are saved in the HTTP session (and, hence, do not appear in the URL). See Flash Attributes for more information.

Flash Attributes
Flash attributes provide a way for one request to store attributes that are intended for use in another. This is most commonly needed when redirecting — for example, the Post-Redirect-Get pattern. Flash attributes are saved temporarily before the redirect (typically in the session) to be made available to the request after the redirect and are removed immediately.

Spring MVC has two main abstractions in support of flash attributes. FlashMap is used to hold flash attributes, while FlashMapManager is used to store, retrieve, and manage FlashMap instances.

Flash attribute support is always “on” and does not need to enabled explicitly. However, if not used, it never causes HTTP session creation. On each request, there is an “input” FlashMap with attributes passed from a previous request (if any) and an “output” FlashMap with attributes to save for a subsequent request. Both FlashMap instances are accessible from anywhere in Spring MVC through static methods in RequestContextUtils.

Annotated controllers typically do not need to work with FlashMap directly. Instead, a @RequestMapping method can accept an argument of type RedirectAttributes and use it to add flash attributes for a redirect scenario. Flash attributes added through RedirectAttributes are automatically propagated to the “output” FlashMap. Similarly, after the redirect, attributes from the “input” FlashMap are automatically added to the Model of the controller that serves the target URL.

Matching requests to flash attributes
The concept of flash attributes exists in many other web frameworks and has proven to sometimes be exposed to concurrency issues. This is because, by definition, flash attributes are to be stored until the next request. However the very “next” request may not be the intended recipient but another asynchronous request (for example, polling or resource requests), in which case the flash attributes are removed too early.

To reduce the possibility of such issues, RedirectView automatically “stamps” FlashMap instances with the path and query parameters of the target redirect URL. In turn, the default FlashMapManager matches that information to incoming requests when it looks up the “input” FlashMap.

This does not entirely eliminate the possibility of a concurrency issue but reduces it greatly with information that is already available in the redirect URL. Therefore, we recommend that you use flash attributes mainly for redirect scenarios.

Multipart
Same as in Spring WebFlux

After a MultipartResolver has been enabled, the content of POST requests with multipart/form-data is parsed and accessible as regular request parameters. The following example accesses one regular form field and one uploaded file:

@Controller
public class FileUploadController {

    @PostMapping("/form")
    public String handleFormUpload(@RequestParam("name") String name,
            @RequestParam("file") MultipartFile file) {

        if (!file.isEmpty()) {
            byte[] bytes = file.getBytes();
            // store the bytes somewhere
            return "redirect:uploadSuccess";
        }
        return "redirect:uploadFailure";
    }
}
Declaring the argument type as a List<MultipartFile> allows for resolving multiple files for the same parameter name.

When the @RequestParam annotation is declared as a Map<String, MultipartFile> or MultiValueMap<String, MultipartFile>, without a parameter name specified in the annotation, then the map is populated with the multipart files for each given parameter name.

With Servlet 3.0 multipart parsing, you may also declare javax.servlet.http.Part instead of Spring’s MultipartFile, as a method argument or collection value type.
You can also use multipart content as part of data binding to a command object. For example, the form field and file from the preceding example could be fields on a form object, as the following example shows:

class MyForm {

    private String name;

    private MultipartFile file;

    // ...
}

@Controller
public class FileUploadController {

    @PostMapping("/form")
    public String handleFormUpload(MyForm form, BindingResult errors) {
        if (!form.getFile().isEmpty()) {
            byte[] bytes = form.getFile().getBytes();
            // store the bytes somewhere
            return "redirect:uploadSuccess";
        }
        return "redirect:uploadFailure";
    }
}
Multipart requests can also be submitted from non-browser clients in a RESTful service scenario. The following example shows a file with JSON:

POST /someUrl
Content-Type: multipart/mixed

--edt7Tfrdusa7r3lNQc79vXuhIIMlatb7PQg7Vp
Content-Disposition: form-data; name="meta-data"
Content-Type: application/json; charset=UTF-8
Content-Transfer-Encoding: 8bit

{
    "name": "value"
}
--edt7Tfrdusa7r3lNQc79vXuhIIMlatb7PQg7Vp
Content-Disposition: form-data; name="file-data"; filename="file.properties"
Content-Type: text/xml
Content-Transfer-Encoding: 8bit
... File Data ...
You can access the "meta-data" part with @RequestParam as a String but you’ll probably want it deserialized from JSON (similar to @RequestBody). Use the @RequestPart annotation to access a multipart after converting it with an HttpMessageConverter:

@PostMapping("/")
public String handle(@RequestPart("meta-data") MetaData metadata,
        @RequestPart("file-data") MultipartFile file) {
    // ...
}
You can use @RequestPart in combination with javax.validation.Valid or use Spring’s @Validated annotation, both of which cause Standard Bean Validation to be applied. By default, validation errors cause a MethodArgumentNotValidException, which is turned into a 400 (BAD_REQUEST) response. Alternatively, you can handle validation errors locally within the controller through an Errors or BindingResult argument, as the following example shows:

@PostMapping("/")
public String handle(@Valid @RequestPart("meta-data") MetaData metadata,
        BindingResult result) {
    // ...
}
@RequestBody
Same as in Spring WebFlux

You can use the @RequestBody annotation to have the request body read and deserialized into an Object through an HttpMessageConverter. The following example uses a @RequestBody argument:

@PostMapping("/accounts")
public void handle(@RequestBody Account account) {
    // ...
}
You can use the Message Converters option of the MVC Config to configure or customize message conversion.

You can use @RequestBody in combination with javax.validation.Valid or Spring’s @Validated annotation, both of which cause Standard Bean Validation to be applied. By default, validation errors cause a MethodArgumentNotValidException, which is turned into a 400 (BAD_REQUEST) response. Alternatively, you can handle validation errors locally within the controller through an Errors or BindingResult argument, as the following example shows:

@PostMapping("/accounts")
public void handle(@Valid @RequestBody Account account, BindingResult result) {
    // ...
}
HttpEntity
Same as in Spring WebFlux

HttpEntity is more or less identical to using @RequestBody but is based on a container object that exposes request headers and body. The following listing shows an example:

@PostMapping("/accounts")
public void handle(HttpEntity<Account> entity) {
    // ...
}
@ResponseBody
Same as in Spring WebFlux

You can use the @ResponseBody annotation on a method to have the return serialized to the response body through an HttpMessageConverter. The following listing shows an example:

@GetMapping("/accounts/{id}")
@ResponseBody
public Account handle() {
    // ...
}
@ResponseBody is also supported at the class level, in which case it is inherited by all controller methods. This is the effect of @RestController, which is nothing more than a meta-annotation marked with @Controller and @ResponseBody.

You can use @ResponseBody with reactive types. See Asynchronous Requests and Reactive Types for more details.

You can use the Message Converters option of the MVC Config to configure or customize message conversion.

You can combine @ResponseBody methods with JSON serialization views. See Jackson JSON for details.

ResponseEntity
Same as in Spring WebFlux

ResponseEntity is like @ResponseBody but with status and headers. For example:

@GetMapping("/something")
public ResponseEntity<String> handle() {
    String body = ... ;
    String etag = ... ;
    return ResponseEntity.ok().eTag(etag).build(body);
}
Spring MVC supports using a single value reactive type to produce the ResponseEntity asynchronously, and/or single and multi-value reactive types for the body.

Jackson JSON
Spring offers support for the Jackson JSON library.

JSON Views
Same as in Spring WebFlux

Spring MVC provides built-in support for Jackson’s Serialization Views, which allow rendering only a subset of all fields in an Object. To use it with @ResponseBody or ResponseEntity controller methods, you can use Jackson’s @JsonView annotation to activate a serialization view class, as the following example shows:

@RestController
public class UserController {

    @GetMapping("/user")
    @JsonView(User.WithoutPasswordView.class)
    public User getUser() {
        return new User("eric", "7!jd#h23");
    }
}

public class User {

    public interface WithoutPasswordView {};
    public interface WithPasswordView extends WithoutPasswordView {};

    private String username;
    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @JsonView(WithoutPasswordView.class)
    public String getUsername() {
        return this.username;
    }

    @JsonView(WithPasswordView.class)
    public String getPassword() {
        return this.password;
    }
}
@JsonView allows an array of view classes, but you can specify only one per controller method. If you need to activate multiple views, you can use a composite interface.
For controllers that rely on view resolution, you can add the serialization view class to the model, as the following example shows:

@Controller
public class UserController extends AbstractController {

    @GetMapping("/user")
    public String getUser(Model model) {
        model.addAttribute("user", new User("eric", "7!jd#h23"));
        model.addAttribute(JsonView.class.getName(), User.WithoutPasswordView.class);
        return "userView";
    }
}