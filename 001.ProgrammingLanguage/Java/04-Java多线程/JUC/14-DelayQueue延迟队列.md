# DelayQueue 延迟队列

- 设定时间到了 才能够从队列中取出
- 元素实现Delayed 获取delay时间可以判断是否可以出队列
- 元素实现compareTo 可以在队列中调整排队优先级

DelayQueue = BlockingQueue + PriorityQueue + Delayed

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E>
    implements BlockingQueue<E> 
```
> 本身是 BlockingQueue的实现，并要求成员必须实现 Delayed


```java
public class LearnDelayedQueue {
    public static class DelayMember<T> implements Delayed{
        private T item ; //存储数据
        private long delay;
        private long expire;

        public DelayMember(T item, long delay,TimeUnit timeUnit) {
            this.item = item;
            this.delay = TimeUnit.MILLISECONDS.convert(delay,timeUnit);
            this.expire = System.currentTimeMillis()+this.delay;
        }

        @Override
        public long getDelay(TimeUnit unit) { // 获取还剩多久过期
            return unit.convert(this.expire-System.currentTimeMillis(),TimeUnit.MILLISECONDS);
        }

        @Override
        public int compareTo(Delayed o) { // 用于排序先后顺序
                                           // 我们希望结束早的优先高
            return (int)(this.getDelay(TimeUnit.MILLISECONDS)-o.getDelay(TimeUnit.MILLISECONDS));
        }

        public T getItem() {
            return item;
        }
        @Override
        public String toString(){
            return item.toString();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayMember<String>> queue = new DelayQueue<>();
        queue.add(new DelayMember<>("张三",10,TimeUnit.SECONDS));
        queue.add(new DelayMember<>("张四",5,TimeUnit.SECONDS));
        queue.add(new DelayMember<>("a",9,TimeUnit.SECONDS));
        queue.add(new DelayMember<>("b",2,TimeUnit.SECONDS));


        while (!queue.isEmpty()){
            Delayed d =queue.poll();
            if(d!=null)
            System.out.println(((DelayMember) d).getItem()+"滚蛋");
            else
                System.out.println("继续high");
            TimeUnit.SECONDS.sleep(1);
        }
    }
}
```
输出结果
```note
继续high
继续high
b滚蛋
继续high
继续high
张四滚蛋
继续high
继续high
继续high
a滚蛋
张三滚蛋
```

## 我们把 poll方法换成 take 方法
```java
// 上面while 循环体内做如下变动
// Delayed d =queue.poll();
Delayed d = queue.take();
```
输出结果
```note
b滚蛋
张四滚蛋
a滚蛋
张三滚蛋
```


以上可以看到
- poll从队列中取出数据，如果没有可取的会立刻获得null
- take 会在取数据出自旋锁顶，知道拿到数据才离开