'use strict';

angular.module('app.directives', [])

	.directive('resize', function ($window) {
    	return function (scope,element) {
	        scope.width = $window.innerWidth;
	        scope.height = $window.innerHeight;
	        var fluidDiv = element.find('.fluidDiv').children(0);
	        scope.fluidHeight = angular.element(fluidDiv).innerHeight;
	        scope.fluidWidth = angular.element(fluidDiv).innerWidth;
	        angular.element($window).bind('resize', function () {
	            scope.$apply(function () {
	                scope.width = $window.innerWidth;
	                scope.height = $window.innerHeight;
	                var fluidDiv = element.find('.fluidDiv').children(0);
	                scope.fluidWidth = angular.element(fluidDiv).innerWidth;
	                scope.fluidHeight = angular.element(fluidDiv).innerHeight;
	            });
	        });
        };
    })
    
    .directive('float', function($window, $log) {
    	return {
			restrict: 'A',
			link: function(scope, element, attributes) {
				element.parent().addClass('foo');
				
				element.hover(function(){
					$(this).children('.accordion-body').show();
					var where = $(this).children('.accordion-heading').offset();					
					$(this).children('.accordion-body').css('top', where.top - 35);
					$(this).children('.accordion-body').css('left', where.left);
				}, function(){
					$(this).children('.accordion-body').hide();
				});
			}
		}
    })
    
    .directive('results', function() {
    	return {
    		restrict: 'E',
    		templateUrl: "../SiteAssets/Views/templateSearchResults.html",
    		
    	};
    })

    
    .directive('courses', function() {
    	return {
    		restrict: 'E',
    		templateUrl: "../SiteAssets/Views/templateCourses.html",
    		
    	};
    })
        
    .directive('class', function() {
    	return {
    		restrict: 'E',
    		templateUrl: "../SiteAssets/Views/templateClass.html",
    		
    	};
    })

    
    .directive('placeholder', function() {
  		return {
		    restrict: 'A',
		    require: 'ngModel',
		    link: function(scope, element, attr, ctrl) {      
		      var value;
		      var placeholder = function () {
		          element.val(attr.placeholder)
		      };
		      var unplaceholder = function () {
		          element.val('');
		      };
		      scope.$watch(attr.ngModel, function (val) {
		        value = val || '';
		      });
		      element.bind('focus', function () {
		         if(value == '') unplaceholder();
		      });
		      element.bind('blur', function () {
		         if (element.val() == '') placeholder();
		      });
		      ctrl.$formatters.unshift(function (val) {
		        if (!val) {
		          placeholder();
		          value = '';
		          return attr.placeholder;
		        }
		        return val;
		      });
		    }
	  };
});


