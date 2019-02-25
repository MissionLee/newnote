# 动态

一般的爬虫都是直接使用http协议，下载指定url的html内容，并对内容进行分析和抽取。在我写的爬虫框架webmagic里也使用了HttpClient来完成这样的任务。

但是有些页面是通过js以及ajax动态加载的，例如：花瓣网。这时如果我们直接分析原始页面的html，是得不到有效的信息的。当然，因为无论怎样动态加载，基础信息总归是包含在初始页面中得，所以我们可以用爬虫代码来模拟js代码，js读取页面元素值，我们也读取页面元素值;js发送ajax，我们就拼凑参数、发送ajax并解析返回的json。这样总归是能做的，但是比较麻烦，有没有比较省力的方法呢？比较好的方法大概是内嵌一个浏览器了。

Selenium是一个模拟浏览器，进行自动化测试的工具，它提供一组API可以与真实的浏览器内核交互。Selenium是跨语言的，有Java、C#、python等版本，并且支持多种浏览器，chrome、firefox以及IE都支持。

在Java项目中使用Selenium，需要做两件事：

在项目中引入Selenium的Java模块，以Maven为例：
```xml
  <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>2.33.0</version>
  </dependency>
  ```
下载对应的driver，以chrome为例：http://code.google.com/p/chromedriver/downloads/list

下载后，需要将driver的位置写到Java的环境变量里，例如我在mac下将其下载到了/Users/yihua/Downloads/chromedriver，则需要在程序里添加以下代码(当然在JVM参数里写-Dxxx=xxx也是可以的)：

```java
System.getProperties().setProperty("webdriver.chrome.driver","/Users/yihua/Downloads/chromedriver");
```
Selenium的API挺简单的，核心是WebDriver，下面是动态渲染页面，并获取最终html的代码：

```java
	 @Test
    public void testSelenium() {
        System.getProperties().setProperty("webdriver.chrome.driver", "/Users/yihua/Downloads/chromedriver");
        WebDriver webDriver = new ChromeDriver();
        webDriver.get("http://huaban.com/");
        WebElement webElement = webDriver.findElement(By.xpath("/html"));
        System.out.println(webElement.getAttribute("outerHTML"));
        webDriver.close();
    }
```
值得注意的是，每次new ChromeDriver()，Selenium都会建立一个Chrome进程，并使用一个随机端口在Java中与chrome进程进行通信来交互。由此可见有两个问题：

因此如果直接关闭Java程序，Chrome进程可能是无法关闭的。这里需要显示的调用webDriver.close()来关闭进程。

创建进程的开销还是比较大的，尽量对webDriver进行复用会比较好。可惜根据官方的文档，webDriver不是线程安全的，所以我们需要建立一个webDriver池来保存它们。不清楚Selenium是否有这样的接口，反正我是自己写了一个WebDriverPool来完成这个任务。

我已经将Selenium整合到了我的爬虫框架webmagic中，目前还是试用版本，有兴趣的可以一起学习交流。

最后说说效率问题。嵌入浏览器之后，不但要多花CPU去渲染页面，还要下载页面附加的资源。似乎单个webDriver中的静态资源是有缓存的，初始化之后，访问速度会加快。我试用ChromeDriver加载了100次花瓣的首页(http://huaban.com/)，共耗时263秒，平均每个页面2.6秒。

为了测试效果，我写了一个花瓣抽取器，抽取花瓣网的分享图片url，用了咱自己的webmagic框架，集成了Selenium。

```java
    /**
 * 花瓣网抽取器。<br>
 * 使用Selenium做页面动态渲染。<br>
 */
public class HuabanProcessor implements PageProcessor {

    private Site site;

    @Override
    public void process(Page page) {
        page.addTargetRequests(page.getHtml().links().regex("http://huaban\\.com/.*").all());
        if (page.getUrl().toString().contains("pins")) {
            page.putField("img", page.getHtml().xpath("//div[@id='pin_img']/img/@src").toString());
        } else {
            page.getResultItems().setSkip(true);
        }
    }

    @Override
    public Site getSite() {
        if (site == null) {
            site = Site.me().setDomain("huaban.com").addStartUrl("http://huaban.com/").setSleepTime(1000);
        }
        return site;
    }

    public static void main(String[] args) {
        Spider.create(new HuabanProcessor()).thread(5)
                .scheduler(new RedisScheduler("localhost"))
                .pipeline(new FilePipeline("/data/webmagic/test/"))
                .downloader(new SeleniumDownloader("/Users/yihua/Downloads/chromedriver"))
                .run();
    }
}
```
sample地址：HuabanProcessor.java

