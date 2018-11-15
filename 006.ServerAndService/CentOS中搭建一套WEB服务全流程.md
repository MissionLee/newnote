# CentOS 中 搭建一套WEB服务全流程

> 所有组件都保存了一份安装文件，便于在不方便链接外网的时候搭建平台

|类型|名称|启动命令|备注|
|-|-|-|-|
|组件|JDK|java -xxx||
|服务|MySQL|启动服务器 systemctl start mysqld.service <br>启动客户端 mysql -uroot -pxxxx|20181113版本虚拟机里面root密码为Ro998otPass&|
|服务|Redis|启动服务： redis-server |已经加入环境变量 <br> 密码 Red!76is@03|
|服务|Nginx|启动： nginx|已经加入环境变量|
|组件|Maven|命令 mvn -xxx|已经加入环境变量|
|组件|git|git -xxx|yum安装，直接使用|

## STEP ONE
- 个人电脑目前用的win10 系统，powershell还是不错的，为了方便，先给powershell安装ssh
  - 以管理员身份运行 powershell_ise
  - find-module *ssh*
    - 在我的PC，运行这个名利，提示要安装N-Get软件，点了同意（PackageManagement）
  - 系统会查询出来 ssh相关的组件
    - 
- 安装系统
  - 更新 yum update && yum upgrade
## STEP TWO
- 安装与配置 
  - [JDK](./01.CentOS-7/001.安装JDK.md)
  - [MySQL](./01.CentOS-7/002.安装MySQL.md)
  - [Redis](./01.CentOS-7/003.安装Redis.md)
  - Zookeeper 
  - [Maven](./01.CentOS-7/004.安装Maven.md)
  - [Nginx](./01.CentOS-7/005.安装Nginx.md)
  - git
  
