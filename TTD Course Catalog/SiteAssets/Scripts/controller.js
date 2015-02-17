'use strict'; // This is now enabled, forces strict mode. 

/* 
	*** Corporate Functions for Disciplines ***
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	(disciplines are set in Course Catalog, 
	courses are sorted by Function then Discipline in Global Course List, 
	update these below as needed)
*/
function setFunction(discipline) {
    var CorpFunction = [];
    switch(discipline) {
        case 'Geoscience':
        case 'Reservoir Engineering':
            CorpFunction[0] = 'Geoscience and Reservoir Engineering';
            CorpFunction[1] = 1;
            break;
        case 'Drilling and Completions Engineering':
            CorpFunction[0] = 'Global Wells';
            CorpFunction[1] = 2;
            break;
        case 'Production Engineering':
        case 'Facilities/Process Engineering':
            CorpFunction[0] = 'Global Production';
            CorpFunction[1] = 3;
            break;
        case 'Deep Water':
            CorpFunction[0] = 'Deep Water';
            CorpFunction[1] = 4;
            break;
        case 'New Hire Training':
        case 'Individual Development':
        case 'Supervisor Training':
        case 'Instructor Development':
            CorpFunction[0] = 'Leadership and Professional Development';
            CorpFunction[1] = 5;   
            break;    
        case 'Technical Instructor Program':
        case 'Engineering Academy':
            CorpFunction[0] = 'Technical and Professional Development';
            CorpFunction[1] = 6;   
            break;    
        default:
            CorpFunction[0] = 'Not Determined';
            CorpFunction[1] = 7;
    }
    return CorpFunction;
}

function setSkills(skill) {
	var skillSet = [];
	switch(skill) {
		case 'Awareness':
			skillSet[1] = 'aware';
			skillSet[0] = 0;
			break;
		case 'Basic Application':
			skillSet[1] = 'basic';
			skillSet[0] = 1;
			break;
		case 'Professional Application':
		case 'Proficient':
			skillSet[1] = 'profe';
			skillSet[0] = 2;
			break;
		case 'Expert':
			skillSet[1] = 'expert';
			skillSet[0] = 3;
			break;
	}
	return skillSet;
}

// ------------------------------- THIS IS BASIC SHAREPOINT FUNCTIONALITY ----------------------------------
// Global Declarations
var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
var web = context.get_web();
var url = context.get_url();

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
	var nameSpace = name.indexOf(' ');
	if(nameSpace > -1) { name = name.split(',')[1]; name = name.split(' ')[1]; name = name.trim(); }
$('#message').text('Hi ' + name + ', what would you like to learn?');
}

//-----------------------------------------------------------------------------------------------------------
// This function is executed if the GetUserName call fails
function onGetUserNameFail(sender, args) {
alert('Failed to get user name. Error:' + args.get_message());
}
// ------------------------------- THIS IS MAIN CONTEXT - CUSTOM TTD FUNCTIONALITY --------------------------

//make this a function so I can call it before Angular.js needs the retrieved data
//-----------------------------------------------------------------------------------------------------------

/* 
	*** Custom Objects for TTD SP List Data ***
	~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	(these are used for getListData below - json data is 
	pushed to these arrays then pushed into angular $scope
	arrays inside the angular controller populate function)
*/

var spListData = {}; 
spListData.courses = []; 
spListData.classes = []; 
spListData.success = []; 
spListData.pics = [];
spListData.query = [
		{list:'Course Catalog', array:spListData.courses, filter:'?$top=500&$select=Title,PrimaryDiscipline,SkillLevel,CourseDescription,ID'},
		{list:'Training Calendar', array:spListData.classes, filter:''},
		{list:'SuccessStories',array:spListData.success, filter:''},
		{list:'Slideshow Images', array:spListData.pics, filter:''}	
		];



/**********************************************
  ***  Retrieve JSON Data from SP Lists   *****
  *********************************************/

function getListData(list, array, filter) {
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
					url: url + "/_api/web/lists/getByTitle('" + list + "')/items" + filter,
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
				//console.log(JSON.stringify(jsonObject));
	
	            var listitems = jsonObject.d.results;
	
	            //Move the parsed results from the SP query into spListData.classes array
	            for (var a = 0; a < listitems.length; a++) { //iterate the index variable over the number of items in the Calendar
	                array.push(listitems[a]);
	
	            }// spListData.classes array now populated　
	　		//console.log(list + ' populated: ' + array);
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



/**********************************************
  *****    Update SharePoint List Item    *****
  *********************************************/

var oListItem;

function updateListItem()
{
        var clientContext = new SP.ClientContext('/');
        var oList = clientContext.get_web().get_lists().getByTitle('Training Calendar');
     
        this.oListItem = oList.getItemById(3);

        oListItem.set_item('Title', 'Updated Title by Javascript');
        oListItem.update();

      clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));

  }

 function onQuerySucceeded()
 {
        alert('Item updated!');
  }

function onQueryFailed(sender, args)
 {
        alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
        // Access denied. You do not have permission to perform this action or access this resource. undefined
 }

// end Update SharePoint List Item



/*  *********************************************************************************************************
	***									    															  ***
	***                  			      BEGIN ANGULAR APPLICATION       			                      ***
	***					                                						  						  ***
	*********************************************************************************************************/
var app = angular.module('calendar', ['filters','ngSanitize'])


/******************************************
 ***  Begin Angular calendarController  ***
*******************************************/

app.controller('calendarController', ['$scope', function($scope) {

	// Create arrays to hold JSON data from SP Lists
	$scope.classes = [];	
 	$scope.pics = [];
	$scope.success = [];
	$scope.courses = [];
	
	// Create arrays for Search Filters
	$scope.CorpFunctions = [];
	$scope.Disciplines = [];
	$scope.SkillLevel = [];
	$scope.ClassType = [];
	$scope.Locations = [];
	
	// Display message while Angular data loads
	$scope.wait = "Loading courses...";
	
	// Determine current date and subsequent months for sorting Upcoming Calendar	
	$scope.theDate = {};
	$scope.theDate.current = new Date();
	$scope.theDate.months = [
		{count:1, month:$scope.theDate.current.getMonth() + 1, phrase:'', current:'current' },
		{count:2, month:$scope.theDate.current.getMonth() + 2, phrase:'', current:'oneAhead' },
		{count:3, month:$scope.theDate.current.getMonth() + 3, phrase:'', current:'twoAhead'},
		];
	$scope.displayMonth = ["Show All Dates","January","February","March","April","May","June",
	"July","August","September","October","November","December","January","February","March"];
	
	
	
	fetchData()
	
	// Fetch JSON data from SP Lists, WAIT until all lists have finished THEN populate angular controller
	function fetchData(){
		for(var i = 0; i < spListData.query.length; i++) {
			var list = spListData.query[i].list;
			var array = spListData.query[i].array;
			var filter = spListData.query[i].filter;
			getListData(list, array, filter)
			if(i === 3){
				populate()
			}
		}
	}
		
	// AFTER all JSON queries have finished, process information as needed and push into Angular $scope arrays
	function populate(){ 
			if(spListData.courses.length != 0 && spListData.pics.length != 0 && spListData.success.length != 0 && spListData.classes.length != 0){
			
				// set temporary arrays for counting search filters
				var countDisciplines = [];
				var countSkills = [];
				var countType = [];
				var countLocations = [];
				
				
				$scope.$apply(function(){
					$scope.wait = "";
					
					// SP List: SLIDESHOW IMAGES
					for (var i = 0; i < spListData.pics.length; i++) {
						// only use pics if "Featured" is checked
						if(spListData.pics[i].Featured === true) {
						$scope.pics.push(spListData.pics[i]);
						}
					}
					
					// SP List: SUCCESS STORIES
					for (var i = 0; i < spListData.success.length; i++) {
						$scope.success.push(spListData.success[i]);
					}
					
					// SP List: COURSE CATALOG
					for (var i = 0; i < spListData.courses.length; i++) {
						var course = spListData.courses[i];
						// Set Functions for each Discpline
						var getFunction = setFunction(course.PrimaryDiscipline)
						course.CorpFunction = getFunction[0];
						course.CorpOrder = getFunction[1];
						$scope.courses.push(course);

						// Count fields for Sorting and Search Filters  
						if(!unique(countSkills, course.SkillLevel)) {
						 countSkills.push(course.SkillLevel);
						}

						if(!unique($scope.CorpFunctions, course.CorpFunction)){
							$scope.CorpFunctions.push(course.CorpFunction);
						}
						if(!unique(countDisciplines, course.PrimaryDiscipline)){
							countDisciplines.push(course.PrimaryDiscipline);
						}
						if(course.AdditionalDisciplines != null){ 
							for (var a = 0; a < course.AdditionalDisciplines.results.length; a++) {
								if(!unique(countDisciplines, course.AdditionalDisciplines.results[a])) {
									countDisciplines.push(course.AdditionalDisciplines.results[a]);
								}
							}
						}
					}
					
					// SP List: TRAINING CALENDAR
					for (var i = 0; i < spListData.classes.length; i++) {
						// match each Class to its Course by CourseTitleId
						var index = spListData.classes[i].CourseTitleId;
						var course = $.grep(spListData.courses, function(c, i) { return c.Id === index; });
						spListData.classes[i]['course'] = course[0];
						
						// determine whether class is current, upcoming or already passed
						var date = new Date(spListData.classes[i].StartDate);
						spListData.classes[i].current = isCurrent(date, $scope.theDate.current)  
						$scope.classes.push(spListData.classes[i]);
						
						// Count fields for Sorting and Search Filters
						if(!unique(countType, spListData.classes[i].ClassType)) {
							countType.push(spListData.classes[i].ClassType);
						}
						
						if(!unique(countLocations, spListData.classes[i].City)) {
							countLocations.push(spListData.classes[i].City);
						}

					}

				
					// Collect all counted fields and push into $scope arrays for display -
					// These will take unique options found in list above and populate filter checkboxes.
					for (var i = 0; i < countDisciplines.length; i++) {
						var disc = countDisciplines[i];
						var func = setFunction(disc)
						$scope.Disciplines.push({'name':disc, 'func':func[0], 'order':func[1]});
					}
					for (var i = 0; i < countSkills.length; i++) {
						var skill = countSkills[i];
						var skillSet = setSkills(skill);
						$scope.SkillLevel.push({'name':countSkills[i], 'order':skillSet[0], 'shortName':skillSet[1]});
					}
					for (var i = 0; i < countType.length; i++) {
						$scope.ClassType.push(countType[i]);
					}
					for (var i = 0; i < countLocations.length; i++) {
						$scope.Locations.push(countLocations[i]);
					}
					

				});	// end $apply
				clearInterval(timer)		
		}
	} // end populate()
	var timer = setInterval(populate, 1000);	
	
	// To pull Success Stories in random order
	$scope.random = function(){
	    return Math.random();
	};
	
	// To check for duplicates in array
	function unique(arr, item) { 
		for (var i = 0;i < arr.length; i++) {
			if (arr[i] == item) {return true;} else {continue;} 
		} return false;
	}
	
/*********************************************
  ***  Begin Interactive Search Functions  ***
  ********************************************/
	
	$scope.showFilters = function($event) {
		$('#collapseMain').toggle();
	}
	
	$scope.splice = function(filter, option) {
		if(option.hasOwnProperty('name')){ option = option.name; }
		//console.log('splicing ' + JSON.stringify(filter) + ' ' + option);
		var index = filter.indexOf(option);
		filter.splice(index, 1);
		var clean = option.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
		$('.checkboxes input.' + clean).attr('checked', false);
		if(filter.length === 0) {
			//console.log('clear and reset filters');		
			
		}
	}
	
	$scope.clear = function($event){ // clear search filters
	// TODO - fix this and convert to breadcrumb functionality		
			$scope.search = null;
			$scope.searchfilters.disc = [];
			$scope.searchfilters.skill = [];
			$scope.searchfilters.type = [];
			$scope.searchfilters.loc = [];
			$scope.findclass = null;
			$('h2.searchResults').hide();
			$('.checkboxes input').attr('checked', false);
	}
	
	$scope.expand = function($event) {
		$('.accordion-heading.expand').hide();
		$('.accordion-heading.collapse').show();
		$('.panel-collapse .panel-collapse').addClass('in');
		$('.panel-collapse.courses').addClass('in');
	}
	
	$scope.collapse = function($event) {
		$('.accordion-heading.collapse').hide();
		$('.accordion-heading.expand').show();
		$('.panel-collapse .panel-collapse').removeClass('in');
		$('.panel-collapse.courses').removeClass('in');
	}

	
	// Open Global Course List and each Discipline, show Search Results bar
	$scope.searchingcourses = function() {
		$('.panel-collapse.courses').addClass('in');
		$('#calendarA, #calendarB, #calendarC, #calendarD').addClass('in');
		$('h2.searchResults').show();		
		/*
		$('ul.nav-tabs li.globalList').addClass('active');
		$('#global').addClass('active');
		$('li.home, li.overviews, li.calendar').removeClass('active');
		$('#home, #overviews, #calendar').removeClass('active');
		*/
	}
	
	// Open Training Calendar Tab and each Discipline, show Search Results bar
	$scope.searchingclasses = function() {
		$('ul.nav-tabs li.calendar').addClass('active');
		$('#calendar').addClass('active');
		$('.panel-collapse.courses').addClass('in');
		$('#calendarA, #calendarB, #calendarC, #calendarD').addClass('in');
		$('h2.searchResults').show();
		$('li.home, li.overviews, li.globalList').removeClass('active');
		$('#home, #overviews, #global').removeClass('active');
	}

	// for "Find Upcoming Classes" button on each course
	$scope.findclasses = function(course) {
		$('ul.nav-tabs li.calendar').addClass('active');
		$('#calendar').addClass('active');
		$('ul.nav-tabs li.globalList').removeClass('active');
		$('#global').removeClass('active');
		$('h2.searchResults').show();
		$scope.findclass = course;
	}
	
	// for "Show All Upcoming Classes" on Calendar tab
	$scope.collapsecal = function () {
		$(this).children()
		$('.panel-collapse.courses.in').removeClass('in');
		$('.panel-collapse.courses').siblings('.panel-heading h2 a i').removeClass('glyphicon-chevron-down');
		$('.panel-collapse.courses').siblings('.panel-heading h2 a i').addClass('glyphicon-chevron-right');

	}

/***************************************************
  ***  Create $scope arrays for Search Options   ***
  **************************************************/

	$scope.searchfilters = {};
	$scope.searchfilters.disc = [];
	$scope.searchfilters.skill = [];
	$scope.searchfilters.type = [];
	$scope.searchfilters.loc = [];
	
	// When search filter checkboxes are selected/unselected, toggle these arrays. 
	
	
	$scope.searchfilters.checkDisc = function(option){
		// for Discipline checkboxes
		
		$scope.searchingcourses() 
		var disc = $scope.searchfilters.disc.indexOf(option);
		
		if (disc > -1) { // if already in array
			$scope.searchfilters.disc.splice(disc, 1);
			//alert(option + ' already in array, removing. New array: ' + $scope.searchfilters.disc);			
		} else { // if discipline is newly selected 
			$scope.searchfilters.disc.push(option);
			//alert(option + ' not in array, adding. New array: ' + $scope.searchfilters.disc);
		}			
	}
	

	$scope.searchfilters.checkSkill = function(option) {
		// For Skill Level checkboxes
	
		$scope.searchingcourses()
		var match = checkArray($scope.searchfilters.skill, option);
		
		if ( $scope.searchfilters.skill.length === 0 ) {
			$scope.searchfilters.skill.push(option);
		} else {
			var match = checkArray($scope.searchfilters.skill, option)
			if ( match === '' ) {
				$scope.searchfilters.skill.push(option);
			} else {
				$scope.searchfilters.skill.splice(match, 1);
			}
		}
	}
	
	
	// Custom unique function to include property 'shortName' for Skills only
	function checkArray(array, option) {
		var match = ''
		for ( var counter = 0; counter < array.length; counter++) {
			if ( array[counter].shortName === option.shortName ) {
				match = counter;
				return match;
			} else { continue; }
		} return match;
	}
	
	
	$scope.searchfilters.checkType = function(option){
	
		$scope.searchingclasses()
		var array = $scope.searchfilters.type;
		var type = array.indexOf(option);
		
		// for Course Type checkboxes
		if ( array.length === 0 ) {
			array.push(option);
			//alert('array empty, pushing ' + option + ', new array: ' + array);
		} else if ( type > -1 ) { // if already in array
			array.splice(type, 1);
			//alert(option + ' already in array, removing. new array: ' + array);
		} else { // if skill is newly selected 
			array.push(option);
			//alert(option + ' not in array, adding. new array: ' + array);
		}			
	}

	$scope.searchfilters.checkLocation = function(option) {
		
		$scope.searchingclasses()
		var array = $scope.searchfilters.loc;
		var location = array.indexOf(option);
		
		// For Location checkboxes
		if ( array.length === 0 ) {
			array.push(option);
			//alert('array empty, pushing ' + option + ', new array: ' + array);
		} else if ( location > -1 ) {
			array.splice(location, 1);
			//alert(option + ' already in array, removing. new array: ' + array);
		} else {
			array.push(option);
			//alert(option + ' not in array, pushing. new array: ' + array);
		}
	}	
	
/*****************************************************
  *** Begin Animations Dependent on Angular Data   ***
  ****************************************************/


		// FIXED Home Page Slideshow
		$scope.myInterval = 5000;
		var slides = $scope.slides = [];
		$scope.addSlide = function() {
			var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
			slides.push({
			image: 'http://placekitten.com/' + newWidth + '/200',
			text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
			['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
			});
		};
		for (var i=0; i<4; i++) {
			$scope.addSlide();
		}

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
	
}]);  // End of Angular calendarController


app.config(function ($routeProvider) {
	$routeProvider
		.when('/',
			{
				controller: 'calendarController',
				templateUrl: '../SiteAssets/Views/viewSearchOptions.html'
			})
})

/***************************************** 
	***  Begin Custom Angular Filters  ***
    **************************************/
    
angular.module('filters', []) 
	
	// TRUNCATE FILTER
    .filter('truncate', function () {
        return function (text, length, end) {
        	if(text) {
	        	if (length === undefined || length === null) {length = 10;}
	            if (isNaN(length)) { length = 10; }
				else if (length < 10) { end = ""; }
	            else if (end === undefined) { end = "..."; }
	            if (text.length <= length || text.length - end.length <= length) { return text; }
	            else { return String(text).substring(0, length-end.length) + end; }
            }
        };
    })
    
    // CLEAN FILTER (remove spaces and special characters)
    .filter('clean', function() {
    return function(input) {
      var out = "";
	  if(input){
      	out = input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
      }
      return out;
    }
  })
  
  .filter('courseoptions', function() {
  return function( items, options ) {
    var filtered = [];
    
    var disc = options.disc;
    var skill = options.skill;
    
    angular.forEach(items, function(item) {
    
	    
	    var discMatch = checkDisc(disc, item)
	    var skillMatch = checkSkill(skill, item)
	       
	       
	    // If any Discipline or Skill Levels are checked, return only items that match all selections.   
		if( discMatch && skillMatch ) {
			filtered.push(item);
		}
  
    });
    
	function checkDisc(array, item) {
		// Check each item against Discipline Filter
		var discMatch = false;
		var discIndex = array.indexOf(item.PrimaryDiscipline);
		
		// If no Disciplines are checked, return all true.
		if ( array.length === 0 ) { 
			discMatch = true; 
		} else if ( discIndex > -1 ) { 
			// If Primary Discipline matches, return true.
			discMatch = true; 
		} else if ( item.AdditionalDisciplines != undefined ) {
		
			// If any Additional Disciplines match, return true.
			var AD = item.AdditionalDisciplines;
			for ( var i = 0; i < AD.results.length; i++ ) {
				var adIndex = array.indexOf(AD.results[i]);
				if ( adIndex > -1 ) { 
					discMatch = true; 
				}
			}
		}
		return discMatch;
	}  
	
	function checkSkill(skill, item) {
		// Check each item against Skill Level Filter
		var skillMatch = false;
		
		// If no Skill Levels are checked, return true.
		if ( skill.length === 0 ) {
			skillMatch = true;
		} else { 
			// else if Skill Level matches, return true.
			for ( var i = 0; i < skill.length; i++ ) {
				if ( skill[i].name === item.SkillLevel ) {
					skillMatch = true;
				} 			}	 
		}
		return skillMatch;
	}
    
    
    return filtered;
  };
	

})

.filter('classoptions', function() {
  return function( items, options ) {
    var filtered = [];
    
    var type = options.type;
    var location = options.loc;
    var date = options.date;
    
    angular.forEach(items, function(item) {
    
	    
	    var typeMatch = checkType(type, item)
	    var locationMatch = checkLocation(location, item)
	    var dateMatch = checkDate(date, item)
	       
	       
	    // If any Class Type, Location, or Start Date is checked, 
	    // return only items that match all selections.   
		if( typeMatch && locationMatch && dateMatch ) {
			filtered.push(item);
		}
  
    });
    
	function checkType(array, item) {
		// Check each item against Class Type Filter
		var typeMatch = false;
		var typeIndex = array.indexOf(item.ClassType);
		
		// If no Class Types are checked, return all true.
		if ( array.length === 0 ) { 
			typeMatch = true; 
		} else if ( typeIndex > -1 ) { 
			// If Class Type matches, return true.
			typeMatch = true; 
		}
		return typeMatch;
	}  
	
	function checkLocation(location, item) {
		// Check each item against Location Filter
		var locationMatch = false;
		
		// If no Locationss are checked, return true.
		if ( location.length === 0 ) {
			locationMatch = true;
		} else { 
			// else if Location matches, return true.
			for ( var i = 0; i < location.length; i++ ) {
				if ( location[i] === item.City ) {
					locationMatch = true;
				} 			}	 
		}
		return locationMatch;
	}
	
	function checkDate(date, item) {
		// Check each item against Date Filter
		var dateMatch = false;
		if (!date) {
			// if no date is checked, return true
			dateMatch = true;
		} else {
			// else if item date is <= selected date, return true.
			var pickedDate = new Date(date).format('MM dd yyyy');
			var itemDate = new Date(item.StartDate).format('MM dd yyyy');
			if ( pickedDate <= itemDate ) {
				dateMatch = true;
			}
		}
		return dateMatch;
	}
    
    return filtered;
  };
	

});
   
// Determine the dynamic height/width of browser window
app.directive('resize', function ($window) {
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
    });

// Add input textbox placeholder for IE   
app.directive('placeholder', function() {
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
   
/*  *********************************************************************************************************
	***									    															  ***
	***                  			        END ANGULAR APPLICATION       			                      ***
	***					                                						  						  ***
	*********************************************************************************************************/
    

// Determine if Class date is current, upcoming or past
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



/*  *********************************************************************************************************
	***									    															  ***
	***                 	      BEGIN MISCELLANEOUS VIEW EFFECTS       			                      ***
	***					                                						  						  ***
	*********************************************************************************************************/

$(document).ready(function(){
    // Main Nav Dropdown Panels
    $('#mega ul li, #mega ul li > .subNav').hover(function(){
		/*$(this).children('.subNav').css('display','block');*/
        var where = $('#mega').offset();
        var megaWidth = $('#mega').width();
        $('body').delay(100).addClass('shadow');
		$('.subNav').css('top',where.top + 37);
		$('.subNav').css('left',where.left);
		$('.subNav').css('width',megaWidth);
		$(this).children('.subNav').show();		
	}, function(){
		$(this).children('.subNav').stop().hide();
		$('body').removeClass('shadow');		
	});	
		
		
	$('.searchGroup').hover(function(){
		var where = $(this).children('.accordion-heading').offset();
		$(this).children('.accordion-body').css('top', where.top - 35);
		$(this).children('.accordion-body').css('left', where.left);

	})	
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
	
	$('.icon').hover(function() {
		$(this).children('.iconHover').show();
	}, function(){
		$(this).children('.iconHover').hide();
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

// Animated spinner while catalog loads
var opts = {
  //lines: 13, // The number of lines to draw
  length: 10, // The length of each line
  //width: 10, // The line thickness
  //radius: 30, // The radius of the inner circle
  corners: 5, // Corner roundness (0..1)
  //rotate: 0, // The rotation offset
  //direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#fff', // #rgb or #rrggbb or array of colors
  //speed: 1, // Rounds per second
  //trail: 60, // Afterglow percentage
  //shadow: false, // Whether to render a shadow
  //hwaccel: false, // Whether to use hardware acceleration
  //className: 'spinner', // The CSS class to assign to the spinner
  //zIndex: 2e9, // The z-index (defaults to 2000000000)
  //top: 'auto', // Top position relative to parent in px
  //left: 'auto' // Left position relative to parent in px
};
var target = document.getElementById('spinner');
var spinner = new Spinner(opts).spin(target);

}); // end Document Ready




//EOF