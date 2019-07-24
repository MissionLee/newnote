# 搞笑笔记

自己前段时间弄得爬某S站的爬虫已经弄到了过T量级的资源了，这几天想到之前看过一个，通过nginx反向代理pixiv的攻略文章，突然来了兴趣，决定尝试一下。

- 原文地址： https://2heng.xin/2017/09/19/pixiv/
- 原文说面向小白，然后放了一个原理的链接 https://digi.ninja/blog/domain_fronting.php

## 原理部分文章的翻译笔记（原文是英文的）

“域前置” Domain fronting 这个概念已经存在很久，我明白这个概念，但是并不真正了解其工作原理。 直到和Chris Truncer共事的时候，我们把它作为“红队测试”的一部分。这让我必须理解其本质的工作原理。幸运的是，Chris是个好老师，当这个概念被分解后，也很容易立即。

在解释 fronting 之前，我们来看一下我们如何获取一个 网页

- 首先发送一个请求
  - 输入一个地址到浏览器： 地址包含 hostname ， port
  - 操作系统 通过dns照这个 hostname
  - 两个系统（终端和服务器） 通过 TCP/IP 链接

这样，我们获取了一个 网络拦截，应用层开始工作， 发送HTTP请求，一个web server 对一个IP 只能支撑一个网站，因为它无法得知请求site对应的hostname是什么。

HTTP/1.1 新增了一个概念： header里面的 “Host”，这就允许一个server可以通过引入 virtual host 支撑数个网站——“named virtual hosts”。

服务器检查 host name 和自己所拥有的virtual hosts，从而得知要给谁提供服务。如果找不到某个具体的，就提供“默认”的。

```note
GET / HTTP/1.1
Host: digi.ninja
```

通常浏览器发起一个请求，URL里面的hostname应该和 host header里面的 hostname匹配，但是这不是强制的。

我们可以通过curl演示这一点，访问 bing.com但是host里面写 google.com. 因为Bing 没有一个叫做 google.com的 virtual host，所以这个请求会返回error

```note
$ curl -H "Host: google.com" bing.com
<h2>Our services aren't available right now</h2><p>We're working to restore all services as soon as possible. Please check back soon.</p>06XZVXAAAAAD6lfm8665lRL+M0r8EuYmDTFRTRURHRTA1MTMARWRnZQ==
```
我们也可以尝试 Australian Google + UK Google

```note
$ curl -H "host: www.google.com.au" www.google.co.uk
<!doctype html><html itemscope="" itemtype="http://schema.org/WebPage" lang="en-GB"><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"><meta content="/images/branding/googleg/1x/googleg_standard_color_128dp.png" itemprop="image"><title>Google</title>...
```

这个请求就可以正常工作。

现在我们了解了基础概念，让我们试试如何将其应用到 domain fronting

当一个site被部署到 Content Delivery Network (CDN)， 例如 亚马逊云，微软Azure CDN，谷歌云CDN等等。此时我们会为site的域（domain）设置一个 CNAME，只想 CDN服务器，一个类似于 named vhost的东西，也会被配置到 CDN web server上，从而可以对请求给出响应： 把某个域的请求，交给对应的服务器，让其获得真正的返回内容。

就像前面演示的，请求的hostname 不一定要和 网站请求的匹配，因此我们可以 访问 CDN 的hostname，但是 host header里面写别的。

那么“认证”怎么办呢，不匹配的hostname 与 host hader需要给出警告吗，这会造成数据泄露嘛，答案是： no。

回到这篇文章的开头，设置的第一件事就是网络连接，这就是TLS的用武之地。一旦TCP连接建立，TLS协商就会开始，并且全部基于用于启动的主机名 在连接中，主机头是在应用层流量中，并且在建立所有较低层之前不会查看。 我们可以通过回到Google / Bing示例并通过HTTPS发出请求来向我们展示这一点，同时向curl询问有关连接的更多信息。

```note
$ curl -v -H "Host: google.com" https://bing.com
* Rebuilt URL to: https://bing.com/
*   Trying 13.107.21.200...
* TCP_NODELAY set
* Connected to bing.com (13.107.21.200) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* successfully set certificate verify locations:
*   CAfile: /etc/ssl/certs/ca-certificates.crt
  CApath: /etc/ssl/certs
  * TLSv1.2 (OUT), TLS handshake, Client hello (1):
  * TLSv1.2 (IN), TLS handshake, Server hello (2):
  * TLSv1.2 (IN), TLS handshake, Certificate (11):
  * TLSv1.2 (IN), TLS handshake, Server key exchange (12):
  * TLSv1.2 (IN), TLS handshake, Server finished (14):
  * TLSv1.2 (OUT), TLS handshake, Client key exchange (16):
  * TLSv1.2 (OUT), TLS change cipher, Client hello (1):
  * TLSv1.2 (OUT), TLS handshake, Finished (20):
  * TLSv1.2 (IN), TLS handshake, Finished (20):
  * SSL connection using TLSv1.2 / ECDHE-RSA-AES128-GCM-SHA256
  * ALPN, server accepted to use h2
  * Server certificate:
  *  subject: CN=www.bing.com
  *  start date: Jul 20 17:47:08 2017 GMT
  *  expire date: Jul 10 17:47:08 2019 GMT
  *  subjectAltName: host "bing.com" matched cert's "bing.com"
  *  issuer: C=US; ST=Washington; L=Redmond; O=Microsoft Corporation; OU=Microsoft IT; CN=Microsoft IT TLS CA 5
  *  SSL certificate verify ok.
  * Using HTTP2, server supports multi-use
  * Connection state changed (HTTP/2 confirmed)
  * Copying HTTP/2 data in stream buffer to connection buffer after upgrade: len=0
  * Using Stream ID: 1 (easy handle 0x559a18d7f900)
  > GET / HTTP/2
  > Host: google.com
  > User-Agent: curl/7.58.0
  > Accept: */*
  > 
  * Connection state changed (MAX_CONCURRENT_STREAMS updated)!
  < HTTP/2 400 
  < x-msedge-ref: 0OPdbXAAAAACPvltTXmg8T6Ynwb1og0T8TE9OMDRFREdFMDQyMABFZGdl
  < date: Thu, 07 Feb 2019 09:15:35 GMT
  < 
  * Connection #0 to host bing.com left intact
  <h2>Our services aren't available right now</h2><p>We're working to restore all services as soon as possible. Please check back soon.</p>0OPdbXAAAAACPvltTXmg8T6Ynwb1og0T8TE9OMDRFREdFMDQyMABFZGdl
  ```

内容很多，最重要的是这两行
- subject: CN=www.bing.com
- subjectAltName: host "bing.com" matched cert's "bing.com"

这表明正在使用Bing的证书协商TLS连接，没有警告，因为证书有效，并且在HTTP请求中发送主机头之前没有提及Google。

与Chris一起，我们用前置域获取HTTPS命令：将其托管给另一个公司，那家公司使用网络分发方案，通过hostname决定向谁发送request。他们没有剥离SSL，这使得他们有能力确认HTTP traffic 并能够通过 host header做出判断。我们选了Cloudfront上一个声誉不错的公司，希望通过他们来绕过 filter。我们把自己的 Control channel 站点配置在 cloudfront上，并指向我们自己的服务器。 客户访问“好的hostname”，但是header里转向“不好的”（指的是被‘墙’屏蔽）的地址。

在这个例子中，我介绍了 隐藏 c2 traffic，当时这个技术也可以用于绕过审查或者其他类似的情况。绕过审查和这里讨论的通过fronted让站点看起来是一个被信任站点一样，这和使用浏览器插件，或者本地网络代理替换host header也一样。

如果你正在管理一个使用CDN访问的域，我如何才能防止自己的良好商誉被像这样滥用呢，回答是：目前为止，没有办法。漏洞本身来自于HTTP的工作机制，网络层与应用层是分离的。当你与其他站点公用一个host的时候，一旦建立了网络链接，其他所有站点也都可以访问了。一旦CDN看到 host header，所有的 traffic都会被路由到“bad”站点，你甚至连日志记录都看不到。你可以看到的唯一的东西是DNS日志，并尝试计算网站流量的请求，如果你看到很多请求但没有多少流量，那么奇怪的事情可能会发生。 但实际上，由于缓存以及尝试匹配两组日志所需的努力，这不会起作用。

这篇文章可以告诉你如何配置 front domain  https://digi.ninja/blog/cloudfront_example.php

- 参考
  - Domain Fronting with CloudFront https://digi.ninja/blog/cloudfront_example.php
  - Domain Fronting with Cloudflare https://digi.ninja/blog/cloudflare_example.php
  - Using HTTP Pipelining to hide requests https://digi.ninja/blog/pipelining.php