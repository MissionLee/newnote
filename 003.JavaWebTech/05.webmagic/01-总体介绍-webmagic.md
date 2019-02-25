https://github.com/MissionLee/webmagic

http://webmagic.io/docs/zh/posts/ch1-overview/thinking.html

## webmagic四个核心组件

- Downloader 下载
- PageProcessor 处理
- Scheduler 管理
- Pipeline 持久化

![](./res/webmagic.jpg)

### Downloader

负责下载页面，以便后续处理。默认使用 Apache HttpClient

### PageDownloader

负责解析页面，抽取有用信息，发现新链接。

WebMagic使用Jsoup作为HTML解析工具，并基于其开发了解析XPath的工具Xsoup。

⭐⭐ PageProcessor对于每个站点，每个页面都是不一样的，需要使用者定制。

### Scheduler

负责管理待抓取的URL，以及一些去重的工作。WebMagic默认提供JDK的内存队列来管理并用集合来进行去重。也支持使用Redis进行分布式管理。

除非项目有一些特殊的分布式需求，否则无需自己定制Scheduler。

### Pipeline

Pipeline负责抽取结果的处理，包括计算、持久化到文件、数据库等。WebMagic默认提供了“输出到控制台”和“保存到文件”两种结果处理方案。

Pipeline定义了结果保存的方式，如果你要保存到指定数据库，则需要编写对应的Pipeline。对于一类需求一般只需编写一个Pipeline。

## 用户数据流转的对象

### Request
Request是对URL地址的一层封装，一个Request对应一个URL地址。

它是PageProcessor与Downloader交互的载体，也是PageProcessor控制Downloader唯一方式。

除了URL本身外，它还包含一个Key-Value结构的字段extra。你可以在extra中保存一些特殊的属性，然后在其他地方读取，以完成不同的功能。例如附加上一个页面的一些信息等。

### Page
Page代表了从Downloader下载到的一个页面——可能是HTML，也可能是JSON或者其他文本格式的内容。

Page是WebMagic抽取过程的核心对象，它提供一些方法可供抽取、结果保存等。在第四章的例子中，我们会详细介绍它的使用。

### ResultItems
ResultItems相当于一个Map，它保存PageProcessor处理的结果，供Pipeline使用。它的API与Map很类似，值得注意的是它有一个字段skip，若设置为true，则不应被Pipeline处理。

## 控制爬虫运转的引擎--Spider

Spider是WebMagic内部流程的核心。Downloader、PageProcessor、Scheduler、Pipeline都是Spider的一个属性，这些属性是可以自由设置的，通过设置这个属性可以实现不同的功能。Spider也是WebMagic操作的入口，它封装了爬虫的创建、启动、停止、多线程等功能。下面是一个设置各个组件，并且设置多线程和启动的例子。详细的Spider设置请看第四章——爬虫的配置、启动和终止。
```java
public static void main(String[] args) {
    Spider.create(new GithubRepoPageProcessor())
            //从https://github.com/code4craft开始抓    
            .addUrl("https://github.com/code4craft")
            //设置Scheduler，使用Redis来管理URL队列
            .setScheduler(new RedisScheduler("localhost"))
            //设置Pipeline，将结果以json方式保存到文件
            .addPipeline(new JsonFilePipeline("D:\\data\\webmagic"))
            //开启5个线程同时执行
            .thread(5)
            //启动爬虫
            .run();
}
```
## 快速上手
上面介绍了很多组件，但是其实使用者需要关心的没有那么多，因为大部分模块WebMagic已经提供了默认实现。

一般来说，对于编写一个爬虫，PageProcessor是需要编写的部分，而Spider则是创建和控制爬虫的入口。在第四章中，我们会介绍如何通过定制PageProcessor来编写一个爬虫，并通过Spider来启动。