'use strict';    

// Declare app level module and dependencies
angular.module('app', [
	'ngResource',
	'ngRoute',
	'app.controllers',
	'app.services',
	'app.filters',
	'app.directives',
	//'app.templates',
 	'ngSanitize',
 	'ui.bootstrap',
 	'jmdobry.angular-cache'
]);        

angular.element(document).ready(function(){
	angular.bootstrap(document,[
		'ngResource',
		'ngRoute',
	 	'ngSanitize',
	 	'ui.bootstrap',
	 	'jmdobry.angular-cache',
		'app.services',
		'app.filters',
		'app.directives',
		//'app.templates',
	 	'app.controllers',
	 	'app',
	]);	
});
