# mysql.sock

就是以 .sock 为后缀的文件而已。UNIX 系统不以后缀区分文件类型，但为了方便，通常使用后缀来标识一下。.sock 文件极有可能是 UNIX 域套接字（UNIX domain socket），即通过文件系统（而非网络地址）进行寻址和访问的套接字。参见 man 手册 unix(7)（命令：man 7 unix）。

## Mysql 有两种连接方式

- TCP/IP
- socket

> 对mysql.sock来说，其作用是程序与mysqlserver处于同一台机器，发起本地连接时可用。
例如你无须定义连接host的具体IP得，只要为空或localhost就可以。
在此种情况下，即使你改变mysql的外部port也是一样可能正常连接。
因为你在my.ini中或my.cnf中改变端口后，mysql.sock是随每一次 mysql server启动生成的。已经根据你在更改完my.cnf后重启mysql时重新生成了一次，信息已跟着变更。

```bash
Can 't connect to local MySQL server through socket '/var/lib/mysql/mysql.sock '(2) ";
```
是你的mysql.sock 文件不存在了，
可能是被你不小心删除了，

连接localhost通常通过一个Unix域套接字文件进行，一般是/tmp/mysql.sock。如果套接字文件被删除了，本地客户就不能连接。这可能发生在你的系统运行一个cron任务删除了/tmp下的临时文件。

- 如果你因为丢失套接字文件而不能连接，你可以简单地通过重启服务器重新创建得到它。因为服务器在启动时重新创建它。
- 另一个解决办法是你现在不能用套接字建立连接因为它不见了，你可以建立一个TCP/IP连接，例如，如果服务器主机是192.168.0.1，你可以这样连接：
```bash
%mysql -u root -h 192.168.0.1 -p
%mysqladmin -u root -h 192.168.0.1 -p shutdown
```

如果套接字文件被一个cron任务删除，问题将重复出现，除非你修改cron任务或使用一个或使用一个不同的套接字文件，你可以使用全局选项文件指定一个不同的套接字，例如，如果数据目录是/usr/local/var，你可以通过将下列行加入/etc/my.cnf中，将套接字文件移到那里：
```conf
[mysqld]
socket=/usr/local/var/mysql.sock
[client]
socket=/usr/local/var/mysql.sock
```
对服务器和客户均指定路径名，使得它们都使用同一个套接字文件。如果你只为服务器设置路径，客户程序将仍然期望在原位置执行套接字，在修改后重启服务器，使它在新位置创建套接字



## 怎样保护“/tmp/mysql.sock ”不被删除

如果你有这个问题，事实上任何人可以删除MySQL通讯套接字“/tmp/mysql.sock”，在Unix的大多数版本上，你能通过为其设置sticky（t）位来保护你的“/tmp”文件系统。作为root登录并且做下列事情：

shell> chmod +t /tmp

这将保护你的“/tmp”文件系统使得文件仅能由他们的所有者或超级用户(root)删除。

你能执行ls -ld /tmp检查sticky位是否被设置，如果最后一位许可位是t，该位被设置了。


```bash
To prevent the problem from occurring, you must perform a graceful shutdown of the server from the command line rather than powering off the server.

# shutdown -h now


This will stop the running services before powering down the machine.

Based on Centos, an additional method for getting it back up again when you run into this problem is to move mysql.sock:

# mv /var/lib/mysql/mysql.sock /var/lib/mysql/mysql.sock.bak

# service mysqld start
Restarting the service creates a new entry called mqsql.sock
```