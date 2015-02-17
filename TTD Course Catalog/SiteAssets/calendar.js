// App.js This code retrieves a specific set of items from an SP list & passes to Angular

'use strict'; // This is now enabled, forces strict mode. 

// Global Declarations

var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var web = context.get_web();
var url = context.get_url();
var allListitems = {};

//----------------------------------------------------------------------------------------------------------
// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
$(document).ready(function () {
getUserName();//Get User Name
});
// End of Document Ready function

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// This function prepares, loads, and then executes a SharePoint query to get the current users information
function getUserName() {
context.load(user);
context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
}
// End of GetUserName

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------
// This function is executed if the GetUserName call is successful
// It replaces the contents of the 'message' element with the user name
function onGetUserNameSuccess() {
$('#message').text('Hello ' + user.get_title());
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

            url: url + "/_api/web/lists/getByTitle('Training Calendar')/items'",

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

            url: url + "/_api/web/lists/getByTitle('Slideshow Images')/items'",

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
        	//alert('successful list read - pics');
            var jsonObject = JSON.parse(data.body);
			console.log(JSON.stringify(jsonObject));
            allListitems.pics = [];	//declare a holder for the list items

            var listitems = jsonObject.d.results;

            //Move the parsed results from the SP query into allListitems.events array
            for (var i = 0; i < listitems.length; i++) { //iterate the index variable over the number of items in the list
			    allListitems.pics.push(listitems[i]);
            }// allListitems.pics array now populated　
　			
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

    
}//end of getSPcalendardata


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

var app = angular.module('calendar', [])
app.controller('calendarController', ['$scope', function($scope) {
	
	
	//Go get the data BEFORE we make any Angular calls, else data latency will crash the call- Must be preloaded !
	getSPcalendaritems()
	getSPslideshowPics()	
	$scope.events = []; 
	$scope.pics = [];
	$scope.wait = "Loading events...";

	function populate(){
		console.log('timer fired');
		if(allListitems.events != undefined ){
				$scope.$apply(function(){
					$scope.wait = "";
					for (var i = 0; i < allListitems.events.length; i++) {
						$scope.events.push(allListitems.events[i]);
					}
					for (var i = 0; i < allListitems.pics.length; i++) {
						$scope.pics.push(allListitems.pics[i]);
					}
				});	// end $apply
				clearInterval(timer)
		}
	
	} // end populate()
	
var timer = setInterval(populate, 200);	
	
}]);  // End of angular calendarController

//EOF