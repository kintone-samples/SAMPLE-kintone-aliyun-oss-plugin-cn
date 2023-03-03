const path = require('path');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    "config.min": "./oss/js/src/config.js",
    "desktop.min": "./oss/js/src/desktop.js"
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'oss/js/dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"}
        ]
      }
    ]
  }
};