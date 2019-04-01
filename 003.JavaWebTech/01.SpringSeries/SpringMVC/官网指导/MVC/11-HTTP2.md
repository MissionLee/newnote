HTTP/2
Same as in Spring WebFlux
Servlet 4 containers are required to support HTTP/2, and Spring Framework 5 is compatible with Servlet API 4. From a programming model perspective, there is nothing specific that applications need to do. However, there are considerations related to server configuration. For more details, see the HTTP/2 wiki page.
The Servlet API does expose one construct related to HTTP/2. You can use the javax.servlet.http.PushBuilder proactively push resources to clients, and it is supported as a method argument to @RequestMapping methods.