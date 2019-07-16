# Redisson / setNX

分布式锁是非常常用的内容，项目中用到的时候，这里很自然想到借助redis来实现相关功能

> 老旧知识与经验主义，已经知道的内容和学习新内容的平衡

> 在我决定在项目里面自己开发一个redis分布式锁的时候，KingLeading多次跟我说过使用lua脚本来做锁，当然我知道lua脚本可以做什么事情，并且Redis支持执行lua脚本。在我尝试写一个锁的时候，也搜索到了相关的内容。不过我并没有尝试去使用lua脚本，因为“看起来 Java的redis客户端 jedis/Spring#redisTemplate” 已经能够满足使用

- 总结在前
  - 网上看到的一些错误的例子： 使用的是  setNX + expire 方法
    - 错误问题： setNX 执行成功， expire不成功 造成的问题
    - 还有一些过期的言论：
      - 看到一些说只能使用 eval 执行lua脚本，这是因为 set 增强方法是在 比较新的redis版本出现的，在很多过期攻略里面，或者“资深”开发者哪里，这部分可能没有即时更新知识
  - 我们自己开发的基于 （redisTemplate 提供的 setIFAbsent）的方法（实际使用 增强版 set命令）
  - 一些使用上的问题
    - Redisson： redisson 的实现，解锁验证的是“线程”，并不是在所有情况下都符合业务要求，有时候可能用一个 钥匙“value”来解锁，我自己（参考网络文章修改）实现的版本实际就是这个作用

## 方案1： 利用 setNX 命令 set 扩展命令

看了 SpringData redis（Jedis）一些源码， redisTemplate 提供的和对应的redis自身方法是：

- Boolean setIfAbsent(K key, V value, long timeout, TimeUnit unit);
- SET key value [EX seconds] [PX milliseconds] [NX|XX]
  - 返回 OK / NULL
  - OK 表示成功
  - NULL 表示 因为 NX 或 XX 条件不满足，没执行对应操作
  - 这里给自己加深印象，解释一下命令中的各个关键字
    - SET 设置
    - key  key
    - value value
    - EX 过期时间秒计算
    - PX 过期时间毫秒计算
    - NX 没有这个key就执行
    - XX 有这个key就执行

下面贴一下 源码的核心部分 ( setIfAbsent 真正执行命令时候调用的 符合锁需求的方法)

实际执行过程中，根据参数不同，不一定调用这个方法的，Expiration 和 SetOption 都是完成锁的必要内容。
```java
	@Override
	public Boolean set(byte[] key, byte[] value, Expiration expiration, SetOption option) {

		Assert.notNull(key, "Key must not be null!");
		Assert.notNull(value, "Value must not be null!");
		Assert.notNull(expiration, "Expiration must not be null!");
		Assert.notNull(option, "Option must not be null!");

		if (expiration.isPersistent()) { // Expiration 就是把 一个 时间值 和对应的 TimeUnit 封装起来的类，表示过期时间，这里判断一下这次操作是要 永久 还是有 过期时间

			if (ObjectUtils.nullSafeEquals(SetOption.UPSERT, option)) { // SetOption.UPSET 表示没有什么额外参数
				return set(key, value);
			} else {// 如果有额外参数

				try {

					byte[] nxxx = JedisConverters.toSetCommandNxXxArgument(option); // 把参数转为 byte[]
                    // 选择合适的方法运行 pipelined queueing 普通
					if (isPipelined()) {

						pipeline(connection.newJedisResult(connection.getRequiredPipeline().set(key, value, nxxx),
								Converters.stringToBooleanConverter(), () -> false));
						return null;
					}
					if (isQueueing()) {

						transaction(connection.newJedisResult(connection.getRequiredTransaction().set(key, value, nxxx),
								Converters.stringToBooleanConverter(), () -> false));
						return null;
					}

					return Converters.stringToBoolean(connection.getJedis().set(key, value, nxxx));
				} catch (Exception ex) {
					throw convertJedisAccessException(ex);
				}
			}

		} else { // 如果设置了过期时间，参数加上过期时间，然后 额外选项/链接方式之类的判断都类似

			if (ObjectUtils.nullSafeEquals(SetOption.UPSERT, option)) {

				if (ObjectUtils.nullSafeEquals(TimeUnit.MILLISECONDS, expiration.getTimeUnit())) {
					return pSetEx(key, expiration.getExpirationTime(), value);
				} else {
					return setEx(key, expiration.getExpirationTime(), value);
				}
			} else {

				byte[] nxxx = JedisConverters.toSetCommandNxXxArgument(option);
				byte[] expx = JedisConverters.toSetCommandExPxArgument(expiration);

				try {
					if (isPipelined()) {

						if (expiration.getExpirationTime() > Integer.MAX_VALUE) {

							throw new IllegalArgumentException(
									"Expiration.expirationTime must be less than Integer.MAX_VALUE for pipeline in Jedis.");
						}

						pipeline(connection.newJedisResult(
								connection.getRequiredPipeline().set(key, value, nxxx, expx, (int) expiration.getExpirationTime()),
								Converters.stringToBooleanConverter(), () -> false));
						return null;
					}
					if (isQueueing()) {

						if (expiration.getExpirationTime() > Integer.MAX_VALUE) {
							throw new IllegalArgumentException(
									"Expiration.expirationTime must be less than Integer.MAX_VALUE for transactions in Jedis.");
						}

						transaction(connection.newJedisResult(
								connection.getRequiredTransaction().set(key, value, nxxx, expx, (int) expiration.getExpirationTime()),
								Converters.stringToBooleanConverter(), () -> false));
						return null;
					}

					return Converters
							.stringToBoolean(connection.getJedis().set(key, value, nxxx, expx, expiration.getExpirationTime()));

				} catch (Exception ex) {
					throw convertJedisAccessException(ex);
				}
			}
		}
	}

```

上面这部分是 set 方法的源码

redisTemplate 中的 setIfAbsent 封装了这个方法，然后我参考了网上的一个实现方案，开发了下面的内容

- ⭐ 下面这个锁的实现有一个重要的特性： 通过 key-value 解锁，验证锁。
  - 这一点很重要，因为redisson的解锁 锁线程
  - 具体哪种实现“优秀”，还是要看自己的需求

```java
public class RedisDistributedLock {
    public final static long DEFAULT_LOCK_TIMEOUT = 10L * 1000;
    public static final long DEFAULT_ACQUIRE_RESOLUTION_MILLIS = 100L;
    RedisTemplate<String,Object> redisTemplate;

    public RedisDistributedLock(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    public void resetLockExpireTime(String lockKey,long extendMilliseconds){
            redisTemplate.expire(lockKey,extendMilliseconds,TimeUnit.MILLISECONDS);
    }
    // 给定 key 和解锁 value 并尝试锁定
    public boolean acquireWithGivenValue(String lockKey,String lockValue,long acquireTimeoutInMillis,long lockExpiryInMillis) throws InterruptedException {
        return doAcquire(lockKey,lockValue,acquireTimeoutInMillis,lockExpiryInMillis);
    }
    // 判断自己是否持有锁， 要提供 key 与 value
    public boolean isHoldingLoack(String lockKey,String lockValue){
        return lockValue.equals(redisTemplate.opsForValue().get(lockKey));
    }
    // 给定key，获取锁，并返回解锁密钥 UUID一个
    public UUID acquire(String lockKey,long acquireTimeoutInMillis,long lockExpiryInMillis) throws InterruptedException {
            UUID uuid =UUID.randomUUID();
            if(doAcquire(lockKey,uuid.toString(),acquireTimeoutInMillis,lockExpiryInMillis)){
                return uuid;
            }else{
                return null;
            }
    }
    public boolean doAcquire(String lockKey,String lockValue,long acquireTimeoutInMillis,long lockExpiryInMillis) throws InterruptedException {
        long timeout = 0L;
        if(acquireTimeoutInMillis<0)
            acquireTimeoutInMillis=1L;
        redisTemplate.opsForValue().get(lockKey);//
        while (timeout < acquireTimeoutInMillis) { //在这段时间内 不断尝试获取锁
            if (redisTemplate.opsForValue().setIfAbsent(lockKey, lockValue,lockExpiryInMillis,TimeUnit.MILLISECONDS)){
                // 如果 setIfAbsent 成功 设置过期时间
                // 过期时间 <= 0，则立刻过期
                // redisTemplate.expire(lockKey, lockExpiryInMillis, TimeUnit.MILLISECONDS);
                return true;
            }
            TimeUnit.MILLISECONDS.sleep(DEFAULT_ACQUIRE_RESOLUTION_MILLIS);
            timeout += DEFAULT_ACQUIRE_RESOLUTION_MILLIS;
        }
        return false;
    }
    // 解锁， 给 key value 并尝试解锁
    public void release(String lockKey,String lockValue){
        if(lockValue==null)return;
        if(redisTemplate.hasKey(lockKey)){
            String inLockValue = redisTemplate.opsForValue().get(lockKey).toString();
            if(lockValue.equals(inLockValue)){
                redisTemplate.delete(lockKey);
            }else{
//                throw new RuntimeException("解锁失败，尝试使用错误的值解锁");
                System.out.println("解锁失败，尝试使用错误的值解锁");
            }
        }
    }
}
```


## Redisson

- redisson里面会有几个不同情况下

- 调用链条： RedissonLock#lock -> tryAcauire -> tryAcquireAsync
  -  <T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command)
  - leaseTime / TimeUnit : 自动释放事件
  - RedisCommand/RedisStrictCommand

```java
    <T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
        internalLockLeaseTime = unit.toMillis(leaseTime);

        return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, command,
                  "if (redis.call('exists', KEYS[1]) == 0) then " +
                      "redis.call('hset', KEYS[1], ARGV[2], 1); " +
                      "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                      "return nil; " +
                  "end; " +
                  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
                      "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                      "return nil; " +
                  "end; " +
                  "return redis.call('pttl', KEYS[1]);",
                    Collections.<Object>singletonList(getName()), internalLockLeaseTime, getLockName(threadId));
    }
```
- 这个方法中，主要是 commandExecutor.evalWriteAsync
  - key  为 getName
  - Codec 为 LongCodec.INSTANCE
  - command 是 RedisStrictCommand （宽泛一些是 RedisCommand）
    - 再RLock调用lock方法中，符合一些条件会调用 tryAcquireAsync方法，这个方法在调用 tryLockInnerAsync的时候，传的值是：RedisCommands.EVAL_LONG
    - 
```java
    @Override
    public <T, R> RFuture<R> evalWriteAsync(String key, Codec codec, RedisCommand<T> evalCommandType, String script, List<Object> keys, Object... params) {
        NodeSource source = getNodeSource(key);
        return evalAsync(source, false, codec, evalCommandType, script, keys, params);
    }
```

```java
    private <T, R> RFuture<R> evalAsync(NodeSource nodeSource, boolean readOnlyMode, Codec codec, RedisCommand<T> evalCommandType, String script, List<Object> keys, Object... params) {
        // 缓存script 并且 eval 模式下
        if (isEvalCacheActive() && evalCommandType.getName().equals("EVAL")) {
            RPromise<R> mainPromise = new RedissonPromise<R>(); // 使用了 netty框架完成底层数据传输，RedissonPromise 封装了 netty的Promise： ImmediatePromise<V>(this) | io.netty.util.concurrent
            
            Object[] pps = copy(params);
            
            RPromise<R> promise = new RedissonPromise<R>();
            String sha1 = calcSHA(script); // 计算一下 sha1
                                           // script 也要转换成 byte[] Redisson会缓存转换结果
            RedisCommand cmd = new RedisCommand(evalCommandType, "EVALSHA");//点到最底层 都没看到 RedisCommand 到底有啥用
            List<Object> args = new ArrayList<Object>(2 + keys.size() + params.length);
            args.add(sha1);// script
            args.add(keys.size());// key个数
            args.addAll(keys);// key
            args.addAll(Arrays.asList(params));//参数
            async(false, nodeSource, codec, cmd, args.toArray(), promise, 0, false);
            // 使用promise 执行
            promise.onComplete((res, e) -> {
                if (e != null) {
                    if (e.getMessage().startsWith("NOSCRIPT")) {
                        RFuture<String> loadFuture = loadScript(keys, script);
                        loadFuture.onComplete((r, ex) -> {
                            if (ex != null) {
                                free(pps);
                                mainPromise.tryFailure(ex);
                                return;
                            }

                            RedisCommand command = new RedisCommand(evalCommandType, "EVALSHA");
                            List<Object> newargs = new ArrayList<Object>(2 + keys.size() + params.length);
                            newargs.add(sha1);
                            newargs.add(keys.size());
                            newargs.addAll(keys);
                            newargs.addAll(Arrays.asList(pps));
                            async(false, nodeSource, codec, command, newargs.toArray(), mainPromise, 0, false);
                        });
                    } else {
                        free(pps);
                        mainPromise.tryFailure(e);
                    }
                    return;
                }
                free(pps);
                mainPromise.trySuccess(res);
            });
            return mainPromise;
        }
        
        RPromise<R> mainPromise = createPromise();
        List<Object> args = new ArrayList<Object>(2 + keys.size() + params.length);
        args.add(script);
        args.add(keys.size());
        args.addAll(keys);
        args.addAll(Arrays.asList(params));
        async(readOnlyMode, nodeSource, codec, evalCommandType, args.toArray(), mainPromise, 0, false);
        return mainPromise;
    }
```

关于eval ，太过底层的内容这里不去研究，Redis 2.6 版本之后开始支持 lua脚本执行，并且整个脚本的执行过程是一个整体，加上redis的“单线程”特性，我们就得到了一个可以支持多个步骤的“原子性”操作，这让redis在很多任务中变得更加好用。

>当然，也有一定的弊端，例如脚本执行时间过长之类的，redis提供了相应的处理机制，但是开发者提供更健壮的代码才是正确的解决方式
## 简单解释一下 eval 命令

redis eval 语法

EVAL script numkeys key[key ...] arg [arg ...]

- script : 一段lua脚本
- numkeys ： 键名个数
- key [] : 从eval的第三个参数开始算起，脚本中所用到的那些 redis键
  - ⭐ 键的参数可以在 Lua中通过全局变量KEYS 数组
- arg [arg ...]: 附加参数，在lua中通过全局变量ARGV数组访问

- 例子： 
```redis
redis 127.0.0.1:6379> eval "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}" 2 key1 key2 first second
1) "key1"
2) "key2"
3) "first"
4) "second"
```
## 先来看看这一段lua脚本

```lua
-- KEYS 用来传递键 ARGV 用来传递参数
if (redis.call('exists', KEYS[1]) == 0) then -- 如果键1 不存在 （存在返回1 不存在返回0）
      redis.call('hset', KEYS[1], ARGV[2], 1); -- 使用 键1 作为 key ，然后 放入键值对 ARGV[2]:1
      redis.call('pexpire', KEYS[1], ARGV[1]); -- 以毫秒为单位 设置 键1 的过期时间为 ARGV[1]
      return nil; 
end;
if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then -- 如果 上一步的 键1 还存在
      redis.call('hincrby', KEYS[1], ARGV[2], 1); -- 对 hset 里面的一个键的值 加1
      redis.call('pexpire', KEYS[1], ARGV[1]); -- 重设过期时间
      return nil;
end;
return redis.call('pttl', KEYS[1]); -- 以毫秒为单位 返回剩余过期时间
```

## 底层执行
```java
   public <V, R> void async(boolean readOnlyMode, NodeSource source, Codec codec,
            RedisCommand<V> command, Object[] params, RPromise<R> mainPromise, int attempt, 
            boolean ignoreRedirect) 
            // 这段代码就不看了
```