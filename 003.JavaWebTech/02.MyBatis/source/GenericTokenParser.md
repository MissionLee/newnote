#  MyBatis源码解析（十一）——Parsing解析模块之通用标记解析器（GenericTokenParser）与标记处理器（TokenHandler） 

原创作品，可以转载，但是请标注出处地址：http://www.cnblogs.com/V1haoge/p/6724223.html

## 回顾
　　上面的几篇解析了类型模块，在MyBatis中类型模块包含的就是Java类型与Jdbc类型，和其间的转换处理。类型模块在整个MyBatis功能架构中属于基础组件之一，是提前注册到注册器中，并配置到Configuration中备用。
　　从这一篇开始解析Parsing解析模块，这个模块不同于Type模块，这个模块更像是一套工具模块。本篇先解析通用标记解析器GenericTokenParser。
## 通用标记解析器
　　这里的通用标记解析器处理的是SQL脚本中#{parameter}、${parameter}参数，根据给定TokenHandler（标记处理器）来进行处理，TokenHandler是标记真正的处理器，而本篇的解析器只是处理器处理的前提工序——解析，本类重在解析，而非处理，具体的处理会调用具体的TokenHandler的handleToken()方法来完成。
　　下面来看看该类的源码，首先就是字段与构造器：
```java
  //有一个开始和结束记号
  private final String openToken;
  private final String closeToken;
  //记号处理器
  private final TokenHandler handler;

  public GenericTokenParser(String openToken, String closeToken, TokenHandler handler) {
    this.openToken = openToken;
    this.closeToken = closeToken;
    this.handler = handler;
  }
```
　　在该类中定义了三个字段，分别为openToken（开始标记）、closeToken（结束标记）、handler（标记处理器），而且通过带参数的构造器进行赋值，且只有这么一个构造器，如果要调用该解析器，必然需要为其三个参数进行赋值来创建其实例来完成解析工作。
　　本类的重点就在下面的这个解析方法parse()方法上：
```java
   public String parse(String text) {
     StringBuilder builder = new StringBuilder();
     if (text != null && text.length() > 0) {
       char[] src = text.toCharArray();
       int offset = 0;
       int start = text.indexOf(openToken, offset);
       //#{favouriteSection,jdbcType=VARCHAR}
       //这里是循环解析参数，参考GenericTokenParserTest,比如可以解析${first_name} ${initial} ${last_name} reporting.这样的字符串,里面有3个 ${}
       while (start > -1) {
           //判断一下 ${ 前面是否是反斜杠，这个逻辑在老版的mybatis中（如3.1.0）是没有的
         if (start > 0 && src[start - 1] == '\\') {
           // the variable is escaped. remove the backslash.
             //新版已经没有调用substring了，改为调用如下的offset方式，提高了效率
           //issue #760
           builder.append(src, offset, start - offset - 1).append(openToken);
           offset = start + openToken.length();
         } else {
           int end = text.indexOf(closeToken, start);
           if (end == -1) {
             builder.append(src, offset, src.length - offset);
             offset = src.length;
           } else {
             builder.append(src, offset, start - offset);
             offset = start + openToken.length();
             String content = new String(src, offset, end - offset);
             //得到一对大括号里的字符串后，调用handler.handleToken,比如替换变量这种功能
             builder.append(handler.handleToken(content));
             offset = end + closeToken.length();
           }
         }
         start = text.indexOf(openToken, offset);
       }
       if (offset < src.length) {
         builder.append(src, offset, src.length - offset);
       }
     }
     return builder.toString();
   }
```
　　这里必须要强调一下解析的意思，解析就是解读，就是要知道目标是什么，但是不会对目标进行任何处理，解析的目的在于认知，而非处理。那么这么来看这个方法的目的也是如此，MyBatis将解析与处理分开布置，只在最后通过调用标记处理器中的处理方法来完成标记处理工作，其余的代码一律都是解析认知，当然计算机就算解析出来也不会认识那是什么东西，所以这里的解析更形象的说就是将一长串字符串中的部分获取到的意味。然后对获取的部分子串进行响应的处理。
- 第一步：该方法的参数text其实一般是SQL脚本字符串，首先验证参数是否为null，如果为null，直接返回一个空字符串；如果不为null，则执行下一步处理。
- 第二步：将给定字符串转为字符数组src，并定义偏移量offset为0，然后获取openToken子串在text中的第一次出现的开始下标start，执行下一步。
- 第三步：验证start是否大于-1（亦即给定参数text中存在openToken子串），如果大于-1（开启循环），验证在给定text的start位置的前一位字符是否为"\"（反斜扛），如果是反斜杠，说明获取到的参数被屏蔽了，我们需要去除这个反斜杠，并重新定位offset。当然如果不是反斜扛，说明参数正常，则执行第四步。
- 第四步：获取第一个匹配子串的末位位置end，如果end为-1，表示不存在closeToken，则获取末位end之前的所有串，并重新定位offset为src数组长度，如果end值不是-1，说明text字符串中存在结束标记closeToken，则执行下一步
- 第五步：首先获取开始标记之前的子串，并重新定位偏移量offset（start+开始标记的长度=具体参数开始位置），获取这个参数串为content，然后调用TokenHandler的handleToken()方法对获取到的参数串进行处理（比如替换参数之类），然后将处理后的串添加到之前的子串之上，再次重新定位偏移量offset为结束标记的下一位（end+closeToken的长度=end+1）。
- 第六步：获取text中下一步openToken的开始位置，重置start，执行循环体第三步到第六步，处理每一个参数，直到最后一个参数，循环结束，执行第七步。
- 第七步：最后验证偏移量offset与src数组的长度，如果offset小，说明原串还有部分未添加到新串之上，将末尾剩余部分添加到新串，然后将新串返回，如果offset不小于src的数组长度，则直接返回新串

> 总结：这个方法的作用就是通过参数的开始标记与结束标记，循环获取SQL串中的参数，并对其进行一定的处理，组合成新串之后，架构新串返回。就是这么简单！
　　它的解析就是获取SQL脚本串中的参数子串。
## 标记处理器：TokenHandler
　　这是一个接口，用于定义标记处理器，当我们要实现一个具体的标记处理器时，直接实现这个接口即可，可以看看其源码，极其简单：
```java
 package org.apache.ibatis.parsing;
 /**
  * 记号处理器
  * 
  */
 public interface TokenHandler {
     //处理记号
   String handleToken(String content);
 }
```
　　接口中只申明了一个handleToken()方法，这是处理标记的方法。在MyBatis中其实现类大多以内部类的方式呈现，有匿名内部类、静态内部类等。
　　在org.apache.ibatis.parsing包下不只定义了简单的标记处理器接口，还有一个属性解析器PropertyParser，这正是一个纯正的解析器实现，下面对这个类进行解析：
```java
 package org.apache.ibatis.parsing;
 import java.util.Properties;
 
 /**
  * 属性解析器
  */
 public class PropertyParser {
 
   private PropertyParser() {
     // Prevent Instantiation
   }
 
   public static String parse(String string, Properties variables) {
     VariableTokenHandler handler = new VariableTokenHandler(variables);
     GenericTokenParser parser = new GenericTokenParser("${", "}", handler);
     return parser.parse(string);
   }
 
   //就是一个map，用相应的value替换key
   private static class VariableTokenHandler implements TokenHandler {
     private Properties variables;
 
     public VariableTokenHandler(Properties variables) {
       this.variables = variables;
     }
 
     @Override
     public String handleToken(String content) {
       if (variables != null && variables.containsKey(content)) {
         return variables.getProperty(content);
       }
       return "${" + content + "}";
     }
   }
 }
```
　　这里开头就定义了一个私有的无参构造器，目的何在？禁止实例化，不错，这个解析器是作为一个工具类而存在，用于属性解析处理，其解析方法是静态的，可以直接类名点用，虽然也可以使用实例调用，但在这里通过将构造器私有化的行为明令禁止了这种方式，这样也就减少了项目中实例的数量，不会每次调用都会新建实例而导致大量实例堆积。
　　再看parser()方法，首先创建了一个标记处理器的实例，这个标记处理器是PropertyParser的一个静态内部类，这个类实现了TokenHandler接口，用于实现属性解析工作，所谓的属性解析，就是通过给定的key在Properties属性列表中查询获取对应的value进行替换。而具体的解析工作则交由GenericTokenParser来负责