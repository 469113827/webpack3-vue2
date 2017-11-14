官方定义webpack：一个现代JavaScript应用程序的模块打包工具。
我的定义webpack：当下最主流的前端构建工具之一，简单来说，webpack就是把所有的资源都当成模块，再利用不同的模块处理方式进行处理后生成我们所需要的文件。
webpack核心概念：entry(入口)，output(出口),loader(模块处理器),plugins(插件)
下面通过实战项目来对这些概念进行理解。
创建一个文件夹存放项目。

    mkdir webpack-vue
### 1.0 安装webpack

    // 全局安装webpack
    npm install -g webpack
    // 在项目里初始化项目
    npm init
    // 在项目里安装webpack,用的cnpm，速度比较快
    cnpm install --save-dev webpack
### 2.0 创建目录结构（一个合理的目录结构，有助于项目的管理）

    ├── README.md
    ├── build
    │   ├── entry.js                       // 获取所有的入口路径
    │   ├── output.js                      // 输出
    │   ├── plugins.js                     // 配置插件
    ├── src                                // 源码
    |   ├── component                      // 存放vue公用组件库
    |   ├── images                         // 源码图片
    |   ├── less                           
    |       ├── reset.less                 // 公用less文件
    |       ├── pageA.less                 // 页面A的less文件
    |       ├── pageB.less                 // 页面B的less文件
    |   ├── view                           // 存放vue页面
    |       ├── pageA.vue                  // 页面A的vue文件
    |       ├── pageB.vue                  // 页面B的vue文件
    |   ├── js                            
    |       ├── commom                     // 共有JS代码存放
    |       ├── pageA.js                   // 页面A的js文件
    |       ├── pageB.js                   // 页面B的js文件
    |   ├── template.html                  // 模板html
    ├── node_modules                       // 安装包存放(自动生成)
    ├── package.json                       // 包信息管理文件
    ├── webpack.config.js                  // webpack配置文件   
这样，一个简单的项目的目录结构就完成了。接下来就可以安心配置webpack了
### 3.0 配置webpack
首先我们得明确有哪些资源需要被webpack打包处理，通过目录结构可以很清晰的看出src的资源都需要被打包。
    
    // 引入路径操作，webpack，文件匹配工具
    const path = require('path');
    const webpack = require('webpack'); 
    const glob = require('glob');
    
    // 以JS为整个项目得着眼点(一个js为一个页面)
    const entries = glob.sync(
        '**/*.js',
        {
            // 匹配src/js下的所有JS
            cwd: path.join(__dirname, 'src', 'js'),
            // 排除非私有化的js文件
            ignore: ['commom/*.js']
        }
    ); 
这时候获取到的JS文件则是代表每个页面的js文件。
接下来我们需要通过JS文件，去生成每个页面需要的HTML。且路径要跟JS保持一致，保证目录一一映射。

    // 引入模板插件，引入一般写入顶部，为了方便大家理解，所以写在这里了
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    // 生成符合webpack规则的entries
    const webpackEntries = {};
    // 保证一个页面一个HTML
    const htmlWebpackPluginArr = [];
    // 定义一个去除文件后缀名的方法
    const removeExtension = function (filename) {
        return filename.substr(0, filename.lastIndexOf('.') || filename);
    };
    // 遍历所有匹配的js页面
    entries.forEach(
        (value) => {
            // 去除后缀，利于匹配和生成文件
            const resourcePath = removeExtension(value);
    
            // 资源入数组
            webpackEntries[resourcePath] = ['./' + path.join('src', 'js', value)];
    
            htmlWebpackPluginArr.push(
                new HtmlWebpackPlugin({
                    // 一次只能生成一个 html 文件...
                    filename: path.join('template', `${resourcePath}.html`),
                    // 获取模板文件
                    template: path.resolve(__dirname, 'src', `template.html`),
                    // 每个html引入自己私有的资源文件
                    // 如果不配置会把entry所有文件都引入
                    // inject默认true，如果false会所有资源文件都不引入
                    chunks: [`${resourcePath}`]
                })
            )
        }
    )
    
由上代码，我们已经可以获取entry需要的资源webpackEntries，webpackEntries结构为![](https://user-gold-cdn.xitu.io/2017/10/31/bce8388b8afe93583efcc1891d36bfc4)
然后通过html-webpack-plugin去获取HTML模板文件，匹配JS文件名生成相对应的HTML文件，并在HTML里注入相对应的资源文件了。
搞定了entry，接下来就是output:

    output: {
        // 输出目录，没有则新建
        path: path.resolve(__dirname, './dist'),

        // 静态资源路径
        publicPath: '/activity/dist/',

        // 文件名
        filename: `js/[name].js?ver=[hash:6]`,
    },
output为我们需要处理的文件的输出地，一般统一放在一级目录下的dist文件里。[name]为entry的key值, [hash]为哈希值，用于版本号的使用。
我们搞定了需要webpack为我们处理的文件已经输出的地方，接下来我们需要告诉webpack怎么处理这些文件，这时候就要用的loader了。
    
      module: {
        rules: [
            // 用来解析vue后缀的文件
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            // 用babel来解析js文件并把es6的语法转换成浏览器认识的语法
            {
                test: /\.js$/,
                loader: 'babel-loader',
                // 排除模块安装目录的文件(可删除)
                exclude: /node_modules/
            },
            // 用来解析less或css后缀的文件
            {
                test: /\.(less|css)$/,
                use: extractLESS.extract(
                    {
                        fallback: 'style-loader',
                        use: [
                            'css-loader',
                            'postcss-loader',
                            'less-loader'
                        ]
                    }
                ),
            },
            // 处理资源里的图片(也可以用url-loader对图片进行base64转换)
            {
                test: /\.(jpe?g|png|gif|mp4|ttc|otf|ttf|woff)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'images/[name].[ext]',
                        }
                    }

                ]
            },
        ]
    },

loader很容易理解，就是告诉webpack，要用什么方法去处理我们的模块。
这里用了个postcss，是一个使用JavaScript插件来转换CSS的工具。以自动补充兼容前缀为例。
新建一个postcss.config.js专门放置postcss参数，引入autoprefixer，并配置兼容要求。

    plugins: [
             require('autoprefixer')(
                {browsers:'ios >= 8'}
             ),
         ]
         
这里还用了个css文件单独打包的插件extract-text-webpack-plugin。
刚我们一共使用了2个插件，需要在module里添加:
    
     plugins: [
        ...htmlWebpackPluginArr,
        extractLESS
    ]
    
到这，一个简单webpack已经成型了。有entry, output, loader,plugins。
可以试着在终端输入webpack, 会生成我们处理过后的文件夹./dist。

接下来，利用webpack-dev-server简单的做一个server吧。
其实我们只需要在终端输入webpack-dev-server, webpack就会帮我们打开一个server了,
但是我们肯定还希望可以有一些自己的的设置。
    
    devServer: {
            port: 8080,      // 设置端口号
            inline: false,   // 是否启动无刷新url进行页面更新
            hot: true,       // 只刷新改变的部分
        }
更多server的参数配置，可以参考webpack官网。
此时再输入webpack-dev-server，我们会发现我们配置的都生效了。
Ps: webpack-dev-server生成的代码并不会在我们的项目里，而是生成在内存里。

为了我们不需要每次都输入这些指令，我们可以在package.json的scripts里去设置指令。
    
    "scripts": {
        "dev": "webpack-dev-server --progress",
        "build": "webpack --progress"
      },
      
这样输入npm run dev就可以开启本地服务，输入npm run build就可以构建资源了。