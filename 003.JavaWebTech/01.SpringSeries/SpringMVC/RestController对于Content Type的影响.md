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

