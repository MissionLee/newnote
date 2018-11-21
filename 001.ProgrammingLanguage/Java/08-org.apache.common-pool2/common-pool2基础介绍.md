# 介绍

从这抄的 ： https://blog.csdn.net/u011277123/article/details/53943351/

我们在服务器开发的过程中，往往会有一些对象，它的创建和初始化需要的时间比较长，比如数据库连接，网络IO，大数据对象等。在大量使用这些对象时，如果不采用一些技术优化，就会造成一些不可忽略的性能影响。一种办法就是使用对象池，每次创建的对象并不实际销毁，而是缓存在对象池中，下次使用的时候，不用再重新创建，直接从对象池的缓存中取即可。为了避免重新造轮子，我们可以使用优秀的开源对象池化组件apache-common-pool2，它对对象池化操作进行了很好的封装，我们只需要根据自己的业务需求重写或实现部分接口即可，使用它可以快速的创建一个方便，简单，强大对象连接池管理类。

## 一，common-pool2简介

首先是下载这个组件，使用maven引入下面依赖即可：
```xml
<!-- https://mvnrepository.com/artifact/org.apache.commons/commons-pool2 -->

<dependency>

<groupId>org.apache.commons</groupId>

<artifactId>commons-pool2</artifactId>

<version>2.4.2</version>

</dependency>
```
Common-pool2中的代码不是太多，有几个种要的接口和实现类，common-pool2使用的是面向接口的编程，它为我们提供的是一个抽象的对象池管理方式，所以根据我们业务的不同，我们需要重写或实现一些方法和接口，我们一个一个看一下。

- 1，GenericObjectPool

这个是对象池实现的核心类，它实现了对对象池的管理，是一个基本的对象池实现，一般情况下，我们可以直接使用。在使用这个类的时候，我们需要传入两个重要的参数：GenericObjectPoolConfig类和PooledObjectFactory接口的实现，一会我们再详细说这两个。

在GenericObjectPool中，有两个我们会用到的方法：

public T borrowObject throws Exception 从对象池中获取一个对象

public void returnObject(T obj) 对象使用完之后，归还到对象池，

其它还有一些方法，比如关闭对象池，销毁对象池，获取对象池中空闲的对象个数等，可以自行查看API。

- 2，PooledObjectFactory接口

这个接口是我们要实现的，它对要实现对象池化的对象做了一些管理。这个工厂接口就是为了让我们根据自己的业务创建和管理要对象池化的对象。

PooledObject<T> makeObject throws Exception;

这个方法是用来创建一个对象，当在GenericObjectPool类中调用borrowObject方法时，如果当前对象池中没有空闲的对象，GenericObjectPool会调用这个方法，创建一个对象，并把这个对象封装到PooledObject类中，并交给对象池管理。

void destroyObject(PooledObject<T> p) throws Exception;

销毁对象，当对象池检测到某个对象的空闲时间(idle)超时，或使用完对象归还到对象池之前被检测到对象已经无效时，就会调用这个方法销毁对象。对象的销毁一般和业务相关，但必须明确的是，当调用这个方法之后，对象的生命周期必须结果。如果是对象是线程，线程必须已结束，如果是socket，socket必须已close，如果是文件操作，文件数据必须已flush，且文件正常关闭。

boolean validateObject(PooledObject<T> p);

检测一个对象是否有效。在对象池中的对象必须是有效的，这个有效的概念是，从对象池中拿出的对象是可用的。比如，如果是socket,那么必须保证socket是连接可用的。在从对象池获取对象或归还对象到对象池时，会调用这个方法，判断对象是否有效，如果无效就会销毁。

void activateObject(PooledObject<T> p) throws Exception;

激活一个对象或者说启动对象的某些操作。比如，如果对象是socket，如果socket没有连接，或意外断开了，可以在这里启动socket的连接。它会在检测空闲对象的时候，如果设置了测试空闲对象是否可以用，就会调用这个方法，在borrowObject的时候也会调用。另外，如果对象是一个包含参数的对象，可以在这里进行初始化。让使用者感觉这是一个新创建的对象一样。

void passivateObject(PooledObject<T> p) throws Exception;

钝化一个对象。在向对象池归还一个对象是会调用这个方法。这里可以对对象做一些清理操作。比如清理掉过期的数据，下次获得对象时，不受旧数据的影响。

一般来说activateObject和passivateObject是成对出现的。前者是在对象从对象池取出时做一些操作，后者是在对象归还到对象池做一些操作，可以根据自己的业务需要进行取舍。

- 3，带Key的对象池GenericKeyedObjectPool

这种对象池和前面的GenericObjectPool对象池操作是一样的，不同的是对应的每个方法带一个key参数。你可以把这个GenericKeyedObjectPool的对象池看作是一个map的GenericObjectPool，每个key对应一个GenericObjectPool。它用于区别不同类型的对象。比如数据库连接，有可能会连接到不同地址的数据库上面。就可以用这个区分。

- 4，参数配置类GenericObjectPoolConfig

这个类允许使用者对对象池的一些参数进行调整，根据需要定制对象池。下面说逐一说一下每个参数的含义。

lifo：对象池存储空闲对象是使用的LinkedBlockingDeque，它本质上是一个支持FIFO和FILO的双向的队列，common-pool2中的LinkedBlockingDeque不是Java原生的队列，而有common-pool2重新写的一个双向队列。如果为true，表示使用FIFO获取对象。默认值是true.建议使用默认值。

fairness：common-pool2实现的LinkedBlockingDeque双向阻塞队列使用的是Lock锁。这个参数就是表示在实例化一个LinkedBlockingDeque时，是否使用lock的公平锁。默认值是false，建议使用默认值。

maxWaitMillis：当没有空闲连接时，获取一个对象的最大等待时间。如果这个值小于0，则永不超时，一直等待，直到有空闲对象到来。如果大于0，则等待maxWaitMillis长时间，如果没有空闲对象，将抛出NoSuchElementException异常。默认值是-1；可以根据需要自己调整，单位是毫秒。

minEvictableIdleTimeMillis：对象最小的空闲时间。如果为小于等于0，最Long的最大值，如果大于0，当空闲的时间大于这个值时，执行移除这个对象操作。默认值是1000L * 60L * 30L;即30分钟。这个参数是强制性的，只要空闲时间超过这个值，就会移除。

softMinEvictableIdleTimeMillis：对象最小的空间时间，如果小于等于0，取Long的最大值，如果大于0，当对象的空闲时间超过这个值，并且当前空闲对象的数量大于最小空闲数量(minIdle)时，执行移除操作。这个和上面的minEvictableIdleTimeMillis的区别是，它会保留最小的空闲对象数量。而上面的不会，是强制性移除的。默认值是-1；

numTestsPerEvictionRun：检测空闲对象线程每次检测的空闲对象的数量。默认值是3；如果这个值小于0,则每次检测的空闲对象数量等于当前空闲对象数量除以这个值的绝对值，并对结果向上取整。

testOnCreate：在创建对象时检测对象是否有效，true是，默认值是false。

testOnBorrow：在从对象池获取对象时是否检测对象有效，true是；默认值是false。

testOnReturn：在向对象池中归还对象时是否检测对象有效，true是，默认值是false。

testWhileIdle：在检测空闲对象线程检测到对象不需要移除时，是否检测对象的有效性。true是，默认值是false。

timeBetweenEvictionRunsMillis：空闲对象检测线程的执行周期，即多长时候执行一次空闲对象检测。单位是毫秒数。如果小于等于0，则不执行检测线程。默认值是-1;

blockWhenExhausted：当对象池没有空闲对象时，新的获取对象的请求是否阻塞。true阻塞。默认值是true;

maxTotal：对象池中管理的最多对象个数。默认值是8。

maxIdle：对象池中最大的空闲对象个数。默认值是8。

minIdle：对象池中最小的空闲对象个数。默认值是0。

以上就是common-pool2对象池的配置参数，使用的时候可以根据自己的需要进行调整。

- 5，common-pool2的应用

使用common-pool2的对象池技术的一个完美例子就是redis的Java客户端JedisPool。大家可以下载Jedis的包，查看源码进行学习。下次我将分享一个我使用common-pool2实现的一个thrift客户端调用的连接池实现。

综上所述，使用common-pool2可以快速的创建一个安全，强大，简单的对象池管理类。它的开源性使它的功能得到了众多项目的检测，是非常安全的。在我们的业务中，如果有需要使用对象池化的操作，可以使用common-pool2快速实现。