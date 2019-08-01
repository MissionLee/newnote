下载mysql，这里我没使用 installer，因为比较烦

下载 binary，就是压缩包

我的移动硬盘里面有备份

需要做的事情

- 解压到某个文件夹
  - 1. 把解压后里面的bin目录 放到环境path里面
  - 2. 在mysql的文件夹下面 创建 my.ini 

  - 3. 注册mysql
    - cmd 在管理员模式下
    - 进入 bin目录
    - mysqld --install  注册mysql的服务
    - mysqld --initialize-insecure 初始化数据库
    - net start mysql 启动mysql

# 出现了密码改错了， mysql8.0 如何跳过密码

管理员 cmd ，在mysql bin 目录下：

mysqld --console --skip-grant-tables --shared-memory


--------------------------------

5.7

XYp9iN!uaau?