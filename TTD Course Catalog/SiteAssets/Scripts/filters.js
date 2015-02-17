'use strict';

/***************************************** 
	***  Begin Custom Angular Filters  ***
    **************************************/
    
angular.module('app.filters', [])
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
  
  .filter('coursefilters', function($log){
  	return function ( items, filters ) {
  		var filtered = [];
   				
  		var disciplines = filters.disciplines;
  		var disciplineArray = [];
		angular.forEach(disciplines, function(discipline) {
			if(discipline.selected) { disciplineArray.push(discipline.name)}
		});
		
		var skills = filters.skills;
		var skillArray = [];
		angular.forEach(skills, function(skill) {
			if(skill.selected) {skillArray.push(skill.name)}
		});

  		angular.forEach(items, function(item) {
  			var primary = disciplineArray.indexOf(item.PrimaryDiscipline);
			var skill = skillArray.indexOf(item.SkillLevel);  		
							
  			if ( disciplineArray.length === 0 || primary != -1 ) {
  				if ( skillArray.length === 0 || skill != -1 ) {
  					filtered.push(item);
  				}
  			}	  			
  		});
  		return filtered;
  	}
  })
  
  .filter('classfilters', function($log, $filter){
  	return function ( items, filters ) {
  		var filtered = [];

  		var types = filters.types;
  		var typeArray = [];
  		angular.forEach(types, function(type) {
  			if(type.selected) { typeArray.push(type.name)}
  		});
  		
  		var locations = filters.locations;
  		var locationArray = [];
  		angular.forEach(locations, function(location) {
  			if(location.selected) { locationArray.push(location.name) }
  		});
  		
  		if(filters.date){
  			$log.info(filters.date); 
  		}
  		
  		angular.forEach(items, function(item) {
  		  	var date = true;
  			var type = typeArray.indexOf(item.ClassType);
			var location = locationArray.indexOf(item.City);
			if(filters.date){
				var startDate = $filter('date')(item.StartDate, 'MM/dd/yyyy');
				if (startDate < filters.date) {
					date = false;
				} 
			}
				
			if ( typeArray.length === 0 || type != -1 ) {
  				if ( locationArray.length === 0 || location != -1 ) {
  					if(date) {
  						filtered.push(item);
  					}

  				} 
   			}			
  		});
  		return filtered;
  	}
  });
  /*
	.filter('classoptions', function() {
	  return function( items, options ) {
	    var filtered = [];
	    
	    var type = options.type;
	    var location = options.loc;
	    var date = options.date;
	    
	    angular.forEach(items, function(item) {
	    	console.log('testing');
		    
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
	

});*/