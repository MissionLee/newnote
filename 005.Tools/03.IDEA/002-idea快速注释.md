## 添加类注释：

File---Setting----Editor----Code Style-----File and    Code  Templates--------Class

```java
#if (${PACKAGE_NAME} && ${PACKAGE_NAME} != "")package ${PACKAGE_NAME};#end
#parse("File Header.java")
/**
*@program: ${PROJECT_NAME}
*@description: ${description}
*@author: Mission Lee
*@create: ${YEAR}-${MONTH}-${DAY} ${HOUR}:${MINUTE}
*/
public class ${NAME} {
}
```

更改之后仅影响新创建类

## 添加方法注释：

Editor -> Live Templates -> 点击右边加号为自己添加一个Templates Group -> 然后选中自己的Group再次点击加号添加Live Templates 
```java
/**
*@Description: $discription$
*@Param: $params$
*@return: $return$
*@Author: your name
*@date: $date$
*/
```