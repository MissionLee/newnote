# JUC基础

参考 ： https://blog.csdn.net/androidsj/article/details/80167501

有大量自己的改动理解

> 传统线程编程模型中，为了防止死锁等现象的出现， wait(),notify(),synchronized() 时往往会考虑性能，公平性，资源管理等问题，加重开发人员负担
> Java5.0添加了一个新的java.util.concurrent开发包，利用此包进行多线程编程将有效减少竞争条件（race conditions)和死锁线程

## java.util.concurrent核心类

- Executor：具有Runnable任务的执行者。
  - Executor是一个标准接口，规定了一个 execute方法，传入一个Runnable对象
- ExecutorService：一个线程池管理者，其实现类有多种，我会介绍一部分，我们能把Runnable,Callable提交到池中让其调度。
  - public ExecutorService extends Executor 
  - 引入了一些控制方法
    - shutdown
    - isShutdown
    - isTerminated
    - awaitTermination
    - <T> Future<T> submit(Callable<T> task) ⭐
    - <T> Future<T> submit(Runnable task, T result) ⭐
    - Future<?> submit(Runnable task) ⭐
    - <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)throws InterruptedException ⭐
    - <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException ⭐
    - <T> T invokeAny(Collection<? extends Callable<T>> tasks) throws InterruptedException, ExecutionException ⭐
    - <T> T invokeAny(Collection<? extends Callable<T>> tasks, long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException ⭐
- Semaphore：一个计数信号量。
  - 将一系列任务提交给一个semaphore，这些任务会被block，每当semaphore释放一个许可，其中一个任务就会获得许可。
  - 实际上在实现中没有专门用来permit的对象，semaphore仅维护可用和执行数量
- ReentrantLock：一个可重入的互斥锁定Lock，功能类似synchronized，但要强大的多。
  - ⭐ java.util.concurrent.locks包里面提供几个锁，这是其中一个
- Future：是与Runnable,Callable进行交互的接口，比如一个线程执行结束后取返回的结果等，还提供了cancel终止线程。
  - FutureTask 是一个基本的实现
  - 同系列的ForkJoinTask 系列也是对Future的实现
- BlockingQueue：阻塞队列。
- CompletionService：ExecutorService的扩展，可以获得线程执行结果的。
- CountDownLatch：一个同步辅助类，在完成一组正在其他线程中执行的操作之前，它允许一个或多个线程一直等待。
- CyclicBarrier：一个同步辅助类，它允许一组线程互相等待，直到到达某个公共屏障点。
- ScheduldExecutorService：一个ExecutorService，可安排在给定的延迟后运行或定期执行的命令。

## TimeUnit工具类

这是一个时间单元的枚举类型

里面有 天 到 纳秒级别的时间枚举

提供了在各个时间单位之间转换的快捷方法，就不用我们自己口算或者在代码里面自己用乘除法还算了

## 原子操作类

> 既然强调了并发访问，那么就必须考虑操作系统位数；32位操作系统还是64位操作系统，对于Long数据类型而言，是64位的，如果现在项目运行在32位上，则long这个数据类型会占据两个32位空间进行数据的保存。
> 如果现在每一个程序类里面都去使用long进行处理的时候都手工进行volatile配置是不是太麻烦了，为了解决这样的问题，在juc里面提供有一个atomic子包，这个自包里面保存的都是原子性的操作数据，也就是说这个包里所包含的数据类型前都使用volatile进行声明。

### 原子操作分类
> 原子操作，是指操作过程不会被中断，保证数据操作是以原子方式进行的；
- 基本类型：AtomicInteger, AtomicLong, AtomicBoolean.
- 数组类型：AtomicIntegerArray, AtomicLongArray.
- 引用类型：AtomicReference, AtomicStampedRerence.
- 对象的属性修改类型：AtomicIntegerFieldUpdater, AtomicLongFieldUpdater, AtomicReferenceFieldUpdater.


- 以AtomicLong 为例子
  - 其内部存储的值为  private volatile long value
```java
    private volatile long value;
    public AtomicLong(long initialValue) {
        value = initialValue;
    }
```
- 以AtomicLongArray为例子
```java
// 使用AtomicLongArray不能使用下标操作了，而要使用get / set 方法
    public final long get(int i) {
        return getRaw(checkedByteOffset(i));
    }
    public final void set(int i, long newValue) {
        unsafe.putLongVolatile(array, checkedByteOffset(i), newValue);
    }
```

- AtomicReference  用来atomically
  - 同样用 volatile 关键字来操作目标

以上这些都有一个重要方法
```java
// AtomicLang
   public final boolean compareAndSet(long expect, long update) {
        return unsafe.compareAndSwapLong(this, valueOffset, expect, update);
    }
// AtomicReference
    public final boolean compareAndSet(V expect, V update) {
        return unsafe.compareAndSwapObject(this, valueOffset, expect, update);
    }
```
可以看到，其通过unsafe.compareAndSwapXxx 进行底层操作 [下面的内容来自这个传送门](https://www.cnblogs.com/hqlong/p/6586721.html)

关于 Unsafe中的CAS操作（CompareAndSwapXXX)

- Atomic 从JDK5开始, java.util.concurrent包里提供了很多面向并发编程的类. 使用这些类在多核CPU的机器上会有比较好的性能.
主要原因是这些类里面大多使用(失败-重试方式的)乐观锁而不是synchronized方式的悲观锁.
```java
// 以下面的内容为例
   public final int incrementAndGet() {
        for (;;) {
            int current = get();
            int next = current + 1;
            if (compareAndSet(current, next))
                return next;
        }
    }
```
- 首先可以看到，代码通过一个无限循环（spin）指导increment成功位置
- 循环内容为
  - 获取当前数值
  - 计算+1
  - 如果当前值还有效，更新为+1后的值
  - 如果设置没有

```java
// 底层 unsafe提供
public final boolean compareAndSet(int expect, int update) {
        return unsafe.compareAndSwapInt(this, valueOffset, expect, update);
    }
```
此处使用了 Unsafe类的compareAndSwapInt方法

```java
/**
     * Atomically update Java variable to <tt>x</tt> if it is currently
     * holding <tt>expected</tt>.
     * @return <tt>true</tt> if successful
     */
    public final native boolean compareAndSwapInt(Object o, long offset,
                                                  int expected,
                                                  int x);
```

再底层不是用Java实现,是下面这个(jni调用下面的操作系统原生程序)

```cpp
// compareAndSwapInt的 native实现
UNSAFE_ENTRY(jboolean, Unsafe_CompareAndSwapInt(JNIEnv *env, jobject unsafe, jobject obj, jlong offset, jint e, jint x))
  UnsafeWrapper("Unsafe_CompareAndSwapInt");
  oop p = JNIHandles::resolve(obj);
  jint* addr = (jint *) index_oop_from_field_offset_long(p, offset);
  return (jint)(Atomic::cmpxchg(x, addr, e)) == e;
UNSAFE_END
```
可以看到实际调用 Atomic::cmpxchg() 方法
```hpp
inline jint     Atomic::cmpxchg    (jint     exchange_value, volatile jint*     dest, jint     compare_value) {
  // alternative for InterlockedCompareExchange
  int mp = os::is_MP();
  __asm {
    mov edx, dest
    mov ecx, exchange_value
    mov eax, compare_value
    LOCK_IF_MP(mp)
    cmpxchg dword ptr [edx], ecx
  }
}
```
这里可以看到用的嵌入的汇编实现，关键CPU指令是cmpxchg

到这里没法再往下找代码了. 也就是说CAS的原子性实际上是CPU实现的. 其实在这一点上还是有排他锁的. 只是比起用synchronized, 这里的排他时间要短的多. 所以在多线程情况下性能会比较好.


## 最后再贴一下x86的cmpxchg指定

Opcode CMPXCHG

CPU: I486+ 
Type of Instruction: User 

Instruction: CMPXCHG dest, src 

Description: Compares the accumulator with dest. If equal the "dest" 
is loaded with "src", otherwise the accumulator is loaded 
with "dest". 

Flags Affected: AF, CF, OF, PF, SF, ZF 

CPU mode: RM,PM,VM,SMM 
+++++++++++++++++++++++ 
Clocks: 
CMPXCHG reg, reg 6 
CMPXCHG mem, reg 7 (10 if compartion fails) 


## ThreadFactory 线程工厂

> 在Executor类中有个内部类 DefaultThreadFactory是这个接口的实现类，很多其他的项目都有自己的ThreadFactory实现

- 我们看看 Executor 里面的ThreadFactory实现类
```java
   /**
     * The default thread factory
     */
    static class DefaultThreadFactory implements ThreadFactory {
        private static final AtomicInteger poolNumber = new AtomicInteger(1);
        private final ThreadGroup group;
        private final AtomicInteger threadNumber = new AtomicInteger(1);
        private final String namePrefix;

        DefaultThreadFactory() {
            SecurityManager s = System.getSecurityManager();
            group = (s != null) ? s.getThreadGroup() :
                                  Thread.currentThread().getThreadGroup();
            namePrefix = "pool-" +
                          poolNumber.getAndIncrement() +
                         "-thread-";
        }

        public Thread newThread(Runnable r) {
            Thread t = new Thread(group, r,
                                  namePrefix + threadNumber.getAndIncrement(),
                                  0);
            if (t.isDaemon())
                t.setDaemon(false);
            if (t.getPriority() != Thread.NORM_PRIORITY)
                t.setPriority(Thread.NORM_PRIORITY);
            return t;
        }
    }

    /**
     * Thread factory capturing access control context and class loader
     */
    static class PrivilegedThreadFactory extends DefaultThreadFactory {
        private final AccessControlContext acc;
        private final ClassLoader ccl;

        PrivilegedThreadFactory() {
            super();
            SecurityManager sm = System.getSecurityManager();
            if (sm != null) {
                // Calls to getContextClassLoader from this class
                // never trigger a security check, but we check
                // whether our callers have this permission anyways.
                sm.checkPermission(SecurityConstants.GET_CLASSLOADER_PERMISSION);

                // Fail fast
                sm.checkPermission(new RuntimePermission("setContextClassLoader"));
            }
            this.acc = AccessController.getContext();
            this.ccl = Thread.currentThread().getContextClassLoader();
        }

        public Thread newThread(final Runnable r) {
            return super.newThread(new Runnable() {
                public void run() {
                    AccessController.doPrivileged(new PrivilegedAction<Void>() {
                        public Void run() {
                            Thread.currentThread().setContextClassLoader(ccl);
                            r.run();
                            return null;
                        }
                    }, acc);
                }
            });
        }
    }
```
> DefaultThreadFactory里面有一个重要内容 ThreadGroup

> Thread t = new Thread(group, r, namePrefix + threadNumber.getAndIncrement(), 0);

ThreadGroup 有两个获取方式 
```java
 SecurityManager s = System.getSecurityManager();
            group = (s != null) ? s.getThreadGroup() :
                                  Thread.currentThread().getThreadGroup();
```
[关于ThreadGroup的讲解](../Thread与ThreadGroup.md)