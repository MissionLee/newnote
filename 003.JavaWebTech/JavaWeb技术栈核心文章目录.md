# 核心文章目录


## RedisTemplate & Jedis 
> Redis / Jedis / SpringRedisTemplate. 

>这里可以看到JedisPool的实现，Spring中对于Jedis的封装。

>在RedisTemplate 中 数据序列化是在调用 execute之前执行的，所以当我们手动在execute方法中实现某些内容，这些内容是不会自动被配置好的 序列化工具处理的（可以自己调用序列化工具redisTemplate().get，）
- [Jedis基础](./03.Jedis/Jedis基础.md)
  - 获得Jedis实例，JedisPool
- [SpringRedisTemplate](./01.SpringSeries/SpringDataRedis/redisTemplate.md)
  - 从Spring中RedisConfig开始学习
  - 对于Jedis的封装
  - execute(RedisCallBack()) 方法
  - rawKey 定制序列化工具 xxxRedisSerializer
- [RedisTemplate.executePipelined](./01.SpringSeries/SpringDataRedis/在RedisTemplate中使用execute方法调用pipelined批量处理.md)
  - 注意无法自动使用序列化反序列化工具
  - 回掉函数函数doInRedis要求返回 null ： 实际返回值用 RedisConnection.closePipeline()返回值，反序列化处理后返回

## MyBatis

> Tips 1 : SqlSessionTemplate extends SqlSession

- [SpringBoot中手动配置SqlSession](./01.SpringSeries/SpringDataSQL/配置MyBatis.md)
  - 只要正确引入，并且 springboot.properties文件里面参数写好，SpringBoot就能自动帮我们配置好可用的 SqlSession
  - 即使这样，我还是探索了一下如何自己配置，因为注入过程，非常有利于对于 Mybatis底层的理解。