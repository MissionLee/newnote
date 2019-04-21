# Thread 与 ThreadGroup

在学习JUC中内容的时候看到了这部分的知识

Executor中实现了 DefaultThreadFactory，其中提供具体线程

参考文章： https://www.cnblogs.com/yiwangzhibujian/p/6212104.html
参考文章： https://www.jianshu.com/p/bcec38867695  |   https://www.jianshu.com/p/b27feca3b83b

## Thread和ThreadGroup的关系

ThradGroup之间的关系是树的关系，而Thread与ThradGroup的关系就像元素与集合的关系。关系图简单如下：

![](./res/tg01.png)

- ThreadGroup / Thread 关系
  - Thread 是 ThreadGroup的成员
  - ThreadGroup 之间是包含关系

- JVM自身会启用一个 system group作为系统线程（group）
```java
// ThreadGroup类中的一个构造
// ⭐ 这里明确写着 系统线程，并且是 C code来调用
    /**
     * Creates an empty Thread group that is not in any Thread group.
     * This method is used to create the system Thread group.
     */
    private ThreadGroup() {     // called from C code
        this.name = "system";
        this.maxPriority = Thread.MAX_PRIORITY;
        this.parent = null;
    }
```
- 主线程（group）创建在system中

