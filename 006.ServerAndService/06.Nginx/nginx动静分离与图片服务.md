# 使用nginx实现动静分离与web服务
```conf
http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    server {
        listen       80;
        # nginx 监听的端口

        server_name  localhost;


        #access_log  logs/host.access.log  main;

        # ！！！ 图片服务 ！！！！ 
        # 这样前端在引用   /img/xxx.jpg 这个图片的时候，回去寻找 D:/img/xxx.jpg
        # 这里需要注意 /img/ 后面是有一个 / 的，所以下面的
        # alias 最后也要加个 /
        location /img/ {
            alias D:/img/;
            autoindex on;
        } 
        # !!!! 静态资源 ！！！！
        # 前端寻找 下面三种静态文件的时候，会造 html目录下寻找 html是个相对路径，相对于nginx所在目录，也可以指向其他目录
        location ~ .*.(html|css|js)$ {
            root html;
        }

        # ！！！ 动态资源 ！！！
        # 通配所有 请求，并把请求转交给 localtom -> 在下面配置具体的服务器得知，可以配置数个
        location / {
            root   html;
            index  index-color.html index.html index.htm;
            proxy_pass http://localtom;
        }

        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
    }


    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}
    upstream localtom {
        server 127.0.0.1:8080;
    }
}
```