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

- 不可行的方案(对，你没有看错，不过请注意前提)
  - 修改application.properties中的几个参数
  - 配置WebFilter，并修改response的content-type
  - 在RestController的Handler对应的 method里面，修改response的content-type
  - postHandle 不可用

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
  - 匹配到的方法开始工作，并返回一个返回值
    - 返回值在我们这是@ResponseBody注解的
    - 这个地方