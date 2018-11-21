# Spring Boot Test

> 在SpringBoot下进行测试，主要的需求是准备好Spring环境，让各个对象都能正确注入就可以了

## 首先引入Test相关类

```xml
        <dependency>
            <!-- MissionLee  -->
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
```
## idea中，测试需要在标记的测试目录下

- 在 Java 同级别（SpringMVC项目 Resource文件夹同级别）创建 test 目录：标记为 test [Mark as test source root]

## 创建基础测试类
```java
@RunWith(SpringRunner.class) // 测试运行的环境， 这里运行在Spring测试环境中
@SpringBootTest(classes={PlatformApplication.class}) //这是当前项目的启动入口类
public class TestBasicClass {
    @Before
    public void before(){
        System.out.println("X=X=X=X=X=X START TEST X=X=X=X=X=X=X");
    }
    @After
    public void after(){
        System.out.println("X=X=X=X=X=X END TEST X=X=X=X=X=X=X");
    }
}

```

## 我们自己的测试类

> 具体的测试类都集成 基础类就可以了，这样 @Resource 就可以正确注入了。

> Q&A 不是使用 new 创建对象然后测试吗？  如果new的对象有注入其他内容，那么久必须启动Spring环境，没有Spring相关注入的话就可以自行测试。

```java
public class RedisDeplicaTest extends TestBasicClass {
    @Resource(name = "redisTemplate")
    RedisTemplate redisTemplate;
//    @Resource(name="articleRedisTemplate")
//    RedisTemplate redisTemplate2;
    @Resource
    RedisService redisService;

    @Test
    public void test(){
        redisService.set("testxxxxxxxxxxx","xxxxxxxxxx");
        redisTemplate.opsForValue().set("testopsForValue","redisTemplate");
        //redisTemplate2.opsForValue().set("testopsForValue","redisTemplate2");
    }
}

```