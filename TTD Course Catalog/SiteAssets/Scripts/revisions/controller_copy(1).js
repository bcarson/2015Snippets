'use strict'; // This is now enabled, forces strict mode. 

function setFunction(discipline) {
	// Assign Corporate Functions for each Discipline
	var CorpFunction = [];
	switch(discipline) {
		case 'Geosciences':
		case 'Reservoir Engineering':
			CorpFunction[0] = 'Geosciences and Reservoir Engineering';
			CorpFunction[1] = 1;
			break;
		case 'Drilling Engineering':
		case 'Completions Engineering':
			CorpFunction[0] = 'Global Wells';
			CorpFunction[1] = 2;
			break;
		case 'Production Engineering':
		case 'Facilities Engineering':
			CorpFunction[0] = 'Global Production';
			CorpFunction[1] = 3;
			break;
		case 'Unconventional Resources':
			CorpFunction[0] = 'Unconventional Resources';
			CorpFunction[1] = 4;
			break;
		case 'Deep Water':
			CorpFunction[0] = 'Deep Water';
			CorpFunction[1] = 5;
			break;
		case 'New Hire Training':
		case 'Individual Development':
		case 'Supervisor Training':
		case 'Instructor Development':
			CorpFunction[0] = 'Leadership and Professional Development';
			CorpFunction[1] = 5;	
	}
	return CorpFunction;
}

// Global Declarations
var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var web = context.get_web();
var url = context.get_url();

// Create objects to hold SharePoint data for each list
var spListData = {}; 
spListData.courses = []; 
spListData.classes = []; 
spListData.success = []; 
spListData.pics = [];
spListData.query = [
		{list:'Course Catalog', array:spListData.courses},
		{list:'Training Calendar', array:spListData.classes},
		{list:'SuccessStories',array:spListData.success},
		{list:'Slideshow Images', array:spListData.pics}	
		];

//----------------------------------------------------------------------------------------------------------
// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
getUserName();

// This function prepares, loads, and then executes a SharePoint query to get the current users information
function getUserName() {
	context.load(user);
	context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
}

//-----------------------------------------------------------------------------------------------------------
// This function is executed if the GetUserName call is successful
// It replaces the contents of the 'message' element with the user name
function onGetUserNameSuccess() {
//console.log('GetUserNameSuccess');
	var name = user.get_title();
	name = name.split(',')[1]; name = name.split(' ')[1]; name = name.trim();
$('#message').text('Hi ' + name + ', what would you like to learn?');
}

//-----------------------------------------------------------------------------------------------------------
// This function is executed if the GetUserName call fails
function onGetUserNameFail(sender, args) {
alert('Failed to get user name. Error:' + args.get_message());
}
// --------------------------------THIS IS MAIN CONTEXT !!!!!!!!!!!!!----------------------------------------

//make this a function so I can call it before Angular.js needs the retrieved data
//-----------------------------------------------------------------------------------------------------------

function getListData(list, array) {
//console.log('getListData started for ' + list);
    // Load the RequestExecutor.js file using jQuery's getScript function.
    $.getScript(
    url + "/_layouts/15/SP.RequestExecutor.js",
    continueExecution);

    // After the cross-domain library is loaded, execution continues to this function.
    //-----------------------------------------------------------------------------------------------------------
	    function continueExecution() {
	    //console.log('getListData continueExecution fired for ' + list);
	        var executor;
	        // Initialize your RequestExecutor object. This is cross the domain Library SP calls
	
	        executor = new SP.RequestExecutor(url);
	        // You can issue requests here using the executeAsync method of the RequestExecutor object.
	        // get list items from sp site. The embedded url is the assembled endpoint ref. This could be a var for additional asynce calls for brevity
	        //-----------------------------------------------------------------------------------------------------------
	        executor.executeAsync(
		        {
					url: "http://bvlspadweb1/sites/TechnicalTraingDEV/_api/web/lists/getByTitle('" + list + "')/items",
		            method: "GET",
		            headers: { "Accept": "application/json; odata=verbose" },
		            success: successHandler,
		            // successful JSON query ends up here
		            error: errorHandler
		            //alert('error reading list');
		        }
	        );// End of executor.executeAsync block
	        	
	        // successful executeAsync & GET operation !
	        //-----------------------------------------------------------------------------------------------------------
	        function successHandler(data) {
	        //console.log('query successHandler fired for ' + list);
	        	//alert('successful list read - classes');
	            var jsonObject = JSON.parse(data.body);
				////console.log(JSON.stringify(jsonObject));
	
	            var listitems = jsonObject.d.results;
	
	            //Move the parsed results from the SP query into spListData.classes array
	            for (var a = 0; a < listitems.length; a++) { //iterate the index variable over the number of items in the Calendar
	                array.push(listitems[a]);
	
	            }// spListData.classes array now populated　
	　		//console.log('List populated: ' + array);
	        } // END of successHandler

	        // unsuccessful executeAsync & GET operation !--- This needs further test for correct error recovery responses
	        //-----------------------------------------------------------------------------------------------------------
	
	        function errorHandler(sender, args) {
	            /*document.getElementById("message").innerText =
	            "Could not complete cross-domain call: " + args.get_message();*/
	            alert('unsuccessful list read');
	        } //end of errorHandler
	        //-----------------------------------------------------------------------------------------------------------
	    } // end of continueexecution
	    //-----------------------------------------------------------------------------------------------------------

}//end of getListData

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
//console.log('before Angular');
var app = angular.module('calendar', ['filters','ngSanitize'])

app.controller('calendarController', ['$scope', function($scope) {
	//console.log('inside Angular controller');

	//Go get the data BEFORE we make any Angular calls, else data latency will crash the call- Must be preloaded !
	$scope.classes = [];	
 	$scope.pics = [];
	$scope.success = [];
	$scope.courses = [];
	//Create arrays for Search Filters
	$scope.CorpFunctions = [];
	$scope.Disciplines = [];
	
	$scope.wait = "Loading courses...";
	$scope.date = new Date();
	
	$scope.theDate = {};
	$scope.theDate.current = new Date();
	$scope.theDate.months = [
		{count:1, month:$scope.theDate.current.getMonth() + 1, phrase:'', current:'current' },
		{count:2, month:$scope.theDate.current.getMonth() + 2, phrase:'', current:'oneAhead' },
		{count:3, month:$scope.theDate.current.getMonth() + 3, phrase:'', current:'twoAhead'},
		{count:4, month:'', phrase:'Show All Dates',current:[]}
		];
	$scope.displayMonth = ["zero","January","February","March","April","May","June","July","August","September","October","November","December","January","February","March"];
	fetchData()
	
	function fetchData(){
		for(var i = 0; i < spListData.query.length; i++) {
			var list = spListData.query[i].list;
			var array = spListData.query[i].array;
			getListData(list, array)
			if(i === 3){
				populate()
			}
		}
	}
		
	function populate(){
		if(spListData.classes.length != 0 && spListData.pics.length != 0 && spListData.success.length != 0 && spListData.courses.length != 0){
				var countDisciplines = [];
				$scope.$apply(function(){
					$scope.wait = "";
					for (var i = 0; i < spListData.pics.length; i++) {
						if(spListData.pics[i].Featured === true) {
						$scope.pics.push(spListData.pics[i]);
						}
					}
					
					for (var i = 0; i < spListData.success.length; i++) {
						$scope.success.push(spListData.success[i]);
					}
					
					for (var i = 0; i < spListData.courses.length; i++) {
						var course = spListData.courses[i];
						// Set Functions for each Discpline
						var getFunction = setFunction(course.PrimaryDiscipline)
						course.CorpFunction = getFunction[0];
						course.CorpOrder = getFunction[1];
						$scope.courses.push(course);
						if(!unique($scope.CorpFunctions, course.CorpFunction)){
							$scope.CorpFunctions.push(course.CorpFunction);
						}
						if(!unique(countDisciplines, course.PrimaryDiscipline)){
							countDisciplines.push(course.PrimaryDiscipline);
						}
						if(course.AdditionalDisciplines.results.length != 0){
							for (var a = 0; a < course.AdditionalDisciplines.results.length; a++) {
								if(!unique(countDisciplines, course.AdditionalDisciplines.results[a])) {
									countDisciplines.push(course.AdditionalDisciplines.results[a]);
								}
							}
						}
					}
					for (var i = 0; i < spListData.classes.length; i++) {
						var index = spListData.classes[i].CourseTitleId;
						var course = $.grep(spListData.courses, function(c, i) { return c.Id === index; });
						spListData.classes[i]['course'] = course[0];
						var date = new Date(spListData.classes[i].StartDate);
						spListData.classes[i].current = isCurrent(date, $scope.date)  
						//alert(spListData.classes[i].current);
						$scope.classes.push(spListData.classes[i]);
					}
					for (var i = 0; i < countDisciplines.length; i++) {
						var disc = countDisciplines[i];
						var func = setFunction(disc)
						$scope.Disciplines.push({'name':disc, 'func':func[0], 'order':func[1]});
						//console.log('counting: ' + disc + ', function:' + func[0] + ', order: ' + func[1]);
					}
				});	// end $apply
				clearInterval(timer)
				//console.log('all arrays populated, clearing timer.')
		}
	} // end populate()
	var timer = setInterval(populate, 100);	
	

	$scope.random = function(){
	    return Math.random();
	};
	
	function unique(arr, item) { // Check for duplicates in array
		for (var i = 0;i < arr.length; i++) {
			if (arr[i] == item) {return true;} else {continue;} 
		} return false;
	}
	
	$scope.showFilters = function($event) {
		$('#collapseMain').toggle();
	}
	
	$scope.clear = function($event){ // clear search filters
		$scope.search = '';
		$scope.searchfilters = {};
		$scope.findclass = '';
		$('#collapseMain').hide();
		$('h2.searchResults').hide();
	}
	
	$scope.searchingcourses = function() {
		$('ul.nav-tabs li.globalList').addClass('active');
		$('#global').addClass('active');
		$('.panel-collapse.courses').addClass('in');
		$('li.home, li.overviews, li.calendar').removeClass('active');
		$('#home, #overviews, #calendar').removeClass('active');
		$('#calendarA, #calendarB, #calendarC, #calendarD').addClass('in');
		$('h2.searchResults').show();
	}

	$scope.findclasses = function(course) {
		$('ul.nav-tabs li.calendar').addClass('active');
		$('#calendar').addClass('active');
		$('ul.nav-tabs li.globalList').removeClass('active');
		$('#global').removeClass('active');
		$('h2.searchResults').show();
		$scope.findclass = course;
	}
	
	$scope.searchfilters = {};
	$scope.searchfilters.disc = [];
	$scope.searchfilters.skill = [];
	$scope.searchfilters.type = [];
	
	$scope.searchfilters.fill = function(option){
		$scope.searchingcourses()
		var index = $scope.searchfilters.disc.indexOf(option);
		
		// is currently selected
		if (index > -1) { // if already in array
			$scope.searchfilters.disc.splice(index, 1);
			//alert('removed ' + option + ' - new array: ' + $scope.searchfilters.disc);
		} else { // is newly selected 
			$scope.searchfilters.disc.push(option);
			//alert('added ' + option + ' - new array: ' + $scope.searchfilters.disc);
		}
			
	}
	
	$scope.searchfilters.filter = function(){ // ######################### TODO - this #################################
	    
	    	return function(input) {
		       	var index = $scope.searchfilters.disc.indexOf(input.PrimaryDiscipline);
		        alert('searchfilters.filter ' + input);
				if ($scope.searchfilters.disc.length === 0) {
					return input;
				}	
	   	    }
	} // ######################### TODO - this #################################

	
	
	// Begin Query Dependent Animations
		// Home Page Slideshow	
		$('.carousel').carousel();
		
		$('.carousel').hover(function(){
			$('.carousel-description').show().effect('slide',{direction:"down"}, 'slow');
			$('.carousel-caption').hide();
		}, function(){ 
			$('.carousel-description').hide().effect('slide',{direction:"up"},'slow');
			$('.carousel-caption').show();
		});
	
			
		// Calendar Hovers	
		$('.details').hover(function(){
			//console.log('hovers firing');
			$(this).children('.hoverUp').show();
		}, function(){
			$(this).children('.hoverUp').hide();
		});
		
		// Search Option Datepickers
		$( "#endDate" ).datepicker();
		$( "#startDate" ).datepicker();
	
}]);  // End of angular calendarController

angular.module('filters', [])
    .filter('truncate', function () {
        return function (text, length, end) {
        	if (length === undefined || length === null) {length = 10;}
            if (isNaN(length)) { length = 10; }
			else if (length < 10) { end = ""; }
            else if (end === undefined) { end = "..."; }
            if (text.length <= length || text.length - end.length <= length) { return text; }
            else { return String(text).substring(0, length-end.length) + end; }
        };
    })
    .filter('clean', function() {
    return function(input) {
      var out = "";
      out = input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
      return out;
    }
  })
  .filter('courseoptions', function() {
    return function(input, options) {
    	//console.log('options: ' + options.disc.length);
       	if(options.disc.length === 0){
    		return input;
		} else {
		    var index = options.disc.indexOf(input[0].PrimaryDiscipline);
			if ( index > -1) {
				return input;
			}
		}
			for (var i = 0; i < input[0].AdditionalDisciplines.results.length; i++) {
				var ad = input[0].AdditionalDisciplines.results[i];
				var index = options.disc.indexOf(ad);
				//console.log('ad index ' + index);
				if (index > -1) {
					return input;
				}
			}
		
    }
  });   
   
    

function isCurrent(classDate, currentDate){
	var current;
	var classMonth = classDate.getMonth();
	var classYear = classDate.getYear();
	var currentMonth = currentDate.getMonth();
	var currentYear = currentDate.getYear();
	
	
	
	if ( classDate >= currentDate ) {
		if ( classYear === currentYear ) {
			if ( classMonth === currentMonth ) {
				current = 'current';
			} else if ( classMonth === currentMonth + 1 ) {
			current = 'oneAhead';	
			} else if ( classMonth === currentMonth + 2 ) {
			current = 'twoAhead';
			} else current = 'farAhead';
		} else if ( classYear > currentYear ) {
			if ( currentMonth -10 === classMonth ) {
				current = 'twoAhead';
			} else if ( currentMonth -11 === classMonth ) {
				current = 'oneAhead';
			} else current = 'farAhead';
		}	
	} else current = 'past';
	return current;
}

// Various mouseover and animation effects for view
$(document).ready(function(){
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
	
	/* works but not used
	$('.disc-btn').click(function(){
		var contentWhere = $('#discipline').offset();
        var target = $(this).siblings('.browseDiscipline');
		target.effect('slide',{direction:"down"}).show();
	}); */
	
	$('a.back').click(function(){
		$(this).parent().hide();
	});
	

$(".accordion-inner .accordion-group").hover(
    function(){
		$(this).children('.collapse').show();        
    },
    function(){
        $(this).children('.collapse').hide();
        $('.datepicker').blur();
    }
);		

}); // end Document Ready




//EOF