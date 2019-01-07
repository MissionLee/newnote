http://tomcat.apache.org/

下载tomcat core zip 即可 ，解压到文件夹中

此电脑-属性-高级-环境变量

CATALINA_HOME= %自己放tomcat的目录%

Path里面添加 %CATALINA_HOME%\bin 这一条

配置好之后 powershell 中 startup 

tomcat 应该可以正常启动，访问 localhost:8080 可以看到欢迎页面

## 问题处理

win10 中 tomcat 控制台中文乱码

原因： windows 默认使用GBK编码 cmd 或者 powershell 在运行 startup的是偶创建新的窗口沿用GBK，但是tomcat的控制台日志编码是UTF-8

处理：tomcat路径\conf\logging.properties 中 修改 java.util.logging.ConsoleHandler.encoding = GBK