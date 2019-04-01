## Asynchronous Requests
Compared to WebFlux

Spring MVC has an extensive integration with Servlet 3.0 asynchronous request processing:
- `DeferredResult` and `Callable` return values in controller methods and provide basic support for a single asynchronous return value.

- `Controllers` can `stream` multiple values, including SSE and raw data.

- Controllers can use reactive clients and return `reactive types` for response handling.

## DeferredResult / 延迟结果

Compared to WebFlux

只要在Servlet Container中配置使用asynchronous，就可以在Controller中像下面这种情况进行操作:
```java
@GetMapping("/quotes")
@ResponseBody
public DeferredResult<String> quotes() {
    DeferredResult<String> deferredResult = new DeferredResult<String>();
    // Save the deferredResult somewhere..
    return deferredResult;
}

// From some other thread...
deferredResult.setResult(data);
```
The controller can produce the return value asynchronously, from a different thread — for example, in response to an external event (JMS message), a scheduled task, or other event.

## Callable

Compared to WebFlux

A controller can wrap any supported return value with java.util.concurrent.Callable, as the following example shows:
```java
@PostMapping
public Callable<String> processUpload(final MultipartFile file) {

    return new Callable<String>() {
        public String call() throws Exception {
            // ...
            return "someView";
        }
    };

}
```
The return value can then be obtained by running the the given task through the configured TaskExecutor.

## Processing

Compared to WebFlux

> 异步请求处理流程大概如下:
- A ServletRequest can be put in asynchronous mode by calling request.startAsync(). The main effect of doing so is that the Servlet (as well as any filters) can exit, but the response remains open to let processing complete later.
  - ServletRequest通过调用 request.startAsync() 来开启异步模式。这个操作会让Servlet可以推出，但是response保留下来，继续完成后续操作
- The call to `request.startAsync()` returns `AsyncContext`, which you can use for further control over asynchronous processing. For example, it provides the dispatch method, which is similar to a forward from the Servlet API, except that it lets an application resume request processing on a Servlet container thread.
  - 调用了 request.startAsync() 返回一个AsyncContext，用它就可以进行后续处理
  - 例如：它提供 dispatch method，类似于 Servlet API中的 forward，除了它允许应用程序在 Servlet容器线程上回复请求处理
- The ServletRequest provides access to the current DispatcherType, which you can use to distinguish between processing the initial request, an asynchronous dispatch, a forward, and other dispatcher types.
  - ServletRequest提供获取当前DispatcherType的方法，通过它可以区分initial request/asychronous dispatch/forward或者其他 dispatcher 

> DefferedResult 延迟结果工作流程如下:
- The controller returns a DeferredResult and saves it in some in-memory queue or list where it can be accessed.
  - controller返回DefferedResult并将其保存在一个内存中的队列或者列表里
- Spring MVC calls request.startAsync().
  - Spring MVC调用 request.startAsync()
- Meanwhile, the DispatcherServlet and all configured filters exit the request processing thread, but the response remains open.
  - 同事，DispatcherServlet 和配置的 filters 退出请求处理线程，但是 response保持开启状态
- The application sets the DeferredResult from some thread, and Spring MVC dispatches the request back to the Servlet container.
  - 应用程序在其他某个线程中操作DefferedResult，Spring MVC重新将request分发到Servlet container里面
- The DispatcherServlet is invoked again, and processing resumes with the asynchronously produced return value.
  - DispatcherServlet再次被调用之后返回已经被异步处理后的结果

> Callable 工作流程如下:
- The controller returns a Callable.
  - controller返回Callable
- Spring MVC calls request.startAsync() and submits the Callable to a TaskExecutor for processing in a separate thread.
  - Spring MVC调用request.startAsync 并且将Callable交给TaskExecutor让其开启线程处理
- Meanwhile, the DispatcherServlet and all filters exit the Servlet container thread, but the response remains open.
  - 此时 DispatcherServlet 和filters推出Servlet container线程，但是response保持打开
- Eventually the Callable produces a result, and Spring MVC dispatches the request back to the Servlet container to complete processing.
  - 最终Callable返回result，Spring MVC重新把request提交给Servlet Container完成后续操作
- The DispatcherServlet is invoked again, and processing resumes with the asynchronously produced return value from the Callable.
  - DispatcherServlet 重新被调用，获取Callable提供的结果

For further background and context, you can also read the blog posts that introduced asynchronous request processing support in Spring MVC 3.2.

> Exception Handling 异步处理中的错误处理

在使用 `DeferredResult` 时候,如果发生了错误，可以选择调用setResult或者setErrorResult. 不管那种情况，SpringMVC都会重新将request提交给Servlet Container. 之后不管是返回结果，还是报错都会被当成Controller的操作结果. 这样报错就会被当成常规错误来处理 (for example, invoking @ExceptionHandler methods).

When you use Callable, similar processing logic occurs, the main difference being that the result is returned from the Callable or an exception is raised by it.


> Interception

- 使用 AsynHandlerInterceptor 代替HandlerIntceptor

`HandlerInterceptor` instances can be of type `AsyncHandlerInterceptor`, to receive the afterConcurrentHandlingStarted callback on the initial request that starts asynchronous processing (instead of postHandle and afterCompletion).

HandlerInterceptor implementations can also register a CallableProcessingInterceptor or a DeferredResultProcessingInterceptor, to integrate more deeply with the lifecycle of an asynchronous request (for example, to handle a timeout event). See AsyncHandlerInterceptor for more details.

DeferredResult provides onTimeout(Runnable) and onCompletion(Runnable) callbacks. See the javadoc of DeferredResult for more details. Callable can be substituted for WebAsyncTask that exposes additional methods for timeout and completion callbacks.

> Compared to WebFlux

The Servlet API was originally built for making a single pass through the Filter-Servlet chain. Asynchronous request processing, added in Servlet 3.0, lets applications exit the Filter-Servlet chain but leave the response open for further processing. The Spring MVC asynchronous support is built around that mechanism. When a controller returns a DeferredResult, the Filter-Servlet chain is exited, and the Servlet container thread is released. Later, when the DeferredResult is set, an ASYNC dispatch (to the same URL) is made, during which the controller is mapped again but, rather than invoking it, the DeferredResult value is used (as if the controller returned it) to resume processing.
By contrast, Spring WebFlux is neither built on the Servlet API, nor does it need such an asynchronous request processing feature, because it is asynchronous by design. Asynchronous handling is built into all framework contracts and is intrinsically supported through all stages of request processing.

From a programming model perspective, both Spring MVC and Spring WebFlux support asynchronous and Reactive Types as return values in controller methods. Spring MVC even supports streaming, including reactive back pressure. However, individual writes to the response remain blocking (and are performed on a separate thread), unlike WebFlux, which relies on non-blocking I/O and does not need an extra thread for each write.
Another fundamental difference is that Spring MVC does not support asynchronous or reactive types in controller method arguments (for example, @RequestBody, @RequestPart, and others), nor does it have any explicit support for asynchronous and reactive types as model attributes. Spring WebFlux does support all that.

## HTTP Streaming

Same as in Spring WebFlux

通过DefferredResult 和 Callable可以异步处理单一return值，下面介绍如何提供 multipart asynchronous value 并将其写入response

> Objects

You can use the `ResponseBodyEmitter` return value to produce a stream of objects, where each object is serialized with an HttpMessageConverter and written to the response, as the following example shows:
```java
@GetMapping("/events")
public ResponseBodyEmitter handle() {
    ResponseBodyEmitter emitter = new ResponseBodyEmitter();
    // Save the emitter somewhere..
    return emitter;
}

// In some other thread
emitter.send("Hello once");

// and again later on
emitter.send("Hello again");

// and done at some point
emitter.complete();
```
You can also use `ResponseBodyEmitter` as the body in a ResponseEntity, letting you customize the status and headers of the response.

当emitter 报错（IOException），应用程序不用进行cleaning up connection的操作，也不同调用 emitter.complete 或者 emitter.completeWithError。

Servlet container会自动创建一个AsyncListener 错误提示，在这个错误提示下，SpringMVC会进行一个 completeWithError 的调用，在这个调用中，会对应用进行一次final ASYNC dispatch，在个dispatch中，SpringMVC会调用 exception resolver 并结束请求

> SSE

`SseEmitter` (a subclass of ResponseBodyEmitter) provides support for `Server-Sent Events`, where events sent from the server are formatted according to the `W3C SSE specification`. To produce an `SSE stream` from a controller, return `SseEmitter`, as the following example shows:

```java
@GetMapping(path="/events", produces=MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter handle() {
    SseEmitter emitter = new SseEmitter();
    // Save the emitter somewhere..
    return emitter;
}

// In some other thread
emitter.send("Hello once");

// and again later on
emitter.send("Hello again");

// and done at some point
emitter.complete();
```

While SSE is the main option for streaming into browsers, note that Internet Explorer does not support Server-Sent Events. Consider using Spring’s WebSocket messaging with SockJS fallback transports (including SSE) that target a wide range of browsers.
See also previous section for notes on exception handling.

> Raw Data

Sometimes, it is useful to bypass message conversion and stream directly to the response `OutputStream` (for example, for a file download). You can use the StreamingResponseBody return value type to do so, as the following example shows:
```java
@GetMapping("/download")
public StreamingResponseBody handle() {
    return new StreamingResponseBody() {
        @Override
        public void writeTo(OutputStream outputStream) throws IOException {
            // write...
        }
    };
}
```
You can use StreamingResponseBody as the body in a ResponseEntity to customize the status and headers of the response.

## Reactive Types

Same as in Spring WebFlux

Spring MVC supports use of reactive client libraries in a controller (also read Reactive Libraries in the WebFlux section). This includes the WebClient from spring-webflux and others, such as Spring Data reactive data repositories. In such scenarios, it is convenient to be able to return reactive types from the controller method.

Reactive return values are handled as follows:

- A single-value promise is adapted to, similar to using DeferredResult. Examples include Mono (Reactor) or Single (RxJava).
- A multi-value stream with a streaming media type (such as application/stream+json or text/event-stream) is adapted to, similar to using ResponseBodyEmitter or SseEmitter. Examples include Flux (Reactor) or Observable (RxJava). Applications can also return Flux<ServerSentEvent> or Observable<ServerSentEvent>.
- A multi-value stream with any other media type (such as application/json) is adapted to, similar to using DeferredResult<List<?>>.
```note
Spring MVC supports Reactor and RxJava through the ReactiveAdapterRegistry from spring-core, which lets it adapt from multiple reactive libraries. 
```

For streaming to the response, reactive back pressure is supported, but writes to the response are still blocking and are executed on a separate thread through the configured TaskExecutor, to avoid blocking the upstream source (such as a Flux returned from WebClient). By default, SimpleAsyncTaskExecutor is used for the blocking writes, but that is not suitable under load. If you plan to stream with a reactive type, you should use the MVC configuration to configure a task executor.

## Disconnects

Same as in Spring WebFlux

The Servlet API does not provide any notification when a remote client goes away. Therefore, while streaming to the response, whether through `SseEmitter` or `<<mvc-ann-async-reactive-types,reactive types>`, it is important to send data periodically, since the write fails if the client has disconnected. The send could take the form of an empty (comment-only) SSE event or any other data that the other side would have to to interpret as a heartbeat and ignore.

Alternatively, consider using web messaging solutions (such as STOMP over WebSocket or WebSocket with SockJS) that have a built-in heartbeat mechanism.

## Configuration

Compared to WebFlux

The asynchronous request processing feature must be enabled at the Servlet container level. The MVC configuration also exposes several options for asynchronous requests.

> Servlet Container

Filter and Servlet declarations have an asyncSupported flag that needs to be set to true to enable asynchronous request processing. In addition, Filter mappings should be declared to handle the ASYNC javax.servlet.DispatchType.
- In Java configuration, when you use AbstractAnnotationConfigDispatcherServletInitializer to initialize the Servlet container, this is done automatically.
- In web.xml configuration, you can add `<async-supported>true</async-supported>` to the DispatcherServlet and to Filter declarations and add `<dispatcher>ASYNC</dispatcher>` to filter mappings.

> Spring MVC
The MVC configuration exposes the following options related to asynchronous request processing:
- Java configuration: Use the configureAsyncSupport callback on WebMvcConfigurer.
- XML namespace: Use the `<async-support>` element under `<mvc:annotation-driven>`.

You can configure the following:

- Default timeout value for async requests, which if not set, depends on the underlying Servlet container (for example, 10 seconds on Tomcat).
- AsyncTaskExecutor to use for blocking writes when streaming with Reactive Types and for executing Callable instances returned from controller methods. We highly recommended configuring this property if you stream with reactive types or have controller methods that return Callable, since by default, it is a SimpleAsyncTaskExecutor.
- DeferredResultProcessingInterceptor implementations and CallableProcessingInterceptor implementations.

Note that you can also set the default timeout value on a DeferredResult, a ResponseBodyEmitter, and an SseEmitter. For a Callable, you can use WebAsyncTask to provide a timeout value.