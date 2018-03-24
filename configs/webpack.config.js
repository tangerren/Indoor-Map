const path = require('path');
const basePath = path.resolve(__dirname, '..');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: basePath + '/src/index.ts',
    output: {
        filename: "[name].js",
        path: basePath + '/dist/'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
            exclude: /node_modules/
        }]
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
    ]
};