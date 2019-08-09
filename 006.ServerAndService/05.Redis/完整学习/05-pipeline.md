# Pipeline

Request/Response protocols and RTT

redis是一个基于client-server模式的TCPserver，一个请求通过下面几个步骤完成：

- 客户端发送请求给服务端，读取socket获取server反馈
- server处理命令，给客户端发送返回

两端通过网络连接，网络连接可能很快，也可能很慢。但是不管怎样都是有延迟的，将数据在两端之间传递需要时间。

这个时间被称为RTT `Round Trip Time`。实际工作中很影响redis性能表现

## Redis Pipelining

把一组命令放到一个pipeline里命令里面，用一个link发送