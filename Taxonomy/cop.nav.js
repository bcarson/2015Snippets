/*********************************************************************
******   CUSTOM DROPDOWN NAVIGATION W/SHAREPOINT 2013 TAXONOMY  ******
******   Author: Bonnie Carson for CoP ACEO, Version 0 11/5/14  ******
******   Dependencies: RequireJS, jQuery and cop.customNav.css  ******
******   DOM elements are appended to anchor #copCustomPageNav  ******
/*********************************************************************/

// Initialize shared variables
var url, context, termSetGuid, termStoreGuid, title, icon;
var main, first, second, third;
var mainPromise, firstPromise, secondPromise, thirdPromise;

//Add all the relevant functions for Nav
cop.nav = cop.nav || {
    scriptReady: function () {
        require(['jquery'], function($) {
		    $(document).ready(function(){
			
				// Initialize arrays and promises for each level of the menu
				main = []; mainPromise = $.Deferred();
				first = []; firstPromise = $.Deferred();
				second = []; secondPromise = $.Deferred();
				third = []; thirdPromise = $.Deferred();
				
				// Load required SharePoint libraries, then get MenuConfig SP list
				url = _spPageContextInfo.siteAbsoluteUrl;
				var scriptbase = url + "/_layouts/15/";
				$.getScript(scriptbase + "SP.Runtime.js", function () {
					$.getScript(scriptbase + "SP.js", function(){
						$.getScript(scriptbase + "SP.Taxonomy.js", function(){
							getMenuConfig(url);
							//$.getScript(scriptbase + "SP.ClientContext", getMenuConfig(url));
						});
					});
				});

				/*******************************************************************************************************
				*** After scripts load, run functions getMenuConfig & getTermSet (below) then resolve main promise.  ***
				*** For each term, first send to DOM then getChildren. Repeat for each level of dropdown navigation. ***
				********************************************************************************************************/

				mainPromise.then(function(){
					// After main promise is resolved, send main menu items to DOM and retrieve first level dropdown items
					if(icon){
						$('#copCustomPageNav').append('<header><div id="headerLogo"><img src="' + icon + '" /></div><div id="headerTitle">' + title + '</div></header>');
					}
					
					$('#copCustomPageNav').append('<div class="nav-main"></div>');
					placeSubnav();
					asyncLoop(main.length, function(loop){
						var item = main[loop.iteration()];
						$('.nav-main').append("<a href='" + item.url + "'>" + item.name + "<div class='dropdown' id=" + item.id + "></div></a>");
						getChildren(item.term, item.name, first, function(){
							loop.next();
						})
					}, function(){ firstPromise.resolve(); });
				});

				
				firstPromise.then(function(){
				// Send first level menu items to DOM, retrieve second level dropdown items
					asyncLoop(first.length, function(loop){
						var item = first[loop.iteration()];
						$('#' + item.parent).css('display','block');
						$('#' + item.parent).append("<div class='first'><a href='" + item.url + "'>" + item.name + "<div class='firstPoint' /></a><div class='secondContainer' id='" + item.id + "' /></div>");
						getChildren(item.term, item.name, second, function(){ loop.next(); });
					}, function(){ secondPromise.resolve(); });
				});

				
				secondPromise.then(function(){
				// Send second level menu items to DOM, retrieve third level dropdown items
					asyncLoop(second.length, function(loop){
						var item = second[loop.iteration()];
						$('#' + item.parent).append("<div class='second'><a href='" + item.url + "'>" + item.name + "<div class='secondPoint' /></a><div class='thirdContainer' id='" + item.id + "' /></div>");
						getChildren(item.term, item.name, third, function(){ loop.next(); }); 
					}, function(){ thirdPromise.resolve(); });
				});

				
				thirdPromise.then(function(){
				// Send third level menu items to DOM then placeSubnav to make sure items are placed properly
					asyncLoop(third.length, function(loop){
						var item = third[loop.iteration()];
						$('#' + item.parent).append("<div class='third'><a href='" + item.url + "'>" + item.name + "</a></div>");
						loop.next();
					}, function(){ placeSubnav(); });
				});

				$( window ).resize(function() {
				  placeSubnav();
				});

		    }); // END document.ready
		}); // END require
    } // END scriptReady
}; // END cop.nav

// Retrieve GUIDs for TermSet and Term Store from SharePoint List "MenuConfig"
function getMenuConfig(url){
	$.ajax({
		url: url + "/_api/web/lists/getByTitle('MenuConfig')/items",
		method: 'GET',
		headers: { "Accept":"application/json; odata=verbose" },
		success: function(data){
			var config = data.d.results[0];
			termSetGuid = config.TermSetGUID;
			termStoreGuid = config.TermStoreGUID;
			termStoreName = config.TermStoreName;
			title = config.Title;
			if(config.IconImage){ icon = config.IconImage.Url; } 
			getTermSet();
		},
		error: function(sender, args){
			//alert('Error: ' + args.get_message());
		}
	})
}

// After getMenuConfig is completed, retrieve SharePoint Taxonomy data 
function getTermSet(){
	context = SP.ClientContext.get_current();
	var taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
	var termStores = taxSession.get_termStores();
	var termStore = termStores.getByName(termStoreName);
    var termSet = termStore.getTermSet(termSetGuid);
    var terms = termSet.getAllTerms();
	context.load(terms)
	context.executeQueryAsync(function(){
	var termsEnum = terms.getEnumerator();
	while (termsEnum.moveNext()) {
		var term = termsEnum.get_current();
		var root = term.get_isRoot();
		if(root){
			// Push each root term into main array
			var termName = term.get_name();
			var termUrl = term.get_localCustomProperties();
			var termId = clean(termName);
			main.push({'term':term,'name':termName,'id':termId,'url':termUrl.url});
		}
	}
	// After all terms are retrieved and main array is populated, resolve main promise
	mainPromise.resolve('main promise resolved ' + main);
	}, function(sender, args){ alert('Error: ' + args.get_message()); });
}

// Get child terms for each term, called from asyncLoop functions below
function getChildren(term, termName, array, callback){
	var cleanTermName = clean(termName)
	var terms = term.get_terms();
	context.load(terms);
	context.executeQueryAsync(
	function(){
	   for(var i = 0; i < terms.get_count();i++){
	       var childTerm = terms.getItemAtIndex(i);
	       var childTermName = childTerm.get_name();
	       var cleanName = clean(childTermName);
	       var childProperties = childTerm.get_localCustomProperties();
	   	   var childObject = {'parent':cleanTermName,'term':childTerm,'name':childTermName,'id':cleanName,'url':childProperties.url};
	   	   array.push(childObject);  
	   }
	   	callback(childTermName)
	}, 
	function(sender,args){ alert('Error: ' + args.get_message()); });
}

// Manage asyncronous nested loops, terminate loop and activate callback upon completion
function asyncLoop(count, operations, callback){
	var index = 0;
	var done = false;
	var loop = {
		next:function(){
			if(done){ return; }
			if(index < count) {
				index++;
				operations(loop)
			} else {
				done = true;
				callback();
			}
		},
		iteration: function(){ return index - 1; },
		break: function(){
			done = true;
			callback();
		}
	};
	loop.next();
	return loop;
}

// Determine width and placement of responsive menu container, size and position dropdown menu accordingly.
function placeSubnav(){
	var nav = $('.nav-main');
	var menuWidth = nav.width();
	var menuHeight = nav.height();
	var menuOffset = nav.offset();
	if(menuOffset){
		var third = menuWidth*0.33;
		var twoThird = menuWidth*0.6;
		$('.first').css('width', menuWidth);
		$('.dropdown').css('top',menuOffset.top - 27).css('left',menuOffset.left);
		$('.secondContainer').css('left',menuOffset.left + third).css('top',menuOffset.top + menuHeight + 20);
		$('.thirdContainer').css('left', menuOffset.left + twoThird + 50).css('top',menuOffset.top + menuHeight + 20);				
	}	
}

// Remove spaces to convert item names to CSS selectors
function clean(input){
	var out = "";
	  if(input){
      	out = input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
      }
      return out;
}