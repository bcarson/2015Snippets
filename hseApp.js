var app = angular.module('hse', [ // Begin AngularJS application, define module dependencies
    'ui.grid', 
    'ui.grid.autoResize',
    'ngAutocomplete',
    'isteven-multi-select',
    'daypilot',
    'ui.calendar',
    'ngTagsInput'
  ]);

app.factory('queryService', function(){
  return {
    one: { // Retrieve these lists first 
      providers: { title:'AvailableProviders', query:'?$select=Title,Id,Name/Name,Name/ID&$expand=Name/Name' },
      services: { title:'AvailableServices', query:'?$select=Title,Id,Duration' },
      locations: { title: 'AvailableLocations', query:'?$select=Title,Id,StartTime,LunchStart,LunchDuration,EndTime' },
      minutes: { title: 'Minutes', query:'?$select=Title,Id&$top=1441'},
      existingBook: { title:'ImportedFromExcel', query:'?$select=Employee,Exposure,Exam,Last,Due&$top=10000' }
    },
    schedules: { 
      title: 'ProviderSchedule', 
      query:'?$select=Title,Id,Location/Title,Provider/Title,Provider/Id,StartDate,StartTime,EndTime,EndDate,Services/Id,Services/Duration,Services/Title,Days&$expand=Location,Provider,Services'
    },
    appointments: { title:'BookedAppointments', query:'?$select=Title,Id,Location,Consumer,Date,StartTime,Duration,Status' }
  }
});// END queryService

app.controller('scheduler', ['$scope','$timeout','$q', '$filter', 'queryService', 'getListService', 'editList', 'getUserService', 'dateTime', 'searchAvailable',
  function($scope, $timeout, $q, $filter, queryService, getListService, editList, getUserService, dateTime, searchAvailable){

    // Get the current user name/id, SP groups and determine whether Provider/Admin:
    var currentUserID = getUserService.getUser();
    currentUserID.then(function(data){
      var groups = getUserService.groups(data.d.Id);
      $scope.currentUser = data.d;
      $scope.currentUser.groups = [];
      groups.then(function(data){
        angular.forEach(data, function(d, i){
          $scope.currentUser.groups.push(d.Title);
          if(d.Title == "Providers"){
            $scope.currentUser.provider = true;
          }
          if(d.Title == "Admin"){
            $scope.currentUser.admin = true;
          }
        });
      });
    });


    /* Pull all SharePoint lists */
    var lookupLists = []; // Initialize empty array to hold all our async promises
    var colors = ['blue','yellow','green','orange','purple','gray','red'];
    var locations = [];
    var providers = [];
    var durations = [];
    $scope.schedule = [];        

    // Using factories defined below, loop through each list and retrieve items from SharePoint
    angular.forEach(queryService.one, function(list, key){ 

      // use Angular promises to handle asynchronous processing
      var promise = getListService.getList(list.title, list.query);
      lookupLists.push(promise); // add each promise to the array

      // After the promise is returned, perform operations if needed then push list items to $scope object.
      promise.then(function(data){

        // loop through each list item in lookup lists
        angular.forEach(data, function(item, index){ // Available Services
            if(key == 'services'){
              item.text = item.Title;
              var index = durations.indexOf(item.Duration);
              if(index == -1) durations.push(item.Duration);
            }
            
            if(key == 'providers'){ // Available Providers
              providers.push({login:item.Name.Name, title:item.Title});
              if($scope.currentUser){
                if(item.Name.Name == $scope.currentUser.LoginName){
                  $scope.currentUser.providerId = item.ID;
                }                    
              }
            }

            if(key == 'locations'){ // Available Locations
              var locIndex = locations.indexOf(item.Title);
              if(locIndex == -1) locations.push(item.Title);                  
            }
        });
        
        $scope[key] = data; // push each list to scope
      });
    });

    $q.all(lookupLists).then(function(){
      // After lookup lists are pulled, pull and process Provider Schedules
      $scope.providerData = {};
      $scope.providerData.Services = $scope.services;
      var currentProvider = $.grep(providers, function(n, i){
          // determine whether current user is a Provider
          return n.login == $scope.currentUser.LoginName;
      });

      var appts = queryService.appointments;
      var getAppts = getListService.getList(appts.title, appts.query);
      getAppts.then(function(data){ $scope.appointments = data; }); // Get Booked Appointments

      var schedule = queryService.schedules;
      var getSchedule = getListService.getList(schedule.title, schedule.query);
      var scheduleProcessed = getSchedule.then(function(data){

        angular.forEach(data, function(item, index){
          var displayItem = {};
          displayItem.ProviderSchedule = item.Id;
          displayItem.ProviderId = item.Provider.Id;
          displayItem.title = item.Provider.Title + ' - ' + item.Location.Title;
          displayItem.days = item.Days.results;
          displayItem.start = item.StartDate;
          displayItem.end = item.EndDate.split('T')[0].toString();
          displayItem.end = $.fullCalendar.moment(item.EndDate);
          displayItem.utc = dateTime.date(item.EndDate);
          displayItem.services = item.Services.results;
          displayItem.location = item.Location.Title;
          var locIndex = locations.indexOf(item.Location.Title);
          if((currentProvider.length > 0) && (item.Provider.Title == currentProvider[0].title)){
            $scope.showAllProviders = false;
            displayItem.className = colors[locIndex] + ' currentProvider';
          } else {
            $scope.showAllProviders = true;
            displayItem.className = colors[locIndex];
          }
          
          displayItem._id = index;
          $scope.schedule.push(displayItem);                
        });

        $scope.eventSources = [$scope.schedule];
      });

      scheduleProcessed.then(function(){
        // for each batch of days in Provider Schedule, increment days and push to availableDates
        var today = new Date();
        today = dateTime.date(today);
        $scope.availableDates = [];
        angular.forEach($scope.schedule, function(item, index){
          var utcDate = new Date(item.start).toISOString();
          var startDate = dateTime.date(utcDate);
          if(startDate.day == 'Sunday') startDate.day = 'Monday';
          var endDate = dateTime.date(item.end);
          if(startDate.date >= today.date){

            $scope.availableDates.push({date:startDate.date,day:startDate.day,details:item});
          }
          
          var incrementDate = startDate.date;
          var i = 0;
          do {
            var nextDate = new Date(incrementDate);
            nextDate = nextDate.setDate(nextDate.getDate() + 1);
            nextDate = dateTime.date(nextDate);
            incrementDate = nextDate.date;
            var checkDay = item.days.indexOf(nextDate.day);
           if((checkDay != -1) && (incrementDate >= today.date) && (incrementDate <= endDate.date)){
              $scope.availableDates.push({date:incrementDate,day:nextDate.day,details:item});
            }
          } while(nextDate.date <= endDate.date);
        });
      });

      $scope.calOptions = {
        calendar: {
          editable: true,
          height:500,
          ignoreTimezone: true,
          timezone: 'UTC',
          allDay: true,
          weekends: false,
          header:{  
            left: 'prev',
            center: 'title',
            right: 'next'
           },
          defaultView: 'month'
        }
      }; 

      // After all SharePoint lists are processed, activate DOM view elements
      setTimeout(function(){  $('#providerCalendar').fullCalendar('render'); }, 500);

      $('#loading').hide();
      $('#doneLoading').show();
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        $('#providerCalendarAdmin').fullCalendar('render');
    });

  /***************************************/
  /* USER VIEW - Search for appointments */
  /***************************************/
  $scope.searchAppointments = function(data){
    var location = $.grep($scope.locations, function(l, index){ return l.Title === data.selectedLocation })[0];
    var dates = $scope.findAvailableDays(data);
    var foundDates = [];
    var duration = data.selectedService.split('*')[2];
    angular.forEach(dates, function(date, index){
      var booked = $scope.bookedAppointments(date, location, $scope.appointments);
      date.minutes = $scope.processMinuteArrays(date, location, booked, duration);
      foundDates.push(date);
    });
    $scope.foundDates = foundDates;
    $('.searching').hide();
    if(foundDates.length == 0){
      $scope.nothingFound = true;
    } else { $scope.nothingFound = false;}
  }

$scope.processMinuteArrays = function(date, location, daysBookedAppointments, duration){
      var minutes = [];
      for(var i = 0;i <= 1440; i++){
        minutes.push(null);
      }    
    // states = timeAvailable, timeLunch or timeBooked
    var obj = {};

    obj.providerSchedule = function(location, serviceDuration){
      var startTime = location.StartTime - 1;
      var endTime = location.EndTime;
      var lunchStart = location.LunchStart -1;
      var lunchDuration = location.LunchDuration;
      var lastDivider = '';
      for(var i = startTime;i<=endTime;i++){
        minutes[i] = {state:'timeAvailable',cushion:'enoughTime'};
        if(i == startTime){
          var lastDivider = i;
          minutes[i].marker = lastDivider;
          minutes[i].divider = 'first';
        } else {
          if(i%15 == 0){
            lastDivider = i;
            minutes[i].divider = 'quarterHourDivider';
          }
          if(i%30 == 0){
            minutes[i].divider = 'halfHourDivider';
            lastDivider = i;
          }
          if(i%60 == 0){
            minutes[i].divider = 'hourDivider';
            lastDivider = i;
          }
         minutes[i].marker = lastDivider;
        }
      }

      var lunchEndCounter = lunchStart + lunchDuration;
      var lunchMarker = '';
      for(var i = lunchStart;i<=lunchEndCounter;i++){
        if(i == lunchStart){ 
          lunchMarker = i;
          minutes[i] = {state:'timeLunch',marker:lunchMarker,divider:'hourDivider'}
        } else {
          minutes[i] = {state:'timeLunch',marker:lunchMarker};
        } 
        if(i == lunchEndCounter){
          minutes[i+1].divider = 'endLunch';
        }
        var lunchCushion = lunchStart - serviceDuration;
        for(var a = lunchCushion; a <= lunchStart; a++){
          if(minutes[a]){
            if(minutes[a].state == 'timeAvailable'){
              var timeLeft = lunchStart - minutes[a].marker;
              if(timeLeft >= serviceDuration){
                minutes[a].cushion = 'enoughTime';
              } else {
                minutes[a].cushion = 'notEnoughTime lunch';                
              }
            }
          }
        }
      }
      return minutes;
    }

    obj.timeBooked = function(availableMinutes, daysBookedAppointments, serviceDuration){ 
    // this accepts an array of appointments for one day only
      angular.forEach(daysBookedAppointments, function(appt){
        var startIndex = appt.startIndex;
        var startCushion = appt.startIndex - serviceDuration;
        var duration = appt.Duration;
        var endCounter = startIndex + duration;
        var lastDivider;

        for(var i = startIndex; i <= endCounter; i++){
          lastDivider = i;
          availableMinutes[i] = {state:'timeBooked',divider:'',marker:lastDivider};
          if(i%15 == 0){
            lastDivider = i;
            minutes[i].divider = 'quarterHourDivider';
            minutes[i].marker = lastDivider;
          }
          if(i%30 == 0){
            lastDivider = i;
            minutes[i].divider = 'halfHourDivider';
            minutes[i].marker = lastDivider;
          }
          if(i%60 == 0){
            lastDivider = i;
            minutes[i].divider = 'hourDivider';
            minutes[i].marker = lastDivider;
          }
        } 
        for(var a = startCushion; a <= startIndex; a++){
          if(availableMinutes[a]){
            if(availableMinutes[a].state == 'timeAvailable'){
              var timeLeft = startIndex - availableMinutes[a].marker;
              if(timeLeft <= serviceDuration){
                availableMinutes[a].cushion = 'notEnoughTime appt';                
              }
            }
          }
        }
      });
      return minutes;
    }

    var availableMinutes = obj.providerSchedule(location, duration);
    var bookedMinutes = obj.timeBooked(availableMinutes, daysBookedAppointments, duration);
    return bookedMinutes;
}

$scope.findAvailableDays = function(data){ 
// Search all ProviderSchedules, find dates matching user selections
    var foundDates = [];
    var serviceArray = data.selectedService.split('*');
    var selectedService = {id:serviceArray[0], title:serviceArray[1], duration:serviceArray[2]};
    angular.forEach($scope.availableDates, function(singleDay){
      var findService = $.grep(singleDay.details.services, function(s, i){ return s.Title == selectedService.title });
      if((singleDay.details.location == data.selectedLocation) && (findService.length > 0)){
        foundDates.push(singleDay);
      }
    });
    return foundDates;
}

$scope.bookedAppointments = function(date, location, appointments){
  // This function is called from $scope.searchAppointments
  // search all Booked Appointments, find appointments matching Location and Date
  var apptsToday = [];
  angular.forEach(appointments, function(appt, index){
    var apptDate = dateTime.date(appt.Date).date;
    if((date.date == apptDate) && (appt.Location == location.Title)){
      var startTime = appt.StartTime.toUpperCase();
      appt.startIndex = $.grep($scope.minutes, function(m,i){ return m.Title == startTime })[0].Id;
      apptsToday.push(appt);
    }
  });
  return apptsToday;
}

// User View - this function pushes selected appointments to the BookedAppointments list
$scope.bookAppointment = function(data, date, selected, providerSchedule){
  var serviceArray = data.selectedService.split('*');
  var selectedService = {id:serviceArray[0], title:serviceArray[1], duration:serviceArray[2]};
  var title = selectedService.title;
  var duration = selectedService.duration;
  var location = data.selectedLocation;
  var consumer = $scope.currentUser;
  var thisUser = SP.FieldUserValue.fromUser($scope.currentUser.LoginName);
  var selectedDate = $scope.foundDates[selected.date].date;
  var startTime = $scope.foundDates[selected.date].minutes[selected.time].title;
  var ics = selectedDate + ' ' + startTime;
  var icsDate = new Date(ics).toISOString();

  var itemProperties = {
    "Title":title,
    "Location": location,
    "Duration": duration,
    "Consumer": consumer.Title,
    "Email": consumer.Email,
    "Date": ics,
    "StartTime": startTime,
    "ics": icsDate,
    "Provider": selected.provider,
    "ProviderSchedule": providerSchedule
  }
  editList.addAppt('BookedAppointments', itemProperties, thisUser);

}

$scope.pass = function(appt, index){
  $scope.currentAppt = appt;
  $scope.currentIndex = index;
}

// Delete an appointment 
$scope.cancel = function(appt, index){
  editList.delete('BookedAppointments', appt);
  $scope.appointments.splice(index, 1);
}


$scope.searchAvailable = function(data){
  $scope.go = true;
}

$scope.resetSearch = function(){
  $scope.go = '';
  $scope.nothingFound = false;
}

// Enable button once required fields are selected (User View)
var buttonReady = {location:false,service:false}
$scope.enableButton = function(selected){
  buttonReady[selected] = true;
  if(buttonReady.location && buttonReady.service){
    $('#findAppts').prop('disabled',false);
  }
}

  /***************************************/
  /*  PROVIDER VIEW                      */
  /***************************************/
    // Disable Provider view Add Schedule button unless location is selected
    $scope.providerSetLocation = function(){
      $('#createSchedule').prop("disabled",false);
    }

    // Add Provider Schedule to SharePoint list
    $scope.addProviderSchedule = function(list, item){
      var split = item.dateRange.split(' - ');
      var startDate = split[0];
      var endDate = split[1];
      endDate = endDate + ' 11:59';
      var services = [];
      angular.forEach(item.Services, function(service, key){ services.push(service.ID); });
      var lookupsIds = services;  
      var lookups = [];  
       for (var ii in lookupsIds) {  
          var lookupValue = new SP.FieldLookupValue();  
          lookupValue.set_lookupId(lookupsIds[ii]);  
          lookups.push(lookupValue);  
       }

      var itemProperties = {
        'Title': 'Scheduled',
        'Provider': $scope.currentUser.providerId,
        'Location': item.locationId,
        'Services': lookups,
        'StartDate': startDate,
        'EndDate': endDate
      }
      var listName = queryService[list].title;
      editList.add(listName, itemProperties);
      window.location.reload(false);
    }

    // Configurations for Provider Calendar
    $scope.providerSchedule = {
      calendar: {
        editable: true,
        header:{
          left: 'basicWeek basicDay',
          center: 'title',
          right: 'today prev,next'
        },
        defaultView: 'month'
      }
    };



  /***************************************/
  /*  ADMIN VIEW and Shared Functions    */
  /***************************************/
    // Add Provider in Admin View
    $scope.addProvider = function(list, item){
      var val = $('#peoplePickerDiv3 input').val();
      var object = JSON.parse(val);
      var userName = object[0].Key;
      var singleUser = SP.FieldUserValue.fromUser(userName);
      item.Name = singleUser;
      $scope.addItem(list, item);
    } 

    // Add all other list items (used in Admin and Provider View)
    $scope.addItem = function(list, item){
      var listName = queryService.one[list].title;
      editList.add(listName, item);
      var params = "?$filter=Title eq '" + item.Title + "'";
      $timeout(function(){
        var thisList = getListService.getList(listName, params);
        thisList.then(function(data){
          $scope[list].push(data[0]);
        });        
      }, 1000);
    }

    // Delete any list item (used in all views)
    $scope.removeItem = function(list, item){
      var listName = queryService.one[list].title;
      editList.delete(listName, item);
      var index = $scope[list].indexOf(item);
      $scope[list].splice(index, 1);
    }



/***************************************************/
/**** SharePoint Active Directory People Picker ****/
/***************************************************/
$scope.todo = {id:3}
$scope.peoplepicker = function() {
    $scope.editMode = true;
    previousValue = $scope.todo;
    initializePeoplePicker('peoplePickerDiv' + $scope.todo.id, $scope.todo.assignedTo, $scope.todo.assignedToName);
};

$scope.showAD = function(){
  $scope.peoplepicker();
}

// Render and initialize the client-side People Picker.
function initializePeoplePicker(peoplePickerElementId, displayName, userName) {
    // Create a schema to store picker properties, and set the properties.
    var schema = {};
    schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = false;
    schema['MaximumEntitySuggestions'] = 50;
    schema['Width'] = '280px';
    schema['OnUserResolvedClientScript'] = function(x){
      var item={};
      var val = $('#peoplePickerDiv3 input').val();
      var object = JSON.parse(val);
      var userName = object[0].Key;
      var name = userName.split('|')[1];
      var props = getUserService.getUserInfo(name);
      props.then(function(data){
        if(data.d.UserProfileProperties){
          var phone = data.d.UserProfileProperties.results[10];
          item.Phone = phone.Value;          
          var firstName = data.d.UserProfileProperties.results[4];
          item.Title = firstName.Value;
        }

        angular.forEach(data.d, function(value, key){
          if(key == 'Email'){
            item.Email = value;
          }
        });
        $scope.createProvider = item;
      });
    }
    var users = null;

    if (displayName != null) {
        users = new Array(1);
        var user = new Object();
        user.AutoFillDisplayText = displayName;
        user.AutoFillKey = userName;
        user.AutoFillSubDisplayText = "";
        user.DisplayText = displayName;
        user.EntityType = "User";
        user.IsResolved = true;
        user.Key = userName;
        user.ProviderDisplayName = "Tenant";
        user.ProviderName = "Tenant";
        user.Resolved = true;
        users[0] = user;
    }
    // Render and initialize the picker. 
    // Pass the ID of the DOM element that contains the picker, an array of initial
    // PickerEntity objects to set the picker value, and a schema that defines
    // picker properties.
    SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, users, schema);
    $('.sp-peoplepicker-topLevel').addClass('btn').addClass('btn-default');
}



/*******************************************/
/******* EXCEL FILE UPLOAD     *************/
/*******************************************/

$scope.uploadPending = true;
$scope.uploadFile = function() {
    // Get test values from the file input and text input page controls.
    var fileInput = jQuery('#getFile');
    var newName = jQuery('#displayName').val();
    var header = $('#header').val();
    var columns = $('#columns').val();
    var extension = $('#extension').val();

    var serverRelativeUrlToFolder = 'ExcelImport';
    // Get the server URL.
    var serverUrl = _spPageContextInfo.webAbsoluteUrl;

    // Initiate method calls using jQuery promises.
    // Get the local file as an array buffer.
    var getFile = getFileBuffer();
    getFile.done(function (arrayBuffer) {

        // Add the file to the SharePoint folder.
        var addFile = addFileToFolder(arrayBuffer);
        addFile.done(function (file, status, xhr) {

            // Get the list item that corresponds to the uploaded file.
            var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
            getItem.done(function (listItem, status, xhr) {

                // Change the display name and title of the list item.
                var changeItem = updateListItem(listItem.d.__metadata);
                changeItem.done(function (data, status, xhr) {
                    $scope.importExcel(newName, header, columns, extension);
                });
                changeItem.fail(onError);
            });
            getItem.fail(onError);
        });
        addFile.fail(onError);
    });
    getFile.fail(onError);

    // Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(fileInput[0].files[0]);
        return deferred.promise();
    }

    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

        // Get the file name from the file input control on the page.
        var parts = fileInput[0].value.split('\\');
        var fileName = parts[parts.length - 1];

        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl, serverRelativeUrlToFolder, fileName);

        // Send the request and return the response.
        // This call returns the SharePoint file.
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
            }
        });
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}",
            itemMetadata.type, newName, newName);

        // Send the request and return the promise.
        // This call does not return response content from the server.
        return jQuery.ajax({
            url: itemMetadata.uri,
            type: "POST",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "IF-MATCH": itemMetadata.etag,
                "X-HTTP-Method": "MERGE"
            }
        });
    }
}

// Display error messages. 
function onError(error) {
    alert(error.responseText);
}
$scope.book = [];
$scope.upload = {header:true};
$scope.importExcel = function(fileName, header, columns, extension){

  var url = _spPageContextInfo.webAbsoluteUrl;
  var getstring = url + "/_api/web/GetFolderByServerRelativeUrl('ExcelImport')/Files('" + fileName + "." + extension + "')/$value";
  var fileInput = $('#getFile');

  /* set up XMLHttpRequest */
  var url = getstring;
  var oReq = new XMLHttpRequest();
  oReq.open("GET", getstring, true);
  oReq.responseType = "arraybuffer";

  oReq.onload = function(e) {
    var arraybuffer = oReq.response;

    /* convert data to binary string */
    var data = new Uint8Array(arraybuffer);
    var arr = new Array();
    for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    var bstr = arr.join("");

    /* Call XLSX */
    var workbook = XLSX.read(bstr, {type:"binary"});
    var headers = {};
    var rows = [];
    var cellData = [];
    angular.forEach(workbook.SheetNames, function(name, key){
      angular.forEach(workbook.Sheets[name], function(cell, index){
        var cellRow = '';
        var cellCol = '';
        if(cell){
           if(index == '!ref'){} else {
            var split = index;
            angular.forEach(split, function(s,i){
              if(isNaN(s)){ cellCol = cellCol + s; } else { cellRow = cellRow + s; }
            });

            if($scope.upload.header){
              if(cellRow == 1){
                var trimmed = cell.w.split(' ')[0];
                headers[cellCol] = trimmed;

              } else {
              var checkRow = rows.indexOf(cellRow);
                if(checkRow == -1){
                  rows.push(cellRow);
                  cellData[cellRow] = {};
                } 
                cellData[cellRow][headers[cellCol]] = cell.w;
              }
            }
          }

          $scope.book = cellData;
          $scope.rowHeaders = headers;         
        }      
      });
    })
    $scope.uploadPending = false;
    $scope.$apply();
  }

  oReq.send();
}

$scope.writeExcelToList = function(){
  angular.forEach($scope.book, function(row, index){
    var duplicate = $.grep($scope.existingBook, function(oldItem, value){
      if(oldItem.Employee == row.Employee){
        if(oldItem.Exposure == row.Exposure){
          if(oldItem.Exam == row.Exam){
            if(oldItem.Last == row.Last){
              if(oldItem.Due == row.Due){
                return oldItem;
              }                
            }               
          }            
        }
      }
    });
    if(duplicate.length ==  0){
      var itemProperties = {
        Title:'Imported from Excel',
        Employee: row.Employee,
        Exposure: row.Exposure,
        Exam: row.Exam,
        Last: row.Last,
        Due: row.Due
      }     
      editList.add('ImportedFromExcel', itemProperties); 
    }
  });
  $('#addFileButton').text("Data Saved");
  $('#addFileButton').prop("disabled","disabled");
}



}]); // end controller



/************************* Begin Directives *************************/
// User View Appointment Display Search Results Directive
app.directive('results', function(){
  return {
    templateUrl: '../SiteAssets/Views/results.html',
    scope: false,
    link: function(scope, elem, attrs, scheduler){
      scope.$watch(attrs.minutes, function(){
      })
      scope.$watch("go", function() {
        if(scope.data){
          scope.searchAppointments(scope.data);          
        }
      });
    },
    controller: function($scope){
      $scope.confirm = function(data, date, minute, selected){
        $scope.selected = selected;
      }
      $scope.increment = function(){
        $scope.limit = $scope.limit + 5;
      }
    }
  }
});

// Minute directive used in User View Available Appointment Display
app.directive('minutes', function(){
  return {
    templateUrl: '../SiteAssets/Views/minutes.html',
    require: '^results',
    scope: {
      date:'=',
      data:'=',
      minarray:'=',
      selected:'=',
      all:'=',
      passconfirm:'&'

    },
    controller: function($scope){
      $scope.date.mins = cleanArray($scope.date.minutes);
      function cleanArray(actual){
        var newArray = new Array();
        for(var i = 0; i<actual.length; i++){
            if (actual[i]){
              actual[i].index = i;
              newArray.push(actual[i]);
          }
        }
        return newArray;
      }
      $scope.confirmAppointment = function(data, date, minute){
        if(minute.state == 'timeAvailable' && minute.cushion == 'enoughTime'){
          var dateIndex = $scope.all.indexOf(date);
          var minuteIndex = minute.marker;
          $scope.all[dateIndex].minutes[minuteIndex].selected = 'on';
          angular.forEach($scope.all, function(day, dIndex){
            angular.forEach(day.mins, function(min, mIndex){
              if(min){
                min.selected = '';
              }
            });
          });
          var duration = data.selectedService.split('*')[2];
          var lastMarker = +minute.marker + +duration;
          angular.forEach($scope.all[dateIndex].mins, function(m, mIndex){
            if(m){
              if(m.marker == minute.marker){
                m.selected = 'on';
                m.title = $scope.minarray[minuteIndex].Title;
              } else if(m.marker > minute.marker && m.marker < lastMarker){
                m.selected = 'on';
              } else { m.selected = ''; }
            }
          });
          var selected = {date:dateIndex, time:minuteIndex, provider:date.details.ProviderId, schedule:date.details.ProviderSchedule};
          var passSelected = {data:data,date:date,minute:minute}
          $scope.passconfirm()(data, date, minute, selected);
        } 

      }
    }
  }
})

/************************* Begin Factories *************************/
  app.factory('searchAvailable', function(dateTime){
    var obj = {};
      obj.getSchedule = function(data, availableDates, bookedAppointments, minutes){
        var foundDates = [];
        var serviceArray = data.selectedService.split('*');
        var selectedService = {id:serviceArray[0], title:serviceArray[1], duration:serviceArray[2]};
        angular.forEach(availableDates, function(singleDay){
          var findService = $.grep(singleDay.details.services, function(s, i){ return s.Title == selectedService.title });
          if((singleDay.details.location == data.selectedLocation) && (findService.length > 0)){            
                foundDates.push(singleDay);
          }
        });
      return foundDates;
      }

      return obj;
  })

// Retrieve JSON data from SharePoint lists using $http, resolve each "promise" when data is returned
app.factory('getListService', function($http, $q){
  return {
    getList: function (list, params, filter) {
      var url = _spPageContextInfo.webAbsoluteUrl;
      var getstring = url + "/_api/web/lists/getByTitle('" + list + "')/items" + params;
      var getconfig = {cache:false,headers:{"Accept": "application/json; odata=verbose"}}
      var deferred = $q.defer();
      $http.get(getstring, getconfig).
      success(function(data, status, headers, config) {
        deferred.resolve(data.d.results);
      }).
      error(function(data, status, headers, config) {
        console.log('Something went wrong while trying to retrieve the list: ' + status);
        deferred.reject(status);
      });
      return deferred.promise;
    }
  } // END getListService
}) 

app.factory('editList', function($log){
  // Add/Edit/Delete items in a SharePoint list
  return {
    // Add appointment to BookedAppointments list
    addAppt: function(listName, itemProperties, currentUser){
      var ctx = new SP.ClientContext.get_current();
      var list = ctx.get_web().get_lists().getByTitle(listName);
      ctx.load(list);

      var listItemCreationInfo = new SP.ListItemCreationInformation();
      this.newItem = list.addItem(listItemCreationInfo);
      var newItem = this.newItem;
        angular.forEach(itemProperties, function(value, key){
          newItem.set_item(key, value);
        });

      this.newItem.update();
      
      ctx.load(this.newItem);
      var ics=true;
      ctx.executeQueryAsync(
          Function.createDelegate(this,
              function () { 
                if(ics){
                  createIcs(ctx, itemProperties, currentUser);
                } 
                
              }),
          Function.createDelegate(this,
              function (sender, args) { $log.warn(sender + ' ' + args); })); 


              var createIcs = function(context, itemProperties, currentUser){ 

                  var apptObject = {
                    'ParticipantsPicker':currentUser,
                    'EventDate':itemProperties.ics,
                    'Title':itemProperties.Title,
                    'Location':itemProperties.Location
                  }
                  var calendar = context.get_web().get_lists().getByTitle('icsLinks');
                  context.load(calendar);
                  var calItemCreationInfo = new SP.ListItemCreationInformation();
                  this.newAppt = calendar.addItem(calItemCreationInfo);
                  var newAppt = this.newAppt;
                  angular.forEach(apptObject, function(prop, key){
                    newAppt.set_item(key, prop);
                  })
                  this.newAppt.update();
                  context.load(this.newAppt);
                  context.executeQueryAsync(Function.createDelegate(this, function(){
                    //console.log('success');
                  $('#confirmAppt').text("Appointment Saved");
                  $('#confirmAppt').prop("disabled","disabled");
                    var url = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
                    var listGuid = "{2E388EF0-996E-4BED-AD59-97D6988988E1}"; // BookedAppointments List
                    var itemId = this.newAppt.get_id();
                    //console.log(itemId);
                    var icsLink = url + "/_vti_bin/owssvr.dll?CS=109&Cmd=Display&List=" + listGuid + "&CacheControl=1&ID=" + itemId + "&Using=event.ics";
                     window.open(icsLink);  
                     window.location.reload(false);               
                  }), Function.createDelegate(this, function (sender, args) { $log.warn(args); }));

              }     
    },
    // Add a list item (this is re-used in several places)
    add: function(listName, itemProperties){
      var ctx = new SP.ClientContext.get_current();
      var list = ctx.get_web().get_lists().getByTitle(listName);
      ctx.load(list);

      var listItemCreationInfo = new SP.ListItemCreationInformation();
      this.newItem = list.addItem(listItemCreationInfo);
      var newItem = this.newItem;
        angular.forEach(itemProperties, function(value, key){
          newItem.set_item(key, value);
        });

      this.newItem.update();
      ctx.load(this.newItem);
       
      ctx.executeQueryAsync(
          Function.createDelegate(this,
              function () { $log.info('Thank you! Your item has been added successfully.'); }),
          Function.createDelegate(this,
              function (sender, args) { $log.warn(args); }));
    },
    // Delete an item from a SharePoint list (this is also reused in several places)
    delete: function(list, item){
      var id = item.Id;
      var clientContext = new SP.ClientContext.get_current();
      var list = clientContext.get_web().get_lists().getByTitle(list); 
      var listItem = list.getItemById(id);
      listItem.deleteObject();
      clientContext.executeQueryAsync(onQuerySucceeded, onQueryFailed);

      function onQuerySucceeded() {

          $log.info('Item deleted.');
      }

      function onQueryFailed(sender, args) {

          $log.info('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
      }

    }

  } 
})


app.factory('getUserService', function($http, $q, $log){
  // Get properties of the current logged in SharePoint user
    return {
      getUser: function(){
        var deferred = $q.defer();
        var getstring = _spPageContextInfo.webAbsoluteUrl + "/_api/web/CurrentUser";
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
      },
      groups: function(id){
        var deferred = $q.defer();
        var getstring = _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetUserById("+id+")/Groups";
        var getconfig = {cache:true, headers:{ "Accept": "application/json; odata=verbose" }};
        $http.get(getstring, getconfig).
        success(function(data, status, headers, config) {
          deferred.resolve(data.d.results);
        }).
        error(function(data, status, headers, config) {
          $log.warn('request failed');
          deferred.reject(status)
        });
        return deferred.promise;
      },
      groupMembers: function(){
        var clientContext = new SP.ClientContext(siteUrl);
        this.collGroup = clientContext.get_web().get_siteGroups();
        clientContext.load(collGroup, 'Include(Title,Id,Users.Include(Title,LoginName))');

        clientContext.executeQueryAsync(function () {

          var userInfo = '';

          var groupEnumerator = collGroup.getEnumerator();
          while (groupEnumerator.moveNext()) {
              var oGroup = groupEnumerator.get_current();
              var collUser = oGroup.get_users();
              var userEnumerator = collUser.getEnumerator();
              while (userEnumerator.moveNext()) {
                  var oUser = userEnumerator.get_current();
                  this.userInfo += '\nGroup ID: ' + oGroup.get_id() + 
                      '\nGroup Title: ' + oGroup.get_title() + 
                      '\nUser: ' + oUser.get_title() + 
                      '\nLogin Name: ' + oUser.get_loginName();
              }
          }
                  
          alert(userInfo);
          }, function (sender, args) {
              alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
          });
      },
      getUserInfo: function(userName){
        var deferred = $q.defer();
        var getstring = _spPageContextInfo.webAbsoluteUrl + "/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='" + userName + "'";
        var getconfig = {cache:true, headers:{ "Accept": "application/json; odata=verbose" }};
        $http.get(getstring, getconfig).
        success(function(data, status, headers, config) {
         // console.log(data);
          deferred.resolve(data);
        }).
        error(function(data, status, headers, config) {
          $log.warn('request failed');
          deferred.reject(status);
        });
        return deferred.promise;
      }
    }
  })

  app.factory('dateTime', function(){
    return {
      date: function(input){
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];    
        var newDay = moment.utc(input).format();
        var utcDay = new Date(input).toISOString();
        var theDay = new Date(newDay);
        var day = days[theDay.getDay()];
        var dd = theDay.getUTCDate();
        var mm = theDay.getUTCMonth()+1; //January is 0!
        var yyyy = theDay.getUTCFullYear();
        if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
        var date = mm+'/'+dd+'/'+yyyy;
        var today = {day:day,date:date,utc:newDay};
        return today;
      }
    }
  });/****************** END Angular Factories *****************************/

app.directive('myDropdown', function(){
  return {
    templateUrl: '../SiteAssets/Views/dropdown.html',
    scope: {
      row:'='
    },
    link: function(scope, elem, attrs){
      elem.on('click', function(event){
        $(this).parents('.ui-grid-cell,.ui-grid-viewport').css('overflow','visible');
      })
    },
    controller: function($scope){
      $scope.cancel = function(){
        $('#cancel').appendTo("body").modal('show');
      }
      $scope.editRow = function(){
        $('#reschedule').appendTo("body").modal('show');
      }
    }
  }
});

$(document).ready(function () {
 // Misc jquery (non-angular) functions related to DOM elements
  $(function(){
    $(".dropdown-menu li a").click(function(){
      var parent = $(this).parents('.dropdown');
      parent.children(".btn:first-child").text($(this).text());
      parent.children(".btn:first-child").val($(this).text());
   });
  });

  $('input[name="daterange"]').daterangepicker({
          opens: 'left',
          drops: 'up',
          autoApply: true,
          timePicker: false,
          singleDatePicker: true
  });
  $('input[name="datetimerange"]').daterangepicker({
          timePicker: false,
          timePickerIncrement: 30,
          autoApply: true,
          locale: {
              format: 'MM/DD/YYYY'
          }});

  var userid = _spPageContextInfo.userId;

  function GetCurrentUser() {
    var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";

    var requestHeaders = { "accept" : "application/json;odata=verbose" };

    $.ajax({
      url : requestUri,
      contentType : "application/json;odata=verbose",
      headers : requestHeaders,
      success : onSuccess,
      error : onError
    });
    }

    function onSuccess(data, request){
      var loginName = data.d.LoginName.split('|')[1];
      getinfo(loginName);
    }

    function onError(error) { alert(error); }

   GetCurrentUser();   
  });



  function getinfo(loginName) {
      var theData = {
          "propertiesForUser": {
              "__metadata": { "type": "SP.UserProfiles.UserProfilePropertiesForUser" },
              "accountName": loginName,
              "propertyNames": ["PreferredName", "PictureURL"]
          }
      };

      var requestHeaders = {
          "Accept": "application/json;odata=verbose",
          "X-RequestDigest": jQuery("#__REQUESTDIGEST").val()
      };

      $.ajax({
      url: _spPageContextInfo.webServerRelativeUrl +
           "/_api/SP.UserProfiles.PeopleManager/GetMyProperties?$select=DisplayName, PictureUrl",
      method: "GET",
      headers: {
          "accept": "application/json;odata=verbose"
      },
      success: function (data) {
          var result = data.d;
          var displayName = result.DisplayName;
          var firstName = displayName.split('(')[0];
          firstName = firstName.split(',')[1];
          firstName = firstName.trim();
          document.getElementById("username").innerHTML = firstName;
          var picUrl = result.PictureUrl;
      },
      error: function (err) {
          alert(JSON.stringify(err));
      }
  });
}
