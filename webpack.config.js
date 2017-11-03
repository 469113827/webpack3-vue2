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

console.log(webpackEntries)

//
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 样式独立打包
const extractLESS = new ExtractTextPlugin(`css/[name].style.css?ver=[hash]`);
module.exports = {
    entry: webpackEntries,
    output: {
        // 输出目录，没有则新建
        path: path.resolve(__dirname, './dist'),

        // 静态资源路径
        publicPath: '/webpack-vue/dist/',

        // 文件名
        filename: `js/[name].js?ver=[hash]`,
    },
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
    plugins: [
        ...htmlWebpackPluginArr,
        extractLESS
    ]
}
