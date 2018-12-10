# 管中窥豹 可见一斑

```java
// ★★★★★ MyBatis解析配置文件，实际上调用了 XMLConfigBuilder.parse()方法
  public Configuration parse() {
    if (parsed) {
      throw new BuilderException("Each XMLConfigBuilder can only be used once.");
    }
    parsed = true;
    // ★★★★★ 下面这个 parser 是 XPathParser的一个实例，构造的时候，会把我们写好的xml配置文件传给 parser的构造函数
    // ★★★★★ configuration 就是MyBatis的xml配置文件的root节点
    parseConfiguration(parser.evalNode("/configuration"));
    return configuration;
  }
// ★★★★★ 这个是具体的内容
  private void parseConfiguration(XNode root) {
    try {
        // ★★★★★ MyBatis 有 11 类型的参数，这里就使用11个步骤对root进行解析。
      //issue #117 read properties first
      // ★★★★★  创建一个  properties 类，把 配置文件里面 配置的属性，和构造时候写入的属性合在一起，同时传递给类成员 parser 和 configuration
      propertiesElement(root.evalNode("properties"));
      // ★★★★★ 如果配置文件没配置，这里会返回一个空的 Properties，如果配置了，会把配置培成一个 Properties
      Properties settings = settingsAsProperties(root.evalNode("settings"));
      // 如果settings 里面有 vfsImpl
      loadCustomVfs(settings);
      // ★★★★★ 加载类别名
      typeAliasesElement(root.evalNode("typeAliases"));
      // ★★★★★ 加载插件
      pluginElement(root.evalNode("plugins"));
      // ★★★★★ 加载objectFactory
      objectFactoryElement(root.evalNode("objectFactory"));
      objectWrapperFactoryElement(root.evalNode("objectWrapperFactory"));
      reflectorFactoryElement(root.evalNode("reflectorFactory"));
      // ★★★★★ 把settings里面的配置，配置到 Configuration里面
      settingsElement(settings);
      // read it after objectFactory and objectWrapperFactory issue #631
      // ★★★★★ 加载environments节点
      environmentsElement(root.evalNode("environments"));
      databaseIdProviderElement(root.evalNode("databaseIdProvider"));
      typeHandlerElement(root.evalNode("typeHandlers"));
      mapperElement(root.evalNode("mappers"));
    } catch (Exception e) {
      throw new BuilderException("Error parsing SQL Mapper Configuration. Cause: " + e, e);
    }
  }
```