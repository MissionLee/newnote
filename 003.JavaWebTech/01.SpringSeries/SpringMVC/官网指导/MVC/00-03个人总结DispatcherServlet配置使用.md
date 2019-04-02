#

从 00-02个人总结 我们可以看到，DispatcherServlet在完成初始化的最后一步，就是对各个组件进行配置

```java
	protected void initStrategies(ApplicationContext context) {
		initMultipartResolver(context);
		initLocaleResolver(context);
		initThemeResolver(context);
		initHandlerMappings(context);
		initHandlerAdapters(context);
		initHandlerExceptionResolvers(context);
		initRequestToViewNameTranslator(context);
		initViewResolvers(context);
		initFlashMapManager(context);
	}
```

- HandlerMapping
  - url（servletPath部分） 与 handler 映射
  - ⭐⭐ Interceptor 是handlerMapping管理的
- HandlerAdatper
  - 代理Handler
  - 将Handler解析的细节对DispatcherServlet屏蔽
    - 因为Handler可能是注解实现，也可能是继承实现什么接口
- HandlerExceptionResolver
  - 解决报错
- ViewResolver
- ThemeResovler
- MultipartResovler
  - 处理 Multipart请求，例如文件上传
- FlashMapManager

## 关于Filter

Filter是 java web的标准，Filter是配置给 Servlet的，也就是Filter是不受Spring框架管理的.