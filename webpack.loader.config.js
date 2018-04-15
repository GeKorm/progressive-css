const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: './src/loader.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname),
    filename: 'loader.js',
    library: 'loader',
    libraryTarget: 'umd'
  },
  plugins: [new CleanWebpackPlugin(['loader.js'], { verbose: false })]
};
