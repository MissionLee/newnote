# 一个请求在RestController中的奇妙旅途

> 起因：最开始用SpringBoot开发的时候，遇到过字符串被解析成???的情况，一直以来就是在 @RequestMapping 里面加上 `produce = ` 来解决这个问题，平时基础业务功能开发都是组里的小兄弟们解决的，我多数时间只开发通用组件，或者帮组里小兄弟们提供开发思路，所以一直没有注意项目所有的controller 都写着这么一行 produce 参数。重复写这么多一样的东西，是完全无法忍受的

> 说的什么：处理方案很简单，但是解决花了不少时间，学到的东西远超过解决问题

- 这篇文章讲了什么
  - 一个Http请求在SpringMVC框架下的处理流程
  - 我们可以在那些位置对Request/Response进行通用操作
  - 全局配置RestController的Response的content-type
  - 全局配置，解决接口返回中文全部变成 ？？？的问题

## 先解决接口返回中文变成????的问题

> 前提：使用RestController，后台实际字符集utf8，前台获取到的数据集 ISO_8859_1

> 前提：实际造成数据集为ISO_8859_1的原因，这个字符集是SpringMVC中StringMessageConverter

> 如果你看到的现象不是上面描述的两个前提，那么这个解决方案可能不能解决???的问题，你可以跳过这个小结

> 原因总结：ResponseBody的情况下，方法返回String，被StringMessageConverter处理，处理过程中丢弃了最初的response，而是在处理过程中创建了一个新的Response，所以在代码逻辑中，如果是通过在进入方法之前配置response的 content-type，都没有用

- 可行的解决方案
  - @RequestMapping 添加 produce=MediaType.APPLICATION_JSON_UTF8 
    - 常用解决方案，但是个人觉得麻烦
  - [自定义 HttpMessageConverter](./自定义HttpmessageConverter.md) ，并在实现方案中流写入的时候制定UTF8
    - 配置其他的HttpMessageConverter 也是同样的原理，例如一些解决方案会推荐配置 FastJson提供的 HttpMessageConverter
    - 可以解决问题，但是这明显不符合SpringMVC架构的设计思路，不建议用这种方法
  - 实现[WebMvcConfigurationSupport](./探索WebMvcConfigurationSupport.md)，并在其中配置 negotiation
    - 比较好的解决方案之一，但是请确认自己知道自己配置了什么，实现类有些情况下会影响SpringMVC的一些默认配置
  - 实现 ResponseBodyAdvice ，并在其中更改response的header
    - 比较好的解决方案之一，并且很简单
    ```java
    @ControllerAdvice
    public class ResponseBodyConfiguration implements ResponseBodyAdvice {
        @Override
        public boolean supports(MethodParameter returnType, Class converterType){
            return true;
        }

        @Override
        public Object beforeBodyWrite(Object body, MethodParameter returnType,  MediaType selectedContentType, Class selectedConverterType,  ServerHttpRequest request, ServerHttpResponse response) {
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON_UTF8)   ;
            return body;
        }
    }
    ```
  - [hack方法](./HACK操作-AOP配合ResponseBody注解从而跳过MessageConverter.md)，我们知道（或者你去学学），@ResponseBody情况下，方法如果是 void的，然后我们对 入参response进行写body操作，也能顺利进行响应
    - 在这种情况下，我们让 handler 返回想要写入body的内容，然后使用aop代理handler的执行，并且在aop里面配置 content-type，并且写response，而AOP 方法，我们可以让他 return null 或者方法本身就是 void
      - return null的时候，@ResponseBody 后续处理，发现要写入的内容为null，不会执行写的尝试，`不会触发`多次写response body的bug
      - void 的时候就不用解释了，SpringMVC 就是把 入参的这个response 作为返回值返回了，而对于response的操作，我们本身也完成了

- 不可行的方案(对，你没有看错，不过请注意前提)
  - 修改application.properties中的几个参数
  - 配置WebFilter，并修改response的content-type
  - 在RestController的Handler对应的 method里面，修改response的content-type

  - postHandle 不可用
=======
  - ⭐⭐⭐如果你详细看了这篇文章，可能会想到，返回被HttpMessageConverter处理之前修改response无效，那么通过postHandle 在之后操作总没问题了把，遗憾的是，当response被commit之后，调用 setContentType方法是无效的


## SpringMVC对于Http请求的处理流程

> 为什么解决中文出现?????的问题，会变成对请求处理流程的研究？

因为在WebFilter中确实配置了 response的content-type，但是在我的项目情况下，确实返回的Response的content-type变成了 text/plain，我想知道为什么有这种变化。

### 流程总结

> 总结里面提到了一下 AbstractXXXX 类，实际工作过程中肯定是实现类在工作，请注意

> AOP 可能在很多位置接入工作，所以下面流程不考虑AOP

- 项目启动，SpringBoot内置Tomcat启动，NioEndpoint开始监听工作
- 接受请求
  - AbstractProtocol工作，找到合适的ConnectionHandler
  - 连接器CoyoteAdapter开始工作
  - 解析请求：主要是请求url之类的内容
- WebFilter开始执行，我们可以在此处进行一些操作，例如权限验证等等，当然也可以修改请求/返回的参数
- SpringMVC DispatcherServlet开始工作，分发请求
  - HandlerAdapter开始工作
    - 我的Handler都是 @RequestMapping注解的method
    - 实际工作的handlerAdapter是RequestMappingHandlerAdapter，他会调用和注解匹配的方法
  - 调用具体方法之前，会先调用 interceptor 的 prehandle
  - 匹配到的方法开始工作，并返回一个返回值
    - 返回值在这里，是@ResponseBody注解的
    - 根据返回值的类型不同，会交给对应的MessageConverter处理
    - ⭐ 出现???问题的时候，我们的Controller返回的是我这边自己用AOP处理过的String字符串（JSON字符串）
    - 这里会执行interceptor的postHandle
  - 返回值被写入Response里面之后，就可以返回了（具体返回的过程没详细看）

## 将返回值写入之前，SpringMVC做了那些工作

```java
	protected <T> void writeWithMessageConverters(@Nullable T value, MethodParameter returnType,
			ServletServerHttpRequest inputMessage, ServletServerHttpResponse outputMessage)
			throws IOException, HttpMediaTypeNotAcceptableException, HttpMessageNotWritableException {

		Object body; // ⭐ 这是我们的返回值
		Class<?> valueType; // ⭐ 返回值类型，如果用我的aop那么是string，不用的话可能是很多情况
		Type targetType; // ⭐ Http协议下，传输内容是文本的，所以这String

		if (value instanceof CharSequence) {
			body = value.toString();
			valueType = String.class;
			targetType = String.class;
		}
		else {
			body = value;
			valueType = getReturnValueType(body, returnType);
			targetType = GenericTypeResolver.resolveType(getGenericType(returnType), returnType.getContainingClass());
		}

		if (isResourceType(value, returnType)) {
			outputMessage.getHeaders().set(HttpHeaders.ACCEPT_RANGES, "bytes");
			if (value != null && inputMessage.getHeaders().getFirst(HttpHeaders.RANGE) != null &&
					outputMessage.getServletResponse().getStatus() == 200) {
				Resource resource = (Resource) value;
				try {
					List<HttpRange> httpRanges = inputMessage.getHeaders().getRange();
					outputMessage.getServletResponse().setStatus(HttpStatus.PARTIAL_CONTENT.value());
					body = HttpRange.toResourceRegions(httpRanges, resource);
					valueType = body.getClass();
					targetType = RESOURCE_REGION_LIST_TYPE;
				}
				catch (IllegalArgumentException ex) {
					outputMessage.getHeaders().set(HttpHeaders.CONTENT_RANGE, "bytes */" + resource.contentLength());
					outputMessage.getServletResponse().setStatus(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE.value());
				}
			}
		}
        // ⭐ 目标mediaType
		MediaType selectedMediaType = null;
        // ⭐ 获取outputMessage 里面的MediaType 为null
        // ⭐ 这个outputMessage 对象实例，是通过一个名为 createOutputMessage方法创建的，AbstractMessageConverterMethodProcessor#createOutputMessage
        // ⭐ 类型为ServletServerHttpResponse 下面展示一下这个类的结构
		MediaType contentType = outputMessage.getHeaders().getContentType();
		if (contentType != null && contentType.isConcrete()) { // 这里不满足条件
			if (logger.isDebugEnabled()) {
				logger.debug("Found 'Content-Type:" + contentType + "' in response");
			}
			selectedMediaType = contentType; 
		}
		else {
			HttpServletRequest request = inputMessage.getServletRequest();
			List<MediaType> acceptableTypes = getAcceptableMediaTypes(request);// ⭐ 这里的是 application/json;charset=UTF-8
                                                                               // 这是为什么方法 4 能够生效的重点
                                                                               // 这个方法是： 如果能找到恰好匹配的就返回匹配的，否则返回全部
                                                                               
			List<MediaType> producibleTypes = getProducibleMediaTypes(request, valueType, targetType);
              // 三种MediaType 会被放到这个list里面： 1. RequestMappings 里面写着的，如果写了，就只返回这一个
              //                                    2. 可用的 messageConverter 能够支持的各种 mediatype ，如果有就返回这个
              //                                    3. 上面两个都没有，返回全部 */*
              // 这里有四个选项 0 = {MediaType@9968} "text/plain"
              //               1 = {MediaType@9783} "*/*"
              //               2 = {MediaType@9910} "application/json"
              //               3 = {MediaType@9969} "application/*+json"

			if (body != null && producibleTypes.isEmpty()) {
				throw new HttpMessageNotWritableException(
						"No converter found for return value of type: " + valueType);
			}
			List<MediaType> mediaTypesToUse = new ArrayList<>(); 
			for (MediaType requestedType : acceptableTypes) {
				for (MediaType producibleType : producibleTypes) {
					if (requestedType.isCompatibleWith(producibleType)) {
                        // isCompatibleWith 规则： 如果两者有一个使用* 通配，那么可以匹配
                        //                        如果两者的mimeType一样， subtype 一样也匹配
                        //                        对于包含+ 的情况，也进行匹配,没特地注意看细节
						mediaTypesToUse.add(getMostSpecificMediaType(requestedType, producibleType));
					}
				}
			}
            // ⭐ 上面这个循环找出可用的mediaType application/json;charset=UTF-8
			if (mediaTypesToUse.isEmpty()) {
				if (body != null) {
					throw new HttpMediaTypeNotAcceptableException(producibleTypes);
				}
				if (logger.isDebugEnabled()) {
					logger.debug("No match for " + acceptableTypes + ", supported: " + producibleTypes);
				}
				return;
			}

			MediaType.sortBySpecificityAndQuality(mediaTypesToUse);

			for (MediaType mediaType : mediaTypesToUse) {
				if (mediaType.isConcrete()) {
					selectedMediaType = mediaType;
					break;
				}
				else if (mediaType.isPresentIn(ALL_APPLICATION_MEDIA_TYPES)) {
					selectedMediaType = MediaType.APPLICATION_OCTET_STREAM;
					break;
				}
			}

			if (logger.isDebugEnabled()) {
				logger.debug("Using '" + selectedMediaType + "', given " +
						acceptableTypes + " and supported " + producibleTypes);
			}
		}

		if (selectedMediaType != null) {  
			selectedMediaType = selectedMediaType.removeQualityValue();
			for (HttpMessageConverter<?> converter : this.messageConverters) { // ⭐ 循环找到合适的messageConverter 处理数据
				GenericHttpMessageConverter genericConverter = (converter instanceof GenericHttpMessageConverter ?
						(GenericHttpMessageConverter<?>) converter : null);
				if (genericConverter != null ?
						((GenericHttpMessageConverter) converter).canWrite(targetType, valueType, selectedMediaType) :
						converter.canWrite(valueType, selectedMediaType)) {
					body = getAdvice().beforeBodyWrite(body, returnType, selectedMediaType,
							(Class<? extends HttpMessageConverter<?>>) converter.getClass(),
							inputMessage, outputMessage);
					if (body != null) {
						Object theBody = body;
						LogFormatUtils.traceDebug(logger, traceOn ->
								"Writing [" + LogFormatUtils.formatValue(theBody, !traceOn) + "]");
						addContentDispositionHeader(inputMessage, outputMessage);
						if (genericConverter != null) {
							genericConverter.write(body, targetType, selectedMediaType, outputMessage);
						}
						else { // ⭐ 使用 selectMediaType 处理 outputMessage
                               // ⭐ 在write方法里面，这个selectedMediaType 会被写道 outputMesage的header里面
                               // ⭐ 如果selectedMediaType 为空，当前具体的MessageConverter 支持什么就改成什么
                               // ⭐ 具体的Messageconverter 例如StringMessageConverter 提供了 默认值，再所有情况匹配不到的时候，总还有一个
							((HttpMessageConverter) converter).write(body, selectedMediaType, outputMessage);
						}
					}
					else {
						if (logger.isDebugEnabled()) {
							logger.debug("Nothing to write: null body");
						}
					}
					return;
				}
			}
		}

		if (body != null) {
			throw new HttpMediaTypeNotAcceptableException(this.allSupportedMediaTypes);
		}
	}
```
> ! 上面的流程说明了 ， 在 RestController 或者说 ResponseBody 注解模式下，我们在 filter 或者 controller#method里面操作 response对象，设置contentType是没有效果的

> WebMvcConfigurationSupport ， 设置 negotiation的方法 ，如果不设置，默认情况是 */* 接受一切，如果协商过后还是这样，或者为空 接受一切的情况下，对于StringMessageConverter 就会使用默认值

### 在@ResponseBody模式下，最总返回的Response 是新建的，与之前所有步骤中的Response**不是同一个**

AbstractMessageConverterMethodProcessor#createOutputMessage
```java
	protected ServletServerHttpResponse createOutputMessage(NativeWebRequest webRequest) {
		HttpServletResponse response = webRequest.getNativeResponse(HttpServletResponse.class);
		Assert.state(response != null, "No HttpServletResponse");
		return new ServletServerHttpResponse(response);
	}
```


- outputMessage / ServletServerHttpResponse
  - servletResponse / ResponseFacade
    - response / Response
      - 这里有很多成员，我就找我们本次分析中需要的
      - coyoteResponse / Response （⭐ 这是最初始的Response）
        - 同样省略很多内容
        - contentType = "application/json"
        - charset = UTF-8
  - headers / ServletReponseHttpHeaders  size = 0
  - headersWritten = false
  - bodyUsed = false