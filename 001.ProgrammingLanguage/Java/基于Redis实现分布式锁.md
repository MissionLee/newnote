
# 基于Redis实现分布式锁

基本参考了csdn上的一个实现，但是这篇记录文章是后来补充的，忘了原文链接了，下面的代码也是从自己项目里面找出来的，在此说明一下，非原创

有一些小改动，原demo加锁只有uuid版本，这里扩展了可以自定义锁的内容，方便项目里面使用

```java
import org.springframework.data.redis.core.RedisTemplate;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

public class RedisDistributedLock {
    public final static long DEFAULT_LOCK_TIMEOUT = 10L * 1000;
    public static final long DEFAULT_ACQUIRE_RESOLUTION_MILLIS = 100L;
    RedisTemplate<String,Object> redisTemplate;

    public RedisDistributedLock(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean acquireWithGivenValue(String lockKey,String lockValue,long acquireTimeoutInMillis,long lockExpiryInMillis) throws InterruptedException {
        return doAcquire(lockKey,lockValue,acquireTimeoutInMillis,lockExpiryInMillis);
    }
    public UUID acquire(String lockKey,long acquireTimeoutInMillis,long lockExpiryInMillis) throws InterruptedException {
            UUID uuid =UUID.randomUUID();
            if(doAcquire(lockKey,uuid.toString(),acquireTimeoutInMillis,lockExpiryInMillis)){
                return uuid;
            }else{
                return null;
            }
    }
    private boolean doAcquire(String lockKey,String lockValue,long acquireTimeoutInMillis,long lockExpiryInMillis) throws InterruptedException {
        long timeout = 0L;
        while (timeout < acquireTimeoutInMillis) { //在这段时间内 不断尝试获取锁
            if (redisTemplate.opsForValue().setIfAbsent(lockKey, lockValue)){
                // 如果 setIfAbsent 成功 设置过期时间
                // 过期时间 <= 0，则立刻过期
                redisTemplate.expire(lockKey, lockExpiryInMillis, TimeUnit.MILLISECONDS);
                return true;
            }
            TimeUnit.MILLISECONDS.sleep(DEFAULT_ACQUIRE_RESOLUTION_MILLIS);
            timeout += DEFAULT_ACQUIRE_RESOLUTION_MILLIS;
        }
        return false;
    }
    public void release(String lockKey,String lockValue){
        if(lockValue==null)return;
        if(redisTemplate.hasKey(lockKey)){
            System.out.println("锁存在");
            String inLockValue = redisTemplate.opsForValue().get(lockKey).toString();
            if(lockValue.equals(inLockValue)){
                System.out.println("手动解锁成功");
                redisTemplate.delete(lockKey);
            }else{
                System.out.println("手动解锁失败");
            }
        }else{
            System.out.println("锁已经超时自己消失 ");
        }

    }
}
```