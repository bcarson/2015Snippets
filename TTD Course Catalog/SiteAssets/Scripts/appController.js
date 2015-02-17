'use strict';

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var web = context.get_web();
var url = context.get_url();

angular.module('app.controllers', ['app.services','jmdobry.angular-cache'])	

	.controller('ttdContact', function($scope, onlineInquiry, getUserService){
		$scope.requestHelpGreeting = 'Please wait, building page...';		
		var namePromise = getUserService.getUser();
		namePromise.then(function(data){
			var firstName = getUserService.firstName(data.d.Title);
			$scope.requestHelpGreeting = 'Hi ' + firstName + ', how can we help you?';
		});		
		$scope.form = onlineInquiry.go;
	})


	.controller('ttdController', function($scope, queryService, getListService, 
	processService, date, $filter, $log, $cacheFactory, onlineInquiry, getUserService) {
		$scope.initialize = 'Please wait, building page...';
		$scope.greeting = '';
		
		var namePromise = getUserService.getUser();
		namePromise.then(function(data){
			var firstName = getUserService.firstName(data.d.Title);
			$scope.requestHelpGreeting = 'Hi ' + firstName + ', how can we help you?';
		});		
		$scope.form = onlineInquiry.go;

		var picList = queryService.images;
		var picPromise = getListService.getList(picList.title, picList.query);
		picPromise.then(function(data){
			$scope.pics = data;
		});
						
		$scope.coursefilters = {}; 
		var courseList = queryService.courses;
		var coursePromise = getListService.getList(courseList.title, courseList.query);
		$scope.classfilters = {};
		var classList = queryService.classes;
		var classPromise = getListService.getList(classList.title, classList.query);
		
		coursePromise.then(function(data) {
			var returnObject = processService.forCourses(data, $scope.coursefilters);
			$scope.courses = returnObject.list;
			$scope.coursefilters.disciplines = returnObject.disciplines;
			$scope.coursefilters.skills = returnObject.skills;
		})
		.then(function(){
			 $scope.$watch('coursefilters', function(newValues) {
				$scope.filteredCourses = $filter('coursefilters')($scope.courses, $scope.coursefilters);
			}, true);
		})
		
		.then(function(){
			var namePromise = getUserService.getUser();
			namePromise.then(function(data){
				var firstName = getUserService.firstName(data.d.Title);
				$scope.greeting = 'Hi ' + firstName + ', what would you like to learn?';
				$scope.requestHelpGreeting = 'Hi ' + firstName + ', how can we help you?';
				$scope.initialize = '';
			});
		})
		
		.then(function(){
			classPromise.then(function(data){
				var returnObject = processService.forClasses(data, $scope.courses, $scope.classfilters);
				$scope.classes = returnObject.list;
				$scope.classfilters.types = returnObject.types;
				$scope.classfilters.locations = returnObject.locations;			
				$scope.date = date.object();			
			})
			.then(function(){
				$scope.$watch('classfilters', function(newValues) {
					$scope.filteredClasses = $filter('classfilters')($scope.classes, $scope.classfilters);
				}, true);	
			});
		});
				
		$scope.thismonth = true;

		$scope.behavior = {};
		$scope.behavior.courseview = false;
		$scope.behavior.viewcourses = function(){
			if( $scope.behavior.courseview === false ) {
				$scope.behavior.courseview = true;
				for (var i = 0; i < 12; i++) {
					var counter = 'opendisc' + String(i);
					$scope[counter] = true;
				}	
				$('ul.nav-tabs li.globalList').addClass('active');
				$('#global').addClass('active');
				$('li.calendar').removeClass('active');
				$('#calendar').removeClass('active');
			}
		}
		
		$scope.behavior.classview = false;
		$scope.behavior.viewclasses = function() {
			if( $scope.behavior.classview === false ) {
				$scope.behavior.classview = true;
				$('ul.nav-tabs li.globalList').removeClass('active');
				$('#global').removeClass('active');
				$('li.calendar').addClass('active');
				$('#calendar').addClass('active');
				$scope.showall.open = true;
				$scope.behavior.showall();
			}
		}
		        
		$scope.behavior.showall = function(){
			$scope.thismonth.open = false;
			$scope.nextmonth.open = false;
			$scope.monthafter.open = false;
		}
		
		$scope.behavior.clear = function(){
			processService.clearAll($scope.coursefilters);
			processService.clearAll($scope.classfilters);
		}

})// end ttdController
      
	.run(function ($http, $angularCacheFactory) {

		var dataCache = $angularCacheFactory('dataCache');
	
	/*
	    $angularCacheFactory('dataCache', {
	        maxAge: 900000, // Items added to this cache expire after 15 minutes.
	        cacheFlushInterval: 6000000, // This cache will clear itself every hour.
	        deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
	    });
	*/
	
	    $http.defaults.cache = $angularCacheFactory.get('dataCache');
});	
