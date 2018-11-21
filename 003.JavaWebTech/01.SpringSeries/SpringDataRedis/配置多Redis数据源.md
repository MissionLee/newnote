# 多个Redis数据源

> 可以是同一个Redis的不同库，也可以是不同Redis

```conf
### application.properties
#### Server
spring.redis.password=xxxx
spring.redis.host=${ip}
spring.redis.database=15
spring.redis.port=27000
spring.redis.jedis.pool.max-wait=3600
spring.redis.jedis.pool.max-active=1
spring.redis.jedis.pool.max-idle=1
spring.redis.jedis.pool.min-idle=1
spring.redis.timeout=3600
## more redis
spring.redis2.database=0
spring.redis2.host=192.168.78.128
spring.redis2.port=17000
spring.redis2.password=Red!76is@03
```

> 对应RedisConf的写法 (Spring Boot)

> 主要就是在创建 JedisConnectionFactory的时候，使用不同的参数

> 另外：Spring-boot-starter-data-redis 缺少jar包，需要手动引入

```xml
		<dependency>
			<groupId>redis.clients</groupId>
			<artifactId>jedis</artifactId>
			<version>2.9.0</version>
		</dependency>
```

```java
import com.alibaba.fastjson.support.spring.FastJsonRedisSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class DefaultRedisConfig  {
    @Value("${spring.redis.database}")
    private int dbIndex;
    @Value("${spring.redis.host}")
    private String host;
    @Value("${spring.redis.port}")
    private int port;
    @Value("${spring.redis.password}")
    private String pwd;

    @Primary
    @Bean
    public JedisConnectionFactory defaultRedisConnectionFactory(){
        return getJedisConnectionFactory(dbIndex, host, port, pwd);
    }
    @Bean(name="redisTemplate")
    public RedisTemplate defaultRedisTemplate(){
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new FastJsonRedisSerializer(Object.class));
        redisTemplate.setValueSerializer(new FastJsonRedisSerializer(Object.class));
        redisTemplate.setConnectionFactory(defaultRedisConnectionFactory());
        return redisTemplate;
    }


    @Value("${spring.redis2.database}")
    private int dbIndex2;
    @Value("${spring.redis2.host}")
    private String host2;
    @Value("${spring.redis2.port}")
    private int port2;
    @Value("${spring.redis2.password}")
    private String pwd2;
    @Bean
    public JedisConnectionFactory articleRedisConnectionFactory(){
        return getJedisConnectionFactory(dbIndex2, host2, port2, pwd2);
    }
    @Bean(name = "articleRedisTemplate")
    public RedisTemplate articleRedisTemplate(){
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new FastJsonRedisSerializer(Object.class));
        redisTemplate.setValueSerializer(new FastJsonRedisSerializer(Object.class));
        redisTemplate.setConnectionFactory(articleRedisConnectionFactory());
        return redisTemplate;
    }
    private JedisConnectionFactory getJedisConnectionFactory(int dbIndex2, String host2, int port2, String pwd2) {
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setDatabase(dbIndex2);
        redisStandaloneConfiguration.setHostName(host2);
        redisStandaloneConfiguration.setPort(port2);
        redisStandaloneConfiguration.setPassword(RedisPassword.of(pwd2));
        return new JedisConnectionFactory(redisStandaloneConfiguration);
    }

}

```

- 这就是那个需要 引入 redis.clients jar包的报错：
```bash
Error:(72, 16) java: 无法访问redis.clients.jedis.JedisPoolConfig
  找不到redis.clients.jedis.JedisPoolConfig的类文件
```