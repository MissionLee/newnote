# 使用详解

后面的解析很重要

# DEMO 例子
```java
package com.lms.learn.locks;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.AbstractQueuedSynchronizer;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;

/**
 * @description:
 *      学习 ：
 *       定义内部类同步器，实现lock接口，完成一个锁
 * @author: Mission Lee
 * @create: 2019-04-23 16:08
 */
public class LearnLock implements Lock,java.io.Serializable {
    /**
     *
     * AbstractQueuedSynchronizer 的实现类，根据 AbstractQueuedSynchronizer的说明
     * 1. 这个类应该被定义为 non-public internal helper classes
     * 2. 重定义下面这几个 方法
     *      tryAcquire        尝试获取
     *      tryRelease        尝试释放
     *      tryAcquireShared
     *      tryReleaseShared
     *      isHeldExclusively 是否处于占用状态
     *
     * */
    private static class LearnSync extends AbstractQueuedSynchronizer{
        // 尝试获取
        /**
         * 该方法以排他的方式获取锁，对中断不敏感，完成synchronized语义
         *
         * 在 tryAcquire方法中使用 同步器操作state，
         * 利用compareAndSet保证只有一个线程能够对状态进行成功修改
         *
         * 在AbstractQueuedSynchronizer里面的 acquire 方法中会调用tryAcquire方法
         * 没有修改成功的线程讲进入sync队列排队
         *      进入队列的线程都是一个节点Node，从而形成一个双向队列，类似CLH队列，这样做的目的
         *      是线程之间的通信会被限制在较小规模（两个节点左右）
         *
         *      acquire方法里面还使用了用addWaiter创建一个Node放到queue里面
         * */
        protected boolean tryAcquire(int acquires){

            assert acquires == 1;
            if(compareAndSetState(0,1)){
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }
        // 尝试释放
        protected boolean tryRelease(int releases){
            assert releases == 1;
            if(getState()==0) throw new IllegalMonitorStateException();
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }
        // 是否处于占用状态
        protected boolean isHeldExclusively(){
            return getState() == 1;
        }
        // new Condition
        Condition newCondition(){
            return new ConditionObject();
        }
    }
    private final LearnSync sync = new LearnSync();
    @Override
    public void lock() {
        sync.acquire(1);
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        sync.acquireInterruptibly(1);
    }

    @Override
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }

    @Override
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        return sync.tryAcquireNanos(1,unit.toNanos(time));
    }

    @Override
    public void unlock() {
        sync.release(1);
    }

    @Override
    public Condition newCondition() {
        return sync.newCondition();
    }
}

```

- Lock 接口中三个 lock方法辨析  与 unlock 和 Condition
  - ⭐lock 
    - 获取lock
    - 如果不能立刻获取到锁（其他线程持有锁），当前线程会保持休眠状态直到获取锁
    - 实现类的注意事项
      - 实现类应当可以发现锁被错误使用
        - 例如调用产生死锁的时候应该抛出unchecked exception
      - 这些错误必须在类文档里面写清楚
  - ⭐lockInterruptibly [允许被interrupted的lock获取]
    - 获取lock
    - 如果当前拿不到lock，线程disabled，保持休眠，直到下面两种情况之一发生
      - 得到锁
      - 其他线程interrupted这个线程（在interruption被支持的情况下）
    - 如果当前线程出现下面两种情况，会抛出InterruptedException
      - 进入方法的时候interrupted status已经被设置
      - 尝试lock的时候被interrupt（自身支持）
    - 实现类注意事项
      - 有些情况下，中断锁的获取可能很难实现，或者开销很大。开发者必须考虑这些情况。实现类需要把这些情况在文档中写清楚
      - 与方法正常返回相比，实现类最好对中断进行相应
      - 实现类应当可以发现锁被错误使用
  - ⭐tryLock / tryLock(long time, TimeUnit unit)
    - 如果调用方法的时候锁没有被占用，那么获得锁
    - 第二种实现是会等一段时间
  - ⭐unlock
    - 释放锁
  - ⭐ newCondition
    - 返回一个与Lock实例绑定的Condition实例
    - 当前线程必须持有锁，才能获取condition
    - 调用 Condition.await 方法会在开始等待前自动释放锁，并在返回时重新获取锁
    - 实现类注意事项
      - 具体实现依赖于实现类，文档中需要写清楚
  
## 使用AbstractQueuedSynchronizer 实现 Lock

- Node 状态说明
  - CANCELLED 取消
  - SINGAL 信号 表示继任线程需要取消停靠 （unparking）
  - CONDITION 线程正在等待condition
  - PROPAGATE 传播 下一个acquireShared 应当被无条件传播
  - 说明
    - 等待队列是CLH的一种形式。CLH被广泛应用于自旋锁spinlock。
    - 我们在此处将它用于blocking synchronizer
    - 使用相同的策略，存储一些上一个节点predecessor 的控制信息
    - 在每个node里 用status字段来表示一个线程是否应该被 block
    - 当一个node的前一个node release的时候，当前node应该被signalled
    - queue里的每个node都以 specific-notification-style monitor身份 持有一个等待线程（等待一个singal）
    - status字段不负责控制是否能够获得lock
    - 当thread排到queue第一的时候他会尝试 acquire，但是并一定可以成功获取，如果失败了 当前release 的thread就需要 rewait
- lock 方法
```java
// lock 方法调用我们实现的 同步器的acquire方法
    public void lock() {
        sync.acquire(1);
    }
// AbstractQueuedSynchronizer.acquire
    public final void acquire(int arg) {
        if (!tryAcquire(arg) &&  // 尝试获取 这里会调用我们在实现类中的 tryAcquire
                                 // 如果 没有获取到 ，那么执行 && 后面的方法
                                 // 如果获取到了，方法返回
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
                                 // 没有立刻获取到调用下面的方法
                                 // 
            selfInterrupt();
    }
// 我们需要看两个方法
// ⭐ 1 addWaiter(Node.EXCLUSIVE)
// ⭐ 2 acquireQueued()
    /**
     * Creates and enqueues node for current thread and given mode.
     *
     * @param mode Node.EXCLUSIVE for exclusive, Node.SHARED for shared
     * @return the new node
     */
    private Node addWaiter(Node mode) {
      // 给当前线程创建一个Node
      // 然后把这个Node设置为 Queue里面的尾巴
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail;
        if (pred != null) {
            node.prev = pred;
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        enq(node);
        return node;
    }
   /**
     * Acquires in exclusive uninterruptible mode for thread already in
     * queue. Used by condition wait methods as well as acquire.
     *
     * @param node the node
     * @param arg the acquire argument
     * @return {@code true} if interrupted while waiting
     */
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            // -------------------- 自旋开始 --------------------------
            for (;;) { // 在此处进行 自旋
                final Node p = node.predecessor(); //获取当前node的前一个node
                if (p == head && tryAcquire(arg)) { // 如果 前一个node 已经排到 head位置
                                                    // 并且 当前自己获取锁成功了
                                                    // ⭐这表示前面的线程已经执行完成了
                    setHead(node); // 把自己设为Head
                    p.next = null; // help GC
                    failed = false; 
                    return interrupted;
                }
                if (shouldParkAfterFailedAcquire(p, node) && //此方法检查，更新node的状态
                                                             //如果线程应当被block，返回true
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
            // --------------------- 自旋结束 -------------------------
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    } 
```

- shouldParkAfterFailedAcquire 条件
  - ⭐ pws为前一个node的waitStatus
  - pws == SINGAL  返回 true
    - 前一个节点已经设置状态要求release
  - pws > 0 表示前一个node任务取消了
    - 把当前node连接到前一个的前一个上
  - pws <= 0