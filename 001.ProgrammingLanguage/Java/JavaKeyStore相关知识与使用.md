# KeyStore

介绍部分 https://blog.csdn.net/zlh313_01/article/details/82424664

Keytool是一个Java数据证书的管理工具 ,Keytool将密钥（key）和证书（certificates）存在一个称为keystore的文件中。 

在keystore里，包含两种数据： 
- 1. 密钥实体（Key entity）——密钥（secret key）又或者是私钥和配对公钥（采用非对称加密） 
- 2. 可信任的证书实体（trusted certificate entries）——只包含公钥

ailas(别名)每个keystore都关联这一个独一无二的alias，这个alias通常不区分大小写


## powershell 输入 keytool 提示的内容
密钥和证书管理工具

命令:

 -certreq            生成证书请求
 -changealias        更改条目的别名
 -delete             删除条目
 -exportcert         导出证书
 -genkeypair         生成密钥对
 -genseckey          生成密钥
 -gencert            根据证书请求生成证书
 -importcert         导入证书或证书链
 -importpass         导入口令
 -importkeystore     从其他密钥库导入一个或所有条目
 -keypasswd          更改条目的密钥口令
 -list               列出密钥库中的条目
 -printcert          打印证书内容
 -printcertreq       打印证书请求的内容
 -printcrl           打印 CRL 文件的内容
 -storepasswd        更改密钥库的存储口令


 我在尝试写 pixiv的爬虫的时候，使用了这部分内容，这里做一下