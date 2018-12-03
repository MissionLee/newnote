# MySQL

正常运行的mysql，机器重启之后就启动不了

可以看Mysql 日志 位置在 /var/log/mysqld.log

## 失败原因： 没有  [ERROR] /usr/sbin/mysqld: Can't create/write to file '/var/run/mysqld/mysqld.pid'

或者是类似的原因，实际上是因为 mysqld 这个文件夹没有了，我们需要创建文件夹，并授权给 mysql 就可以了

## 解释说明 

之所以/var/run/mysqld 目录每次重启后都需要手动去创建，是因为/var/run/目录下建立文件夹是在内存中，故每次重启后内存被清空导致/var/run/mysqld 也被清除，从而导致无法启动mysql。

vim /etc/init.d/mysqld

找到下面字段

get_mysql_option mysqld datadir "/var/lib/mysql"
datadir="$result"
get_mysql_option mysqld socket "$datadir/mysql.sock"
socketfile="$result"
get_mysql_option mysqld_safe log-error "/var/log/mysqld.log"
errlogfile="$result"
get_mysql_option mysqld_safe pid-file "/var/run/mysqld/mysqld.pid"
mypidfile="$result"

修改为

get_mysql_option mysqld datadir "/var/lib/mysql"
datadir="$result"
get_mysql_option mysqld socket "$datadir/mysql.sock"
socketfile="$result"
get_mysql_option mysqld_safe log-error "/var/log/mysqld.log"
errlogfile="$result"
get_mysql_option mysqld_safe pid-file "/var/lib/mysql/mysqld.pid"
mypidfile="$result"

保存后退出，执行下面命令：

systemctl daemon-reload   //重构进程

service mysqld start    //启动mysql

chkconfig mysqld on    //加入随系统启动启动



至此，解决。
--------------------- 
作者：我心银河系 
来源：CSDN 
原文：https://blog.csdn.net/codemacket/article/details/77719323 
版权声明：本文为博主原创文章，转载请附上博文链接！