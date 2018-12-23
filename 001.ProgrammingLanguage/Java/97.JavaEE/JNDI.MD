# JNDI

原文：https://www.cnblogs.com/zhulongchao/p/4567427.html

## 什么是JNDI

JNDI（The Java Naming and Directory Interface，Java命名和目录接口）是一组在Java应用中访问命名和目录服务的API.命名服务将名称和对象联系起来，使得我们可以用名称访问对象。目录服务是一种命名服务，在这种服务里，对象不但有名称，还有属性。

命名或目录服务使你可以`集中存储共有信息`，这一点在网络应用中是重要的，因为这使得这样的应用更协调、更容易管理。例如，可以将打印机设置存储在目录服务中，以便被与打印机有关的应用使用。

命名服务中的对象可以是DNS记录中的名称、应用服务器中的EJB组件（Enterprise JavaBeans Component）、LDAP（Lightweight Directory Access Protocol）中的用户Profile.

`目录服务是命名服务的自然扩展`。两者之间的关键差别是`目录服务中对象可以有属性`（例如，用户有email地址），而命名服务中对象没有属性。因此，在目录服务中，你可以根据属性搜索对象。目录服务允许你访问文件系统中的文件，定位远程RMI注册的对象，访问象LDAP这样的目录服务，定位网络上的EJB组件。

## JNDI的优势

解耦合(Decoupling)：通过注册、查找JNDI服务，可以直接使用服务，而无需关心服务提供者，这样程序不至于与访问的资源耦合！（高内聚:high cohesion）

包含了大量的命名和目录服务，使用通用接口来访问不同种类的服务；可以同时连接到多个命名或目录服务上；建立起逻辑关联，允许把名称同Java对象或资源关联起来，而不必指导对象或资源的物理ID。

JNDI程序包： 
- javax.naming：命名操作； 
- javax.naming.directory：目录操作； 
- javax.naming.event：在命名目录服务器中请求事件通知； 
- javax.naming.ldap：提供LDAP支持； 
- javax.naming.spi：允许动态插入不同实现。

利用JNDI的命名与服务功能来满足企业级APIs对命名与服务的访问，诸如EJBs、JMS、JDBC 2.0以及IIOP上的RMI通过JNDI来使用CORBA的命名服务。

## JNDI的基本运行原理

### 注册 register
> 注册JNDI提供者（register）

在使用JNDI之前，需要先获取JNDI的提供者，并在系统注册它。与JNDI相关的系统属性在javax.naming.Context中定义，常用的属性：

- java.naming.factory.initial，服务提供者用来创建InitialContext的类名。
- java.naming.provider.url，用来配置InitialContext的初始url
- java.naming.factory.object，用来创建name-to-object映射的类，用于NameClassPair和References。
- java.naming.factory.state，用来创建jndi state的类

对于目录服务，由于一般需要安全设置，还通常使用：

- java.naming.security.authentication，安全类型，三个值：none，simple或strong。
- java.naming.security.principal，认证信息。
- java.naming.security.credentials，证书信息。
- java.naming.security.protocol，安全协议名。

> 使用System.setProperty注册，如果程序不显示说明，那么java会在classpath内查找jdni.properties文件来完成注册。jdni.properties例子：

java.naming.factory.initial=com.codeline.db.MockInitialContextFactory

### 连接服务(init)

注册之后，就可以实施服务连接了。对于名字服务由InitialContext开始，目录服务则使用InitialDirContext。它们分别实现了Context和DirContext，这两个接口分别对应名字服务和目录服务的接口，也是JNDI中最重要的两个接口。

连接名字服务：                
```java
System.setProperty(Context.INITIAL_CONTEXT_FACTORY,"
com.sun.jndi.fscontext.FSContextFactory");
InitialContext ctx = new InitialContext();
```
连接目录服务 

```java
Hashtable env = new Hashtable();
env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
env.put(Context.PROVIDER_URL, "ldap://myserver.com/");
env.put(Context.SECURITY_AUTHENTICATION, "simple");
    //登录ldap server需要的用户名
env.put(Context.SECURITY_PRINCIPAL, "ldapuser");
  //登录ldap server需要的密码
env.put(Context.SECURITY_CREDENTIALS, "mypassword");
InitialDirContext ctx = new InitialDirContext(env);

```

多服务提供者：如果应用包含多个服务提供者，在连接时略有不同。以名字服务为例

```java
Hashtable env = new Hashtable();
  env.put(Context.INITIAL_CONTEXT_FACTORY,
"com.sun.jndi.rmi.registry.RegistryContextFactory");
  env.put(Context.PROVIDER_URL, "rmi://myserver.com:1099");
  //使用不同的构造函数
InitialContext ctx = new InitialContext(env);
```
### 查找服务(lookup)

不论名字服务还是目录服务，都是使用lookup来查找对象的。除了可以使用String作为参数之外，lookup还可使用Name接口作为参数。 
```java
Greeter greeter = (Greeter)ctx.lookup("SayHello"); 
```
如果想要获得上下文中所有的对象名字，就使用list返回NameClassPair列表。NameClassPair包含对象名字和对象类名。如果想要获得实际的对象实例列表，就使用listBindings，它返回Binding列表。Binding是NameClassPair的子类，它包含对象的实例。

```java
//  list
NamingEnumeration list = ctx.list("awt"); 
while (list.hasMore()) { 
    NameClassPair nc = (NameClassPair)list.next(); 
    System.out.println(nc); 
}
//  listBindings
NamingEnumeration bindings = ctx.listBindings("awt"); 
while (bindings.hasMore()) { 
    Binding bd = (Binding)bindings.next(); 
    System.out.println(bd.getName() + ": " + bd.getObject()); 
}
```
### 对象绑定(binding)
```java
// 使用bind添加绑定 
Fruit fruit = new Fruit("orange"); 
ctx.bind("favorite", fruit);

// 使用rebind修改绑定 
Fruit fruit = new Fruit("lemon"); 
ctx.rebind("favorite", fruit);

// 使用unbind去除绑定。 
ctx.unbind("favorite");

### 对象改名(rename)

使用rename可以给一个在上下文中的对象改名 
```java
ctx.rename("report.txt", "old_report.txt");
```
- 获取属性

属性相关的接口是Attribute和Attributes，它们都在javax.naming.directory包内。通过DirContext的getAttributes方法就可以获得对象的属性集合，然后使用Attributes的get方法获得对应的属性，最后通过Attribute的get方法就可以获得属性值。

```java
String dn = "uid=me, dc=mycompany, dc=com, ou=customer, o=ExampleApp"; 
Context user = (Context)ctx.lookup(dn); 
//获得所有属性 
Attributes attrs = user.getAttributes(""); 
Attribute test= attrs .get("test"); 
Object testValue= test.get();
//上例中获得的是user的所有属性，在实际使用过程中，考虑网络带宽的影响，可以设置获取要获取的属性数组：

String reqd_attrs = new String[] { "surname", "initials","title", "rfc822mailalias"}; 
Attributes attrs = user.getAttributes("", reqd_attrs);
```
### 查找及过滤(Search and Filter)
```java
SearchControls ctrls = new SearchControls(); 
ctrls.setCountLimit(20); 
ctrls.setTimeLimit(5000); 
ctrls.setSearchScope(SearchControls.SUBTREE_SCOPE); 
NamingEnumeration results = initial_ctx.search("cat=books,ou=Products, 
o=ExampleApp","title=*Java*",ctrls);
```
### 修改属性

使用ModificationItem，也可一次进行多个不同的修改操作：

```java
ModificationItem[] mod_items = new ModificationItems[2]; 
Attribute email = new BasicAttribute("rfc822mailalias", new_email); 
ModificationItem email_mod = new ModificationItem(DirContext.ADD_ATTRIBUTE, email); 
Attribute addr = new BasicAttribute("address", address); 
ModificationItem addr_mod = new ModificationItem(DirContext.REPLACE_ATTRIBUTE, addr); 
mod_items[0] = email_mod; 
mod_items[1] = addr_mod; 
initial_ctx.modifyAttributes(dn, mod_items);
```
### 创建上下文
```java
// 使用createSubcontext方法完成。
 BasicAttributes attrs = new BasicAttributes(); 
attrs.put("initials", initials); 
 attrs.put("sn", surname); 
 attrs.put("rfc822mailalias", email); 
 if(address != null) 
     attrs.put("address", address); 
 if(country != null) 
     attrs.put("c", country); 
 if(phone != null) 
    attrs.put("phonenumber", phone); 
initial_ctx.createSubcontext(dn, attrs);
//删除上下文

//使用destroySubcontext方法完成。 
initial_ctx.destroySubcontext(dn);
```
## JNDI与JDBC

JNDI提供了一种统一的方式，可以用在网络上查找和访问服务。通过指定一个资源名称，该名称对应于数据库或命名服务中的一个纪录，同时返回数据库连接建立所必须的信息。

复制代码
```java
try{
Context cntxt = new InitialContext();
DataSource ds = (DataSource) cntxt.lookup("jdbc/dpt");
}
catch(NamingException ne){
...
}
```
## JNDI与JMS

消息通信是软件组件或应用程序用来通信的一种方法。JMS就是一种允许应用程序创建、发送、接收、和读取消息的JAVA技术。

```java
try{
Properties env = new Properties();
InitialContext inictxt = new InitialContext(env);
TopicConnectionFactory connFactory = (TopicConnectionFactory) inictxt.lookup("TTopicConnectionFactory");
...
}
catch(NamingException ne){
...
}
```
## JNDI与Spring集成(integrate)

查找connection
```xml
<bean id="tuxedoConnFactory" class="org.springframework.jndi.JndiObjectFactoryBean">   
      <property name="jndiName"> 
            <value>tuxedo/services/TuxedoConnection</value>
      </property> 
      <property name="resourceRef"> 
          <value>false</value>
     </property> 
     <property name="jndiEnvironment"> 
       <props> 
            <!-- The value of Context.PROVIDER_URL --> 
            <prop key="java.naming.provider.url">t3://localhost:7001</prop> 
            <prop key="java.naming.factory.initial">weblogic.jndi.WLInitialContextFactory</prop> 
        </props> 
      </property> 
</bean>
```
查找datasource


（1）配置可以访问到同一应用服务器的jndi数据源 
```xml
<bean id="dataSource" class="org.springframework.jndi.JndiObjectFactoryBean"> 

<property name="jndiName"> 

<value>jdbc/cqccms</value> 

</property> 

</bean>
```
（2）配置能访问远程jndi数据源 
```xml
<bean id="dataSource" class="org.springframework.jndi.JndiObjectFactoryBean"> 

<property name="jndiName"> 

<value>jdbc/cqccms</value> 

</property> 

<property name="jndiEnvironment"> 

<props> 

<prop key="java.naming.factory.initial"> 

weblogic.jndi.WLInitialContextFactory 

</prop> 

<prop key="java.naming.provider.url">t3://172.16.101.42:7001</prop> 

<prop key="java.naming.security.principal">weblogic</prop> 

<prop key="java.naming.security.credentials">weblogic</prop> 

</props> 

</property> 

</bean>
```
远程数据源的事务配置

```xml
<bean id="jndiTemplate" class="org.springframework.jndi.JndiTemplate" singleton="true" 

lazy-init="default" autowire="default" dependency-check="default"> 

<property name="environment"> 

<props> 

<prop key="java.naming.factory.initial"> 

weblogic.jndi.WLInitialContextFactory 

</prop> 

<prop key="java.naming.provider.url">t3://172.16.101.42:7001</prop> 

<prop key="java.naming.security.principal">weblogic</prop> 

<prop key="java.naming.security.credentials">weblogic</prop> 

</props> 

</property> 

</bean> 
```
然后在配置一下transactionManager,如下 
```xml
<bean id="transactionManager" class="org.springframework.transaction.jta.JtaTransactionManager" singleton="true" 

lazy-init="default" autowire="default" dependency-check="default"> 

<property name="jndiTemplate"> 

<ref local="jndiTemplate" /> 

</property> 

<property name="userTransactionName"> 

<value>weblogic/transaction/UserTransaction</value> 

</property> 

</bean>
```