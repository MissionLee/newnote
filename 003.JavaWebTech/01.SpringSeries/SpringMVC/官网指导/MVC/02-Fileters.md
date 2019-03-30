# Filters

spring-web模块提供这些 filters
- FormData
- Forwarded Heanders
- Shallow ETag
- CORS

## Form Data

浏览器只能提交 GET/SET请求，但是一些非浏览器客户端可以提交：PUT/PATCH/DELETE。

Servlet API 要求 ServletRequest.getParameter*() 方法 to support form field access only for HTTP POST.

spring-web模块提供 FormContentFilter拦截content type 为application/x-www-form-urlencoded的 HTTP PUT/PATCH/DELETE请求，把ServletRequest包装起来，好让 ServletRequset.getParameter*()系列方法可以只用

## Forwarded Headers

如果请求时通过代理发过来的，host port 和 scheme 可能改变了，这导致识别真正的信息变得有挑战性

RFC 7239 defines the Forwarded HTTP header that proxies can use to provide information about the original request. There are other non-standard headers, too, including X-Forwarded-Host, X-Forwarded-Port, X-Forwarded-Proto, X-Forwarded-Ssl, and X-Forwarded-Prefix.

ForwardedHeaderFilter is a Servlet filter that modifies the host, port, and scheme of the request, based on Forwarded headers, and then removes those headers.

There are security considerations for forwarded headers since an application cannot know if the headers were added by a proxy, as intended, or by a malicious client. This is why a proxy at the boundary of trust should be configured to remove untrusted Forwarded headers that come from the outside. You can also configure the ForwardedHeaderFilter with removeOnly=true, in which case it removes but does not use the headers.

## Shallow ETag
The ShallowEtagHeaderFilter filter creates a “shallow” ETag by caching the content written to the response and computing an MD5 hash from it. The next time a client sends, it does the same, but it also compares the computed value against the If-None-Match request header and, if the two are equal, returns a 304 (NOT_MODIFIED).

This strategy saves network bandwidth but not CPU, as the full response must be computed for each request. Other strategies at the controller level, described earlier, can avoid the computation. See HTTP Caching.

This filter has a writeWeakETag parameter that configures the filter to write weak ETags similar to the following: W/"02a2d595e6ed9a0b24f027f2b63b134d6" (as defined in RFC 7232 Section 2.3).

## CORS
Same as in Spring WebFlux

Spring MVC provides fine-grained support for CORS configuration through annotations on controllers. However, when used with Spring Security, we advise relying on the built-in CorsFilter that must be ordered ahead of Spring Security’s chain of filters.

See the sections on CORS and the CORS Filter for more details.