require(['jquery','bootstrap'],function($){ 
	$("estream-menu.js").remove();

	// First load AngularJS and dependent scripts
	$.getScript('../SiteAssets/scripts/angular_v1.2.23.js', function(){
	$.getScript('../SiteAssets/scripts/ui-bootstrap-custom-0.12.0.js?version=6', function(){
	$.getScript('../SiteAssets/scripts/angular-sanitize_v1.2.9.min.js', function(){	

		/************************************************************************************************
		****** Initialize custom Angular module (and load dependent modules called in scripts above) ****
		************************************************************************************************/
		angular.module('itApp', ['ui.bootstrap','ngSanitize'])

			/******************* Begin Angular Controller ***********************************/
			.controller('itHome', function($scope, $filter, $q, queryService, getListService){
				
				var listPromises = []; // Initialize empty array to hold all our async promises

				// Using factories defined below, loop through each list and retrieve items from SharePoint
				angular.forEach(queryService, function(list, key){ 

					// use Angular promises to handle asynchronous processing
					var promise = getListService.getList(list.title, list.query);
					listPromises.push(promise); // add each promise to the array

					// After the promise is returned, perform operations if needed then push list items to $scope object.
					promise.then(function(data){

						// loop through each list item
						angular.forEach(data, function(item, index){
							item.clean = $filter('clean')(item.Title);
							
							if(key === 'accordion'){
								// Open first accordion group on page load
								if(item.Title === 'IT Organization'){
									item.open = true;
								} else { item.open = false; }
							}

							if(key === 'blocks'){
								// Determine if Block Content Type a tab or link 
								var contentType = item.ContentTypeId.slice(-4);
								if(contentType === 'BE22') {
									item.link = true;
								} else { item.link = false; }
							}
						});

						$scope[key] = data;
					});
				});

				// After all list promises have been returned, handle deep links and home tab
				$q.all(listPromises).then(function(){
					var hash = window.location.hash;
					if(hash){ $scope.deepLinks(hash); }
					$scope.homeBlock = $filter('filter')($scope.blocks, {Title:'Home'}, true);
					$scope.homeTab = $filter('filter')($scope.tabs, {Title:'Welcome'}, true);
				});

				$scope.selectedBlock = 28;
				$scope.selectedTab = 0;

				$scope.selectBlock = function($index){$scope.selectedBlock = $index;}

				$scope.selectTab = function(id, selectedBlock, selectedTab){
					angular.forEach($scope.tabs, function(tab){
						tab.active = false;
					});
					$scope.selectedBlock = selectedBlock.Id;
					selectedTab.active = true;
					$(id).addClass('active');
				}

				$scope.deepLinks = function(url){
					// If #hash exists in URL, identify and activate corresponding Block/Tab
					if(url.indexOf('#') > -1){
						var hash = url.split('#')[1];
						var split = hash.split('_');
						var hashBlock = $filter('filter')($scope.blocks, {clean: split[0]}, true);
		        		var hashTab = $filter('filter')($scope.tabs, {clean: split[1]}, true);
	        			$scope.selectBlock(hashBlock[0].Id);
	        			if(hashTab){ $scope.selectTab(hash, hashBlock[0], hashTab[0]); }					
					} 
				}

			}) /******************* END Angular itHome controller **********************/

			/************************* Begin Angular Factories *************************/
			.factory('queryService', function(){
				return {
					// Define parameters (list title and query string) for each SharePoint List used in this app
					accordion: { title:'Parent Block', query:'?$select=Title,Id' },
					blocks: { title:'Blocks', query:'?$select=Title,Id,Icon,AssociatedContactId,SortOrder,ParentBlockId,BlockColorId,ContentTypeId,URL,BlockColor/Hex&$expand=BlockColor' },
					tabs: { title:'Tabs', query:'?$select=Title,Id,ParentBlockId,Body,SortOrder' },
					dropdown: { title: 'BFReferenceLinks', query:'?$select=Title,targetUrl,newTab' }
				}
			})// END queryService

			// Retrieve JSON data from SharePoint lists using $http, resolve each "promise" when data is returned
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
							console.log('Doh! Something went wrong while trying to retrieve the list: ' + status);
							deferred.reject(status);
						});
						return deferred.promise;
					}
				} // END getListService
			}) /****************** END Angular Factories *****************************/

			/********************* Begin Custom Filters ******************************/
			/** PARENT BLOCK FILTER: Filter each block/tab element by ParentBlockId **/
			.filter('parentBlock', function() {
				return function(items, parentBlockId){
					var filtered = [];
					angular.forEach(items, function(item){
						var type = Object.prototype.toString.call(item.ParentBlockId);
						if(type === '[object Number]'){
							if(item.ParentBlockId === parentBlockId) filtered.push(item); 
						} else {
							if(item.ParentBlockId.results.indexOf(parentBlockId) != -1) filtered.push(item);
						}	
					});
					return filtered;
				}
			})

			/** CLEAN FILTER: Regex to remove spaces and special chars for CSS ****/
		    .filter('clean', function() {
			    return function(input) {
			      var out = "";
				  if(input) out = input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ''); 
			      return out;
			    }
			}); /****************** END Custom Filters *******************************/
			/********************** END CUSTOM ANUGLAR MODULE ************************/


		    /***************************** IMPORTANT! *********************************
		    * Now that all scripts and modules are loaded, we have to send the module *
		    * to the DOM using Angular Bootstrap (this is NOT Twitter's Bootstrap) ****
		    ***************************************************************************/
			angular.bootstrap(document,['itApp']);
			/******************************************* aaaand that's all she wrote! */

        });
		});
		});
}); //END requirejs wrapper