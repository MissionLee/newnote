# 

JDBC在链接的时候，会从数据库，获取其时区，如果系统使用的CST时区，JDBC会将其作为 CST -5（美国），而我们本地为CST +8， 这就导致了查询出来的时间比真实时间多13小时，或者存储到库的时间比真实值少13小时
- 相关类 com.mysql.cj.jdbc.ConnetionImpl.initializePropsFromServer() 获取服务器参数

当需要使用时区的时候，有这样的方法
```java
    /**
     * The default time zone used to marshall date/time values to/from the server. This is used when getDate(), etc methods are called without a calendar
     * argument.用于将日期/时间值与服务器组合在一起的默认时区。 在没有日历参数的情况下调用getDate（）等方法时使用此方法。
     *
     * @return The server time zone (which may be user overridden in a connection property) 可以被connection property覆盖
     */
    TimeZone getDefaultTimeZone();
```

- 这个问题由两种解决方法
  - 修改mysql 与 applicaiton其中一个时间，让两者相同
  - 根据上面的源码提示，在connection的时候，指定时间



> 相关报错

服务器上的MySQL 5.6.40 （CentOS）
```bash
org.springframework.dao.TransientDataAccessResourceException: Error attempting to get column 'updateDate' from result set.  Cause: java.sql.SQLException: HOUR_OF_DAY: 2 -> 3
; HOUR_OF_DAY: 2 -> 3; nested exception is java.sql.SQLException: HOUR_OF_DAY: 2 -> 3
......
Caused by: java.sql.SQLException: HOUR_OF_DAY: 2 -> 3
.......
Caused by: com.mysql.cj.exceptions.WrongArgumentException: HOUR_OF_DAY: 2 -> 3
.....
Caused by: java.lang.IllegalArgumentException: HOUR_OF_DAY: 2 -> 3
```
本地Mysql MySQL 5.7 Windows

```bash
java.sql.SQLException: The server time zone value 'ÖÐ¹ú±ê×¼Ê±¼ä' is unrecognized or represents more than one time zone. You must configure either the server or JDBC driver (via the serverTimezone configuration property) to use a more specifc time zone value if you want to utilize time zone support.
....
Caused by: com.mysql.cj.exceptions.InvalidConnectionAttributeException: The server time zone value 'ÖÐ¹ú±ê×¼Ê±¼ä' is unrecognized or represents more than one time zone. You must configure either the server or JDBC driver (via the serverTimezone configuration property) to use a more specifc time zone value if you want to utilize time zone support.
......

