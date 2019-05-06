# Unsafe 与 LockSupport

参考文章：https://blog.csdn.net/aesop_wubo/article/details/7537278

java不能直接访问操作系统底层，而是通过本地方法来访问。Unsafe类提供了硬件级别的原子操作，主要提供了以下功能：

## 通过Unsafe类可以分配内存，可以释放内存；

类中提供的3个本地方法`allocateMemory`、`reallocateMemory`、`freeMemory`分别用于分配内存，扩充内存和释放内存，与C语言中的3个方法对应。

## 可以定位对象某字段的内存位置，也可以修改对象的字段值，即使它是私有的；
```java
public native long allocateMemory(long l);
public native long reallocateMemory(long l, long l1);
public native void freeMemory(long l);
```
>字段的定位：

JAVA中对象的字段的定位可能通过`staticFieldOffset`方法实现，该方法返回给定field的内存地址偏移量，这个值对于给定的filed是唯一的且是固定不变的。
`getIntVolatile`方法获取对象中offset偏移地址对应的整型field的值,支持volatile load语义。
`getLong`方法获取对象中offset偏移地址对应的long型field的值

> 数组元素定位：

Unsafe类中有很多以BASE_OFFSET结尾的常量，比如`ARRAY_INT_BASE_OFFSET`，`ARRAY_BYTE_BASE_OFFSET`等，这些常量值是通过`arrayBaseOffset`方法得到的。arrayBaseOffset方法是一个本地方法，可以获取数组第一个元素的偏移地址。Unsafe类中还有很多以INDEX_SCALE结尾的常量，比如 ARRAY_INT_INDEX_SCALE ， ARRAY_BYTE_INDEX_SCALE等，这些常量值是通过arrayIndexScale方法得到的。arrayIndexScale方法也是一个本地方法，可以获取数组的转换因子，也就是数组中元素的增量地址。将arrayBaseOffset与arrayIndexScale配合使用，可以定位数组中每个元素在内存中的位置。

```java
public final class Unsafe {
	public static final int ARRAY_INT_BASE_OFFSET;
	public static final int ARRAY_INT_INDEX_SCALE;
 
	public native long staticFieldOffset(Field field);
	public native int getIntVolatile(Object obj, long l);
	public native long getLong(Object obj, long l);
	public native int arrayBaseOffset(Class class1);
	public native int arrayIndexScale(Class class1);
 
	static 
	{
		ARRAY_INT_BASE_OFFSET = theUnsafe.arrayBaseOffset([I);
		ARRAY_INT_INDEX_SCALE = theUnsafe.arrayIndexScale([I);
	}
}
```
## 挂起与恢复

将一个线程进行挂起是通过park方法实现的，调用 park后，线程将一直阻塞直到超时或者中断等条件出现。unpark可以终止一个挂起的线程，使其恢复正常。整个并发框架中对线程的挂起操作被封装在 LockSupport类中，LockSupport类中有各种版本park方法，但最终都调用了Unsafe.park()方法。
```java

package java.util.concurrent.locks;
import sun.misc.Unsafe;

public class LockSupport {
    private LockSupport() {} // Cannot be instantiated.

    private static void setBlocker(Thread t, Object arg) {
        // Even though volatile, hotspot doesn't need a write barrier here.
        UNSAFE.putObject(t, parkBlockerOffset, arg);
    }

    public static void unpark(Thread thread) {
        if (thread != null)
            UNSAFE.unpark(thread);
    }

    public static void park(Object blocker) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        UNSAFE.park(false, 0L);
        setBlocker(t, null);
    }

    public static void parkNanos(Object blocker, long nanos) {
        if (nanos > 0) {
            Thread t = Thread.currentThread();
            setBlocker(t, blocker);
            UNSAFE.park(false, nanos);
            setBlocker(t, null);
        }
    }

    public static void parkUntil(Object blocker, long deadline) {
        Thread t = Thread.currentThread();
        setBlocker(t, blocker);
        UNSAFE.park(true, deadline);
        setBlocker(t, null);
    }

  
    public static Object getBlocker(Thread t) {
        if (t == null)
            throw new NullPointerException();
        return UNSAFE.getObjectVolatile(t, parkBlockerOffset);
    }

   
    public static void park() {
        UNSAFE.park(false, 0L);
    }

   
    public static void parkNanos(long nanos) {
        if (nanos > 0)
            UNSAFE.park(false, nanos);
    }

   
    public static void parkUntil(long deadline) {
        UNSAFE.park(true, deadline);
    }

   
    static final int nextSecondarySeed() {
        int r;
        Thread t = Thread.currentThread();
        if ((r = UNSAFE.getInt(t, SECONDARY)) != 0) {
            r ^= r << 13;   // xorshift
            r ^= r >>> 17;
            r ^= r << 5;
        }
        else if ((r = java.util.concurrent.ThreadLocalRandom.current().nextInt()) == 0)
            r = 1; // avoid zero
        UNSAFE.putInt(t, SECONDARY, r);
        return r;
    }

    // Hotspot implementation via intrinsics API
    private static final sun.misc.Unsafe UNSAFE;
    private static final long parkBlockerOffset;
    private static final long SEED;
    private static final long PROBE;
    private static final long SECONDARY;
    static {
        try {
            UNSAFE = sun.misc.Unsafe.getUnsafe();
            Class<?> tk = Thread.class;
            parkBlockerOffset = UNSAFE.objectFieldOffset
                (tk.getDeclaredField("parkBlocker"));
            SEED = UNSAFE.objectFieldOffset
                (tk.getDeclaredField("threadLocalRandomSeed"));
            PROBE = UNSAFE.objectFieldOffset
                (tk.getDeclaredField("threadLocalRandomProbe"));
            SECONDARY = UNSAFE.objectFieldOffset
                (tk.getDeclaredField("threadLocalRandomSecondarySeed"));
        } catch (Exception ex) { throw new Error(ex); }
    }

}

```
## CAS操作

是通过compareAndSwapXXX方法实现的
```java
/**
* 比较obj的offset处内存位置中的值和期望的值，如果相同则更新。此更新是不可中断的。
* 
* @param obj 需要更新的对象
* @param offset obj中整型field的偏移量
* @param expect 希望field中存在的值
* @param update 如果期望值expect与field的当前值相同，设置filed的值为这个新值
* @return 如果field的值被更改返回true
*/
public native boolean compareAndSwapInt(Object obj, long offset, int expect, int update);
```
CAS操作有3个操作数，内存值M，预期值E，新值U，如果M==E，则将内存值修改为B，否则啥都不做。
