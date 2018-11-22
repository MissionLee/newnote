# RedisTemplate

> RedisTemplate 实际上一Jedis为基础，封装了其中的方法

## 我们看一个比较完整的 RedisConfig配置类

同步参考 [Jedis基础](../../03.Jedis/Jedis基础.md)
```java
@Configuration
public class RedisConfig {
    // 我们可以直接使用高度封装后的 redisTemplate，但是实际上底层使用了 JedisConnectionFactory。 看到过SpringDataRedis介绍，原本也支持其他的Redis客户端，但是在新版本中废弃了
	@Bean
	public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory){
		RedisTemplate<String, String> redisTemplate = new RedisTemplate<String, String>();
		redisTemplate.setConnectionFactory(connectionFactory);
        // ！！！！ 这里可以配置一些其他东西，例如Redis里面各种数据类型的序列化
        // ！！！！ 查看相同目录下的  配置多Redis数据源.md 可以加深相关理解
        redisTemplate.setHashValueSerializer(new FastJsonRedisSerializer(Object.class));
		return redisTemplate;
	}
	
	@Bean
	public RedisConnectionFactory connectionFactory(JedisPoolConfig poolConfig){
		JedisConnectionFactory jedisConnectionFactory = new JedisConnectionFactory(poolConfig);
		jedisConnectionFactory.setHostName("localhost");
		jedisConnectionFactory.setPort(6379);
		return jedisConnectionFactory;
	}
	
	@Bean
	public JedisPoolConfig poolConfig(){
		JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();
		jedisPoolConfig.setMaxIdle(20);
		jedisPoolConfig.setMaxTotal(200);
		jedisPoolConfig.setMaxWaitMillis(2000);
		jedisPoolConfig.setTestOnBorrow(true);
		jedisPoolConfig.setTestOnCreate(true);
		
		return jedisPoolConfig;
	}
}
```

## 从最表面的开始入手

### 先找一个 redisTemplate 提供的方法
```java
public Boolean hasKey(K key) {
	byte[] rawKey = rawKey(key);
	return execute(connection -> connection.exists(rawKey), true);
    // 重要！！！ 这里的 connection -> connection.exists(rawKey) 就是下面的RedisCallBack 函数-匿名函数
}
    //  rawKey 方法 用于以制定的方法 将 key序列化
private byte[] rawKey(Object key) {
	Assert.notNull(key, "non null key required");
	if (keySerializer == null && key instanceof byte[]) {
		return (byte[]) key;
	}
	return keySerializer.serialize(key);
}
   // execute 方法
   	public <T> T execute(RedisCallback<T> action, boolean exposeConnection) {
		return execute(action, exposeConnection, false);
	}
    	/**
	 * Executes the given action object within a connection that can be exposed or not. Additionally, the connection can
	 * be pipelined. Note the results of the pipeline are discarded (making it suitable for write-only scenarios).
	 *
	 * @param <T> return type
	 * @param action callback object to execute
	 * @param exposeConnection whether to enforce exposure of the native Redis Connection to callback code
	 * @param pipeline whether to pipeline or not the connection for the execution
	 * @return object returned by the action
	 */
	@Nullable
	public <T> T execute(RedisCallback<T> action, boolean exposeConnection, boolean pipeline) {

		Assert.isTrue(initialized, "template not initialized; call afterPropertiesSet() before using it");
		Assert.notNull(action, "Callback object must not be null");
        // 1. 拿到工厂
		RedisConnectionFactory factory = getRequiredConnectionFactory();
		RedisConnection conn = null;
		try {
            // 根据参数要求，从工厂中获取 RedisConnection conn
			if (enableTransactionSupport) {
				// only bind resources in case of potential transaction synchronization
				conn = RedisConnectionUtils.bindConnection(factory, enableTransactionSupport);
			} else {
				conn = RedisConnectionUtils.getConnection(factory);
			}

			boolean existingConnection = TransactionSynchronizationManager.hasResource(factory);
            // 对 RedisConnection进行预处理
			RedisConnection connToUse = preProcessConnection(conn, existingConnection);
            // 判断一下是否需要 Pipeline
			boolean pipelineStatus = connToUse.isPipelined();
			if (pipeline && !pipelineStatus) {
				connToUse.openPipeline();
			}

			RedisConnection connToExpose = (exposeConnection ? connToUse : createRedisConnectionProxy(connToUse));
            // 最后把 RedisConnection 传递给 回掉函数，执行回掉函数里面doInRedis方法
			T result = action.doInRedis(connToExpose);

			// close pipeline
			if (pipeline && !pipelineStatus) {
				connToUse.closePipeline();
			}

			// TODO: any other connection processing?
			return postProcessResult(result, connToUse, existingConnection);
		} finally {
			RedisConnectionUtils.releaseConnection(conn, factory);
		}
	}
    // 这里面 最重要的 一行 doInRedis 实际上就是调用了我们写的回掉函数
    // 实际上，具体的工作都是由 RedisConnection 来完成的
```

- 从配置RedisConfig里面，我们知道 最早的 RedisConnectionFactory 其实就是来自 Jedis ，所以之后的操作就全部使用 Redis来完成

## 总结

- redisTemplate 起到了什么作用
    - 1.把Jedis的一些命令封装起来 例如 ： .exists 转变为 hasKey
    - 2.可配置 keySerializer，在调用 底层Jedis方法之前，先把 k-v用制定方法序列化为 byte[]
    - 3.其他的预处理，尾处理操作： 获取/归还 RedisConnection ，判断执行 批操作之类的