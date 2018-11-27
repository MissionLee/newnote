# MySQL 参数

> 此处并非所有参数

原文链接： https://www.cnblogs.com/zengkefu/p/5634845.html

## **配置参数**

MySQL有两种途径途径了解其的配置参数，一个是MySQL交互模式下的命令SHOW  VARIABLES，一个使用mysqladmin variables 查询。

MySQL的配置参数分为2种，全局的和局部的。局部的配置变量可以在每次会话中自己更改。

从MySQL 4.0以后开始，在SHOW VARIABLES中显示的参数，大部分可以动态使用SET命令进行更改。

### 基本参数配置：

| **参数**           | **说明**                                                     |
| ------------------ | ------------------------------------------------------------ |
| bind-address       | 绑定的IP地址                                                 |
| user               | 用户                                                         |
| port               | 端口号                                                       |
| datadir            | 数据文件目录                                                 |
| basedir            | msyql应用程序的目录                                          |
| socket             | socket文件，默认在/tmp目录下，但是建议不要这样设置，/tmp目录是一个大家都愿意破坏的目录 |
| default-table-type | 默认表类型                                                   |

### 查询的Cache的是从MySQL4.0版本开始提供的功能。相关的参数为：

| **参数**          | **说明**                                                     |
| ----------------- | ------------------------------------------------------------ |
| query_cache_size  | 查询Cache的尺寸                                              |
| query_cache_type  | 查询的Cache类型。0 OFF，不进行缓冲1 ON，进行缓冲2 DEMAND，对SELECT SQL_CACHE开头的查询进行缓冲 |
| query_cache_limit | 查询的结果的限制长度，小于这个长度的数据才能Cache            |

### MyISAM的索引参数

> key_buffer_size为MyISAM引擎的最关键的优化参数之一。

| **参数**             | **说明**                                                     |
| -------------------- | ------------------------------------------------------------ |
| key_buffer_size      | (关键参数),索引块用的缓冲区大小，所有的连接程序线程共用      |
| key_cache_block_size | 每一个索引block的大小，默认1024字节,从4.1.1后才出现这个参数，原来都是直接采用1024字节作为Block的长度 |

### InnoDB使用的参数

> InnoDB的参数较少，笼统而不细致，内存的管理多由InnoDB引擎自己负责，主要的缓冲就是innodb_buffer_pool_size参数分配的缓冲。这样配置倒是简单了，但没有了细致优化乐趣。

| **参数**                        | **说明**                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| innodb_buffer_pool_size         | innodb的缓冲区大小，存放数据和索引,一般设置为机器内存的50%-80% (关键参数) |
| innodb_log_buffer_size          | InnoDB日志缓冲区大小                                         |
| innodb_flush_method             | 刷新日志的方法                                               |
| innodb_additional_mem_pool_size | innodb内存池的大小，存放着各种内部使用的数据结构             |
| innodb_data_home_dir            | InnoDB数据文件的目录                                         |
| innodb_data_file_path           | 数据文件配置                                                 |
| innodb_log_files_in_group       | Innodb日志的                                                 |
| innodb_log_file_size            | Innodb日志文件的尺寸                                         |
| innodb_lock_wait_timeout        | 等待数据锁的超时时间，避免死锁的一种措施                     |
| innodb_flush_log_at_trx_commit  | 日志提交方式 (关键参数)0每秒写1次日志，将数据刷入磁盘，相当于每秒提交一次事务。1每次提交事务写日志，同时将刷新相应磁盘，默认参数。2每提交事务写一次日志，但每隔一秒刷新一次相应的磁盘文件[注] |
| innodb_force_recovery           | 在Innodb的自动恢复失败后，从崩溃中强制启动，有1-6个级别，数值越低恢复的方式也保守，默认为4。尽量使用较保守方式恢复。恢复后要注释删除这一行。 |

### Log的参数

> MySQL的日志有6种，查询日志，慢查询日志，变更日志，二进制变更日志，告警日志，错误日志。my.cnf中可以配置日志的前缀和日志参数。日志是监控数据库系统的重要途径。

| **参数**                      | **说明**                                                     |
| ----------------------------- | ------------------------------------------------------------ |
| log                           | 查询日志，记录所有的MySQL的命令操作，在跟踪数据库运行时非常有帮助，但在实际环境中就不要使用了 |
| log-update                    | 变更日志，用文本方式记录所有改变数据的变更操作，             |
| log-bin                       | 二进制变更日志，更加紧凑，使用mysqlbinlog读取，操作，转换    |
| binlog_cache_size             | 临时存放某次事务的SQL语句缓冲长度                            |
| max_binlog_cache_szie         | 最大的二进制Cache日志缓冲区尺寸                              |
| max_binlog_size               | 最大的二进制日志尺寸                                         |
| log-error                     | 导致无法启动的错误日志                                       |
| log-warnings                  | 告警日志                                                     |
| long_query_time               | 慢查询时间限度，超过这个限度，mysqld认为是一个慢查询         |
| log-queries-not-using-indexes | 没有使用索引查询的日志,方便记录长时间访问的查询进行优化      |
| log-slow-queries              | 慢速的查询日志，                                             |

### 打开文件参数：

| **参数**         | **说明**                                                     |
| ---------------- | ------------------------------------------------------------ |
| table_cache      | 能够被同时打开的表最大个数，打开一个表使用2个文件描述符(关键参数) |
| open_files_limit | mysqld保留的文件描述符号个数，和table_cache和max_connections设置相关，默认为0设置为0, 系统设置max_connections*5或者max_connections + table_cache*2中的最大值 |

### 关于连接通信的参数：

| **参数**            | **说明**                               |
| ------------------- | -------------------------------------- |
| max_connections     | 最大的连接数                           |
| max_connect_errors  | 同一个地址最大错误连接数，防止攻击用   |
| net_buffer_length   | 服务器和客户之间通讯的使用的缓冲区长度 |
| max_allowed_packet  | 服务器和客户之间最大的通信的缓冲区长度 |
| net_read_timeout    | 网络读取超时                           |
| net_write_timeout   | 网络写入超时                           |
| interactive_timeout | 交互模式下的没有操作后的超时时间       |
| wait_ timeout       | 非交互模式的没有操作后的超时时间       |

### 每个会话使用的buffer设置

> 默认使用my.cnf的配置，也可以使用每个会话设置。不要设置的过大。

| **参数**                        | **说明**                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| read_buffer_size(record_buffer) | 对数据表作顺序读取的缓冲大小                                 |
| read_rnd_buffer_size            | 在排序后，读取结果数据的缓冲区大小，                         |
| sort_buffer_size(sort_buffer)   | 用来完成排序操作的线程使用的缓冲区大小                       |
| join_buffer_size                | 全关联操作缓冲区（没有索引而进行关联操作）                   |
| write_buffer_size               | myisamchk的特有选项写入缓冲区大小                            |
| myisam_sort_buffer_szie         | 为索引的重新排序操作（比如CREATE INDEX）的分配的缓冲区的长度 |

### 对于磁盘缓式写入的一些选项

delay_key_write，flush，flush_time参数可能可以进一步提高MyISAM引擎的性能，但是在服务器Crash的时候，可能会丢失数据，造成表损坏。

MySQL对于插入语句支持一个选项INSERT DELAYED，如果有这个选项，MySQL将这些插入语句放入一个队列，并不马上读入磁盘。delay_insert_XXX的选项都是配置这个功能，

MySQL创建表的时候也有一个选项，DELAY_KEY_WRITE，有这个选项描述的表的键发生改动后，改动可以缓冲在key_buffer中，不立即回写磁盘。

| **参数**             | **说明**                                                     |
| -------------------- | ------------------------------------------------------------ |
| delay_insert_limit   | INSERT DELAYED语句选项。（插入语句的描述）处理INSERT DELAYED语句，MYSQL插入delay_insert_limit条语句后检查是否有查询语句，如有有去查询，如果没有，则继续插入 |
| delay_insert_timeout | 在处理完INSERT DELAYED对列的插入数据后，MYSQL等待delay_insert_timeout秒后看看是否有INSERT DELAYED数据，如果有继续，如果没有结束这次操作。 |
| delay_query_size     | INSERT DELAYED插入数据对列的长度                             |
| max_delayed_threads  | 处理INSERT DELAYED语句的最大线程个数                         |
| delay_key_write      | 对于使用DELAY_KEY_WRITE选项的创建的表，可以延缓键读写0N  不延缓所有的键写如操作OFF延缓有DELAY_KEY_WRITE选项的标的键写入操作ALL延缓所有的表 |
| flush                | 是否要在每个操作后立即刷新数据表                             |
| flush_time           | 每隔多少秒，对数据表进行一次刷新。关闭后打开。               |
|                      |                                                              |

### 关闭某些选项

> 关闭某些选项可以加快MySQL的运行速度，这些选项在MySQL SHOW VARIABLES 中显示为have_XXX 的变量。

| **参数**              | **说明**                                                     |
| --------------------- | ------------------------------------------------------------ |
| skip-openssl          | 关闭mysql服务器对SSL加密的支持                               |
| skip-isam             | 关闭mysql服务器对isam的引擎的支持                            |
| skip-bdb              | 关闭mysql服务器对bdb的引擎的支持                             |
| skip-external-locking | 不使用外部锁,MySQL的外部锁用于防止其他程序修改正在数据文件，但其在部分系统上不可靠，一般都不使用。(4.03版本前叫skip-locking) |
| skip-innodb           | 关闭mysql服务器对innodb的引擎的支持                          |
| skip_networking       | 只能从本地访问数据库                                         |
|                       |                                                              |

### 其他参数：

| **参数**               | **说明**                                                     |
| ---------------------- | ------------------------------------------------------------ |
| slow_launch_time       | 用多于这个时间创建的线程视为一个慢创建线程                   |
| binlog_cache_size      | 临时存放构成每次事务的SQL的缓冲区长度，(全局变量，但是应该影响每一个会话) |
| max_binlog_cache_size  | 二进制日志缓冲区的最大长度，其实就是事物的最大长度，默认4G   |
| max_heap_table_size    | HEAP表的最大允许长度                                         |
| max_tmp_tables         | 临时tables的最大个数                                         |
| myisam_recover_options | myisam引擎的自动恢复模式                                     |
| thread_cache_size      | 线程缓冲区的所能容纳的最大线程个数                           |
| tmp_table_size         | 临时tables的最大尺寸                                         |

 

## 运行状态监控

MySQL有两种途径途径了解其的运行状态，一个是MySQL交互模式下的命令SHOW STATUS，一个使用mysqladmin extended-status  。两种方法异曲同工，通过观察其运行状态可以了解我们的参数设置是否合理，是否有要优化的表和数据。

SHOW STATUS显示了MySQL从运行开始到现在为止状态，大部分为一些计数器，使用FLUSH STATUS可以重新对各种状态变量进行计数。

### MySQL的状态计数器

| **参数**                       | **说明**                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| Aborted_clients                | 因客户没有正确关闭而丢弃的连接数量，没有正确关闭指没有调用mysql_close就退出，连接超时，数据传送中客户端退出 |
| Aborted_connects               | 试图连接MySQL服务器但没有成功的次数                          |
| Connections                    | 试图连接MySQL服务器的尝试次数，（包括成功的和没有成功）      |
|                                |                                                              |
| Com_XXX                        | 执行语句的计数器，比如Com_select变量记录了select语句的个数   |
|                                |                                                              |
| Created_tmp_disk_tables        | 使用磁盘创建临时表的次数，如果要创建的临时表的尺寸大于tmp_table_size，那么临时表将创建在磁盘上， |
| Created_tmp_tables             | 创建临时表的次数                                             |
|                                |                                                              |
| Delayed_XXX                    | INSERT DELAYED语句的执行性能参数                             |
|                                |                                                              |
| Opened_tables                  | 曾经打开过的数据表总数                                       |
| Open_tables                    | 当前处于打开的表个数                                         |
| Open_files                     | 当前处于打开的文件个数                                       |
|                                |                                                              |
| Bytes_received                 | 从客户收到的字节总数                                         |
| Bytes_send                     | 发送给客户的字节总数                                         |
|                                |                                                              |
| Handler_commitHandler_rollback | 事务提交或者回滚的次数                                       |
| Handler_delete                 | 对数据表删除一条记录的次数                                   |
| Handler_update                 | 对数据表修改一条记录的次数                                   |
| Handler_write                  | 对数据表插入一条记录的次数                                   |
| Handler_read_first             | 读取索引中第一个索引项的个数                                 |
| Handler_read_key               | 根据索引直接读取一行数据的次数，这个数值高表示数据库有较好的检索能力。 |
| Handler_read_next              | 根据索引读取下个数据行的请求次数. 在一个索引的区间内进行查询( > < ,orderby 这类查询条件)会影响这个计数器。 |
| Handler_read_prev              | 根据索引读取前个数据行的请求次数.用于一些反序查询。          |
| Handler_read_rnd               | 通过一个固定位置(应该就是不通过索引)读取一个数据行的次数。这个数值很高表示你的很多查询操作的结果需要排序，可能这些查询操作不能适当使用索引而要检索整个表。 |
| Handler_read_rnd_next          | 请求从数据文件中读取下一个记录的次数.如果有很多全表的检索这个值将很高. 通常这表示数据表没有合适的索引。 |
|                                |                                                              |
| key_blocks_used                | 索引缓冲区块中已经被使用的区块大小。Block的尺寸默认是1024字节，4.1.1后可以通过key_cache_block_size参数设置。可以根据key_buffer_size/(1024 or key_cache_block_size) 得到Block总数，然后知道key_buffer的利用率 |
| Key_read_requests              | 从缓冲读取1个Block的次数                                     |
| Key_read                       | 从磁盘读取的次数                                             |
| Key_write_requests             | 写入索引缓冲区写入一个Block的次数                            |
| Key_write                      | 写回磁盘的次数                                               |
|                                |                                                              |
| Qcache_free_blocks             | Qcache没有使用的内存块个数                                   |
| Qcache_free_memory             | Qcache没有使用的内存尺寸                                     |
| Qcache_hits                    | 查询在Qcache中的命中次数，和Com_select比较，就可以知道Qache的大约命中率是多少。 |
| Qcache_inserts                 | 加入Cache中的查询个数                                        |
| Qcache_lowmem_prunes           | 由于Qcache不够用，造成替换出Qcache的查询个数                 |
| Qcache_not_cached              | 没有能Cache的查询个数                                        |
|                                |                                                              |
| Slow_queries                   | 慢查询的次数，如果一个查询的所用的时间大于long_query_time设置的时间，则计数加1 |
|                                |                                                              |
| Select_XXXX                    | 关联查询的一些状态计数                                       |
|                                |                                                              |
| Innodb_XXXX                    | InnoDB的状态技术器，不过只有MySQL 5.02的版本才支持这些计数器。这儿略过 |
|                                |                                                              |
| Table_locks_waited             | 必须等待后才能完成表锁定的请求个数，如果这个数值和下面数值的比率过大，表示数据库的性能较低 |
| Table_locks_immediate          | 无需等待，立即完成表锁定的请求个数。                         |
|                                |                                                              |
| Thread_connected               | 现在处在连接打开状态的线程个数                               |
| Thread_cached                  | 现在在现场缓冲区的线程个数                                   |
| Thread_created                 | 到目前为止,创建的线程个数                                    |
| Thead_running                  | 现在运行的线程个数，不是所有打开的线程都在运行，有些会处于SLEEP状态 |

InnoDB的状态监控的要在交互模式下使用show innodb status命令。相对的可以利用InnoDB状态参数也过少。



 ##  性能优化参数的推荐



###   innodb_flush_log_at_trx_commit  AND  sync_binlog

#### **innodb_flush_log_at_trx_commit = N：**

N=0  – 每隔一秒，把事务日志缓存区的数据写到日志文件中，以及把日志文件的数据刷新到磁盘上；

N=1  – 每个事务提交时候，把事务日志从缓存区写到日志文件中，并且刷新日志文件的数据到磁盘上；

N=2  – 每事务提交的时候，把事务日志数据从缓存区写到日志文件中；每隔一秒，刷新一次日志文件，但不一定刷新到磁盘上，而是取决于操作系统的调度；

#### **sync_binlog =  N：**

N>0  — 每向二进制日志文件写入N条SQL或N个事务后，则把二进制日志文件的数据刷新到磁盘上；

N=0  — 不主动刷新二进制日志文件的数据到磁盘上，而是由操作系统决定；

#### **推荐配置组合：**

N=1,1  — 适合数据安全性要求非常高，而且磁盘IO写能力足够支持业务，比如充值消费系统；

N=1,0  — 适合数据安全性要求高，磁盘IO写能力支持业务不富余，允许备库落后或无复制；

N=2,0或2,m(0<m<100)  — 适合数据安全性有要求，允许丢失一点事务日志，复制架构的延迟也能接受；

N=0,0  — 磁盘IO写能力有限，无复制或允许复制延迟稍微长点能接受，例如：日志性登记业务；

### innodb_file_per_table

启用单表空间，减少共享表空间维护成本，减少空闲磁盘空间释放的压力。另外，大数据量情况下 的性能，也会有性能上的提升，为此建议大家使用**独立表空间** 代替  **共享表空间**的方式；

### key_buffer_size

 key_buffer_size只能缓存MyISAM或类MyISAM引擎的索引数据，而innodb_buffer_pool_size不仅能缓存索引数据，还能缓存元数据，但是对于我们只使用InnoDB引擎的数据库系统而言，此参数值也不能设置过于偏小，因为临时表可能会使用到此键缓存区空间，索引缓存区推荐：64M；

### query_cache_type  and query_cache_size

#### n  query_cache_type=N

N=0  —- 禁用查询缓存的功能；

N=1  —- 启用产讯缓存的功能，缓存所有符合要求的查询结果集，除SELECT SQL_NO_CACHE..， 以及不符合查询缓存设置的结果集外；

N=2  —- 仅仅缓存SELECT SQL_CACHE …子句的查询结果集，除不符合查询缓存设置的结果集外；

#### n  query_cache_size

查询缓存设置多大才是合理？至少需要从四个维度考虑：

①   查询缓存区对DDL和DML语句的性能影响；

②   查询缓存区的内部维护成本；

③   查询缓存区的命中率及内存使用率等综合考虑

④   业务类型

 

###  innodb_commit_concurrency

含义：同一时刻，允许多少个线程同时提交InnoDB事务，默认值为0，范围0-1000。

0      — 允许任意数量的事务在同一时间点提交；

N>0  — 允许N个事务在同一时间点提交；

**注意事项：**

①   mysqld提供服务时，不许把 innodb_commit_concurrency 的值从0改为非0，或非0的值改为0；

②   mysqld提供时，允许把 innodb_commit_concurrency 的值N>0改为M，且M>0；

###  innodb_concurrency_tickets

含义：

同一时刻，能访问InnoDB引擎数据的线程数，默认值为500，范围1-4294967295。

补充说明：当访问InnoDB引擎数据的线程数达到设置的上线，线程将会被放到队列中，等待其他线程释放ticket。

**建议：**

​    MySQL数据库服务最大线程连接数参数max_connections，一般情况下都会设置在128-1024的范围，再结合实际业务可能的最大事务并发度，innodb_concurrency_tickets保持默认值一般情况下足够。

###  innodb_fast_shutdown  and innodb_force_recovery

#### innodb_fast_shutdown：

含义：设置innodb引擎关闭的方式，默认值为：1，正常关闭的状态；

0         —  mysqld服务关闭前，先进行数据完全的清理和插入缓冲区的合并操作，若是脏数据

较多或者服务器性能等因素，会导致此过程需要数分钟或者更长时间；

1          — 正常关闭mysqld服务，针对innodb引擎不做任何其他的操作；

2  — 若是mysqld出现崩溃，立即刷事务日志到磁盘上并且冷关闭mysqld服务；没有提交

的事务将会丢失，但是再启动mysqld服务的时候会进行事务回滚恢复；

#### innodb_force_recovery：

含义：

mysqld服务出现崩溃之后，InnoDB引擎进行回滚的模式，默认值为0，可设置的值0~6；

**提示：**

   只有在需要从错误状态的数据库进行数据备份时，才建议设置innodb_force_recovery的值大于0。 若是把此参数作为安全选项，也可以把参数的值设置大于0，防止InnoDB引擎的数据变更，设置不同值的作用：

0 — 正常的关闭和启动，不会做任何强迫恢复操作；

1 — 跳过错误页，让mysqld服务继续运行。跳过错误索引记录和存储页，尝试用

SELECT *  INOT OUTFILE ‘../filename’ FROM tablename;方式，完成数据备份；

2 — 阻止InnoDB的主线程运行。清理操作时出现mysqld服务崩溃，则会阻止数据恢复操作；

3 —  恢复的时候，不进行事务回滚；

4 — 阻止INSERT缓冲区的合并操作。不做合并操作，为防止出现mysqld服务崩溃。不计算

表的统计信息

5 — mysqld服务启动的时候不检查回滚日志：InnoDB引擎对待每个不确定的事务就像提交

的事务一样；

6 — 不做事务日志前滚恢复操作；

#### **推荐的参数组合配置：**

innodb_fast_shutdown = 1

\#若是机房条件较好可设置为0（双路电源、UPS、RAID卡电池和供电系统稳定性）

innodb_force_recovery =0

\#至于出问题的时候，设置为何值，要视出错的原因和程度，对数据后续做的操作

###  innodb_additional_mem_pool_size

含义：开辟一片内存用于缓存InnoDB引擎的数据字典信息和内部数据结构（比如：自适应HASH索引结构）；

默认值：build-in版本默认值为：1M；Plugin-innodb版本默认值为：8M；

提示：若是mysqld服务上的表对象数量较多，InnoDB引擎数据量很大，且innodb_buffer_pool_size的值设置 较大，则应该适当地调整innodb_additional_mem_pool_size的值。若是出现缓存区的内存不足，则会直接向操作系统申请内存分配，并且会向MySQL的error log文件写入警告信息；

## innodb_buffer_pool_size

含义：开辟一片内存用于缓存InnoDB引擎表的数据和索引；

默认值：历史默认值为：8M，现在版本默认值为：128M；

参数最大值：受限于CPU的架构，支持32位还是支持64位，另外还受限于操作系统为32位还是64位；

提示：

innodb_buffer_pool_size的值设置合适，会节约访问表对象中数据的物理IO。官方手册上建议专用的数据库服务器，可考虑设置为物理内存总量的80%，但是个人建议要看物理服务器的物理内存总量，以及考虑： 是否只使用InnoDB引擎、mysqld内部管理占用的内存、最大线程连接数和临时表等因素，官方提供的80%值作为一个参考，举而个例子方便大家作决定（前提：物理服务器为mysqld服务专用，且只用InnoDB引擎,假设数据量远大于物理内存）：

1).内存配置：24G    则 innodb_buffer_pool_size=18G

1).内存配置：32G    则 innodb_buffer_pool_size=24G

出现下列哪些情况，则可以考虑减小innodb_buffer_pool_size的值：

1).出现物理内存的竞争，可能导致操作系统的分页；

2).InnoDB预分配额外的内存给缓冲区和结构管理，当分配的总内存量超过innodb_buffer_pool_size值的10%；

3).地址空间要求必须为连续的，在windows系统有一个严重问题，DLL需要加载在特定的地址空间；

4).初始化缓冲区的时间消耗，与缓冲区的大小成正比。官方提供的数据 Linux X86 64位系统 初始化 innodb_buffer_pool_size=10G 大概需要6秒钟；

###  **lower_case_table_names**

   Linux或类Unix平台，对文件名称大小写敏感，也即对数据库、表、存储过程等对象名称大小写敏 感，为减少开发人员的开发成本，为此推荐大家设置该参数使对象名称都自动转换成小写；

###   **max_connect_errors**

​    max_connect_errors默认值为10，也即mysqld线程没重新启动过，一台物理服务器只要连接 异常中断累计超过10次，就再也无法连接上mysqld服务，为此建议大家设置此值至少大于等于10W； 若异常中断累计超过参数设置的值，有二种解决办法，执行命令：FLUSH HOSTS;或者重新启动mysqld服务；

 

###  **interactive_timeout  and wait_timeout**

#### u  interactive_timeout

​       处于交互状态连接的活动被服务器端强制关闭，而等待的时间，单位：秒；

#### u  wait_timeout

​       与服务器端无交互状态的连接，直到被服务器端强制关闭而等待的时间，此参数只对基于TCP/IP或基于 Socket通信协议建立的连接才有效，单位：秒；

#### u  推荐设置

​     interactive_timeout = 172800

​     wait_timeout  = 172800

###   **transaction-isolation  and binlog-format** 

#### u  **transaction-isolation**

​      可供设置的值：READ-UNCOMMITTED、READ-COMMITTED、REPEATABLE-READ、

SERIALIZABLE，默认的值为： REPEATABLE-READ，事务隔离级别设置的不同，对二进制日志登记格

式影响非常大，详细信息可见文章[解读](http://www.mysqlops.com/2011/10/2011/04/25/mysql-isolation-binlog.html)[MySQL](http://www.mysqlops.com/2011/10/2011/04/25/mysql-isolation-binlog.html)[事务的隔离级别和日志登记模式选择技巧](http://www.mysqlops.com/2011/10/2011/04/25/mysql-isolation-binlog.html)；

#### u  **binlog-format**

​       复制的模式，可供设置的值：STATEMENT、ROW、MIXED（注：5.0.*只有命令行式复制），

5.1.*版本默认设置：MIXED；

### u  **推荐配置**

①   只读为主的业务应用场景

​             transaction-isolation =  read-committed

​             binlog-format  = mixed            **#5.1.\*版本，5.0.*只能设置为 statement**

①   非只读为主的业务应用场景

​             transaction-isolation = repeatabled-read

​             binlog-format  = mixed            **#5.1.\*版本，5.0.*只能设置为 statement**

###  event_scheduler

事务调度默认是关闭状态，也推荐源码编译的版本可不编译进来，以及实际生产环境保持默认禁用 状态，当真正需要用的时候，可以临时打开，命令：SET GLOBAL event_scheduler=1;

###  skip_external_locking

外部锁，也即操作系统所实施的锁，只对MyISAM引擎有效，且容易造成死锁发生，为此我们一律禁用；

16、 innodb_adaptive_hash_index

InnoDB引擎会根据数据的访问频繁度，把表的数据逐渐缓到内存，若是一张表的数据大量缓存在 内存中，则使用散列索引（注：Hash Index）会更高效。InnoDB内有Hash Index机制，监控数据的访 问情况，可以自动创建和维护一个Hash Index，以提供访问效率，减少内存的使用；

###   innodb_max_dirty_pages_pct

​    InnoDB主线程直接更新Innodb_buffer_pool_size中存在的数据，并且不实时刷回磁盘，而是等待 相关的处罚事件发生，则允许缓存空间的数据量不实时刷回磁盘的最大百分比。比例设置较小，有利于 减少mysqld服务出现问题的时候恢复时间，缺点则是需要更多的物理I/O，为此我们必须根据业务特点 和可承受范围进行一个折中，一般范围建议设置为5%~90%，像我们SNS游戏行业的写非常厉害，综合 各方面因素，设置为20%；