# ChromeDriver 处理法

## 第一步 需要准备chrome driver 和 selenium

```xml
 <dependency>
  <groupId>org.seleniumhq.selenium</groupId>
   <artifactId>selenium-java</artifactId>
  <version>3.141.59</version>
 </dependency>
```


- chrome driver 下载地址 ： http://npm.taobao.org/mirrors/chromedriver/


代码找到chrome diriver
- 把chrome driver 放到 C:\Windows\System32 里面
- System.setProperty("webdriver.chrome.driver",  "D:/some/path/chromedriver.exe");

## 看一下 webmagic作者的 selenium是真么实现的

```java
package us.codecraft.webmagic.downloader.selenium;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import us.codecraft.webmagic.Page;
import us.codecraft.webmagic.Request;
import us.codecraft.webmagic.Site;
import us.codecraft.webmagic.Task;
import us.codecraft.webmagic.downloader.Downloader;
import us.codecraft.webmagic.selector.Html;
import us.codecraft.webmagic.selector.PlainText;

import java.io.Closeable;
import java.io.IOException;
import java.util.Map;

/**
 * 使用Selenium调用浏览器进行渲染。目前仅支持chrome。<br>
 * 需要下载Selenium driver支持。<br>
 *
 * @author code4crafter@gmail.com <br>
 *         Date: 13-7-26 <br>
 *         Time: 下午1:37 <br>
 */
public class SeleniumDownloader implements Downloader, Closeable {

	private volatile WebDriverPool webDriverPool;

	private Logger logger = Logger.getLogger(getClass());

	private int sleepTime = 0;

	private int poolSize = 1;

	private static final String DRIVER_PHANTOMJS = "phantomjs";

	/**
	 * 新建
	 *
	 * @param chromeDriverPath chromeDriverPath
	 */
	public SeleniumDownloader(String chromeDriverPath) {
		System.getProperties().setProperty("webdriver.chrome.driver",
				chromeDriverPath);
	}

	/**
	 * Constructor without any filed. Construct PhantomJS browser
	 * 
	 * @author bob.li.0718@gmail.com
	 */
	public SeleniumDownloader() {
		// System.setProperty("phantomjs.binary.path",
		// "/Users/Bingo/Downloads/phantomjs-1.9.7-macosx/bin/phantomjs");
	}

	/**
	 * set sleep time to wait until load success
	 *
	 * @param sleepTime sleepTime
	 * @return this
	 */
	public SeleniumDownloader setSleepTime(int sleepTime) {
		this.sleepTime = sleepTime;
		return this;
	}

	@Override
	public Page download(Request request, Task task) {
		checkInit();
		WebDriver webDriver;
		try {
			webDriver = webDriverPool.get();
		} catch (InterruptedException e) {
			logger.warn("interrupted", e);
			return null;
		}
		logger.info("downloading page " + request.getUrl());
		webDriver.get(request.getUrl());
		try {
			Thread.sleep(sleepTime);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		WebDriver.Options manage = webDriver.manage();
		Site site = task.getSite();
		if (site.getCookies() != null) {
			for (Map.Entry<String, String> cookieEntry : site.getCookies()
					.entrySet()) {
				Cookie cookie = new Cookie(cookieEntry.getKey(),
						cookieEntry.getValue());
				manage.addCookie(cookie);
			}
		}

		/*
		 * TODO You can add mouse event or other processes
		 * 
		 * @author: bob.li.0718@gmail.com
		 */

		WebElement webElement = webDriver.findElement(By.xpath("/html"));
		String content = webElement.getAttribute("outerHTML");
		Page page = new Page();
		page.setRawText(content);
		page.setHtml(new Html(content, request.getUrl()));
		page.setUrl(new PlainText(request.getUrl()));
		page.setRequest(request);
		webDriverPool.returnToPool(webDriver);
		return page;
	}

	private void checkInit() {
		if (webDriverPool == null) {
			synchronized (this) {
				webDriverPool = new WebDriverPool(poolSize);
			}
		}
	}

	@Override
	public void setThread(int thread) {
		this.poolSize = thread;
	}

	@Override
	public void close() throws IOException {
		webDriverPool.closeAll();
	}
}

```

## 在作者提供内容的基础上，用selenium做一次操作

- 出现的问题
  - 作者在 WebDriverPool 里面写的 默认配置文件路径在我的机器上是没有的，但是git源码里面由作者写好的， pull的时候就有了，这里改一下路径
    - 	private static final String DEFAULT_CONFIG_FILE ="C:\\Users\\MissionLee\\IdeaProjects\\webmagic\\webmagic-samples\\src\\main\\resources\\config.ini";
    - 配置里面把 driver 改成 chrome ，其他不用修改什么内容
  - 要保证机器里面安装的chrome 和 chromedriver是同一个版本
  - 另有问题提示
    - java.lang.NoSuchMethodError: com.google.common.base.Preconditions.checkState(ZLjava/lang/String;Ljava/lang/Object;)V
    - 百度一下应该是jar包版本的问题
    - 🔺 未确认，但是应该是 selenium 的版本
    - 目前我在 webmagic sample的项目里面 可以复现这个错误
    - 在webmagic selenium test包里面没有这个错误
    - 应该是 selenium 版本的问题

```java
// 这是最终正常执行的代码
package us.codecraft.webmagic.samples;

import us.codecraft.webmagic.Page;
import us.codecraft.webmagic.Site;
import us.codecraft.webmagic.Spider;
import us.codecraft.webmagic.downloader.selenium.SeleniumDownloader;
import us.codecraft.webmagic.pipeline.FilePipeline;
import us.codecraft.webmagic.processor.PageProcessor;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

/**
 * 花瓣网抽取器。<br>
 * 使用Selenium做页面动态渲染。<br>
 * @author code4crafter@gmail.com <br>
 * Date: 13-7-26 <br>
 * Time: 下午4:08 <br>
 */
public class HuabanProcessor implements PageProcessor {

    private Site site;
    public static void download(String urlStr,String filename,String savePath) throws IOException {

        URL url = new URL(urlStr);
        //打开url连接  可以用普通的URLConnection,但是根据后台的不同，有些后台回对普通的URLConnection返回500错误
        //            更保险的形式，我们把Connection换成HttpURLConnection，因为浏览器使用这种方式来创建链接
        //            “GET/POST” 的设置是否恰当会从 405错误看出来
        HttpURLConnection connection = (HttpURLConnection)url.openConnection();
        //请求超时时间
        connection.setConnectTimeout(50000);
        connection.setRequestMethod("GET");
        connection.setRequestProperty("accept","text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
        connection.setRequestProperty("accept-encoding","gzip, deflate, br");
        connection.setRequestProperty("accept-language","zh-CN,zh;q=0.9");
        connection.setRequestProperty("cache-control","no-cache");
        connection.setRequestProperty("pragma","no-cache");
        connection.setRequestProperty("upgrade-insecure-requests","1");
        connection.setRequestProperty("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.119 Safari/537.36");

        System.out.println(connection.getRequestMethod());

        //输入流
        InputStream in = connection.getInputStream();
        //缓冲数据
        byte [] bytes = new byte[1024];
        //数据长度
        int len;
        //文件
        File file = new File(savePath);
        if(!file.exists())
            file.mkdirs();

        OutputStream out  = new FileOutputStream(file.getPath()+"\\"+filename);
        //先读到bytes中
        while ((len=in.read(bytes))!=-1){
            //再从bytes中写入文件
            out.write(bytes,0,len);
        }
        //关闭IO
        out.close();
        in.close();

    }
    @Override
    public void process(Page page) {
        List<String> list =page.getHtml()
                .$(".wfc")
                .$(".layer-view")
                .$("img","src").all();
        for (String st: list
             ) {
            try {
//                System.out.println(st.substring(19,st.length()-6));
                System.out.println("download");
                download("http:"+st.substring(0,st.length()-6),st.substring(19,st.length()-6)+".jpg","C:\\Users\\MissionLee\\Desktop\\表格");
                Thread.sleep(5000L);
            } catch (Exception e) {
                e.printStackTrace();
            }

        }
//        page.addTargetRequests(page.getHtml().links().regex("http://huaban\\.com/.*").all());
//        if (page.getUrl().toString().contains("pins")) {
//            page.putField("img", page.getHtml().xpath("//div[@class='image-holder']/a/img/@src").toString());
//        } else {
//            page.getResultItems().setSkip(true);
//        }
    }

    @Override
    public Site getSite() {
        if (null == site) {
            site = Site.me().setDomain("huaban.com").setSleepTime(0);
        }
        return site;
    }

    public static void main(String[] args) {
        Spider.create(new HuabanProcessor()).thread(5)
                .setDownloader(new SeleniumDownloader("C:\\\\Windows\\\\System32\\\\chromedriver.exe"))
                .addUrl("http://huaban.com/favorite/anime/")
                .runAsync();
    }
}

```