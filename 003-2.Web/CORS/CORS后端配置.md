CORS 跨域 实现思路及相关解决方案 

原创作品,转载请附带原文路径：http://www.cnblogs.com/sloong/p/cors.html

## CORS 定义

Cross-Origin Resource Sharing（CORS）跨来源资源共享是一份浏览器技术的规范，提供了 Web 服务从不同域传来沙盒脚本的方法，以避开浏览器的同源策略，是 JSONP 模式的现代版。与 JSONP 不同，CORS 除了 GET 要求方法以外也支持其他的 HTTP 要求。用 CORS 可以让网页设计师用一般的 XMLHttpRequest，这种方式的错误处理比 JSONP 要来的好。另一方面，JSONP 可以在不支持 CORS 的老旧浏览器上运作。现代的浏览器都支持 CORS。
```note
CORS是W3c工作草案，它定义了在跨域访问资源时浏览器和服务器之间如何通信。CORS背后的基本思想是使用自定义的HTTP头部允许浏览器和服务器相互了解对方，从而决定请求或响应成功与否。W3C CORS 工作草案
同源策略：是浏览器最核心也最基本的安全功能；同源指的是：同协议，同域名和同端口。精髓：认为自任何站点装载的信赖内容是不安全的。当被浏览器半信半疑的脚本运行在沙箱时，它们应该只被允许访问来自同一站点的资源，而不是那些来自其它站点可能怀有恶意的资源；参考:JavaScript 的同源策略
JSON & JSONP:JSON 是一种基于文本的数据交换方式，或者叫做数据描述格式。JSONP是资料格式JSON的一种“使用模式”，可以让网页从别的网域要资料，由于同源策略，一般来说位于server1.example.com的网页无法与不是 server1.example.com的服务器沟通，而HTML的script元素是一个例外。利用script元素的这个开放策略，网页可以得到从其他来源动态产生的JSON资料，而这种使用模式就是所谓的JSONP
```
> CORS 对比 JSONP
都能解决 Ajax直接请求普通文件存在跨域无权限访问的问题

- JSONP只能实现GET请求，而CORS支持所有类型的HTTP请求
- 使用CORS，开发者可以使用普通的XMLHttpRequest发起请求和获得数据，比起JSONP有更好的错误处理
- JSONP主要被老的浏览器支持，它们往往不支持CORS，而绝大多数现代浏览器都已经支持了CORS


## 主要用途
- `From a browser script perspective`: By allowing cross-domain requests, which are subject to tighter controls on the types of data that is exchanged. Cookies, for instance, are blocked unless specifically requested by the XHR author and allowed by the cross-domain web service. This is done to mitigate the risk of data leaks.
- `From a web service perspective`: By utilising the origin URL reported by the browser the target cross-domain web service can determine, based on its origin policy, whether to allow or deny the request.

> Ajax请求跨域资源的异常
当出现如下异常时，那么就需要考虑跨域的问题了
例如 localhost:63343 通过Ajax请求http://192.168.10.61:8080服务器资源时就会出现如下异常：

![](./res/001.png)

## CORS 实现思路

CORS背后的基本思想是使用自定义的HTTP头部允许浏览器和服务器相互了解对方，从而决定请求或响应成功与否
## 安全说明
CORS is not about providing server-side security. The Origin request header is produced by the browser and the server has no direct means to verify it.

CORS 并不是为了解决服务端安全问题，而是为了解决如何跨域调用资源。至于如何设计出 安全的开放API，却是另一个问题了，这里提下一些思路：

- 请求时间有效性（验证timestamp与服务接到请求的时间相差是否在指定范围内，比如5分钟内）
- token验证
- ip验证
- 来源验证
例如
```json
    {
        'name': 用户名,
        ‘key: 加密的验证key,//(name+secret+timestamp来通过不可逆加密生成)
        ‘timestamp’: 时间戳,//验证timestamp与服务接到请求的时间相差是否在指定范围内，比如5分钟内
    }
```
## CORS 几种解决方案

CORS背后的基本思想是使用自定义的HTTP头部允许浏览器和服务器相互了解对方，从而决定请求或响应成功与否.

- Access-Control-Allow-Origin:指定授权访问的域
- Access-Control-Allow-Methods：授权请求的方法（GET, POST, PUT, DELETE，OPTIONS等)

### 一：简单的自定义CORSFilter / Interceptor
适合设置单一的（或全部）授权访问域，所有配置都是固定的，特简单。也没根据请求的类型做不同的处理
在web.xml 中添加filter
```xml
<filter>
    <filter-name>cros</filter-name>
    <filter-class>cn.ifengkou.test.filter.CORSFilter</filter-class>
</filter>
<filter-mapping>
    <filter-name>cros</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>
```
新增CORSFilter 类
```java
@Component
public class CORSFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        response.addHeader("Access-Control-Allow-Headers", "Content-Type");
        response.addHeader("Access-Control-Max-Age", "1800");//30 min
        filterChain.doFilter(request, response);
    }
}
```
Access-Control-Allow-Origin只能配置 或者一个域名*
比如配置了192.168.56.130，那么只有192.168.56.130 能拿到数据，否则全部报403异常
```java
response.addHeader("Access-Control-Allow-Origin", "http://192.168.56.130");
```
### 二：Nginx 配置支持Ajax跨域
这里是一个nginx启用COSR的参考配置：来源
```conf
#
# Wide-open CORS config for nginx
#
location / {
     if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        #
        # Custom headers and headers various browsers *should* be OK with but aren't
        #
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
        #
        # Tell client that this pre-flight info is valid for 20 days
        #
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
     }
     if ($request_method = 'POST') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
     }
     if ($request_method = 'GET') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
     }
}
```
### 三：支持多域名配置的CORS Filter

因为知道已经有可以用的库可以解决，所以就没重复造轮子了。其实因为懒，看看别人的源码算了。。。

在mvnrepository搜索cors-filter,目前也就两个可以用
- org.ebaysf.web 的 cors-filter,项目地址：https://github.com/ebay/cors-filter
- com.thetransactioncompany的 cors-filter，项目地址：http://software.dzhuvinov.com/cors-filter.html

这两个也都大同小异，因为ebay开源在github上，也有详细的README，那么就以ebay的cors-filter为例
配置
添加依赖包到项目：
```xml
<dependency>
    <groupId>org.ebaysf.web</groupId>
    <artifactId>cors-filter</artifactId>
    <version>1.0.1</version>
</dependency>
```
添加配置(具体配置项，还是见项目的README.md吧）
```xml
  <filter>
    <filter-name>CORS Filter</filter-name>
    <filter-class>org.ebaysf.web.cors.CORSFilter</filter-class>
    <init-param>
      <param-name>cors.allowed.origins</param-name>
      <param-value>http://192.168.56.129,http://192.168.56.130</param-value>
    </init-param>
    <init-param>
      <param-name>cors.allowed.methods</param-name>
      <param-value>GET,POST,HEAD,OPTIONS,PUT</param-value>
    </init-param>
    <init-param>
      <param-name>cors.allowed.headers</param-name>
      <param-value>Content-Type,X-Requested-With,accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers</param-value>
    </init-param>
  </filter>
  <filter-mapping>
    <filter-name>CORS Filter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
```
- 源码分析

源码地址：github。但通过IDEA Decompiled 出来的更清晰.....,以下是反编译的
ebaysf的cors-filter 只有一个类CORSFilter。也就是一个拦截器，implements Filter
```java
public final class CORSFilter implements Filter {
```
通过是实现Filter 的init 方法从配置文件中读取参数：
```java
public void init(FilterConfig filterConfig) throws ServletException {
    this.parseAndStore("*", "GET,POST,HEAD,OPTIONS", "Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers", "", "true", "1800", "false", "true");
    this.filterConfig = filterConfig;
    this.loggingEnabled = false;
    if(filterConfig != null) {
        String configAllowedOrigins = filterConfig.getInitParameter("cors.allowed.origins");
        String configAllowedHttpMethods = filterConfig.getInitParameter("cors.allowed.methods");
        String configAllowedHttpHeaders = filterConfig.getInitParameter("cors.allowed.headers");
        String configExposedHeaders = filterConfig.getInitParameter("cors.exposed.headers");
        String configSupportsCredentials = filterConfig.getInitParameter("cors.support.credentials");
        String configPreflightMaxAge = filterConfig.getInitParameter("cors.preflight.maxage");
        String configLoggingEnabled = filterConfig.getInitParameter("cors.logging.enabled");
        String configDecorateRequest = filterConfig.getInitParameter("cors.request.decorate");
        this.parseAndStore(configAllowedOrigins, configAllowedHttpMethods, configAllowedHttpHeaders, configExposedHeaders, configSupportsCredentials, configPreflightMaxAge, configLoggingEnabled, configDecorateRequest);
    }
}
```
parseAndStore 方法，解析参数。以 解析cors.allowed.orgins为例；其他参数同理
```java
    Set e;
    if(allowedOrigins != null) {
        if(allowedOrigins.trim().equals("*")) {
            this.anyOriginAllowed = true;
        } else {
            this.anyOriginAllowed = false;
            e = this.parseStringToSet(allowedOrigins);
            this.allowedOrigins.clear();
            this.allowedOrigins.addAll(e);
        }
    }
//parseStringToSet
//对多域名用点分割，加到HashSet中，再赋给allowedOrigins（Collection<String> allowedOrigins = new HashSet();）
private Set<String> parseStringToSet(String data) {
    String[] splits;
    if(data != null && data.length() > 0) {
        splits = data.split(",");
    } else {
        splits = new String[0];
    }

    HashSet set = new HashSet();
    if(splits.length > 0) {
        String[] arr$ = splits;
        int len$ = splits.length;

        for(int i$ = 0; i$ < len$; ++i$) {
            String split = arr$[i$];
            set.add(split.trim());
        }
    }

    return set;
}
```
如何实现 doFilter
```java
public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
    if(servletRequest instanceof HttpServletRequest && servletResponse instanceof HttpServletResponse) {
        HttpServletRequest request1 = (HttpServletRequest)servletRequest;
        HttpServletResponse response = (HttpServletResponse)servletResponse;
        //识别request 属于哪种类别
        CORSFilter.CORSRequestType requestType = this.checkRequestType(request1);
        if(this.decorateRequest) {
            decorateCORSProperties(request1, requestType);
        }

        switch(CORSFilter.SyntheticClass_1.$SwitchMap$org$ebaysf$web$cors$CORSFilter$CORSRequestType[requestType.ordinal()]) {
        case 1:
            this.handleSimpleCORS(request1, response, filterChain);
            break;
        case 2:
            this.handleSimpleCORS(request1, response, filterChain);
            break;
        case 3:
            this.handlePreflightCORS(request1, response, filterChain);
            break;
        case 4:
            this.handleNonCORS(request1, response, filterChain);
            break;
        default:
            this.handleInvalidCORS(request1, response, filterChain);
        }

    } else {
        String request = "CORS doesn\'t support non-HTTP request or response.";
        throw new ServletException(request);
    }
}
```
判断request类别，根据类别进行差异化处理。handleSimpleCORS 处理过程，判断是否设置允许所有origin参数，判断是否符合httpMethods要求，判断此次request的origin（origin = request.getHeader("Origin")）是否在allowedOrigins（origin白名单）内。如果在，就设置response.addHeader("Access-Control-Allow-Origin", origin);这样也就实现了多域名支持。流程图就不画了...
```java
public void handleSimpleCORS(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        CORSFilter.CORSRequestType requestType = this.checkRequestType(request);
        String origin;
        if(requestType != CORSFilter.CORSRequestType.SIMPLE && requestType != CORSFilter.CORSRequestType.ACTUAL) {
            origin = "Expects a HttpServletRequest object of type " + CORSFilter.CORSRequestType.SIMPLE + " or " + CORSFilter.CORSRequestType.ACTUAL;
            throw new IllegalArgumentException(origin);
        } else {
            origin = request.getHeader("Origin");
            String method = request.getMethod();
            if(!this.isOriginAllowed(origin)) {
                this.handleInvalidCORS(request, response, filterChain);
            } else if(!this.allowedHttpMethods.contains(method)) {
                this.handleInvalidCORS(request, response, filterChain);
            } else {
                if(this.anyOriginAllowed && !this.supportsCredentials) {
                    response.addHeader("Access-Control-Allow-Origin", "*");
                } else {
                    response.addHeader("Access-Control-Allow-Origin", origin);
                }

                if(this.supportsCredentials) {
                    response.addHeader("Access-Control-Allow-Credentials", "true");
                }

                if(this.exposedHeaders != null && this.exposedHeaders.size() > 0) {
                    String exposedHeadersString = join(this.exposedHeaders, ",");
                    response.addHeader("Access-Control-Expose-Headers", exposedHeadersString);
                }

                filterChain.doFilter(request, response);
            }
        }
    }
```
为了避免对参数一知半解，就把作者的参数描述表贴上来，通过参数表可以了解下header里面各个参数的作用


- cors.allowed.origins

A list of origins that are allowed to access the resource. A '' can be specified to enable access to resource from any origin. Otherwise, a whitelist of comma separated origins can be provided. Ex: http://www.w3.org, https://www.apache.org. Defaults: (Any origin is allowed to access the resource).
- cors.allowed.methods

A comma separated list of HTTP methods that can be used to access the resource, using cross-origin requests. These are the methods which will also be included as part of 'Access-Control-Allow-Methods' header in a pre-flight response. Ex: GET,POST. Defaults: GET,POST,HEAD,OPTIONS
- cors.allowed.headers

A comma separated list of request headers that can be used when making an actual request. These header will also be returned as part of 'Access-Control-Allow-Headers' header in a pre-flight response. Ex: Origin,Accept. Defaults: Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers
- cors.exposed.headers

A comma separated list of headers other than the simple response headers that browsers are allowed to access. These are the headers which will also be included as part of 'Access-Control-Expose-Headers' header in the pre-flight response. Ex: X-CUSTOM-HEADER-PING,X-CUSTOM-HEADER-PONG. Default: None
- cors.preflight.maxage

The amount of seconds, browser is allowed to cache the result of the pre-flight request. This will be included as part of 'Access-Control-Max-Age' header in the pre-flight response. A negative value will prevent CORS Filter from adding this response header from pre-flight response. Defaults: 1800
- cors.support.credentials

A flag that indicates whether the resource supports user credentials. This flag is exposed as part of 'Access-Control-Allow-Credentials' header in a pre-flight response. It helps browser determine whether or not an actual request can be made using credentials. Defaults: true
- cors.logging.enabled

A flag to control logging to container logs. Defaults: false
- cors.request.decorate

A flag to control if the request should be decorated or not. Defaults: true
#### 测试：

- 1.服务端准备接口（我的地址是：http://192.168.10.61:8080/api）
```java
@RequestMapping(method = RequestMethod.GET,value = "test")
@ResponseBody
public HashMap<String,Object> getArticles(){
    HashMap<String,Object> map = new HashMap<>();
    map.put("result","success");
    return map;
}
```
- 2.过滤器配置(web.xml),配置允许访问的域为：http://192.168.56.129，http://www.website2.com
```xml
<filter>
    <filter-name>CORS Filter</filter-name>
    <filter-class>org.ebaysf.web.cors.CORSFilter</filter-class>
    <init-param>
      <param-name>cors.allowed.origins</param-name>
      <param-value>http://192.168.56.129,http://www.website2.com</param-value>
    </init-param>
  </filter>
  <filter-mapping>
    <filter-name>CORS Filter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
```
3.准备测试网页index.html：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>cors test page</title>
    <script src="jquery.min.js"></script>
    <script>
        function loadData(){
            $.ajax({
                url: "http://192.168.10.61:8080/api",
                type:"GET",
                dataType:"json",
                timeout:10000,
                success:function(data){
                    $("#result").append(data.result+"<br />");
                    console.log(data);
                },
                error:function(e){
                    $("#result").append(e.statusText+"<br />");
                }
            });
        }
        $(function(){
            $("#host").append("origin:"+window.location.origin);
        });
    </script>
</head>
<body>
<button onclick="loadData()">onclick</button>
<div id="host"></div>
<div id="result" style="height:200px;width:100%"></div>
</body>
</html>
```
- 4.将index.html发布到nginx（nginx后面也有方案）
index.html 不能直接用浏览器打开运行，虽然可以调用Ajax请求，但是域是file:///path/index.html
虚拟机增加一个网卡地址（原机器IP是192.168.56.129)
ifconfig eth0:0 192.168.56.130
建立两个测试网站
cd home
mkdir /website1 #站点目录
mkdir /website2 
将index.html 传输到这两个目录
配置nginx，增加两个server节点
```conf
# ----server1 ----
server {
    listen       192.168.56.129:80;
    server_name  www.website1.com;
    location / {
        root   /website1;
        index  index.html index.htm;
    }
}
# ----server2 ----
server {
    listen       192.168.56.130:80;
    server_name  www.website2.com;
    location / {
        root   /website2;
        index  index.html index.htm;
    }
}
```
重启nginx服务
./nginx -s reload
- 5.修改本地hosts文件
//hosts文件路径：windows系统一般在C:\Windows\System32\drivers\etc
```hosts
192.168.56.129  www.website1.com
192.168.56.130  www.website2.com
```
通过增加虚拟网卡 、nginx代理 和 修改hosts文件，我在本地就有4个网站(域）可以进行测试了，分别是:
```conf
http://192.168.56.129
http://192.168.56.130
http://www.website1.com
http://www.website2.com
```
- 6.测试
准备:
（chrome）打开4个tab，分别进入到上述四个网站，页面打印了当前origin，通过onclick调用Ajax请求，页面布局如下

预期：
```conf
http://192.168.56.129 SUCCESS
http://192.168.56.130 ERROR
http://www.website1.com ERROR
http://www.website2.com SUCCESS
```
结果： 符合预期！

建议使用，除了对域的过滤，还做了其他很多操作，比简单的自定义过滤器考虑得周全，例如
```java
this.handlePreflightCORS(request1, response, filterChain);
this.handleNonCORS(request1, response, filterChain);
this.handleInvalidCORS(request1, response, filterChain);
```
总结
cors在开发WebService、RESTful API 时经常会遇到，在以前可能直接通过jsonp解决，jsonp怎样怎样就不多说了。 总之，CORS技术规范出来这么久了，如果不考虑IE6 IE7的问题，那么还是积极拥抱CORS吧

上文三种解决方案，通过搜索引擎均能找到，但估计大部分都是用的第一种最简单的无脑的Cors Filter处理，第二种方案是通过nginx配置的，并不适合所有Web应用。第三种，考虑得很周全，而且使用方便，如果不考虑造重复轮子，推荐使用。
本文所用的测试工程代码太简单了，就不放github了，直接下载吧，项目下载地址
断断续续写了好几天，转载请附带原文路径：http://www.cnblogs.com/sloong/p/cors.html
首发于[个人博客](https://ifengkou.github.io)，转载或引用请附带原文链接，如果文章有摘录和参考，请勿删除文后的[参考和摘录] 章节