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
- 从 HashMap开始分析
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
            tab[i] = newNode(hash, key, value, null);
        else {
            Node<K,V> e; K k;
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            else if (p instanceof TreeNode)
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
                for (int binCount = 0; ; ++binCount) {
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
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