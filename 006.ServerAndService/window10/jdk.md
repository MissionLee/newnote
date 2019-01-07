可以使用安装包自动安装，但是这种方式安装，虽然可以正常使用，但是没有在 环境变量中写入参数，还要自己手动添加

此电脑-属性-高级系统设置-环境变量-添加

JAVA_HOME = %自己安装的JDK的PATH%

CLASSPATH = .;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar

Path（系统中已经存在） 中 添加一条 ： %JAVA_HOME%\bin