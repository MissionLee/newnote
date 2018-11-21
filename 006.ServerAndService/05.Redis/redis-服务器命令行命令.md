启动服务

- redis-server ${path:redis.conf}

停止服务(没有重启命令)

- redis-cli -h ${ip} -p ${port} -a '${password}'  shutdown
  - 如果没有密码就不用 -a 这一项

```bash
EXEC=/usr/local/bin/redis-server
CLIEXEC=/usr/local/bin/redis-cli
PIDFILE=/var/run/redis_6379.pid
CONF="/etc/redis/redis.conf"
REDISPORT="6379"
PASSWORD=$(cat $CONF|grep '^\s*requirepass'|awk '{print $2}'|sed 's/"//g')
if [ -z $PASSWORD ]
then 
    $CLIEXEC -p $REDISPORT shutdown
else
    $CLIEXEC -a $PASSWORD -p $REDISPORT shutdown
fi
#$CLIEXEC -a $PASSWORD -p $REDISPORT shutdown
--------------------- 
作者：空间神的礼赞 
来源：CSDN 
原文：https://blog.csdn.net/u010309394/article/details/81807597 
版权声明：本文为博主原创文章，转载请附上博文链接！
```