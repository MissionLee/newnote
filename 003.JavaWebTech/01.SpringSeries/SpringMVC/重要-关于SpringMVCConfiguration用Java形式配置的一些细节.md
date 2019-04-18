# SpringMVCConfig

https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#boot-features-spring-mvc-auto-configuration

总结写在最上面
- 配置Spring Web Mvc 的两种方案
  - [不推荐]方案一 @Configuration + @EnableWebMvc + implements WebMvcConfigurer
    - ⭐ @EnableWenMvc 只要写一次
    - ⭐ @Configuration + implements WebMvcConfigurer 可以有多个，分别进行配置
    - 🔺 问题： 用这个配置会导致 默认配置被忽略（默认配置是当没找到主动配置的时候启用的）
  - 方案二 @Configuration + extends WebMvcConfigurationSupport
    - ⭐ 可以配置方案一中配置的内容，同时可以配置很多进阶内容（例如配置HandlerMapping相关的东西，但是不建议这么做）
- 一些要注意的问题
  - 使用方案一的时候，是可以同时存在多个配置类 implements WebMvcConfigurer的，他们都会被执行
  - 一 二同时存在的时候，第二种配置不会生效，这也是为什么

最初项目里有一个

```java
@Configuration
public class SecurityInterceptorConfiguration extends WebMvcConfigurationSupport
```

通过这个类，配置了拦截器

后来为了处理一下跨域请求，添加了下面这个类

```java
@Configuration
@EnableWebMvc
public class GlobalWebMvcConfiguration implements WebMvcConfigurer
```

然后出现了一个问题，上面的SecurityInterceptorConfiguration 不生效了（项目初始化阶段根本没有调用）

之后做了一些简单的测试，最后在 @EnableWebMvc 注解的注释里面找到了说明

## 先放我的翻译，后面是原文
- @EnableWebMvc注解

添加这个注解到@Configuration类上，从 WebMvcConfigurationSupport导入配置，例如
```java
@Configuration
@EnableWebMvc
@ComponentScan(basePackageClasses = MyConfiguration.class)
public class MyConfiguration{

}
```
需要定制配置的话，可以 实现 WebMvcConfigurer这个接口，然后override里面的方法
```java
@Configuration
@EnableWebMvc
@ComponentScan(basePackageClasses = MyConfiguration.class)
public class MyConfiguration implements WebMvcConfigurer{
    @Override
    public void addFormatters(FormatterRegistry formatterRefistry){
        // do some thing
    }
}
```
> 注意： ⭐⭐ 仅有一个@Configuration类可以通过添加@EnableWebMvc注解来向Spring Web MVC添加配置。可以有多个@Configuration类实现 WebMvcConfigurer 从而定制配置

如果WebMvcConfigurer没有你需要的高阶配置，你可以考虑 删掉 @EnableWebMvc 注解，并且直接 继承WebMvcConfigurationSupport 或者 DelegatingWebMvcConfiguration

```java
/*
 * Copyright 2002-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.springframework.web.servlet.config.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.context.annotation.Import;

/**
 * Adding this annotation to an {@code @Configuration} class imports the Spring MVC
 * configuration from {@link WebMvcConfigurationSupport}, e.g.:
 *
 * <pre class="code">
 * &#064;Configuration
 * &#064;EnableWebMvc
 * &#064;ComponentScan(basePackageClasses = MyConfiguration.class)
 * public class MyConfiguration {
 *
 * }
 * </pre>
 *
 * <p>To customize the imported configuration, implement the interface
 * {@link WebMvcConfigurer} and override individual methods, e.g.:
 *
 * <pre class="code">
 * &#064;Configuration
 * &#064;EnableWebMvc
 * &#064;ComponentScan(basePackageClasses = MyConfiguration.class)
 * public class MyConfiguration implements WebMvcConfigurer {
 *
 * 	   &#064;Override
 * 	   public void addFormatters(FormatterRegistry formatterRegistry) {
 *         formatterRegistry.addConverter(new MyConverter());
 * 	   }
 *
 * 	   &#064;Override
 * 	   public void configureMessageConverters(List&lt;HttpMessageConverter&lt;?&gt;&gt; converters) {
 *         converters.add(new MyHttpMessageConverter());
 * 	   }
 *
 * }
 * </pre>
 *
 * <p><strong>Note:</strong> only one {@code @Configuration} class may have the
 * {@code @EnableWebMvc} annotation to import the Spring Web MVC
 * configuration. There can however be multiple {@code @Configuration} classes
 * implementing {@code WebMvcConfigurer} in order to customize the provided
 * configuration.
 *
 * <p>If {@link WebMvcConfigurer} does not expose some more advanced setting that
 * needs to be configured consider removing the {@code @EnableWebMvc}
 * annotation and extending directly from {@link WebMvcConfigurationSupport}
 * or {@link DelegatingWebMvcConfiguration}, e.g.:
 *
 * <pre class="code">
 * &#064;Configuration
 * &#064;ComponentScan(basePackageClasses = { MyConfiguration.class })
 * public class MyConfiguration extends WebMvcConfigurationSupport {
 *
 * 	   &#064;Override
 *	   public void addFormatters(FormatterRegistry formatterRegistry) {
 *         formatterRegistry.addConverter(new MyConverter());
 *	   }
 *
 *	   &#064;Bean
 *	   public RequestMappingHandlerAdapter requestMappingHandlerAdapter() {
 *         // Create or delegate to "super" to create and
 *         // customize properties of RequestMappingHandlerAdapter
 *	   }
 * }
 * </pre>
 *
 * @author Dave Syer
 * @author Rossen Stoyanchev
 * @since 3.1
 * @see org.springframework.web.servlet.config.annotation.WebMvcConfigurer
 * @see org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport
 * @see org.springframework.web.servlet.config.annotation.DelegatingWebMvcConfiguration
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Import(DelegatingWebMvcConfiguration.class)
public @interface EnableWebMvc {
}
```