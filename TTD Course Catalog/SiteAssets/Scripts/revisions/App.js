/* THIS PART ECHOES THE USER NAME, VS INSERTS THIS IN EVERY NEW SP HOSTED APP */
//'use strict';
calendarData = [];
var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
//----------------------------------------------------------------------------------------------------------
// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
$(document).ready(function () {
     getUserName();
      $('.carousel').carousel()
      getWebTitle();
      
//    sharePointReady()
}); // END Document Ready

// ANGULAR
function simpleController($scope) {

    $scope.customers = [
        { name: 'Bill', city: 'New York' },
        { name: 'Ted', city: 'Nashville' },
        { name: 'Bob', city: 'Newark' }
    ];

    $scope.events = [];
    setTimeout(finish, 800);
    // wait for the json query to run, then populate $scope.events
    function finish() {
        for (var i = 0; i < calendarData.length; i++) {
            $scope.events.push(calendarData[i]);
        }
        $scope.$apply()
    }
}



// This function prepares, loads, and then executes a SharePoint query to get the current users information
function getUserName() {
    context.load(user);
    context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
}

function getWebTitle() {
    context.load(web.title);
    context.executeQueryAsync(onGetTitleSuccess, onGetTitleFail);
}

function onGetTitleSuccess() {
    $('#message2').text('Title: ' + context.web.title);
}
// This function is executed if the above call fails
function onGetTitleFail(sender, args) {
    alert('Failed to get title. Error:' + args.get_message());
}



// This function is executed if the above call is successful
// It replaces the contents of the 'message' element with the user name
function onGetUserNameSuccess() {
    $('#message').text('Hello ' + user.get_title() + '. What would you like to learn about?');
}
// This function is executed if the above call fails
function onGetUserNameFail(sender, args) {
    alert('Failed to get user name. Error:' + args.get_message());
}

/*********** Build and run the JSON query to retrieve data from the list **********/
var web;
var hostcontext;
var hostweburl;
var appweburl;

//get url components
appweburl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
// Load the .js files using jQuery's getScript function.
$.getScript(hostweburl + "/_layouts/15/SP.RequestExecutor.js", continueExecution);
// After the cross-domain library is loaded, execution
// continues to this function.
function continueExecution() {
    var executor;
    // Initialize your RequestExecutor object. This is cross the domain Library SP calls
    executor = new SP.RequestExecutor(appweburl);
    // You can issue requests here using the executeAsync method of the RequestExecutor object.
    // get lists from sp site. The embedded url is the assembled endpoint ref. This could be a var for additional async calls for brevity
    executor.executeAsync(
        {
            url:
            appweburl +
             //"/_api/SP.AppContextSite(@target)/web/lists?@target='" +
             "/_api/SP.AppContextSite(@target)/web/lists/getByTitle('Training Calendar')/items/?@target='" +
            hostweburl + "'",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: successHandler,
            // successful JSON query ends up here
            error: errorHandler
            //alert('error reading list');
        }
    );

    //* successful executeAsync & GET operation !
    function successHandler(data) {
        var jsonObject = JSON.parse(data.body);
        var lists = jsonObject.d.results;
        var listsHtml = $.each(lists, function (index, list) {
            calendarData.push(list);
        });
    } // END SUCCESS HANDLER

    //* unsuccessful executeAsync & GET operation !--- This is untested & need work !!!!!!
    function errorHandler(sender, args) {
        /*document.getElementById("message").innerText =
       "Could not complete cross-domain call: " + args.get_message();*/
        alert('unsuccessful list read');
    } // END errorHandler
} /********** END query **********/

function sharePointReady() {
    var hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    appweburl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
    currentcontext = new SP.ClientContext.get_current();
    hostcontext = new SP.AppContextSite(currentcontext, hostweburl);
    web = hostcontext.get_web();
    currentcontext.load(web, "Title");
    currentcontext.executeQueryAsync(onGetWebSuccess, onGetWebFail);
}
function onGetWebSuccess() {
    //$('#message2').text("The title of the host web of this app is " + web.get_title());

}
function onGetWebFail(sender, args) {
    alert('Failed to get lists. Error:' + args.get_message());
}
/* THIS IS THE STANDARD getQueryStringParameter FUNCTION, USED TO DEFINE hostUrl in the sharepointReady FUNCTION ABOVE */
function getQueryStringParameter(paramToRetrieve) {
    var params =
   document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}




