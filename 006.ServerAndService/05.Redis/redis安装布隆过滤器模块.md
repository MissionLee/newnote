1.下载redisbloom插件(redis官网下载即可)

https://github.com/RedisLabsModules/redisbloom/

找到最新的tag下载tar.gz格式即可；

[root@redis]# wget https://github.com/RedisLabsModules/rebloom/archive/v1.1.1.tar.gz
2.解压并安装，生成.so文件

[root@redis]# tar -zxvf v1.1.1.tar.gz
 
[root@redis]# cd redisbloom-1.1.1/
 
[root@redisbloom-1.1.1]# make
 
[root@redisbloom-1.1.1]# ls
 
contrib  Dockerfile  docs  LICENSE  Makefile  mkdocs.yml  ramp.yml  README.md  rebloom.so  src  tests
3.在redis配置文件(redis.conf)中加入该模块即可

[root@yangwenjiong-centos etc]# cd /etc/redis/
 
[root@yangwenjiong-centos redis]# ls
 
redis.conf
4.配置文件加入模块代码

[root@redis]# vim redis.conf
 
#####################MODULES####################                                                                                                                      # Load modules at startup. If the server is not able to load modules
 
# it will abort. It is possible to use multiple loadmodule directives.
 
loadmodule /usr/local/redis/redisbloom-1.1.1/rebloom.so


5.启动redis即可

[root@redis]# redis-server redis.conf
6.测试是否安装成功

127.0.0.1:6379> bf.add users user2
 
(integer) 1
 
127.0.0.1:6379> bf.exists users user2
 
(integer) 1
 
127.0.0.1:6379> bf.exists users user3
 
(integer) 0
 
--------------------- 
版权声明：本文为CSDN博主「囧囧哥」的原创文章，遵循CC 4.0 by-sa版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/u013030276/article/details/88350641