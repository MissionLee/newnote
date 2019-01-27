# vue-cli
> 尝试了一下从0开始用node webpack创建一个vue的项目，没有成功，折腾了挺长时间，每一套知识都需要一定的积累才能贯通，显然我不是那种能够很快掌握所有东西的天才，回想起来最早从0开始搭建大数据平台的时候，也是从安装jdk开始一步一步弄出来一个可运行的平台。但是这里就偷懒用vue-cli了，不想在这个地方花费太多精力

- 下载安装 node.js
  - node -v
  - v10.15.0
- npm  Node package manager  6.x版本之后内建在node中
  - 自行升级 npm install npm -g
  - 淘宝镜像 npm install -g cnpm --registry=https://registry.npm.taobao.org
    - 这样可以用 cnpm xxx 代替原本需要的所有的 npm命令
- 依赖
  - npm install 
    - webpack 基础工具
    - vue vue本体
    - vue-cli -g  全局的vue-cli
- vue cli 的使用
  - vue init webpack my-project 创建一个名为 my-project 的基于webpack的vue模板
  - 会有一大堆选项选项让选 可以全部回车
  - 项目名称别用大写
  - 初始化完成了，配置文件里面已经写入了依赖但是没有导入
    - npm install
    - npm run dev
      - npm 管理的是一个项目中的包，npm的命令会以 当前目录下的 package.json为参数
      - npm run执行scripts 里面的命令
        - 这是一个开发时使用的预览工具
        - webpack-dev-server --inline --progress --config build/webpack.dev.conf.js
        - 运行时候会提示：Your application is running here: http://localhost:8080
        - 浏览器可以看到默认运行的项目
    - npm run build
      - node build/build.js
      - node 执行build.js
        - 这是一个编译项目的js脚本
        - ⭐ 有空可以研究一下
- npm install 介绍
  - npm install moduleName 模块安装到目录下
    - 不写入两个依赖节点，运行npm install初始化项目的时候不会下载模块
  - npm install -g moduleName 安装到全局 
  - npm install -save modulename 安装到目录下，并在package文件里面dependencies里写入依赖
    - npm install的时候会下载， npm install --production的时候或者 NODE_DEV=production的时候，会下载到 node_module里面
  - npm intall -save-dev modulename 在 devDependencies里面写入依赖
    - 和上放的区别就是 -dev表示开发用，如果是生产情况就不会下载这个东西
    - 例如 gulp css js的压缩模块等等，项目部署后不需要，就放在dev就好
    - 项目运行需要的就 -save
- 项目引入 iview
  - npm i iview
  - 修改标准文件main.js
    ```js
        import iView from 'iview';
        import 'iview/dist/styles/iview.css';

        Vue.use(iView);
    ```
  - 再次 npm run build
    - 报错了，上面的三行后面都有 ; 提示这是多余的 分号，去掉就好了
  - 生成好的项目在target目录下，但是里面有一些问题
    - ⭐⭐⭐问题1：生成的html里面的文件引用都是绝对路径，但是项目不一定部署在根目录下
      - build目录下面 webpack.prod.conf.js
        - output里面添加一个参数
          - publicPath:'./'
      - 修改config目录下 index.js里面 assetPublicPath能达到一样的效果
      - 🔺🔺 我还没有碰到，但是实际上存在一个问题
        - 我们在css文件里面可能会写一些图片的路径
        - 如果我们有需要统一 放图片的位置，那么由两个方式处理
          - 第一：写路径的时候提前考虑到这个问题⭐这个才是正解
            - 因为必须明白一个问题，后面的改动是全局的，总会有影响的，当然最好的方式肯定还是用图片服务，文件服务提供图片
          - 第二：在 build/utils.js里面
            - generateLoader下面这个地方 
            ```js
                // Extract CSS when that option is specified
                // (which is the case during production build)
                if (options.extract) {
                  return ExtractTextPlugin.extract({
                    use: loaders,
                    fallback: 'vue-style-loader'
                  })
                } else {
                  return ['vue-style-loader'].concat(loaders)
                }
            ```
            - 添加publicPath 并且在这里做调整
            ```js
                // Extract CSS when that option is specified
                // (which is the case during production build)
                if (options.extract) {
                  return ExtractTextPlugin.extract({
                    use: loaders,
                    fallback: 'vue-style-loader',
                    publicPath:'../xxx'
                  })
                } else {
                  return ['vue-style-loader'].concat(loaders)
                }
            ```
    - ⭐问题2：这个不算问题，为了最小化文件，把引号都还说呢攻略了
      - webpack.prod.conf.js
        - removeAttribute属性控制的
- 引入 axios作为ajax控件（已经做了上面的内容，下面这种简单记录应该也能看懂了）
  - npm install axios --save-dev
  - import axios from 'axios'
  - Vue.prototype.$http=axios
  - 使用
  ```js
  methods: {
          get(){
            this.$http({
              method:'get',
              url:'/url',
              data:{}
            }).then(function(res){
              console.log(res)
            }).catch(function(err){
              console.log(err)
            })

            this.$http.get('/url').then(function(res){
              console.log(res)
            }).catch(function(err){
              console.log(err)
            })
          }     
    }    
  ```
  - https://www.kancloud.cn/yunye/axios/234845 axios的一个文档

  