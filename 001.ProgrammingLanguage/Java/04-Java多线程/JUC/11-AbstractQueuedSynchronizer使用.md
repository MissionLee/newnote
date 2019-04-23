# 使用详解

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