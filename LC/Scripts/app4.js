console.log('foo');

require.config({
	baseUrl: '../SiteAssets/Scripts',
    urlArgs: 'version=2.0',
    paths: {
        jquery: 'vendor/jquery',
        angular: 'vendor/angular_v1.2.10',
        app: 'app'
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