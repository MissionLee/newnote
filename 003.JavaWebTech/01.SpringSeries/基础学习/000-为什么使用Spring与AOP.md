#

## DEMO一个，就不写了

## AOP

- 普通的程序，会出现不同模块出现在同一个业务里面
  - 我们在每个功能模块里面，都要独立的实现各个组成模块

![](./res/001.png)

- AOP的情况下
  - 每个模块独立完成，然后再功能中串起来

![](./res/002.png)

AOP使得这些组件具有更高的内聚性以及更加关注与自身业务，完全不需要涉及其他系统服务，甚至你的核心业务根本不知道它们（日志模块，安全模块）的存在。

