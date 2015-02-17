console.log('script.js loaded');
$('#carousel').carousel('cycle');

// App.js This code retrieves a specific set of items from an SP list & passes to Angular

'use strict'; // This is now enabled, forces strict mode. 

// Global Declarations

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var web = context.get_web();
var url = context.get_url();
// get absolute url for hostweb instead of relative ///
var allListitems = {};

//----------------------------------------------------------------------------------------------------------
// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
$(document).ready(function () {
console.log('document ready');
getUserName();//Get User Name
});
// End of Document Ready function

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// This function prepares, loads, and then executes a SharePoint query to get the current users information
function getUserName() {
	console.log('getUserName fired');
	context.load(user);
	context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
}
// End of GetUserName

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// This function is executed if the GetUserName call is successful
// It replaces the contents of the 'message' element with the user name
function onGetUserNameSuccess() {
console.log('GetUserNameSuccess');
	var name = user.get_title();
	name = name.split(',')[1];
	name = name.split(' ')[1];
	name = name.trim();
$('#message').text('Hi ' + name + ', what would you like to learn?');
}
//End of onGetUserNameSuccess function

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// This function is executed if the GetUserName call fails
function onGetUserNameFail(sender, args) {
alert('Failed to get user name. Error:' + args.get_message());
}
//End of onGetUserNameFail function

//----------------------------------------------------------------------------------------------------------
// --------------------------------THIS IS MAIN CONTEXT !!!!!!!!!!!!!----------------------------------------

//make this a function so I can call it before Angular.js needs the retrieved data
//-----------------------------------------------------------------------------------------------------------
function getSPcalendaritems() {
console.log('getSPcalendaritems fired');
    // Load the RequestExecutor.js file using jQuery's getScript function.
    $.getScript(
    url + "/_layouts/15/SP.RequestExecutor.js",
    continueExecution);

    // After the cross-domain library is loaded, execution continues to this function.
    //-----------------------------------------------------------------------------------------------------------
    function continueExecution() {
    console.log('getSPcalendaritems continueExecution fired');
        var executor;
        // Initialize your RequestExecutor object. This is cross the domain Library SP calls

        executor = new SP.RequestExecutor(url);
        // You can issue requests here using the executeAsync method of the RequestExecutor object.
        // get list items from sp site. The embedded url is the assembled endpoint ref. This could be a var for additional asynce calls for brevity
        //-----------------------------------------------------------------------------------------------------------
        executor.executeAsync(
        {

            //url: url + "/_api/web/lists/getByTitle('TrainingCalendar')/items'",
			url: "http://bvlspadweb1/sites/TechnicalTraingDEV/_api/web/lists/getByTitle('TrainingCalendar')/items",
			
            method: "GET",

            headers: { "Accept": "application/json; odata=verbose" },

            success: successHandler,

            // successful JSON query ends up here

            error: errorHandler
            //alert('error reading list');
        }
        );// End of executor.executeAsync block
        //-----------------------------------------------------------------------------------------------------------

        // successful executeAsync & GET operation !
        //-----------------------------------------------------------------------------------------------------------
        function successHandler(data) {
        console.log('query calendar successHandler fired');
        	//alert('successful list read - events');
            var jsonObject = JSON.parse(data.body);
			//console.log(JSON.stringify(jsonObject));
            allListitems.events = [];	//declare a holder for the list items

            var listitems = jsonObject.d.results;

            //Move the parsed results from the SP query into allListitems.events array
            for (var i = 0; i < listitems.length; i++) { //iterate the index variable over the number of items in the Calendar
                //$('ul#displayList').append('<li>' + listitems[i].Title + '</li>'); //Get the course Title into listitems.Title array
                allListitems.events.push(listitems[i]);

            }// allListitems.events array now populated　
　		console.log('events populated');
        } // END of successHandler
        //-----------------------------------------------------------------------------------------------------------
        // unsuccessful executeAsync & GET operation !--- This needs further test for correct error recovery responses

        //-----------------------------------------------------------------------------------------------------------

        function errorHandler(sender, args) {
            /*document.getElementById("message").innerText =
            "Could not complete cross-domain call: " + args.get_message();*/
            alert('unsuccessful list read - events');
        } //end of errorHandler
        //-----------------------------------------------------------------------------------------------------------
    } // end of continueexecution
    //-----------------------------------------------------------------------------------------------------------

    
}//end of getSPcalendardata


function getSPslideshowPics() {
	console.log('getSPslideshowPics fired');
    // Load the RequestExecutor.js file using jQuery's getScript function.
    $.getScript(
    url + "/_layouts/15/SP.RequestExecutor.js",
    continueExecution);

    // After the cross-domain library is loaded, execution continues to this function.
    //-----------------------------------------------------------------------------------------------------------
    function continueExecution() {
        var executor;
        // Initialize your RequestExecutor object. This is cross the domain Library SP calls

        executor = new SP.RequestExecutor(url);
        // You can issue requests here using the executeAsync method of the RequestExecutor object.
        // get list items from sp site. The embedded url is the assembled endpoint ref. This could be a var for additional asynce calls for brevity
        //-----------------------------------------------------------------------------------------------------------
        executor.executeAsync(
        {

            //url: url + 
            url: "http://bvlspadweb1/sites/TechnicalTraingDEV/_api/web/lists/getByTitle('Slideshow Images')/items",

            method: "GET",

            headers: { "Accept": "application/json; odata=verbose" },

            success: successHandler,

            // successful JSON query ends up here

            error: errorHandler
            //alert('error reading list');
        }
        );// End of executor.executeAsync block
        //-----------------------------------------------------------------------------------------------------------

        // successful executeAsync & GET operation !
        //-----------------------------------------------------------------------------------------------------------
        function successHandler(data) {
        	console.log('successful list read - pics');
            var jsonObject = JSON.parse(data.body);
			console.log(JSON.stringify(jsonObject));
            allListitems.pics = [];	//declare a holder for the list items

            var listitems = jsonObject.d.results;

            //Move the parsed results from the SP query into allListitems.events array
            for (var i = 0; i < listitems.length; i++) { //iterate the index variable over the number of items in the list
			    allListitems.pics.push(listitems[i]);
            }// allListitems.pics array now populated　
　			console.log('slideshow pics array populated');
        } // END of successHandler
        //-----------------------------------------------------------------------------------------------------------
        // unsuccessful executeAsync & GET operation !--- This needs further test for correct error recovery responses

        //-----------------------------------------------------------------------------------------------------------

        function errorHandler(sender, args) {
            /*document.getElementById("message").innerText =
            "Could not complete cross-domain call: " + args.get_message();*/
            alert('unsuccessful list read - pics');
        } //end of errorHandler
        //-----------------------------------------------------------------------------------------------------------
    } // end of continueexecution
    //-----------------------------------------------------------------------------------------------------------

    
}//end of getSPslideshowPics

function getSPsuccessStories() {
	console.log('getSpsuccessStories fired.');
    // Load the RequestExecutor.js file using jQuery's getScript function.
    $.getScript(
    url + "/_layouts/15/SP.RequestExecutor.js",
    continueExecution);

    // After the cross-domain library is loaded, execution continues to this function.
    //-----------------------------------------------------------------------------------------------------------
    function continueExecution() {
        var executor;
        // Initialize your RequestExecutor object. This is cross the domain Library SP calls

        executor = new SP.RequestExecutor(url);
        // You can issue requests here using the executeAsync method of the RequestExecutor object.
        // get list items from sp site. The embedded url is the assembled endpoint ref. This could be a var for additional asynce calls for brevity
        //-----------------------------------------------------------------------------------------------------------
        executor.executeAsync(
        {

            //url: url + 
            url: "http://bvlspadweb1/sites/TechnicalTraingDEV/_api/web/lists/getByTitle('SuccessStories')/items",

            method: "GET",

            headers: { "Accept": "application/json; odata=verbose" },

            success: successHandler,

            // successful JSON query ends up here

            error: errorHandler
            //alert('error reading list');
        }
        );// End of executor.executeAsync block
        //-----------------------------------------------------------------------------------------------------------

        // successful executeAsync & GET operation !
        //-----------------------------------------------------------------------------------------------------------
        function successHandler(data) {
        	console.log('successful list read - success stories');
            var jsonObject = JSON.parse(data.body);
			console.log(JSON.stringify(jsonObject));
            allListitems.success = [];	//declare a holder for the list items

            var listitems = jsonObject.d.results;

            //Move the parsed results from the SP query into allListitems.events array
            for (var i = 0; i < listitems.length; i++) { //iterate the index variable over the number of items in the list
			    allListitems.success.push(listitems[i]);
            }// allListitems.success array now populated　
　			console.log('14. success stories populated.');
        } // END of successHandler
        //-----------------------------------------------------------------------------------------------------------
        // unsuccessful executeAsync & GET operation !--- This needs further test for correct error recovery responses

        //-----------------------------------------------------------------------------------------------------------

        function errorHandler(sender, args) {
            /*document.getElementById("message").innerText =
            "Could not complete cross-domain call: " + args.get_message();*/
            alert('unsuccessful list read - success stories');
        } //end of errorHandler
        //-----------------------------------------------------------------------------------------------------------
    } // end of continueexecution
    //-----------------------------------------------------------------------------------------------------------

    
}//end of getSPsuccessStories




// getQueryStringParameter is used to help define host and web url's for Sharepoint calls
//-----------------------------------------------------------------------------------------------------------
function getQueryStringParameter(paramToRetrieve) {
	var params = document.URL.split("?")[1].split("&");
	var strParams = "";
	for (var i = 0; i < params.length; i = i + 1) {
		var singleParam = params[i].split("=");
		if (singleParam[0] == paramToRetrieve)
			return singleParam[1];
	} // end of block
} // End of getQueryStringParameter　

// ANGULAR STUFF HERE
console.log('before Angular');
var app = angular.module('calendar', ['filters','ngSanitize'])
app.controller('calendarController', ['$scope', function($scope) {
	console.log('inside Angular controller');
	
	//Go get the data BEFORE we make any Angular calls, else data latency will crash the call- Must be preloaded !
	getSPcalendaritems()
	$scope.events = [];	
	getSPslideshowPics()	
 	$scope.pics = [];
	getSPsuccessStories()
	$scope.success = [];
	
	$scope.wait = "Loading courses...";
	$scope.date = new Date();
	$scope.numberDate = Date($scope.date);
	$scope.thisMonth = $scope.date.getMonth()+1;
	$scope.monthPlus = $scope.thisMonth + 1;
	$scope.monthPlusPlus = $scope.thisMonth + 2;
	$scope.displayMonth = ["zero","January","February","March","April","May","June","July","August","September","October","November","December","January","February","March"];
	

	function populate(){
		console.log('timer fired');
		if(allListitems.events != undefined && allListitems.pics != undefined && allListitems.success != undefined ){
				$scope.$apply(function(){
					$scope.wait = "";
					for (var i = 0; i < allListitems.events.length; i++) {
						var event = {};
						event = allListitems.events[i];
						event.month = event.startDate.split('-')[1];
						event.numDate = Date(event.startDate);
						//if( event.numDate > $scope.numberDate ) {alert('current');} else {alert('past');}						
						$scope.events.push(event);
					}
					for (var i = 0; i < allListitems.pics.length; i++) {
						if(allListitems.pics[i].Featured === true) {
						$scope.pics.push(allListitems.pics[i]);
						}
					}
					
					for (var i = 0; i < allListitems.success.length; i++) {
						$scope.success.push(allListitems.success[i]);
					}
				});	// end $apply
				clearInterval(timer)
				console.log('all arrays populated, clearing timer.')
					
				//Home Page Slideshow	
				$('.carousel').carousel();
				
				$('.carousel').hover(function(){
					$('.carousel-description').show().effect('slide',{direction:"down"}, 'slow');
					$('.carousel-caption').hide();
				}, function(){ 
					$('.carousel-description').hide().effect('slide',{direction:"up"},'slow');
					$('.carousel-caption').show();
				});
	
					
				//Calendar Hovers	
				$('.details').hover(function(){
					console.log('hovers firing');
					$(this).children('.hoverUp').show();
				}, function(){
					$(this).children('.hoverUp').hide();
				});

		}
	
	} // end populate()
	
var timer = setInterval(populate, 100);	
	

$scope.random = function(){
    return Math.random();
};
	
	
}]);  // End of angular calendarController

angular.module('filters', []).
    filter('truncate', function () {
        return function (text, length, end) {
        	if (length === undefined || length === null) {length = 10;}
            if (isNaN(length)) { length = 10; }
			else if (length < 10) { end = ""; }
            else if (end === undefined) { end = "..."; }
            if (text.length <= length || text.length - end.length <= length) { return text; }
            else { return String(text).substring(0, length-end.length) + end; }
        };
    });
    
    
    
    
// Get dates
var d = new Date();
var currentMonth = d.getMonth()+1;
var currentDay = d.getDate();
var currentYear = d.getFullYear();
var nextMonth = currentMonth+1;
var lastMonth = currentMonth+2;
// to show today's date:
var outputDate = d.getFullYear() + '/' +
    (currentMonth<10 ? '0' : '') + currentMonth + '/' +
    (currentDay<10 ? '0' : '') + currentDay;
//alert("current month: " + currentMonth);

var displayMonth = ["zero","January","February","March","April","May","June","July","August","September","October","November","December","January","February","March"];

// Various mouseover and animation effects for view
console.log('after all functional scripts');
$(document).ready(function(){
console.log('document ready, firing view animation scripts.');
    // Main Nav Dropdown Panels
    $('#mega ul li, #mega ul li > .subNav').hover(function(){
		/*$(this).children('.subNav').css('display','block');*/
        var where = $('#mega').offset();
        var megaWidth = $('#mega').width();
        $('body').delay(100).addClass('shadow');
		$('.subNav').css('top',where.top + 37);
		$('.subNav').css('left',where.left);
		$('.subNav').css('width',megaWidth - 1);
		$(this).children('.subNav').show();		
	}, function(){
		$(this).children('.subNav').stop().hide();
		$('body').removeClass('shadow');		
	});
		
	
	$('#popover').hover(function(){
		$('#popover').modal('show')
	});
		
	$( "#endDate" ).datepicker();
	$( "#startDate" ).datepicker();	
		
	// Home Page Mission Statement Hover Effect	
	$('#missionHover').hover(function(){
		$('#missionHide').show().effect('slide',{direction:"left"}, 'slow');
		$('.pioner').hide();
		$('#missionShow').hide('slow');
	}, 
	function(){
		$('.pioner').show();
		$('#missionShow').show();
		$('#missionHide').hide();
	});	
	
	
	// Catalog Tab Page - Click to show Discipline
	$('.discipline a').click(function(){
		var contentWhere = $('#discipline').offset();
        var target = $(this).siblings('.selectDiscipline');
		target.effect('slide',{direction:"right"}).show();
	});
	
	$('.disc-btn').click(function(){
		var contentWhere = $('#discipline').offset();
        var target = $(this).siblings('.browseDiscipline');
		target.effect('slide',{direction:"down"}).show();
	});
	
	$('a.back').click(function(){
		$(this).parent().hide();
	});
		
	// Catalog Page - Switching Tabs
	$('input.search').focus(function(){
		$('ul.nav-tabs li.globalList').addClass('active');
		$('#global').addClass('active');
		$('li.home, li.overviews, li.calendar').removeClass('active');
		$('#home, #overviews, #calendar').removeClass('active');
		$('#calendarA, #calendarB, #calendarC, #calendarD').addClass('in');
	});

		
});



//EOF