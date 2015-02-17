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
			skillSet[0] = 3;
			break;
		case 'Expert':
			skillSet[1] = 'expert';
			skillSet[0] = 4;
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
		{list:'Course Catalog', array:spListData.courses},
		{list:'Training Calendar', array:spListData.classes},
		{list:'SuccessStories',array:spListData.success},
		{list:'Slideshow Images', array:spListData.pics}	
		];



/**********************************************
  ***  Retrieve JSON Data from SP Lists   *****
  *********************************************/

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
					url: url + "/_api/web/lists/getByTitle('" + list + "')/items",
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
			getListData(list, array)
			if(i === 3){
				populate()
			}
		}
	}
		
	// AFTER all JSON queries have finished, process information as needed and push into Angular $scope arrays
	function populate(){ 
			if(spListData.classes.length != 0 && spListData.pics.length != 0 && spListData.success.length != 0 && spListData.courses.length != 0){
			
				// set temporary arrays for counting search filters
				var countDisciplines = [];
				var countSkills = [];
				var countType = [];
				
				
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
						if(course.AdditionalDisciplines.results.length != 0){
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

					}
					
					// Collect all counted fields and push into $scope arrays for display
					for (var i = 0; i < countDisciplines.length; i++) {
						var disc = countDisciplines[i];
						var func = setFunction(disc)
						$scope.Disciplines.push({'name':disc, 'func':func[0], 'order':func[1]});
					}
					for (var i = 0; i < countSkills.length; i++) {
						var skillSet = setSkills(countSkills[i]);
						var order = skillSet[0];
						var shortSkill = skillSet[1];
						$scope.SkillLevel.push({'name': countSkills[i], 'shortName': shortSkill, 'order': order});
					}
					for (var i = 0; i < countType.length; i++) {
						$scope.ClassType.push(countType[i]);
					}

				});	// end $apply
				clearInterval(timer)		
		}
	} // end populate()
	var timer = setInterval(populate, 100);	
	
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
		var index = filter.indexOf(option);
		filter.splice(index, 1);
		var clean = option.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
		$('.checkboxes input.' + clean).attr('checked', false);
		if(filter.length === 0) {
			console.log('clear and reset filters');		
			
		}
	}
	
	$scope.clear = function($event){ // clear search filters
	// TODO - fix this and convert to breadcrumb functionality
		$scope.search = null;
		$scope.searchfilters.length = 0;
		$scope.findclass = null;
		$('#collapseMain').hide();
		$('h2.searchResults').hide();
	}
	
	// Open Global Course List and each Discipline, show Search Results bar
	$scope.searchingcourses = function() {
		$('ul.nav-tabs li.globalList').addClass('active');
		$('#global').addClass('active');
		$('.panel-collapse.courses').addClass('in');
		$('#calendarA, #calendarB, #calendarC, #calendarD').addClass('in');
		$('h2.searchResults').show();		
		$('li.home, li.overviews, li.calendar').removeClass('active');
		$('#home, #overviews, #calendar').removeClass('active');

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
	
	
	$scope.searchfilters.checkDisc = function(option){
		
		$scope.searchingcourses() 
		var disc = $scope.searchfilters.disc.indexOf(option);
		
		// for Discipline checkboxes
		if (disc > -1) { // if already in array
			$scope.searchfilters.disc.splice(disc, 1);
			//alert(option + ' already in array, removing. New array: ' + $scope.searchfilters.disc);			
		} else { // if discipline is newly selected 
			$scope.searchfilters.disc.push(option);
			//alert(option + ' not in array, adding. New array: ' + $scope.searchfilters.disc);
		}			
	}
	
	$scope.searchfilters.checkSkill = function(option){
		
		$scope.searchingcourses() 
		var skill = $scope.searchfilters.skill.indexOf(option);
		var skillSet = setSkills(option);
				//alert(skillSet);
		// for Skill Level checkboxes
		if (skill > -1) { // if already in array
			$scope.searchfilters.skill.splice(skill, 1);
			//alert(option + ' already in array, removing. New array: ' + JSON.stringify($scope.searchfilters.skill));
		} else { // if skill is newly selected 
			$scope.searchfilters.skill.push({'name': option, 'shortName': skillSet[1], 'order': skillSet[0]});
			
			//alert(option + ' not in array, adding. New array: ' + JSON.stringify($scope.searchfilters.skill));
		}			
	}
	
	
	$scope.searchfilters.classType = function(option){
	
		$scope.searchingclasses()
		var type = $scope.searchfilters.type.indexOf(option);
		
		// for Course Type checkboxes
		if (type > -1) { // if already in array
			$scope.searchfilters.type.splice(type, 1);
		} else { // if skill is newly selected 
			$scope.searchfilters.type.push(option);
		}			
	}

	/*
	$scope.searchfilters.filter = function(){ // ######################### TODO - this #################################
	    
	    	return function(input) {
		       	var index = $scope.searchfilters.disc.indexOf(input.PrimaryDiscipline);
		        alert('searchfilters.filter ' + input);
				if ($scope.searchfilters.disc.length === 0) {
					return input;
				}	
	   	    }
	} // ######################### TODO - this #################################
*/
	
	

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


/***************************************** 
	***  Begin Custom Angular Filters  ***
    **************************************/
    
angular.module('filters', []) 
	
	// TRUNCATE FILTER
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
    
    // CLEAN FILTER (remove spaces and special characters)
    .filter('clean', function() {
    return function(input) {
      var out = "";
      out = input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
      return out;
    }
  })
  
  // COURSE OPTIONS FILTER 
  // (filter Courses based on $scope.searchfilters as defined above)
  .filter('courseoptions', function() {
    return function(input, options) {
    	//console.log('primary: ' + input[0].PrimaryDiscipline);
    	
    	var skill = setSkills(input[0].SkillLevel)    	
    	var discIndex = options.disc.indexOf(input[0].PrimaryDiscipline);
		var skillIndex = options.skill.indexOf(input[0].SkillLevel);
		console.log('skill: ' + skill[1] + ' ' + skillIndex + ' ' + JSON.stringify(options.skill));
		for (var i = 0; i < input[0].AdditionalDisciplines.results.length; i++) {
				var ad = input[0].AdditionalDisciplines.results[i];
				var adIndex = options.disc.indexOf(ad);
				if (options.disc.length === 0 || discIndex > -1 || adIndex > -1) {
					if(options.skill.length === 0 || skillIndex > -1 ) {
						return input;
					}			
				}
		}	
    }
  })
  /*
  // CLASS OPTIONS FILTER
  // (filter Classes based on $scope.searchfilters as defined above)
  .filter('classoptions', function() {
      return function(input, options) {
  		console.log('classoptions - ' + typeof(input[0].ClassType));
		
       	if( input[0].ClassType === undefined ) {
       	console.log('null');
           	} else { 
           	console.log('else ' + input[0].ClassType);
           	console.log('options ' + options.type);
			var type = options.type.indexOf(input[0].ClassType);
			       	if(options.type.length === 0 ){
			    		return input;
					} else if ( type > -1) {
							return input;
					}  
       	}       	
    }
  })*/;   
   
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