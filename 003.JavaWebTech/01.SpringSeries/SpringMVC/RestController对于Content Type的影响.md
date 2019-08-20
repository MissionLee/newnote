#

参考文章： https://www.bbsmax.com/A/QV5Zek1VJy/

https://www.jianshu.com/p/f27db5d05731

在做个人博客项目的时候，又忘了写 produce = MediaType.APPLICAITON_JONS_UTF8_VALUE,导致汉字都变成了？？？

最根本的原因我是知道的，没有设置MediaType，返回值被默认当作了 text/html;Charset=ISOxxxxx 具体的charset没背下来，也不去找了

# 想办法全局设置

搜索到了一大堆方法，无外几种情况
- 1.修改SpringBoot参数，设置utf8 
- 2.添加WebFilter，在filter中拦访问，把request与response的 content-type 与 charset 设置为需要的格式 
- 3.配置HttpMessageConverter，提供对应返回值类型的HttpMessageConverter,进行调整  （WebMvcConfigurationSupport）
- 4.配置 content negotiation ：（WebMvcConfigurationSupport）

> 这里必须记录以下，整个查找解决方案的过程很痛苦，一方面是我自己不了解SpringMVC处理请求最底层的详细流程，一方面是网上能找到的资料良莠不齐，我虽然看过来一遍官网攻略，这会也忘得差不多了

> 很多处理方案无效，是因为： 我的项目里面完全使用 RestController ,一直以来我是用的方法，是指定 produce

在RestController的情况下，可以使用3/4 两个方案来处理

# 配置HttpMessageConverter

RestController中的每个方法，在我的项目中都返回一个 String（Object）， （通常可以返回一个对象），这个对象会被作为 ResponseBody,但是我们知道，一个Java对象，直接给前端(二进制流)，前端也没法使用，SpringMVC使用HttpMessageConverter 将返回值转换成合适的形式

我们先看一下默认情况下，SpringBoot给SpringMVC配置了那些 Converter

```java
protected final voidaddDefaultHttpMessageConverter(List<HttpMessageConverter<?>>messageConverters) {
	StringHttpMessageConverter stringHttpMessageConverter = new StringHttpMessageConverter(); // String
	stringHttpMessageConverter.setWriteAcceptCharset(false);  // see SPR-7316
	messageConverters.add(new ByteArrayHttpMessageConverter()); 
	messageConverters.add(stringHttpMessageConverter);
	messageConverters.add(new ResourceHttpMessageConverter());
	messageConverters.add(new ResourceRegionHttpMessageConverter());
	try {
		messageConverters.add(new SourceHttpMessageConverter<>());
	}
	catch (Throwable ex) {
		// Ignore when no TransformerFactory implementation is available...
	}
	messageConverters.add(new AllEncompassingFormHttpMessageConverter());
	if (romePresent) {
		messageConverters.add(new AtomFeedHttpMessageConverter());
		messageConverters.add(new RssChannelHttpMessageConverter());
	}
	if (jackson2XmlPresent) {
		Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.xml();
		if (this.applicationContext != null) {
			builder.applicationContext(this.applicationContext);
		}
		messageConverters.add(new MappingJackson2XmlHttpMessageConverter(builder.build()));
	}
	else if (jaxb2Present) {
		messageConverters.add(new Jaxb2RootElementHttpMessageConverter());
	}
	if (jackson2Present) {
		Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.json();
		if (this.applicationContext != null) {
			builder.applicationContext(this.applicationContext);
		}
		messageConverters.add(new MappingJackson2HttpMessageConverter(builder.build()));
	}
	else if (gsonPresent) {
		messageConverters.add(new GsonHttpMessageConverter());
	}
	else if (jsonbPresent) {
		messageConverters.add(new JsonbHttpMessageConverter());
	}
	if (jackson2SmilePresent) {
		Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.smile();
		if (this.applicationContext != null) {
			builder.applicationContext(this.applicationContext);
		}
		messageConverters.add(new MappingJackson2SmileHttpMessageConverter(builder.build()));
	}
	if (jackson2CborPresent) {
		Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.cbor();
		if (this.applicationContext != null) {
			builder.applicationContext(this.applicationContext);
		}
		messageConverters.add(new MappingJackson2CborHttpMessageConverter(builder.build()));
	}
```
- 总结一下有那些
  - StringHttpMessageConverter
    - 注意这里设置了一个属性为false 才加载进去，主要是转换（把流写入responseBody）的时候，不套用request的字符集，转而使用response设置的字符集
    - 如果没有设置具体的charset，并且content-type类似 application/json 就设置成utf8
    - 最后返回 默认字符集， 就是文章最初提到的那个叫不上名字的 StandardCharsets.ISO_8859_1
  - ByteArrayHttpMessageConverter
  - ResourceHttpMessageConverter
  - ResourceRegionHttpMessageConverter
  - SourceHttpMessageConverter
  - AllEncompassingFormHttpMessageConverter
  - AtomFeedHttpMessageConverter
  - RssChannelHttpMessageConverter
  - MappingJackson2XmlHttpMessageConverter
  - Jaxb2RootElementHttpMessageConverter
  - MappingJackson2HttpMessageConverter
    - ⭐⭐ 这个是默认的把object转成json字符串的converter
  - GsonHttpMessageConverter
  - JsonbHttpMessageConverter
  - MappingJackson2SmileHttpMessageConverter
  - MappingJackson2CborHttpMessageConverter

- 两种情况
  - 如果没有什么其他处理，那么RestController返回的内容会被 MappingJackson2HttpMessageConverter转换，并放到body里面
  - （我的现有项目）方法被AOP拦截，在AOP里面对返回值进行了进一步处理，给返回加上状态值 ，信息等方便前端进行判定的字段，并且AOP替换这个方法输出，最终输出 一个字符串
    - 最终输出字符串的时候，实际上请求交给了StringHttpMessageConverter
    - 当然AOP也可以继续返回一个Object，这时候输出还是会交给MappingJackson2HttpMessageConverter

- 通过简单测试，可以发现
  - MappingJackson2HttpMessageConverter 会自动配application/json utf8信息，不会出现问题
  - 真正的问题在于：我自己的AOP让结果变成了String，但是在可生效的返回内，没有给response配置application/json，导致默认String类型的converter将其转换成了 默认字符集

- 所以自定义一个String类型的HttpMessageConverter，并且指定为 UTF8 ，Application/json是可行的
```java
package pers.missionlee.blog.component.http.converter;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.lang.Nullable;
import org.springframework.util.Assert;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * @description:
 *      配置这个HttpMessageConverter之后，就不需要所有controller里面写 produce=MediaType.APPLICATION_JSON_UTF8_VALUE 了
 *      读取的时候，可以接受各种 charset
 *      写的时候，一律写成Application/JSON UTF8
 * @author: Mission Lee
 * @create: 2019-08-19 19:39
 */
public class ApplicationJSONUTF8StringHttpMessageConverter extends AbstractHttpMessageConverter<String> {

    private static final StringHttpMessageConverter c = new StringHttpMessageConverter();
    private static List<Charset> charsets = new ArrayList<Charset>(){{add(StandardCharsets.UTF_8);}};
    public ApplicationJSONUTF8StringHttpMessageConverter() {
        super(StandardCharsets.UTF_8, MediaType.APPLICATION_JSON,MediaType.APPLICATION_JSON_UTF8);
    }
    private Charset getContentTypeCharset(@Nullable MediaType contentType) {
        if (contentType != null && contentType.getCharset() != null) {
            return contentType.getCharset();
        }
        else if (contentType != null && contentType.isCompatibleWith(MediaType.APPLICATION_JSON)) {
            // Matching to AbstractJackson2HttpMessageConverter#DEFAULT_CHARSET
            return StandardCharsets.UTF_8;
        }
        else {
            Charset charset = getDefaultCharset();
            Assert.state(charset != null, "No default charset");
            return charset;
        }
    }
    @Override
    protected Long getContentLength(String str, @Nullable MediaType contentType) {
        Charset charset = getContentTypeCharset(contentType);
        return (long) str.getBytes(charset).length;
    }
    @Override
    protected boolean supports(Class<?> clazz) {
        return String.class==clazz;
    }

    @Override
    protected String readInternal(Class<? extends String> clazz, HttpInputMessage inputMessage) throws IOException, HttpMessageNotReadableException {
        Charset charset = getContentTypeCharset(inputMessage.getHeaders().getContentType());

        return StreamUtils.copyToString(inputMessage.getBody(),charset);
    }
// https://www.bbsmax.com/A/QV5Zek1VJy/
    @Override
    protected void writeInternal(String s, HttpOutputMessage outputMessage) throws IOException, HttpMessageNotWritableException {
        System.out.println("调用了自定义的UTF8 StringHttpMessageConverter");
        //outputMessage.getHeaders().setAcceptCharset(charsets);
        StreamUtils.copy(s,StandardCharsets.UTF_8,outputMessage.getBody());
    }
}
// ================================================
@Configuration
public class WebMvcConfiguration extends WebMvcConfigurationSupport {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {

       ApplicationJSONUTF8StringHttpMessageConverter converter = new ApplicationJSONUTF8StringHttpMessageConverter();
       converters.add(converter);
        addDefaultHttpMessageConverters(converters);
    }

}

```

## 方法4 ，配置 content negotiation 

没有测试，时间比较晚了， 这个方法的作用应该是在有效区间，将 content-type charset参数设置起来
```java
@Configuration
public class WebMvcConfiguration extends WebMvcConfigurationSupport {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.defaultContentType(MediaType.APPLICATION_JSON_UTF8);
        configurer.mediaType("json", MediaType.APPLICATION_JSON_UTF8);
    }
}

```

## 原因探究

在配置文件，WebFilter，还有controller里面，我们都尝试把Response 的content-type / charset 设置成我们想要的模式，为什么不可行

- 首先要明确一定，我们使用RestController，返回的内容应该被放入ResponseBody里面
- 通过一波断点调试



- 启动
  - NioEndpoint 启动
- 接受请求
  - AbstractProtocol工作，ConnectionHandler工作
  - CoyoteAdapter工作（连接器）
  - 解析信息等等细节
- filter执行
- 开始服务service （不是Mvc的service，是 HttpServlet开始工作）
  - dispatcher servlet 开始工作，分发请求
  - HandlerAdapter 发现这是个 带有@RequestMaping 注解的 method
    - RequestMappingHandlerAdapter
    - 调用对应的注解方法
  - 我们便携的controller#method 开始工作 并返回一个值
  - HandlerMethodReturnValueHandlerComposite 中使用 HandlerMethodArgumentResolver 来处理我们方法中的返回值
    - RequestResponseBodyMethodProcessor 处理返回值 （因为我们用的RestController ，相当于使用 了 @ResoponseBody 注解）
    - 使用 MessageConverter 处理返回值
      
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

> 关于方法4， 设置 negotiation ，如果不设置，默认情况是 */* 接受一切，如果协商过后还是这样，或者为空 接受一切的情况下，对于StringMessageConverter 就会使用默认值

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


  ## 更加优雅的方案

  > ResponseBodyAdivce

  在以上所记录的的折腾过程中，我发现了一条 灰色注释，提到了ResponseBodyAdvice，同时也说明了，ResponseBodyAdvice应该可以起作用

  作用： 在 @ResponseBody/ResponseEntity 返回之后， HttpMessageConverter 处理之前，提供配置 response的入口 

