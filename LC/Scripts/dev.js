// Initialize jQuery and Twitter Bootstrap through RequireJS before calling AngularJS
require(['jquery','bootstrap'], function($) {

	// Call AngularJS and dependent modules
	$.getScript('https://spchr.cop.net/services/learning-central/SiteAssets/scripts/vendor/angular_v1.2.19.js', function(){
		$.getScript('https://spchr.cop.net/services/learning-central/SiteAssets/scripts/vendor/angular-sanitize_v1.2.19.js', function(){
				
			// Initialize AngularJS application and dependent modules	
			angular.module('app', ['app.services','ngSanitize','app.filters','app.directives'])

				// Define AngularJS controller, which uses Angular services to query SharePoint list items and inject data into $scope
				.controller('controller', function($scope, getListService, queryService, $log){
					
					// Slideshow
					var picList = queryService.images;
					var picPromise = getListService.getList(picList.title, picList.query);
					picPromise.then(function(data){
						$scope.pics = data;
					}); //END picPromise

					// Main Menu Primary
					var menuMainList = queryService.menuMain;
					var menuMainPromise = getListService.getList(menuMainList.title, menuMainList.query);
					menuMainPromise.then(function(data){
						$scope.menuMain = data;
					}); // END mainMenuPromise

					// Main Menu Level One
					var menuOneList = queryService.menuOne;
					var menuOnePromise = getListService.getList(menuOneList.title, menuOneList.query);
					menuOnePromise.then(function(data){
						$scope.menuOne = data;
					}); // END menuOnePromise
					
					// Main Menu Level Two
					var menuTwoList = queryService.menuTwo;
					var menuTwoPromise = getListService.getList(menuTwoList.title, menuTwoList.query);
					menuTwoPromise.then(function(data){
						$scope.menuTwo = data;
					}); // END menuTwoPromise

					// Main Menu Level Three
					var menuThreeList = queryService.menuThree;
					var menuThreePromise = getListService.getList(menuThreeList.title, menuThreeList.query);
					menuThreePromise.then(function(data){
						$scope.menuThree = data;
					}); // END menuThreePromise
					
					//Announcements (right sidebar under slideshow)
					var announcements = queryService.announcements;
					var announcementsPromise = getListService.getList(announcements.title, announcements.query);
					announcementsPromise.then(function(data){
						$scope.announcements = data;
					}); // END announcementsPromise
				});	// END controller

				angular.module('app.services', [])
				// Identify SharePoint lists and applicable fields for each list
				.factory('queryService', function(){
					return {
						images: {
							title:'Slideshow', 
							name: 'images', 
							query:'?$select=Title,Featured,Filename,Order0,Hyperlink,Description&$filter=Featured eq 1'
						},
						menuMain: {
							title:'Menu_Primary',
							name: 'mainMenu',
							query:''
						},
						menuOne: {
							title:'Menu_LevelOne',
							query: '?$select=Title,ID,ParentMenuItemId,DisplayOrder,Hyperlink'
						},
						menuTwo: {
							title:'Menu_LevelTwo',
							query: '?$select=Title,ID,ParentMenuItemId,Hyperlink,DisplayOrder'
						},
						menuThree: {
							title:'Menu_LevelThree',
							query:'?$select=Title,ID,ParentMenuItemId,Hyperlink,DisplayOrder'
						},
						announcements: {
							title:'Announcements',
							query:'?$select=ID,Title,Modified,Body,Link'
						}

					}
				})// END queryService

				// Retrieve JSON data from SharePoint lists using $http, resolve each "promise" when data is returned
				.factory('getListService', function($http, $q){
					return {
						getList: function (list, params) {
							var url = _spPageContextInfo.webAbsoluteUrl;
							var absLink = 'https://spchr.cop.net/services/learning-central';
							var getstring = absLink + "/_api/web/lists/getByTitle('" + list + "')/items" + params;
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
					} // END getListService
				}); // END app.services
				
				angular.module('app.filters', [])
				// Custom Angular filter to truncate strings as needed (used in Announcments section)
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
			    }); // END app.filters

				angular.module('app.directives', [])
				// Wait until list data is injected into DOM and then initialize jQuery behavior on dynamic dropdown menu
				.directive('mydropdown', function($sce){
					return {
						transclude: true,
						template: '<div ng-transclude></div>',
						controller: function(){
							angular.element(document).ready(function () {
								// Check size and position of main navigation
								var nav = $('#mainNav');
								var navWhere = nav.offset();
								var navWidth = nav.width();
								var navThird = Math.floor(navWidth/3.2);
								var placeThird = Math.floor(navWidth - navThird);
								
								// set CSS attributes for subNav
								var subNav = $('.subNav');
								subNav.css('top', navWhere.top + 41);
								subNav.css('left', navWhere.left);
								subNav.css('width', navWidth + 2);
								
								$('.firstHeadings, .firstHeadings > li, .secondHeadings, .thirdContent').css('width', navThird);
								$('.secondHeadings').css('margin-left', navThird);	
								$('.thirdContent').css('margin-left', navThird + 50);

						    });
						}
					}
				})
				// Initialize Twitter Bootstrap accordion behavior on home page Announcements AFTER data is injected into DOM
				.directive('myaccordion', function(){
					return {
						transclude: true,
						templateUrl: '../SiteAssets/views/viewAccordion.html',
						controller: function(){
							$('#announcements').collapse();
						}
					}
				}); // END app.directives 

		// Add AngularJS controller attribute to selector
		$('#angular').attr('data-ng-controller','controller');
	
		// AFTER AngularJS app and all dependent modules are defined, initialize AngularJS
		angular.bootstrap(document,['app']);

		
			});
		});
});