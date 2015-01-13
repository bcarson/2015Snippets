
console.log('bar');

var basePath = _spPageContextInfo.webServerRelativeUrl.replace('/$','');
require.config({
	paths: {
        jquery: basePath + 'vendor/jquery',
        angular: basePath + 'vendor/angular_v1.2.10',
        app: basePath + 'app'
    },
    // configure Angular shim
    shim: {
    	angular: {
    		deps: ['jquery'],
    		exports: 'angular'
    	}
    }
});

define(function(require){
  'use strict';
  return require('angular').module('app', [])
    .controller('controller', function($scope, getListService, queryService, $log){
				console.log('hello from the controller');
				
				// Slideshow
				var picList = queryService.images;
				var picPromise = getListService.getList(picList.title, picList.query);
				picPromise.then(function(data){
					$scope.pics = data;
				});


				// Main Menu Primary
				var menuMainList = queryService.menuMain;
				var menuMainPromise = getListService.getList(menuMainList.title, menuMainList.query);
				menuMainPromise.then(function(data){
					$scope.menuMain = data;
				});
	

				// Main Menu Level One
				var menuOneList = queryService.menuOne;
				var menuOnePromise = getListService.getList(menuOneList.title, menuOneList.query);
				menuOnePromise.then(function(data){
					$scope.menuOne = data;
				});
				
				// Main Menu Level Two
				var menuTwoList = queryService.menuTwo;
				var menuTwoPromise = getListService.getList(menuTwoList.title, menuTwoList.query);
				menuTwoPromise.then(function(data){
					$scope.menuTwo = data;
				});

				// Main Menu Level Three
				var menuThreeList = queryService.menuThree;
				var menuThreePromise = getListService.getList(menuThreeList.title, menuThreeList.query);
				menuThreePromise.then(function(data){
					$scope.menuThree = data;
				});
				
				//Announcements (right sidebar under slideshow)
				var announcements = queryService.announcements;
				var announcementsPromise = getListService.getList(announcements.title, announcements.query);
				announcementsPromise.then(function(data){
					$scope.announcements = data;
				});

			})
		
		.factory('queryService', function(){
			return {
				images: {
					title:'Slideshow', 
					name: 'images', 
					query:'?$select=Title,Featured,Filename,Order0,Hyperlink,Description&$filter=Featured eq 1'
				},
				menuMain: {
					title:'MainMenu_Primary',
					name: 'mainMenu',
					query:''
				},
				menuOne: {
					title:'MainMenu_LevelOne',
					query: '?$select=Title,ID,ParentMenuItemId'
				},
				menuTwo: {
					title:'MainMenu_LevelTwo',
					query: '?$select=Title,ID,ParentMenuItemId,Hyperlink'
				},
				menuThree: {
					title:'MainMenu_LevelThree',
					query:'?$select=Title,ID,ParentListItemId,Hyperlink'
				},
				announcements: {
					title:'Announcements',
					query:''
				}

			}
		})
		// Retrieve JSON data from SharePoint lists using $http into a promise
		.factory('getListService', function($http, $q){
			return {
				getList: function (list, params) {
					var url = _spPageContextInfo.webAbsoluteUrl;
					var getstring = url + "/_api/web/lists/getByTitle('" + list + "')/items" + params;
					var getconfig = {cache:false,headers:{"Accept": "application/json; odata=verbose"}}
					var deferred = $q.defer();
					$http.get(getstring, getconfig).
					success(function(data, status, headers, config) {
					    deferred.resolve(data.d.results);
					}).
					error(function(data, status, headers, config) {
						console.log('request failed');
						deferred.reject(status);
					});
					return deferred.promise;
				}
			}
		})

		.filter('truncate', function () {
	        return function (text, length, end) {
	        	if(text) {
		        	if (length === undefined || length === null) {length = 10;}
		            if (isNaN(length)) { length = 10; }
					else if (length < 10) { end = ""; }
		            else if (end === undefined) { end = "..."; }
		            if (text.length <= length || text.length - end.length <= length) { return text; }
		            else { return String(text).substring(0, length-end.length) + end; }
	            }
	        };
	    });
});

require( ['angular', 'app'], function(angular, app) {
  angular.bootstrap(document, [app.name]);
});

require(['jquery'], function($) {

$.ajaxSetup({ cache: false });

var url = _spPageContextInfo.webServerRelativeUrl;

window.onload = init;
	function init(){
		
		// Add Angular controller attribute to SharePoint DOM
		theBody = document.getElementById('s4-bodyContainer');
		theBody.setAttribute('data-ng-controller','controller');
		
	} // END init 
}); // END require 