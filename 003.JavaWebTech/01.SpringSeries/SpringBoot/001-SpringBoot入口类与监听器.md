# SpringBoot 2.1.3.RELEASE 版本

一个新的spring boot项目，ide会自动创建一个入口

```java
@SpringBootApplication
public class LearnApplication {

    public static void main(String[] args) {
        SpringApplication.run(LearnApplication.class, args);
    }

}
```

- 这个入口被 @SpringBootApplication 注解，我们来看一下这个注解

```java
/*
 * Copyright 2012-2017 the original author or authors.
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

package org.springframework.boot.autoconfigure;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.context.TypeExcludeFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.annotation.AliasFor;

/**
 * Indicates a {@link Configuration configuration} class that declares one or more
 * {@link Bean @Bean} methods and also triggers {@link EnableAutoConfiguration
 * auto-configuration} and {@link ComponentScan component scanning}. This is a convenience
 * annotation that is equivalent to declaring {@code @Configuration},
 * {@code @EnableAutoConfiguration} and {@code @ComponentScan}.
 *
 * @author Phillip Webb
 * @author Stephane Nicoll
 * @since 1.2.0
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration  // ⭐ 在早些的版本中 这里是 @Configuration 当然 点开看看@SpringBootConfiguration你会发现其中还是 @Configuration
@EnableAutoConfiguration  // ⭐ 启动Spring boot内置的自动配置
@ComponentScan(excludeFilters = {  // ⭐ 扫描bean，看各种攻略里面介绍默认扫描当前层级，和当前层级下级的内容
		@Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {

	@AliasFor(annotation = EnableAutoConfiguration.class)
	Class<?>[] exclude() default {};
	@AliasFor(annotation = EnableAutoConfiguration.class)
	String[] excludeName() default {};
	@AliasFor(annotation = ComponentScan.class, attribute = "basePackages")
	String[] scanBasePackages() default {};
	@AliasFor(annotation = ComponentScan.class, attribute = "basePackageClasses")
	Class<?>[] scanBasePackageClasses() default {};
}
```

## 我们的第一件事是尝试启动这个应用

- 启动过程中我们有对应的事件监听机制
  - 实现 ApplicationListener 接口就可以进行对应的操作
  - 支持的事件在 package org.springframework.boot.context.event 中
    - ApplicationStartedEvent 等等

- 我这边创建了一个 LMSListener 监听启动事件
```java
public class LMSListener implements ApplicationListener<ApplicationStartedEvent> {
    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {
        System.out.println("== LMSListener == applicationStartedEvented");
    }
}
```
然后把这个监听注册到 应用中

```java
@SpringBootApplication
public class LearnApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(LearnApplication.class);
        app.addListeners(new LMSListener());
        app.run(args);
    }

}
```

运行这个方法，可以看到 打印了这句话

> 一个对于Listener的应用

存在一个 ConfigFileApplicationListener 监听ApplicationEvent（就是监听所有阶段），当判断执行到目标阶段的时候，会加载已经配置的“配置文件”