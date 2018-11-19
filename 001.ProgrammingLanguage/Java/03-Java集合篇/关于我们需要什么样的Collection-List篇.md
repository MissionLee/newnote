# Collection

List有几种实现
- ArrayList
- LinkedList
- Vector
  - Stack

初次想到我必须用合适的数据结构来存储一些数据，是在做一个比较细致的权限控制功能的时候。因为所有的功能都要先从这个模块获得访问许可，所以此处的效率必须优化到位。

之前我曾经粗略（但是很认真）的看过一遍集合的相关内容。但是知其然，不知其所以然，所以我觉得从更底层来看看集合和集合的效率问题。

## 什么时候用

如果说Map是 k-v，那么 Collection 就是 K-Vn，一个key对应一组值。这样说不甚严谨，但是方便理解。

很简单就能知道Collection中那种适合什么样的业务，但是为什么适合呢？

## 快存 与 快取

- ArrayList

```java
    /**
     * The array buffer into which the elements of the ArrayList are stored.
     * The capacity of the ArrayList is the length of this array buffer. Any
     * empty ArrayList with elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA
     * will be expanded to DEFAULT_CAPACITY when the first element is added.
     */
    transient Object[] elementData; // non-private to simplify nested class access
```

我们先来自己分析一下，然后看看源码里面的处理方法。

首先和名称一样，底层是个Array

#### 我们主要考虑常见的对数据集合的操作

- 存
  - 在Array里面添加一个新元素，添加元素，这时候需要考虑一个问题：扩容
  - 能想到的扩容方法，创建一个更大的数组，把现在的内容放过去
- 取
  - 根据数组的特性，给定下标就可以取出来使用
- 查
  - 查就是查一个元素是否存在，数组作为底层，没有其他辅助的话，只能是遍历
- 删除
  - 如果不用标记，而是真的删除，那么操作起来还是要用到另外一个数组
- 那么确实是这样子嘛
  - 是的，但是源码中考虑了很多细节内容
  - size 实际存储的元素个数
  - 存
    - add(E e) 确保容量，直接添加
    - add(int index,E e)  在制定位置插入数据，当前数据向右移动
      - 检查想要放的位置是否合适，容量是否足够
      - ArrayCopy 
    - 其他操作不一一看了，但是基本上以ArrayCopy为主，也就是确实如同我们想的一样
- 有什么特别的地方
  - // clear to let GC do its work 
    -  elementData[--size] = null; 如同这个操作，删除某个元素，我们把右边的元素左移，如果不做处理，最后一个还是引用某个对象的，所以需要解除引用，这样GC才好使。！！！！！！！！！
  - // non-private to simplify nested class access 非私有化以简化嵌套类访问
    - 我们存储的Object[] 是非私有的

#### 为什么实际存储数据的 elementData 是 transient

https://blog.csdn.net/zero__007/article/details/52166306 从这里摘抄的

     ArrayList在序列化的时候会调用writeObject，直接将size和element写入ObjectOutputStream；反序列化时调用readObject，从ObjectInputStream获取size和element，再恢复到elementData。
       为什么不直接用elementData来序列化，而采用上诉的方式来实现序列化呢？原因在于elementData是一个缓存数组，它通常会预留一些容量，等容量不足时再扩充容量，那么有些空间可能就没有实际存储元素，采用上诉的方式来实现序列化时，就可以保证只序列化实际存储的那些元素，而不是整个数组，从而节省空间和时间。

## LinkedList

> 实际上我先下了下面这一部分内容，感觉不对劲回来又补充了这里的碎碎念。因为忘记了“思考”，下面写的都是一些现象。 我们有了ArrayList，为什么还要有LinkedList。<br>
我们来看看上面提到了那些问题：ArrayList很多操作都需要使用到 ArrayCopy的方法来调整存储的数据。也就是说 删除，在指定位置插入这样的操作，消耗是很大的。<br>
链表的问题在于，下一个元素在哪里只有上一个元素知道，所以各种操作都需要在链中跑，但是在链中跑一趟能够解决所有问题

|类型|指定下标查询-平均-最坏|指定元素查询-平均-最坏|删除|总结|
|-|-|-|-|-|
|ArrayList|O(1)|O(n/2)-O(n)|查找后 O(n)|适合取频繁业务|
|LinkedList|O(n/2)-O(n)|O(n/2)-O(n)|查找后 O(1)|中规中矩|


```java
public class LinkedList<E>
    extends AbstractSequentialList<E>
    implements List<E>, Deque<E>, Cloneable, java.io.Serializable
```

弄清楚一个集合的原理，了解底层的存储方式有很大帮助。除此之外，弄清楚实现了那些接口，能够让我们更清楚我们可以怎么使用

#### 首先看一看底层存储

```java
    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;

        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
    }
```
这个不用多做说明，教科书式的链表结构

#### 看看实现了那些接口

- extends AbstractSequentialList<E> 继承了双线链表
  - 提供了几个方法： get set add remove addAll Iterator
    - 这些方法都 依赖  listIterator 这个抽象方法
  - 一个抽象
    -  public abstract ListIterator<E> listIterator(int index);
    - 这个方法： public interface ListIterator<E> extends Iterator<E>
  - 所以！！！！在LinkedList实现这个 ListIterator就能实现其中各种方法
- 实现了两个接口（只算数据操作方面的）
  - List<E>
    - 一些基本操作【队列操作】，然后还有 toArray这样的操作
  - Deque<E>
    - A linear collection that supports element insertion and removal at  both ends  双端对立操作
    - 就是 push() pop() / xxFirst() xxLast() 这些方法。


## Vector 矢量 / 

> 一个线程安全的ArrayList，各种方法都加了 synchronized 关键字，锁的非常严。<br> 一些总结介绍的文章，都讲的很简单，这里还是简单看看里面到底和ArrayList是不是一样，自己看过一遍才踏实

- 底层数据存储：    protected Object[] elementData;
- 方法（找几个关键方法看一下）
  - 指定位置添加
  ```java
      public synchronized void insertElementAt(E obj, int index) {
        modCount++;
        if (index > elementCount) {
            throw new ArrayIndexOutOfBoundsException(index
                                                     + " > " + elementCount);
        }
        ensureCapacityHelper(elementCount + 1);
        System.arraycopy(elementData, index, elementData, index + 1, elementCount - index);
        elementData[index] = obj;
        elementCount++;
    }
    ```
    - 指定删除
    ```java
        public synchronized E remove(int index) {
        modCount++;
        if (index >= elementCount)
            throw new ArrayIndexOutOfBoundsException(index);
        E oldValue = elementData(index);

        int numMoved = elementCount - index - 1;
        if (numMoved > 0)
            System.arraycopy(elementData, index+1, elementData, index,
                             numMoved);
        elementData[--elementCount] = null; // Let gc do its work

        return oldValue;
    }
    ```
    - 其他就不看了，因为底层一样，所以操作都一样

```java
public class Vector<E>
    extends AbstractList<E>
    implements List<E>, RandomAccess, Cloneable, java.io.Serializable
```

## Stack 

> 栈，用Vector对列实现， push/pop/peek/search/empty<br>都是对栈顶部（也就是队列的尾部）进行操作<br>因为java的特性，Stack用了Vector的底层，因为底层结构一样，但是Stack没法屏蔽掉来自Vector的方法。

```java
public
class Stack<E> extends Vector<E>
```