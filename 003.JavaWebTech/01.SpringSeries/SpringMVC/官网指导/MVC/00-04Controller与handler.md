# Controller & RequestMapping

@RequestMapping:
- @GetMapping
- @PostMapping
- @PutMapping
- @DeleteMapping
- @PatchMapping
- RequestMapping里面的path 可以用一些
  - 变量语法/{name}/hello
  - URL pattern
    - ？
    - *
    - **
  - consumes： request的Content-Type
  - produces： response的Content-Type


## Handler 的入参 与 返回

- 可选入参
  - WebRequest, NativeWebRequest
    - 通用的Web请求之类的内容
    - 没有被Servlet API 封装
  - javax.servlet.ServletRequest, javax.servlet.ServletResponse
    - ServletRequest/Response的某种具体实现
    - Request类型的例子：
      - ServletRequest / HttpServletRequest
      - MultipartRequest
      - MultipartHttpServletRequest
  - javax.servlet.http.HttpSession
    - session的增强， never null
    - ⭐ HttpSession是线程不安全的
      - 🔺 可以通过在 RequestMappingHandlerAdapter中配置 synchronizeOnSession
  - javax.servlet.http.PushBuilder
    - Servlet 4.0
  - java.security.Principal
    - 🔺 不太懂 🔺
  - HttpMethod
    - GET
    - HEAD
    - POST
    - PUT
    - DELETE
    - CONNECT HTTP/1.1
    - OPTIONS
    - TRACE
    - PATCH
    - COPY
    - LINK
    - UNLINK
    - WRAPPED
    - Extension-mothed
  - java.util.Locale
    - 地理/政治/文化信息  语言环境敏感
    - 由LocaleResolver 或 LocaleContextResolver 提供
  - java.util.TimeZone + java.time.ZoneId
    - 时区信息 LocaleContextResovler
  - java.io.InputStream, java.io.Reader
    - 获取请求主体部分
  - java.io.OutputStream, java.io.Writer
    - 响应主体部分
  - @PathVariable
    - 通过 URL patterns 获取对应的内容
  - @MatrixVariable
    - 矩阵变量
  - @RequestParam
    - Servlet request的 参数，包括 multipart files
    - ⭐ 参数会被转换成声明的 类型
  - @RequestHeader
    - 请求头内容
  - @CookieValue
    - ⭐ Cookie值 也会被转换成声明的类型
  - @RequestBody
    - HTTP 请求body，通过HttpMessageConverter
  - HttpEntity<B>
    - HTTP 的  header + body
  - @RequestPart
    - 对应multipart/form-data 请求中的 一个部分
    - 也是通过 HttpMessageConcerter转换
  - java.util.Map, org.springframework.ui.Model, org.springframework.ui.ModelMap
    - Model
  - RedirectAttributes
    - 重定向（hat is, to be appended to the query string） 和 flash 参数
    - 下面有讲解
  - @ModelAttribute
  - Errors, BindingResult
  - SessionStatus + class-level @SessionAttributes
    - 用于标记表单处理完成，它触发通过类级别@SessionAttributes注释声明的会话属性的清除。 有关更多详细信息，请参阅@SessionAttributes。
  - UriComponentsBuilder
    - 一个封装好的当前请求的 host/ port /scheme/ context path / servlet mapping 相关信息
  - @SessionAttribute
    - session attribute
  - @RequestAttribute
    - request attribute
  - Any other argument
- 可返回内容
  - @ResponseBody
    - 通过HttpMessageConverter 把返回值转换后写入 ResponseBody
  - HttpEntity<B>, ResponseEntity<B>
    - 返回一个完整的 response
    - 同样也由 HttpMessageConverter来转换
  - HttpHeaders
    - 返回一个header 没有body
  - String
    - view的名称
  - View
    - view
  - java.util.Map, org.springframework.ui.Model
    - 要放在model里面的参数 和 对应的model（也是RequestToViewNameTranslator.）
  - @ModelAttribute
    - model 里面的attribute，放到RequestToViewNameTranslator定制的model
  - ModelAndView object
    - The view and model attributes to use and, optionally, a response status.
  - void
    - 根据其他参数（入参/Controller是否是REST等等）的不同，有不同的情况
  - DeferredResult<V>
    - 🔺 异步返回 其他某个线程提供的内容
  - Callable<V>
    - 异步返回上面提到的所有内容
  - ListenableFuture<V>, java.util.concurrent.CompletionStage<V>, java.util.concurrent.CompletableFuture<V>
    - Alternative to DeferredResult, as a convenience (for example, when an underlying service returns one of those).
  - StreamingResponseBody
    - Emit a stream of objects asynchronously to be written to the response with HttpMessageConverter implementations. Also supported as the body of a ResponseEntity. See Asynchronous Requests and HTTP Streaming.
  - Reactive types — Reactor, RxJava, or others through ReactiveAdapterRegistry
    - Alternative to DeferredResult with multi-value streams (for example, Flux, Observable) collected to a List. 
    - For streaming scenarios (for example, text/event-stream, application/json+stream), SseEmitter and ResponseBodyEmitter are used instead, where ServletOutputStream blocking I/O is performed on a Spring MVC-managed thread and back pressure is applied against the completion of each write. 
See Asynchronous Requests and Reactive Types.
  - Any other return value
    - Any return value that does not match any of the earlier values in this table and that is a String or void is treated as a view name (default view name selection through RequestToViewNameTranslator applies), provided it is not a simple type, as determined by BeanUtils#isSimpleProperty. Values that are simple types remain unresolved.


## Exception

可以是 Controller级别的，卸载Controller里面

也有全局的

在 @Controller 或者 @ControllerAdvice 里面使用 @ExceptionHandler
- 可以匹配错误类型（用入参来匹配错误，在注解中用.class限定 具体的错误类型）
- 入参返回可选类型也很多，具体查看对应的总结
- 返回值和 Handler近似

## @ControllerAdvice

在 @Controller里面配置的内容现定于当前Controller

我们想要全局配置的时候，可以在@ControllerAdice里面配置

- @Exceptionhandler
- @InitBinder
- @ModelAttribute

等

内容