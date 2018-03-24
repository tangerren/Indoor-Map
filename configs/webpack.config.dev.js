const path = require('path');
const basePath = path.resolve(__dirname, '..');
var webpackMerge = require("webpack-merge");
const baseConfig = require('./webpack.config');

module.exports = webpackMerge(baseConfig, {
    devtool: 'inline-source-map',
    module: {
        rules: [{
                test: /\.ts$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: path.resolve(__dirname, '../configs/tsconfigDev.json'),
                }
            },
            {
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        minimize: false
                    }
                }]
            }
        ]
    },
    devServer: {
        contentBase: basePath + '/dist',
        compress: true,
        port: 4200,
        host: "127.0.0.1",
    }
});