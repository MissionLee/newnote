# 底层数据结构

学习java Collection的时候，一开始有一个误区。里面的 set list map 之类的就是数据结构，但是当我想要深入思考这些东西的时候，发现这些并不是数据结构，而是数据结构与实用方法的组合体。

那么，最底层的数据结构是什么呢

- 数组：使用连续内存存储数据
  - 制定下标查询 时间复杂度 O-1
  - 给定值查找，时间复杂度 O-n
- 线性链表
  - 指定节点 O-1
  - 定值查找 O-n
- 二叉树
  - 二叉树结构没有下标， 查询复杂度 O log n
- 哈希表
  - 不考虑冲突的情况 O-1

## 首先有这个限制

物理结构中只有两种存储结构：（内存是否连续）
- 顺序存储结构
- 链式存储结构

## 特别要说的哈希表

> 为什么Hash表如此高效

- ！Hash表的主干是数组 -》 一次定位就可以完成操作
- 哈希函数： 把元素的关键字 映射到数组的某个位置
## 从 HashMap开始分析

> JDK 1.8对HashMap进行了比较大的优化，底层实现由之前的“数组+链表”改为“数组+链表+红黑树”, 当某个链表长度大于8之后，就会将其调整为红黑树 putVal  &  putTreeVal

> putVal 方法要多分析一下，因为HashMap的衍生类就是重写了
  - HashMap 的主干数组是一个 Entry数组。主干数组的长度一定是2的次幂
    - Entry是 HashMap 里的一个 静态内部类
      - Entry 主要有四个成员
        - key
        - value
        - next 指向下一个Entry
        - hash 一个hash值

- 内存中 HashMap 的结构
![](./res/001.png)

- 所谓： 数组 + 链表
  - 数组是主体
  - 链表是为了解决hash冲突（定位到非链表的位置，就可以省去一步二次查询）
- 那么，怎么使用 hash 函数，让数据存入这个 数组+链表的结构的呢
  - 首先我们可以拿到 K-V值
  - 取到K值，计算 hash(Object K) 得到要给 hash值
  - 使用 indexFor(int hash, int length) 得到实际的存储位置
    - h&(length - 1) 假如容量length 16， 我们得到的hash 就是与 1111做与运算，最终的到的结果，一定是在 0~1111之间，也就是 0~15，这个就是对应的下标 index
  - 把这个新的Entry放入 index位置 `[Entry是最基本的节点，内部有 Node 继承Entry，还有TreeNode 继承LinkedHashMap.Entry]`
    - 此时需要先做一下扩容判断： 此时是否发生hash冲突（当前index已经有元素了），并且size超过临界值
    - 满足扩容，就做一个双倍的数组，把现在的元素放进去（重新计算元素应该放的位置，放到正确的位置里面）
```java
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

// 1.8 版本 HashMap putVal (put就是计算一下 hash，然后调用这个方法)
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        // table 是当前的 Node 数组 （Entry数组）
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
            // 下面 (n -1)&hash 就是 indexFor 函数，如果这个位置为空，就放个node在这里 ， 如果不为空，就要判断是更新已经存在的值，还是延长链表
        if ((p = tab[i = (n - 1) & hash]) == null)
        // 当前没有元素，放个新的
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            // 当前已经有元素了
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                // hash相等的情况，如果key是同一个，就更新
                e = p;
            else if (p instanceof TreeNode)
            // 如果 不是同一个key，当前是TreeNode，就调用 putTreeVal
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                // 这种情况就是 普通node
                for (int binCount = 0; ; ++binCount) {
                    // 一个循环，找到key 相等的位置更新
                    if ((e = p.next) == null) {
                        // 链表的下一个 为null （这个也是意味着，找到了这个链的尽头，都没有同一个key）
                        // 放一个新的节点，并且判断是否需要 变成红黑书
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    // 如果  链表的下一节 hash与现在相当，并且 key 也相等 
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            // 上面的情况都跑完了，e已经被赋值了
            //  e 是第一个元素，或者 用 puttreeval（红黑书中）获得了一个元素，或者在链表中循环到一个元素
            if (e != null) { // existing mapping for key
            // 如果找到的符合条件的这个 元素 是原本有值得，更新这个值，并且返回旧的值
            // 如果是新的节点，那么前面就已经放进去就完事了
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        // 新的结点会有以下的后续操作
        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```
- 扩容的具体操作，从 put 方法
  - 首先是put方法中，循环遍历某个index位置的 链表 ，如果链表里面有这个key，就更新，如果没有，就放入一个新的Entry
    - e.hash == hash && ((k = e.key) == key || key.equals(k))
    - e.hash == hash  想要存放的位置的hash值 == 当前计算出来的hash值（代表Hash冲突）
    - ((k = e.key) == key || key.equals(k)  当前这个位置的key（e.key）与这一次的key是通过一个key
  - 当我们添加一个新的 Entry，会首先进行扩容判断
    - 判断条件(size >= threshold) && (null != table[bucketIndex]) `新版本1.8+里面，只要判断 ++size > threshold 就可以了`
      - size ： map中存储的 k-v 对总数
      - threshold ：容量*负载因子 capacity * loadfactor
      - 当前个数是否大于等于阈值 
      - null !=table[bucktIndex] : 冲突判断
- 扩容 resize
  - 首先里面有很多安全判断，不多提
  - 主要：  newCap = oldeCap << 1 ,并且  newCap 要在默认容量 和 最大容量 之间。   threshold 根据 新的总容量的情况做调整，最典型的是 翻倍
  - 之后遍历整个 oldTab，把里面的内容，复制给 newTab
  - 因为容量扩大两倍了，所以链表里面的元素的index位置，要么在原处，要么在两倍位置。

## LinkedHashMap

> HashTable + LinkedList 
```java
    static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
```


这里的 before 和 after 就是 linked 的关键,通过提供 几个关键方法的 多态，来改变HashMap 的一些特性。

主要实现多态的地方
- put方法里面的（put本身没有重写）
  - newNode 返回 LinkedHashMap 的Entry了
  - atferNodeAccess(e) 对于节点的额外处理，HashMap里面是个空方法，LinkedHashMap在这里实现功能：把新加入的这个元素，放到链表最后
  - afterNodeInsertion(evict);HashMap里面是个空方法，LinkedHashMap在这里实现功能： 如果 true，一处最早放入Map的对象。 这个方法在LinkedHashMap里面虽然有重写，但是也是不会有什么作用的，因为判断条件被写死为 false，如果有相关需求，要自己写更改，重写。

 ### 这里还是看一下 HashTable + LinkedList 到底是如何实现的 
```java
// 把 LinkedHashMap 的Entry详细分析一下
    static class Entry<K,V> extends HashMap.Node<K,V> {
        Entry<K,V> before, after;
        Entry(int hash, K key, V value, Node<K,V> next) {
            super(hash, key, value, next);
        }
    }
// 下面是 super的具体内容
        Node(int hash, K key, V value, Node<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
```
- 我们把LinkedHashMap的所有属性列出来
  - 继承来的
    - int hash Hash值
    - key 要存的Key
    - value 要存的Value
    - next 下一项 HashMap同一个index项的下一项（单项链表）
  - 自己独有的
    - before 前元素
    - atfer 后元素（有了前后就可以简单遍历了，我们去看看LinkedHashMap的Iterator）
- 我们来看看 before / after 是如何处理的
 - 首先回看 put方法的流程（在HashMap中）
   - 略去HashMap中的一些设计
   - 主要调用了这两个方法（二选一）
     - afterNodeAccess 调用在更新了一个节点值（Key相同）的情况
     - atferNodeInsertion 调用在添加了一个新的节点的时候
```java
//当一个节点更新
    void afterNodeAccess(Node<K,V> e) { // move node to last
        LinkedHashMap.Entry<K,V> last;
        if (accessOrder && (last = tail) != e) { //我们刚刚更新了这个值，按照List的要求，这个值从原来的位置拿掉，放到最后。
        // 如果 当前元素，之前不知在tail 位置，就把这个元素放到tail位置
            LinkedHashMap.Entry<K,V> p =
                (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
            p.after = null;
            if (b == null) 
                head = a;
            else
                b.after = a;
            if (a != null)
                a.before = b;
            else
                last = b;
            if (last == null)
                head = p;
            else {
                p.before = last;
                last.after = p;
            }
            tail = p; // 主要就是这一个步骤，更新tail
            ++modCount;
        }
    }
// 当插入一个全新的节点 -》 在源码中这里永远不执行
    void afterNodeInsertion(boolean evict) { // possibly remove eldest
        LinkedHashMap.Entry<K,V> first;
        // evict = true ，
        if (evict && (first = head) != null && removeEldestEntry(first)) {
            K key = first.key;
            removeNode(hash(key), key, null, false, true);
        }
    }
// 删除一个节点
    void afterNodeRemoval(Node<K,V> e) { // unlink
    // 主要操作就是取下来，把之前的 before after链接起来
        LinkedHashMap.Entry<K,V> p =
            (LinkedHashMap.Entry<K,V>)e, b = p.before, a = p.after;
        p.before = p.after = null;
        if (b == null)
            head = a;
        else
            b.after = a;
        if (a == null)
            tail = b;
        else
            a.before = b;
    }

```
## TreeMap

```java
public class TreeMap<K,V>
    extends AbstractMap<K,V>
    implements NavigableMap<K,V>, Cloneable, java.io.Serializable
{}
```

因为底层用的树形结构，所以相比于Hash，Link还是有其自己的特点。

- 使用算法：红黑书（JDK1.8）
- 二分法查找，查询复杂度 O(logN)
- 在这里没有什么太多要将的内容可以查看 [红黑树-Java实现](../../../002.DataStructureAndAlgorithms/红黑树与其Java实现.md)
