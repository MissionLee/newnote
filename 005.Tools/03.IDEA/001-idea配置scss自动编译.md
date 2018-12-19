# IDEA配置SCSS自动编译

下载 windows 安装包 https://rubyinstaller.org/
- 安装过程很简单
- 我在win10 安装，可以自动添加到path
- ruby -v 可以测试是否安装成功
- 安装完成 gem install compass
  - compass -v 查看是否成功
  - 稍微看了一下安装过程的日志：我用的版本实际上已经帮助安装好了 sass的相关内容，下面的几个步骤的操作来自最初的攻略文章，⭐实际上我都没用到⭐
    - 安装 normalize
      - gen install compass-normalize
    - 安装sass
      - gem install sass
      - sass -v
- 在这之后还有要给附加步骤
  - 在我的scss文件中，字体中用到了 utf8 16进制的字体参数，程序默认识别的是 gbk
  - 在这个文件 C:\Program Files\Ruby25-x64\lib\ruby\gems\2.5.0\gems\sass-3.4.25\lib\sass\engine.rb
  - 在 require 之后 添加一行 Encoding.default_external = Encoding.find('utf-8') 可以解决

- 另外： 这个版本似乎对于那种 已经被引入其他模块，但是名称之前还没有添加_进行防编译的文件进行报错

- IDEA的操作
  - setting里面 plugin ，搜索 file watcher插件
  - 在file watcher插件里面选择添加 sass / scss 的监控
    - 我们用的是SCSS 
    - 然后如下配置
      - program : C:\Program Files\Ruby25-x64\bin\sass
      - arguments: $FileName$:$FileNameWithoutExtension$.css
      - output path to refresh: $FileNameWithoutExtension$.css:$FileNameWithoutExtension$.css.map
    - 打开一个scss文件，系统会弹出提示是否让watcher监控，允许即可