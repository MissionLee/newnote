# 线程池系列工具

> 我再弄爬虫的时候，写了一个下载工具TimeLimitedHttpDownloader，维护里一个线程池，并且规定线程返回的最大时间（下载如果时间太长，就放弃下载，以免一直卡在这里不动）

- 主要功能组件
  - Executors 工具类，用于创建 Executor （创建线程池）
    - 提供了几个创建线程池的方法（例子）
      - ⭐ 下面几个是返回 ExecutorService的实现类的
      - public static ExecutorService newFixedThreadPool(int nThreads)
        - ThreadPoolExecutor
      - public static ExecutorService newWorkStealingPool(int parallelism)
        - ForkJoinPool
      - public static ExecutorService newWorkStealingPool()
        - ForkJoinPool
      - public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory)
        - ThreadPoolExecutor
      - ⭐ 还有返回ThreadFactory的（例子）
      - public static ThreadFactory defaultThreadFactory()
        - DefaultThreadFactory()
      - public static ThreadFactory privilegedThreadFactory()
        - PrivilegedThreadFactory()
      - ⭐ 返回Callable（例子）
      - public static <T> Callable<T> callable(Runnable task, T result)

使用范例：我在自己代码中实际使用的例子
```java
public class TimeLimitedHttpDownloader implements Thread.UncaughtExceptionHandler {
    private static ExecutorService executorService = Executors.newFixedThreadPool(10); // ⭐ 创建一个 ExecutorService 线程池
    // 省略一些无关理解的代码
    @Override
    public void uncaughtException(Thread t, Throwable e) {

    }

    private static class CallableInputStreamDownloader implements Callable { // 这是具体要在线程中执行的任务
        // 省略了一些无关理解的代码
        @Override
        public Object call() throws Exception {
            boolean returnStatus = false;
            // 要做的事情，具体省略掉
            return returnStatus;
        }
    }

    public static boolean downloadWithAutoRetry(String urlStr, String filename, String referer, SpiderTask spiderTask) throws IOException {
        // ... do something 这里创建/生成了 downloader 的各个参数哦
        CallableInputStreamDownloader downloader = new CallableInputStreamDownloader(in, out, fileSize, filename);
        Future<Object> future = executorService.submit(downloader); // ⭐ 向线程池提交任务，并回去返回值 Future
        long timeout = 100;
        boolean downloaded = (Boolean) future.get(timeout, TimeUnit.SECONDS); // ⭐ 使用 future.get 获取 Callable中 call 方法的返回值
        // ... do something
        return downloaded
    }
}
```

## ExecutorService 接口

Executor提供了终止的方法，发挥Future用于追踪一个或多个异步任务的进程

ExecutorService可以shut down，从而拒绝新的task
- shutdown
  - 用这个方法，之前加如的任务还可以继续执行
- shutdownNow
  - 已经加入但是还没执行的不会执行
  - 正在执行的会尝试stop
- 一旦终止：没有任务在执行，没有任务在等待，也不允许加添新的任务

- submit方法对 Executor.execute方法进行了扩展，创建并返回：Future
  - Future可以用于取消任务，或者等待完成
- invokeAny ，invokeAll 批量执行一组task，等待至少一个（可以是所有）任务完成

- 接口方法（常用的）
  - shutdown
  - <T> Future<T> submit(Callable<T> task);
    - Callable 方法自己有返回值，所以Future可以返回Callable的返回值
  - <T> Future<T> submit(Runnable task, T result);
    - Runnable没有返回值，要求执行成功，返回给定的result
  - <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
  - 还有很多，不一一列举了

## Future接口

用来代表一个异步任务的结果。

提供方法来检测任务是否执行完成

通过 get 方法可以获取任务的结果，如果任务没有完成，会在此处阻塞

通过cancel方法可以取消任务

辅助方法

- 方法列表
  - boolean cancel(boolean mayInterruptIfRunning);
    - 取消任务与是否强制取消
  - boolean isCancelled();
  - boolean isDone();
  - V get() throws InterruptedException, ExecutionException;
    - 这是获取返回值的方法
  - V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;

## public abstract class AbstractExecutorService implements ExecutorService

这里看一下核心方法
- submit 的其中一个重载
```java
    public <T> Future<T> submit(Callable<T> task) {
        if (task == null) throw new NullPointerException();
        RunnableFuture<T> ftask = newTaskFor(task);
        // 这里实际上创建了一个 FutureTask类
        // public class FutureTask<V> implements RunnableFuture<V> 
        execute(ftask);
        // 这里调用具体实现类的 execute方法，来执行任务
        return ftask;
    }
```

## 一个AbstractExecutorService 具体实现类：public class ThreadPoolExecutor extends AbstractExecutorService

- 看其中的重要方法 execute
```java
    public void execute(Runnable command) {
        if (command == null)
            throw new NullPointerException();
        /*
         * Proceed in 3 steps:
         *
         * 1. If fewer than corePoolSize threads are running, try to
         * start a new thread with the given command as its first
         * task.  The call to addWorker atomically checks runState and
         * workerCount, and so prevents false alarms that would add
         * threads when it shouldn't, by returning false.
         *  ⭐ 如果少于corePoolSize数量的线程正在运行，那么尝试开启一个新线程来运行
         *  执行的工作
         * 2. If a task can be successfully queued, then we still need
         * to double-check whether we should have added a thread
         * (because existing ones died since last checking) or that
         * the pool shut down since entry into this method. So we
         * recheck state and if necessary roll back the enqueuing if
         * stopped, or start a new thread if there are none.
         *  ⭐ 如果task可以放入队列，我们仍需要二次检测是否成功添加了一个thread
         * （因为存在ones died since last checking）或者pool在进入方法的时候被shut down了
         *  所以我们再次检测state 如果需要的话，滚回（在停止工作的情形） 
         * 3. If we cannot queue task, then we try to add a new
         * thread.  If it fails, we know we are shut down or saturated
         * and so reject the task.
         *  ⭐ 如果 addWorker执行成功，表示我们把任务加进去了，如果执行失败了意味着
         *  ExecutorService被关停了或者任务饱和了，这样我们需要 拒绝任务
         */
        int c = ctl.get();
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true)) // 开启新线程执行任务
                return;
            c = ctl.get();
        }
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            if (! isRunning(recheck) && remove(command))
                reject(command);
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        else if (!addWorker(command, false))
            reject(command);
    }
```