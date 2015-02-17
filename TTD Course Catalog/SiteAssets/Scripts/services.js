'use strict';

/* Services */

angular.module('app.services', [])
		
	.factory('manualService', function(){
		return {
			 setFunction: function(discipline) {
			    var CorpFunction = [];
			    switch(discipline) {
			        case 'Geoscience':
			        case 'Geoscience ':
			        case 'Reservoir Engineering':
			            CorpFunction[0] = 'Geoscience and Reservoir Engineering';
			            CorpFunction[1] = 1;
			            break;
			        case 'Drilling and Completions Engineering':
			        case 'Drilling and Completion Engineering':
			            CorpFunction[0] = 'Global Wells';
			            CorpFunction[1] = 2;
			            break;
			        case 'Production Engineering':
			        case 'Facilities/Process Engineering':
			            CorpFunction[0] = 'Global Production';
			            CorpFunction[1] = 3;
			            break;
			        case 'Technical Instructor Program':
			        case 'Engineering Academy':
			        case 'Engineering Academy ':
			        case 'Multidisciplinary':
			        case 'Other':
			        	CorpFunction[0] = 'Technical';
			        	CorpFunction[1] = 4;
			        	break; 
			        case 'Economics':
			        	CorpFunction[0] = 'Economics';
			        	CorpFunction[1] = 5;
			        	break;	   
			        case 'Deep Water':
			            CorpFunction[0] = 'Deep Water';
			            CorpFunction[1] = 6;
			            break;
			        case 'New Hire Training':
			        case 'Individual Development':
			        case 'Supervisor Training':
			        case 'Instructor Development':
			        case 'Professional Development':
			        case 'Leadership':
			            CorpFunction[0] = 'Leadership and Professional Development';
			            CorpFunction[1] = 7;   
			            break;       
			        case '':
			        	CorpFunction[0] = 'TBD';
			        	CorpFunction[1] = 9;
			        	break; 
			        default:
			            CorpFunction[0] = 'Not Determined';
			            CorpFunction[1] = 10;
			    }
			    return CorpFunction;
			},
			setSkills: function (skill) {
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
		}
	})						
				
	.factory('queryService', function(){
		return {
			courses: {
				id: 0,
				title:'Course Catalog',
			 	name: 'courses',
			 	query:'?$top=500&$select=Course_x0020_Title, Primary_x0020_Discipline, Additional_x0020_Disciplines, Skill_x0020_Level, Course_x0020_Description, Learning_x0020_Objectives, Target_x0020_Audience, ID'
				 },
			classes: {
				id: 1,
				title:'Training Calendar', 
				name: 'classes',
			 	query:'?$select=Id, Title, Course_x0020_TitleId, Featured, Region, City, StartDate, EndDate, ClassType, Vendor, InstructorName, ClassID, ClassDetails'
				 },
			stories: {
				id: 2,
				title:'SuccessStories',
				name: 'stories', 
				query:'?$select=Title,Picture,Intro,Hyperlink'
				},
			images: {
				id:	3,
				title:'Slideshow Images', 
				name: 'images', 
				query:'?$select=Title,Featured,Filename,Order,Hyperlink,Description&$filter=Featured eq 1'
				}
			}
	})
	
/*	
	// Retrieve JSON data from SharePoint lists using $http into a promise
	.factory('myCacheService', function(myService, $http, $q, $angularCacheFactory, $log){		
		
		$angularCacheFactory('dataCache', {
		        maxAge: 90000, // Items added to this cache expire after 15 minutes.
		        cacheFlushInterval: 600000, // This cache will clear itself every hour.
		        deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
		    });
		
		return {
			fetchList: function (id, list, params) {
				var ID = String(id);
				var getstring = "/sites/TechnicalTraingDEV/_api/web/lists/getByTitle('" + list + "')/items" + params;
				var getconfig = {cache:$angularCacheFactory.get('dataCache'), headers:{"Accept": "application/json; odata=verbose"}};
				var deferred = $q.defer();
				
				if(dataCache.get(ID)){
					deferred.resolve(dataCache.get(ID));
				} else {	
					$http.get(getstring, getconfig).
					success(function(data, status, headers, config) {
					    dataCache.put(ID, data.d.results);
					    deferred.resolve(data.d.results);
					}).
					error(function(data, status, headers, config) {
						$log.info('request failed');
						deferred.reject(status);
					});						
				}
				return deferred.promise;
			}
		}
	})

*/	
	// Retrieve JSON data from SharePoint lists using $http into a promise
	.factory('getListService', function($http, $q){
		return {
			getList: function (list, params) {
				var getstring = "/sites/TechnicalTraingDEV/_api/web/lists/getByTitle('" + list + "')/items" + params;
				var getconfig = {cache:false,headers:{"Accept": "application/json; odata=verbose"}}
				var deferred = $q.defer();
				$http.get(getstring, getconfig).
				success(function(data, status, headers, config) {
				    deferred.resolve(data.d.results);
				}).
				error(function(data, status, headers, config) {
					console.log('request failed');
					deferred.reject(status);
				});
				return deferred.promise;
			}
		}
	})
	
	.factory('getUserService', function($http, $q, $log){
		return {
			getUser: function(){
				var deferred = $q.defer();
				var getstring = "/sites/TechnicalTraingDEV/_api/web/CurrentUser";
				var getconfig = {cache:true, headers:{ "Accept": "application/json; odata=verbose" }};
				$http.get(getstring, getconfig).
				success(function(data, status, headers, config) {
					deferred.resolve(data);
				}).
				error(function(data, status, headers, config) {
					$log.warn('request failed');
					deferred.reject(status);
				});
				return deferred.promise;
			},
			firstName: function(name){
				var fullName = name;
				var nameSpace = fullName.indexOf(' ');
				if(nameSpace > -1) { shortName = fullName.split(',')[1]; shortName = shortName.split(' ')[1]; shortName = shortName.trim(); }
				return shortName;
			}
		}
	})

	.factory('onlineInquiry', function($log, getUserService){
		var newListItem;
		return {
			go: function(){
				var namePromise = getUserService.getUser();
				namePromise.then(function(data){ 
					
					var name = data.d.Title;
					var email = data.d.Email;
					var comment = $('#tag').val();
					var item = {name: name, email: email, comment: comment}
					var firstName = getUserService.firstName(name);
					var myinput = $('#tag').val();
					var ctx = new SP.ClientContext.get_current();
			        var list = ctx.get_web().get_lists().getByTitle('Online Inquiries');
			        ctx.load(list);
									
					var listItemCreationInfo = new SP.ListItemCreationInformation();
			        this.newItem = list.addItem(listItemCreationInfo);
			        this.newItem.set_item("Title", 'Inquiry from ' + firstName);
			        this.newItem.set_item("Message", myinput);
			        this.newItem.set_item("From", name);
			        this.newItem.set_item("Email", email);
			        this.newItem.update();
			        ctx.load(this.newItem);
			         
			        ctx.executeQueryAsync(
			            Function.createDelegate(this,
			                function () { alert('Thank you for your inquiry, someone will contact you soon. You may also reach us at learning@cop.com.'); }),
			            Function.createDelegate(this,
			                function (sender, args) { $log.warn(sender + ' ' + args); }));
				});			
			}
		}
	})
		
	// Extract filter options from live list data
	.factory('processService', function(manualService, date, $log, $filter) {
		return {
		
			// Get filter options based on Course data
			forCourses: function(list, filters) {
				var disciplines = [];
				var skillLevels = [];
				var returnObject = {};
				returnObject.list = [];
				
				angular.forEach(list, function(item){
					item.PrimaryDiscipline = item.Primary_x0020_Discipline;
					item.SkillLevel = item.Skill_x0020_Level;
					item.TargetAudience = item.Target_x0020_Audience;
					item.CourseDescription = item.Course_x0020_Description;
					item.Title = item.Course_x0020_Title;
					if(item.Additional_x0020_Disciplines) {
					item.AdditionalDisciplines = item.Additional_x0020_Disciplines.split(', ');
					} else {item.AdditionalDisciplines = '';}
					item.LearningObjectives = item.Learning_x0020_Objectives;

					var skill = $.trim(item.SkillLevel);
					if (skill === '') { 
						//$log.info(item.ID + ' ' + item.Title); 
						}
					var getFunction = manualService.setFunction(item.PrimaryDiscipline);
					item.CorpFunction = getFunction[0];
					item.CorpOrder = getFunction[1];
					returnObject.list.push(item);
					
					if ( $.inArray(item.PrimaryDiscipline, disciplines) === -1 ) { disciplines.push(item.PrimaryDiscipline); }					
					if ( $.inArray(item.SkillLevel, skillLevels) === -1 ) { skillLevels.push(item.SkillLevel); }

				});
				
				returnObject.disciplines = [];
				angular.forEach(disciplines, function(discipline) { 
					var getFunction = manualService.setFunction(discipline);
					var pushDiscipline = {name: discipline, CorpFunction: getFunction[0], CorpOrder: getFunction[1], selected: false};
					returnObject.disciplines.push(pushDiscipline);
				});
				
				returnObject.skills = [];
				angular.forEach(skillLevels, function(skillLevel) {
					var pushSkillLevel = {name: skillLevel, selected: false};
					returnObject.skills.push(pushSkillLevel);
				});				
				return returnObject;
			},

			// Get filter options based on Class data
			forClasses: function(classes, courses, filters) {
				var types = [];
				var locations = [];
				var returnObject = {};
				returnObject.list = [];
																
				angular.forEach(classes, function(item){
					item.CourseTitleId = item.Course_x0020_TitleId;
					var index = item.CourseTitleId;
					var course = $.grep(courses, function(c, i) { return c.ID === index; });
					item.course = course[0];
					item.current = date.checkStart(item.StartDate);											
					returnObject.list.push(item);
				
					if ( $.inArray(item.ClassType, types ) === -1 ) { types.push(item.ClassType); }				
					if ( $.inArray(item.City, locations ) === -1 ) {
					 	if(item.current != 'past'){
					 		locations.push(item.City); 
					 	}	
					 }
				});
				
				returnObject.types = [];
				angular.forEach(types, function(type) {
					var pushType = {name: type, selected: false};
					returnObject.types.push(pushType);
				});
				
				returnObject.locations = [];
				angular.forEach(locations, function(location) {
					var pushLocation = {name: location, selected: false};
					returnObject.locations.push(pushLocation);
				});				
				return returnObject;
			},
			
			clearAll: function(filters){
					angular.forEach(filters, function(filter){
						angular.forEach(filter, function(item){
							var cleanname = $filter('clean')(item.name);
							item.selected = false;
							$('input.' + cleanname).prop('checked', false);
						});
					});
			}

		}
	})
	
	.factory('date', function($filter){
		var today = new Date();
		var year = today.getFullYear();
		return {
			now: function(){				
				return today;
			},
			currentMonth: function(){
				var result = {}
				result.month = today.getMonth() + 1; 
				result.string = this.monthString(result.month);
				result.year = year;				
				return result;
			},
			nextMonth: function(){
				var month = today.getMonth() + 2;
				var result = this.rollYear(month);
				return result;
			},
			monthAfter: function(){
				var month = today.getMonth() + 3;
				var result = this.rollYear(month);
				return result;
			},
			monthString: function(x){
				var monthArray = ['error','January','February','March','April','May','June','July','August','September','October','November','December'];
				var month = monthArray[x];
				return month;
			},
			rollYear: function(month){
				var result = {};
				if (month > 12){
					result.month = month - 12;
					result.year = year + 1;
				} else {
					result.month = month;
					result.year = year;
				}
				result.string = this.monthString(result.month);
				return result;
			},
			object: function(){
				var d = {};
				d.today = this.now();
				d.thisMonth = this.currentMonth();
				d.nextMonth = this.nextMonth();
				d.monthAfter = this.monthAfter();
				return d;
			},
			checkStart: function(x){
				var status = '';
				var d = this.object();
				var today = $filter('date')(d.today, 'M-dd-yyyy')
				var start = $filter('date')(x, 'M-dd-yyyy');
				var y = start.split('-');
				var z = {month: y[0], year:y[2], string:this.monthString(y[0])};

				if (today >= start) {
					status = 'past';
				} else if ((z.month == d.thisMonth.month) && (z.year == d.thisMonth.year)) {
					status = 'thisMonth';
				} else if ((z.month == d.nextMonth.month) && (z.year == d.nextMonth.year)) {
					status = 'nextMonth';
				} else if ((z.month == d.monthAfter.month) && (z.year == d.monthAfter.year)) {
					status = 'monthAfter';
				} else {
					status = 'farOut';
				}
				
				return status;
			}
		}
	});

