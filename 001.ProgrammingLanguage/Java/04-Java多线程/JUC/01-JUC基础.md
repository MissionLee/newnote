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
