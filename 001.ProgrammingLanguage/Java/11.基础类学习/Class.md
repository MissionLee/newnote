# Class.java

## getResource / getResourceAsStream
```java
    public java.net.URL getResource(String name) {
        name = resolveName(name);
        ClassLoader cl = getClassLoader0();
        if (cl==null) {
            // A system class.
            return ClassLoader.getSystemResource(name);
        }
        return cl.getResource(name);
    }
    /**
     * Add a package name prefix if the name is not absolute Remove leading "/"
     * if name is absolute
     */
    private String resolveName(String name) {
        if (name == null) {
            return name;
        }
        if (!name.startsWith("/")) {
            Class<?> c = this;
            while (c.isArray()) {
                c = c.getComponentType();
            }
            String baseName = c.getName();
            int index = baseName.lastIndexOf('.');
            if (index != -1) {
                name = baseName.substring(0, index).replace('.', '/')
                    +"/"+name;
            }
        } else {
            name = name.substring(1);
        }
        return name;
    }

```
- 从 resolveName 
  - 如果给的是绝对路径  /xxx 那么不做处理
  - 如果给的其他的路径 那么就用当前 package-prefix + “/” + name

如下测试
```java
        // a.txt 在当前目录下
        System.out.println(TestClassGetResource.class.getResource("a.txt")); // OK
        System.out.println(TestClassGetResource.class.getResource("/a.txt"));
        System.out.println(TestClassGetResource.class.getResource("./a.txt"));// OK 相对路径 且被视为相对路径
        System.out.println(TestClassGetResource.class.getResource("pers/missionlee/test/a.txt")); // 被视为相对路径，加上前缀，所以路径错了
        System.out.println(TestClassGetResource.class.getResource("/pers/missionlee/test/a.txt"));// OK 绝对路径不做处理
        System.out.println("----------------------------");
        // b.txt 在根目录下
        System.out.println(TestClassGetResource.class.getResource("b.txt"));
        System.out.println(TestClassGetResource.class.getResource("/b.txt")); // OK 文件在跟目录下，可以正常找到
        System.out.println(TestClassGetResource.class.getResource("./b.txt"));
```

> 注意： 很多项目都是使用 maven的，maven默认打包位置是 resource文件夹，类目录里面的文件得配置以下

> 这里 class 的 getResource最底层的是在 sun.misc里面实现的，这部分

> 这个方法返回的是java.net.URL 打印的是 toString结果