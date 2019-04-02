## Introduction to WebSocket

WebSocket协议, RFC 6455, 规定了一种用于客户端与服务端双向通讯的标准，基于一个TCP丽娜姐. 它和HTTP协议不同，但是基于HTTP, 使用ports 80 and 443 并且重用现有的firewall规则.

A WebSocket 通讯通过一个 HTTP request 发起，使用upgrade HTTP header. The following example shows such an interaction:
```bash
GET /spring-websocket-portfolio/portfolio HTTP/1.1
Host: localhost:8080
Upgrade: websocket  ## The Upgrade header.
Connection: Upgrade  ## Using the Upgrade connection.
Sec-WebSocket-Key: Uc9l9TMkWGbHFD2qnFHltg==
Sec-WebSocket-Protocol: v10.stomp, v11.stomp
Sec-WebSocket-Version: 13
Origin: http://localhost:8080
```

通常服务端会返回200，但是WebSocket会这样返回
```bash
HTTP/1.1 101 Switching Protocols  ## Protocol switch
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: 1qVdfYHU9hPOl4JYYNXF623Gzn0=
Sec-WebSocket-Protocol: v10.stomp
```

握手成功后，HTTP 升级请求 底层的TCP socket保持链接开启状态.
具体WebSocket如何保持连接的，参照 See RFC 6455, the WebSocket chapter of HTML5, or any of the many introductions and tutorials on the Web.

注意：WebSocket server是运行在一个web server后的 (e.g. nginx),你需要配置你的web server 让它能过够把 WebSocket upgrade request提给WebScoket server. 如果是云服务的话，需要确认云服务提供商支持WebSocket

## HTTP Versus WebSocket

Even though WebSocket is designed to be HTTP-compatible and starts with an HTTP request, it is important to understand that the two protocols lead to very different architectures and application programming models.

In HTTP and REST, an application is modeled as many URLs. To interact with the application, clients access those URLs, request-response style. Servers route requests to the appropriate handler based on the HTTP URL, method, and headers.
By contrast, in WebSockets, there is usually only one URL for the initial connect. Subsequently, all application messages flow on that same TCP connection. This points to an entirely different asynchronous, event-driven, messaging architecture.
WebSocket is also a low-level transport protocol, which, unlike HTTP, does not prescribe any semantics to the content of messages. That means that there is no way to route or process a message unless the client and the server agree on message semantics.
WebSocket clients and servers can negotiate the use of a higher-level, messaging protocol (for example, STOMP), through the Sec-WebSocket-Protocol header on the HTTP handshake request. In the absence of that, they need to come up with their own conventions.

## When to Use WebSockets

WebSockets can make a web page be dynamic and interactive. However, in many cases, a combination of Ajax and HTTP streaming or long polling can provide a simple and effective solution.

For example, news, mail, and social feeds need to update dynamically, but it may be perfectly okay to do so every few minutes. Collaboration, games, and financial apps, on the other hand, need to be much closer to real-time.

Latency alone is not a deciding factor. If the volume of messages is relatively low (for example, monitoring network failures) HTTP streaming or polling can provide an effective solution. It is the combination of low latency, high frequency, and high volume that make the best case for the use of WebSocket.

Keep in mind also that over the Internet, restrictive proxies that are outside of your control may preclude WebSocket interactions, either because they are not configured to pass on the Upgrade header or because they close long-lived connections that appear idle. This means that the use of WebSocket for internal applications within the firewall is a more straightforward decision than it is for public facing applications.