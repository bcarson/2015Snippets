// Initialize jQuery and Twitter Bootstrap through RequireJS before calling AngularJS
require(['jquery','bootstrap'], function($) {
	// Call AngularJS and dependent modules
	$.getScript('../SiteAssets/scripts/vendor/angular_v1.2.19.js', function(){
		$.getScript('../SiteAssets/scripts/vendor/angular-sanitize_v1.2.19.js', function(){
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
							query:'?$select=Title,Featured,Order0,Hyperlink,Description,FileRef&$filter=Featured eq 1'
							//query: '?$filter=Featured eq 1'
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
		$('#homepage').attr('data-ng-controller','controller');
	
		// AFTER AngularJS app and all dependent modules are defined, initialize AngularJS
		angular.bootstrap(document,['app']);
			});
		});
});