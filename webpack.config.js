'use strict'; // jshint node: true, browser: false, esnext: true
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  resolve: {
    modules: [ "node_modules", path.resolve(__dirname, "app") ],
    extensions: [".js", ".json", '.css'],
    alias: {
//        'jquery'          : 'jquery/dist/jquery.min',
        'ngRoute'         : 'angular-route/angular-route',
        'ngCookies'       : 'angular-cookies/angular-cookies',
        'ngAnimate'       : 'angular-animate/angular-animate',
        'ngSanitize'      : 'angular-sanitize/angular-sanitize',
        'ngDialog'        : 'ng-dialog/js/ngDialog',
        'ngMeta'          : 'ng-meta/dist/ngMeta',
        'authentication'  : 'services/authentication',
        'toastr'          : 'angular-toastr',
        'dragula'         : 'dragula/dist/dragula',

      },
  },
  module: {
    loaders: [
      { test: require.resolve('jquery'),  loader: 'expose-loader?jQuery!expose-loader?$' },
      { test: /angular/,                  loader: 'imports-loader?jquery' },
      { test: /bootstrap/,                loader: 'imports-loader?jquery' },
      { test: /angular-flex/,             loader: 'imports-loader?angular' },
//      { test: /\.js$/, include: /(node_modules\/|\/app\/)/, loader: 'uglify-loader' }
    ]
  },
  entry: {
      template : './app/template.js',
  },
  plugins: [
    new UglifyJsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common', // Specify the common bundle's name.
      names : ['template'],
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/app/dist/'
  }
};
