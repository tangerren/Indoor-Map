const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const basePath = path.resolve(__dirname, '..');

module.exports = {
    entry: basePath + '/src/index.ts',
    output: {
        filename: "[name].js",
        path: basePath + '/dist/'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: path.resolve(__dirname, '../configs/tsconfig.json'),
                }
            },
            {
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        minimize: true
                    }
                }]
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js", ".css"]
    },
    externals: [{
        IndoorMap: 'IndoorMap',
        IndoorMapLoader: 'IndoorMapLoader'
    }],
    plugins: [
        new HtmlWebPackPlugin({
            template: basePath + '/src/index.html',
            filename: "./index.html"
        })
    ],
    devServer: {
        contentBase: basePath + '/dist',
        compress: true,
        port: 4200,
        host: "127.0.0.1",
    }
};
// var HtmlWebpackPlugin = require('html-webpack-plugin');

// module.exports = {
//     devtool: 'cheap-source-map',
//     entry: {
//         "index": "./src/index.ts" // 入口文件可以多个
//     },
//     output: {
//         filename: "[name].js", // 这里会自动生成index.js
//         path: __dirname + "/build" // 输出到哪个文件夹
//     },
//     resolve: {
//         extensions: [".ts", ".js", ".css"] // 自动补全，很重要
//     },
//     module: {
//         loaders: [{
//             test: /\.css$/,
//             loader: ['style-loader', 'css-loader']
//         }, {
//             test: /\.ts$/,
//             loader: "ts-loader"
//         }]
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: './src/index.html'
//         }),
//     ],
//     externals: [{
//         IndoorMap: 'IndoorMap',
//         IndoorMapLoader: 'IndoorMapLoader'
//     }],
//     devServer: {
//         contentBase: path.join(__dirname, "build")
//     }
// };