# Set

在 [集合为什么是这个样子](./我的思考-集合为什么是这个样子.md) 这一篇里面，我写到了 List 和 Set 的主要区别在于是否允许重复元素。

- Set
  - HashSet hash表
  - TreeSet 红黑树
  - LinkedHashSet 链表+Hash表


## HashSet
- 如何保证唯一：底层使用 HashMap的key部分存储，会有Key值冲突判断。所以唯一

理解了 HashMap,就明白了 HashSet
```java
    private transient HashMap<E,Object> map;
```
这样就没有太多要将的了。

> 所有HashMap 的V 都是同一个空 Object，这一点把节约资源做到极致。

## TreeSet  自动排序是其特点
- 如何保证唯一：TreeSet 使用树形结构，要提供 Comparator对边两个元素是否重复（同时判断放在左边还是右边）。

TreeSet到底是什么呢？

- 有序Set
- 底层是TreeMap
- 其特性来自于红黑树
```java
public class TreeSet<E> extends AbstractSet<E>
    implements NavigableSet<E>, Cloneable, java.io.Serializable{}
    // 
public interface NavigableSet<E> extends SortedSet<E>{}
    // 搜索功能 
public interface SortedSet<E> extends Set<E>{}
    // 排序功能
```

## LinkedHashSet

> 从名字中可以看出来： Linked + Hash + Set<br>Linked是链表的特征<br>Hash就是Hash表的特征<br>Set就是Set所要求的特性：去重

```java
public class LinkedHashSet<E>
    extends HashSet<E>
    implements Set<E>, Cloneable, java.io.Serializable {}
```

### 我们在HashSet里面可以找到这样一个构造函数 : 为LinkedHashSet 提供的一个包内私有的构造函数

```java
    // ==========  HashSet 的一个构造函数
    /**
     * Constructs a new, empty linked hash set.  (This package private
     * constructor is only used by LinkedHashSet.) The backing
     * HashMap instance is a LinkedHashMap with the specified initial
     * capacity and the specified load factor.
     *
     * @param      initialCapacity   the initial capacity of the hash map
     * @param      loadFactor        the load factor of the hash map
     * @param      dummy             ignored (distinguishes this
     *             constructor from other int, float constructor.)
     * @throws     IllegalArgumentException if the initial capacity is less
     *             than zero, or if the load factor is nonpositive
     */
    HashSet(int initialCapacity, float loadFactor, boolean dummy) {
        map = new LinkedHashMap<>(initialCapacity, loadFactor);
    }
```

也就是说， HashSet底层用 LinkedHashMap 实现其功能。