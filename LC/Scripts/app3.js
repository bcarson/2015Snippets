console.log('foobar');
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

// After all scripts are loaded, initialize Angular
require(['jquery','angular','app'], function( $ ) {
	angular.element(document).ready(function(){
		angular.bootstrap(document,['app']);
	});
});