'use strict'; // jshint node: true, browser: false, esnext: true
const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    modules: [ "node_modules", path.resolve(__dirname, "app") ],
    extensions: [".js", ".json", '.css'],
    alias: {
//        'jquery'          : 'jquery/dist/jquery.min',
        'ngRoute'         : 'angular-route/angular-route.min',
        'ngCookies'       : 'angular-cookies/angular-cookies.min',
        'ngAnimate'       : 'angular-animate/angular-animate.min',
        'ngSanitize'      : 'angular-sanitize/angular-sanitize.min',
        'ngDialog'        : 'ng-dialog/js/ngDialog.min',
        'ngMeta'          : 'ng-meta/dist/ngMeta.min',
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
    ]
  },
  entry: {
      template : './app/template.js',
      meetings : './app/views/meetings/documents/entry.js',
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common', // Specify the common bundle's name.
      names : ['template', 'meetings'],
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/app/dist/'
  }
};
