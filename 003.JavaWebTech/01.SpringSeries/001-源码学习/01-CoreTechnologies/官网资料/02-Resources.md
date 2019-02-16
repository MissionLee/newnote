# Resources
此部分包括：Spring如何处理资源，还有如何在项目中使用资源，包括以下几个部分

- Introduction 介绍

- The Resource Interface 接口

- Built-in Resource Implementations 内置实现

- The ResourceLoader

- The ResourceLoaderAware interface

- Resources as Dependencies 把Resource作为依赖

- Application Contexts and Resource Paths

##　2.1. Introduction

java自带标准 java.nte.URL类和处理各种URL前缀的实现，依然不能很好的用来处理各种low-level资源，例如URL没有一个标准的实现可以访问classpath或者ServletContext里面的资源。虽然我们可以自己实现一个handler，但是这太复杂，并且URL类下面也缺少一些实用方法，比如判断某个资源是否存在

## 2.2. The Resource Interface

Spring的 Resource 接口就是设计作为访问low-level 资源的抽象。下面是Resource接口的定义。
```java
public interface Resource extends InputStreamSource {

    boolean exists();

    boolean isOpen();

    URL getURL() throws IOException;

    File getFile() throws IOException;

    Resource createRelative(String relativePath) throws IOException;

    String getFilename();

    String getDescription();

}
```
从这个定义我们可以看到它继承了InputStreamSource接口，下面是这个接口
```java
public interface InputStreamSource {

    InputStream getInputStream() throws IOException;

}
```
介绍以下核心方法：

- getInputStream(): 定义并打开资源，返回一个InputStream,要求是每次调用都返回一个新的InputStream，然后调用者负责关闭Stream

- exists(): 返回要找的资源是否存在boolean

- isOpen(): 表示这个resource是否是一个open stream，如果true这个InputStream只能读取一次，然后关掉防止resource泄露；除了InputStreamResource 普通的resource都是返回false

- getDescription():通常是file的全限定名或者rul，在操作resource的时候如果报错就用这个

其他的方法用来获取代表resource的真正的url或者file

Spring内部广泛使用Resource，作为很多方法的资源参数。其他还有一些SpringAPI例如一些ApplicationContext实现类，可以接受一个带有指定前缀的字符串用来调用对应的resource处理器

因为resource在spring中广泛使用，实际上我们也可以在自己的代码中使用这些接口来访问资源，即使不需要其他的spring组件

The Resource abstraction does not replace functionality. It wraps it where possible. For example, a UrlResource wraps a URL and uses the wrapped URL to do its work.
## 2.3. Built-in Resource Implementations
Spring includes the following Resource implementations:

- UrlResource
  - java.net.URL的包装，可以通过URL访问资源，例如files，HTTP target，FTP target还有其他之类的。资源定位用的字符串前缀是： file: / http: / ftp: 的时候会用这个
  - 🔺 特别注意： 如果定位资源用的字符串的前缀没有直接匹配到，就会被交给UrlResource

- ClassPathResource
  - 类路径下的资源，用当前新城的 class loader 或者指定的class loader
  - 如果资源在文件系统里面，这个实现支持使用java.io.File来访问资源，但是如果jar包没有被包含在servlet engine中或者其他什么环境中，要访问这种资源，支持用java.net.URL的形式解析
  - 字符串前缀： classpath：
- FileSystemResource
  - 支持java.io.File和java.nio.file.Path
- ServletContextResource
  - 支持 ServletContext resource。这是servlet上下文资源的资源实现，用于解释相关web应用程序根目录中的相对路径。
  - 它始终支持流访问和URL访问，但只有在-扩展Web应用程序存档-且资源实际位于文件系统上时才允许java.io.File访问。 无论它是在文件系统上扩展还是直接从JAR或其他地方（如数据库）（可以想象）访问，实际上都依赖于Servlet容器。
- InputStreamResource
  - InputStream对应实现，一般不用这个
  - 和其他实现比，这个需要 already-opened resource，所以 isOpen方法返回true
- ByteArrayResource
  - byteArray
## 2.4. The ResourceLoader
ResourceLoader接口通过 location字符串返回 一个Resource 实现
```java
public interface ResourceLoader {

    Resource getResource(String location);

}
```

所有的application context实现了resourceloader接口，因此所有的application context都能获得resource 实例

当您在特定的应用程序上下文中调用getResource()，而指定的位置路径没有特定的前缀时，您将获得适合于该特定应用程序上下文中的资源类型。
For example, assume the following snippet of code was executed against a ClassPathXmlApplicationContext instance:
```java
Resource template = ctx.getResource("some/resource/path/myTemplate.txt");
```
对于ClassPathXmlApplicationContext，该代码返回一个ClassPathResource。如果对FileSystemXmlApplicationContext实例执行相同的方法，它将返回文件系统资源。对于WebApplicationContext，它将返回一个servletcontext tresource。它同样会为每个上下文返回适当的对象。

因此，您可以以适合特定应用程序上下文的方式加载资源。

另一方面，您也可以通过指定特殊的classpath: prefix来强制使用ClassPathResource，而不考虑应用程序上下文类型，如下面的示例所示:
```java
Resource template = ctx.getResource("classpath:some/resource/path/myTemplate.txt");
```
Similarly, you can force a UrlResource to be used by specifying any of the standard java.net.URL prefixes. The following pair of examples use the file and http prefixes:
```java
Resource template = ctx.getResource("file:///some/resource/path/myTemplate.txt");
Resource template = ctx.getResource("http://myhost.com/resource/path/myTemplate.txt");
```
The following table summarizes the strategy for converting String objects to Resource objects:

## 2.5. The ResourceLoaderAware interface
ResourceLoaderAware接口是一个特殊的标记接口，用于标识预期由ResourceLoader引用提供的对象。下面的清单显示了ResourceLoaderAware接口的定义:
```java
public interface ResourceLoaderAware {

    void setResourceLoader(ResourceLoader resourceLoader);
}
```

当一个类实现ResourceLoaderAware并被部署到应用程序上下文中(作为spring管理的bean)时，应用程序上下文中会将其识别为ResourceLoaderAware。然后，应用程序上下文调用setResourceLoader(ResourceLoader)，并提供自身作为参数(请记住，Spring中的所有应用程序上下文都实现了ResourceLoader接口)。

由于ApplicationContext是一个ResourceLoader, bean还可以实现ApplicationContextAware接口，并使用提供的应用程序上下文直接加载资源。但是，通常情况下，如果只需要专用的ResourceLoader接口，那么最好使用它。代码将仅耦合到资源加载接口(可以将其视为实用程序接口)，而不耦合到整个Spring ApplicationContext接口。

从Spring2.5开始，您可以依赖ResourceLoader的自动连线作为实现ResourceLoaderware接口的替代方法。“传统”构造器和bytype自动布线模式（如autowiring collaborators中所述）现在能够分别为构造器参数或setter方法参数提供类型resourceloader的依赖关系。为了获得更大的灵活性（包括自动连接字段和多个参数方法的能力），请考虑使用基于注释的自动连接功能。在这种情况下，只要字段、构造函数或方法包含@autowired注释，ResourceLoader就会自动连接到需要ResourceLoader类型的字段、构造函数参数或方法参数中。有关详细信息，请参阅使用@autowired。

## 2.6. Resources as Dependencies
如果bean本身要通过某种动态过程确定并提供资源路径，那么bean使用ResourceLoader接口加载资源可能是有意义的。例如，考虑加载某种类型的模板，其中所需的特定资源取决于用户的角色。如果资源是静态的，那么完全消除ResourceLoader接口的使用是有意义的，让bean公开它需要的资源属性，并期望将它们注入其中。

所有应用程序上下文都注册并使用一个特殊的javabans PropertyEditor，它可以将字符串路径转换为资源对象，这使得注入这些属性变得非常简单。⭐⭐⭐因此，如果myBean具有Resource类型的模板属性，那么可以为该资源配置一个简单的字符串，如下面的示例所示:
```xml
<bean id="myBean" class="...">
    <property name="template" value="some/resource/path/myTemplate.txt"/>
</bean>
```
请注意，资源路径没有前缀。 因此，因为应用程序上下文本身将用作ResourceLoader，所以资源本身通过ClassPathResource，FileSystemResource或ServletContextResource加载，具体取决于上下文的确切类型。

如果需要强制使用特定的资源类型，则可以使用前缀。 以下两个示例显示如何强制ClassPathResource和UrlResource（后者用于访问文件系统文件）：
```xml
<property name="template" value="classpath:some/resource/path/myTemplate.txt">
<property name="template" value="file:///some/resource/path/myTemplate.txt"/>
```
## 2.7. Application Contexts and Resource Paths
如何通过Resource创建 Appliction Context，包括使用xml，使用通配符和其他细节

### 2.7.1. Constructing Application Contexts 构造Application Contexts

一个application context 构造器通常用一个string，或者 string数组表示资源路径，

当这样的位置路径没有前缀时，从该路径构建并用于加载bean定义的特定资源类型⭐⭐取决于并且适合于特定的应用程序上下文。 例如，请考虑以下示例，该示例创建ClassPathXmlApplicationContext：
```java
ApplicationContext ctx = new ClassPathXmlApplicationContext("conf/appContext.xml");
```
上面的ctx会从classpath加载bean definition，下面的这个会从filesystem加载
```java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("conf/appContext.xml");
```
Now the bean definition is loaded from a filesystem location (in this case, relative to the current working directory).

⭐注意：如果写了前缀，会覆盖默认的加载方式，如下：
```java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("classpath:conf/appContext.xml");
```
使用FileSystemXmlApplicationContext从类路径加载bean定义。 但是，它仍然是FileSystemXmlApplicationContext。 如果它随后用作ResourceLoader，则任何未加前缀的路径仍被视为文件系统路径。

>Constructing ClassPathXmlApplicationContext Instances — Shortcuts

ClassPathXmlApplicationContext公开了许多构造函数，以实现方便的实例化。 基本思想是，您只能提供一个字符串数组，该数组只包含XML文件本身的文件名（没有前导路径信息），并且还提供一个Class。 然后，ClassPathXmlApplicationContext从提供的类派生路径信息。

Consider the following directory layout:
```note
com/
  foo/
    services.xml
    daos.xml
    MessengerService.class
```
The following example shows how a ClassPathXmlApplicationContext instance composed of the beans defined in files named services.xml and daos.xml (which are on the classpath) can be instantiated:
```java
ApplicationContext ctx = new ClassPathXmlApplicationContext(
    new String[] {"services.xml", "daos.xml"}, MessengerService.class);
```
See the ClassPathXmlApplicationContext javadoc for details on the various constructors.

### 2.7.2. Wildcards in Application Context Constructor Resource Paths应用程序上下文构造函数资源路径中的通配符

应用程序上下文构造函数值中的资源路径可以是简单路径（如前所示），每个路径都与目标资源进行一对一映射，或者可以包含特殊的“classpath *：”前缀或内部Ant 式正则表达式（使用Spring的PathMatcher实用程序进行匹配）。 后者都是有效的通配符。

此机制的一个用途是当您需要进行组件样式的应用程序组装时。 所有组件都可以将上下文定义片段“发布”到一个众所周知的位置路径，并且当使用前缀为classpath *的相同路径创建最终应用程序上下文时，将自动拾取所有组件片段。

请注意，此通配符特定于在应用程序上下文构造函数中使用资源路径（或直接使用PathMatcher实用程序类层次结构时），并在构造时解析。 它与资源类型本身无关。 您不能使用classpath *：前缀来构造实际的Resource，因为资源一次只指向一个资源。

>Ant-style Patterns

Path locations can contain Ant-style patterns, as the following example shows:
```note
/WEB-INF/*-context.xml
com/mycompany/**/applicationContext.xml
file:C:/some/path/*-context.xml
classpath:com/mycompany/**/applicationContext.xml
```
当路径位置包含Ant样式模式时，解析程序遵循更复杂的过程来尝试解析通配符。 它为直到最后一个非通配符段的路径生成一个Resource，并从中获取一个URL。 如果此URL不是jar：URL或特定于容器的变体（例如，在WebLogic中为zip：，在WebSphere中为wsjar，等等），则从中获取java.io.File并通过遍历来解析通配符。 文件系统。 对于jar URL，解析器要么从中获取java.net.JarURLConnection，要么手动解析jar URL，然后遍历jar文件的内容以解析通配符。

>Implications on Portability 对可移植性的影响

如果指定的路径已经是文件URL（隐式，因为基本ResourceLoader是文件系统或显式的），则可以保证通配符以完全可移植的方式工作。

如果指定的路径是类路径位置，则解析程序必须通过进行Classloader.getResource（）调用来获取最后一个非通配符路径段URL。 由于这只是路径的一个节点（不是最后的文件），实际上它是未定义的（在ClassLoader javadoc中），在这种情况下确切地返回了什么类型的URL。 实际上，它总是一个java.io.File，表示目录（类路径资源解析为文件系统位置）或某种类型的jar URL（类路径资源解析为jar位置）。 尽管如此，这项行动仍存在可移植性问题。

如果获取最后一个非通配符段的jar URL，则解析器必须能够从中获取java.net.JarURLConnection或手动解析jar URL，以便能够遍历jar的内容并解析通配符。 这在大多数环境中都有效，但在其他环境中无效，我们强烈建议您在依赖它之前，在特定环境中对来自jar的资源的通配符解析进行全面测试。

>The classpath*: Prefix

When constructing an XML-based application context, a location string may use the special classpath*: prefix, as the following example shows:
```java
ApplicationContext ctx =
    new ClassPathXmlApplicationContext("classpath*:conf/appContext.xml");
```
此特殊前缀指定必须获取与给定名称匹配的所有类路径资源（在内部，这主要通过调用ClassLoader.getResources（...））然后合并以形成最终的应用程序上下文定义。
```note
The wildcard classpath relies on the getResources() method of the underlying classloader. As most application servers nowadays supply their own classloader implementation, the behavior might differ, especially when dealing with jar files. A simple test to check if classpath* works is to use the classloader to load a file from within a jar on the classpath: getClass().getClassLoader().getResources("<someFileInsideTheJar>"). Try this test with files that have the same name but are placed inside two different locations. In case an inappropriate result is returned, check the application server documentation for settings that might affect the classloader behavior.
```
您还可以将classpath *：前缀与PathMatcher模式结合在其余的位置路径中（例如，classpath *：META-INF / *  -  beans.xml）。 在这种情况下，解析策略非常简单：在最后一个非通配符路径段上使用ClassLoader.getResources（）调用来获取类加载器层次结构中的所有匹配资源，然后从每个资源中获取相同的PathMatcher解析 前面描述的策略用于通配符子路径。

>Other Notes Relating to Wildcards

Note that classpath*:, when combined with Ant-style patterns, only works reliably with at least one root directory before the pattern starts, unless the actual target files reside in the file system. This means that a pattern such as classpath*:*.xml might not retrieve files from the root of jar files but rather only from the root of expanded directories.

Spring’s ability to retrieve classpath entries originates from the JDK’s ClassLoader.getResources() method, which only returns file system locations for an empty string (indicating potential roots to search). Spring evaluates URLClassLoader runtime configuration and the java.class.path manifest in jar files as well, but this is not guaranteed to lead to portable behavior.
```note
The scanning of classpath packages requires the presence of corresponding directory entries in the classpath. When you build JARs with Ant, do not activate the files-only switch of the JAR task. Also, classpath directories may not get exposed based on security policies in some environments — for example, stand-alone applications on JDK 1.7.0_45 and higher (which requires 'Trusted-Library' to be set up in your manifests. See http://stackoverflow.com/questions/19394570/java-jre-7u45-breaks-classloader-getresources).

On JDK 9’s module path (Jigsaw), Spring’s classpath scanning generally works as expected. Putting resources into a dedicated directory is highly recommendable here as well, avoiding the aforementioned portability problems with searching the jar file root level.
```
Ant-style patterns with classpath: resources are not guaranteed to find matching resources if the root package to search is available in multiple class path locations. Consider the following example of a resource location:
```note
com/mycompany/package1/service-context.xml
```
Now consider an Ant-style path that someone might use to try to find that file:
```note
classpath:com/mycompany/**/service-context.xml
```
Such a resource may be in only one location, but when a path such as the preceding example is used to try to resolve it, the resolver works off the (first) URL returned by getResource("com/mycompany");. If this base package node exists in multiple classloader locations, the actual end resource may not be there. Therefore, in such a case you should prefer using classpath*: with the same Ant-style pattern, which searches all class path locations that contain the root package.

### 2.7.3. FileSystemResource Caveats 注意事项
未附加到FileSystemApplicationContext的FileSystemResource（即，当FileSystemApplicationContext不是实际的ResourceLoader时）会按预期处理绝对路径和相对路径。 相对路径相对于当前工作目录，而绝对路径相对于文件系统的根目录。

但是，出于向后兼容性（历史）原因，⭐⭐当FileSystemApplicationContext是ResourceLoader时，这会发生更改。 FileSystemApplicationContext强制所有附加的FileSystemResource实例将所有位置路径视为相对路径，无论它们是否以前导斜杠开头。 实际上，这意味着以下示例是等效的：
```java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("conf/context.xml");
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("/conf/context.xml");
```
The following examples are also equivalent (even though it would make sense for them to be different, as one case is relative and the other absolute):
```java
FileSystemXmlApplicationContext ctx = ...;
ctx.getResource("some/resource/path/myTemplate.txt");
FileSystemXmlApplicationContext ctx = ...;
ctx.getResource("/some/resource/path/myTemplate.txt");
```
实际上，如果您需要真正的绝对文件系统路径，则应避免对FileSystemResource或FileSystemXmlApplicationContext使用绝对路径，并使用file：URL前缀强制使用UrlResource。 以下示例显示了如何执行此操作：
```java
// actual context type doesn't matter, the Resource will always be UrlResource
ctx.getResource("file:///some/resource/path/myTemplate.txt");
// force this FileSystemXmlApplicationContext to load its definition via a UrlResource
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("file:///conf/context.xml");
```