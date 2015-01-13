console.log('app loaded');

define(function(require){
  'use strict';
  return require('angular').module('app', [])
    .controller('controller', function($scope){
    	console.log('hello from the controller');
    });
}