/*********************************************************************
******   CUSTOM DROPDOWN NAVIGATION W/SHAREPOINT 2013 TAXONOMY  ******
******   Author: Bonnie Carson for CoP ACEO, Version 2 1/28/15  ******
******   Dependencies: RequireJS, jQuery and cop.customNav.css  ******
******   DOM elements are appended to anchor #copCustomPageNav  ******
/*********************************************************************/

// Initialize shared variables
var url, context, termSetGuid, termStoreGuid, title, icon;
var main, first, second, third;
var mainPromise, firstPromise, secondPromise, thirdPromise;
var navbar, navbarWidth, navbarHeight;
var loaded;

//Add all the relevant functions for Nav
cop.nav = cop.nav || {
    scriptReady: function () {
        require(['jquery'], function($) {
		    $(document).ready(function(){
				loaded = false;
		    	$(window).resize(function(){ resetSubnav() });
				$(window).scroll(function(){ resetSubnav() });

		    	$('#navbar,.copCLSCustomPageNav,#navHeader').css('z-index','0');
		    	// To prevent errors in case of any rogue console log statements
				if (typeof console == "undefined" || typeof console.log == "undefined") var console = { log: function() {} };
				
				// Activate shadow overlay behind dropdown menu
				$('.copCLSCustomPageNav').hover(function(){
					$('#navbar,#navHeader').css('position','relative');
					$('#navbar,.copCLSCustomPageNav,#navHeader').css('z-index','10000');
					//$('.copCLSCustomPageNav').css('z-index','10000');
					$('#pageOverlay').css('display','block');
				},function(){
					$('#pageOverlay').css('display','none');
					//$('.copCLSCustomPageNav').css('z-index','10');
					$('#navbar,.copCLSCustomPageNav,#navHeader').css('z-index','0');
				});

				//$(window).resize(function(){ initialSubnav(); secondSubnav(); });
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
					$('#copCustomPageNav').append('<header id="navHeader"><a href=' + url + '><div id="headerLogo"><img src="' + icon + '" /></div><div id="headerTitle">' + title + '</div></a></header>')
					$('#copCustomPageNav').append('<div class="nav-main" id="navbar"></div>');
					asyncLoop(main.length, function(loop){
						var item = main[loop.iteration()];
						pushToDOM(0, item);
						getChildren(1, item.term, item.name, first, function(){
							loop.next();
						})
					}, function(){ initialSubnav(); firstPromise.resolve(); });
				});

				
				firstPromise.then(function(){
				// Send first level menu items to DOM, retrieve second level dropdown items
					asyncLoop(first.length, function(loop){
						var item = first[loop.iteration()];
						getChildren(2, item.term, item.name, second, function(child){ 
							loop.next(); 
						});
					}, function(){ secondSubnav(); secondPromise.resolve(); });
				});

				
				secondPromise.then(function(){
				// Send second level menu items to DOM, retrieve third level dropdown items	
					asyncLoop(second.length, function(loop){
						var item = second[loop.iteration()];
						getChildren(3, item.term, item.name, third, function(){ loop.next(); }); 
					}, function(){ thirdPromise.resolve(); });
				});

				
				thirdPromise.then(function(){
				// Send third level menu items to DOM then placeSubnav to make sure items are placed properly	
					asyncLoop(third.length, function(loop){
						var item = third[loop.iteration()];
						loop.next();
					}, function(){  });
					loaded = true;
				});
		    }); // END document.ready
		}); // END require
    } // END scriptReady
}; // END cop.nav


function pushToDOM(level, item){
	if(level === 0){ // Main Menu
		$('.nav-main').append("<a href='" + item.url + "'>" + item.name + "<div class='dropdown' id=" + item.id + "></div></a>");
	} else if(level === 1){
		$('#' + item.parent).css('display','block').append("<div class='first'><a href='" + item.url + "'>" + item.name + "<div class='firstPoint' /></a><div class='secondContainer' id='" + item.id + "' /></div>");
	} else if(level === 2){
		$('#' + item.parent).append("<div class='second'><a href='" + item.url + "'>" + item.name + "<div class='secondPoint' /></a><div class='thirdContainer' id='" + item.id + "' /></div>");
	} else if(level === 3){
		$('#' + item.parent).append("<div class='third'><a href='" + item.url + "'>" + item.name + "</a></div>");
	}
};

function resetSubnav(){
	if(loaded){ 
		initialSubnav();
		secondSubnav();
	}
}

function initialSubnav(){
	//console.log('initialSubnav');
	navbar = document.getElementById('navbar');
	if(navbar){
		navbarWidth = navbar.offsetWidth;
		navbarHeight = navbar.offsetHeight;
		$('.first').css('width', navbarWidth);
		$('.dropdown').css('top', navbarHeight - 1).css('max-width',navbarWidth);
	}
}

function secondSubnav(){
	//console.log('secondSubnav');
	var dropdown = document.getElementsByClassName('dropdown')[0].getBoundingClientRect();
	var first = document.getElementsByClassName('first')[0].getBoundingClientRect();
	var navbarLeft = navbar.offsetLeft;
	var third = navbarWidth * 0.33;
	var twoThird = third * 2;
	var top = first.top || dropdown.top;
	if(top){
		if(third){
			$('.second a, .third a').css('width',third);
			$('.secondContainer').css('left', navbarLeft + third + 50).css('top', top + 15);
			$('.thirdContainer').css('left', navbarLeft + twoThird + 50).css('top', top + 15);
		}
	}

}

function placeSubnav(source){ /*
	console.log(source);
	var header = $('#copCustomPageNav');
	var headerWidth = header.width();
	var headerHeight = header.height();
	var nav = $('.nav-main');
	var navbar = document.getElementById('navbar');
	if(navbar){
		var navbarWidth = navbar.offsetWidth;
		var navbarHeight = navbar.offsetHeight;
		var navbarTop = navbar.offsetTop;
		var navbarLeft = navbar.offsetLeft;
		var third = navbarWidth * 0.33;
		var twoThird = third * 2;
		$('.first').css('width', navbarWidth);
		$('.dropdown').css('top', navbarHeight - 1).css('max-width',navbarWidth);
		var top = $('.dropdown').position();
		if(top){
			var elements = document.getElementsByClassName('dropdown');
			var coord = elements[0].getBoundingClientRect();
			$('.second a').css('width',third);
			$('.third a').css('width', third);			
			if(top.top > coord.top){
				console.log('one | navbarTop + navbarHeight + 85: ' + (navbarTop + navbarHeight + 85));
				$('.secondContainer').css('left', navbarLeft + third + 50).css('top', navbarTop + navbarHeight + 85);
				$('.thirdContainer').css('left', navbarLeft + twoThird + 50).css('top', navbarTop + navbarHeight + 85);					
			} else { 
				if(coord.top < 300){
					console.log('two | coord.top + 15: ' + (coord.top + 85));
					$('.secondContainer').css('left', navbarLeft + third + 50).css('top', coord.top + 15);
					$('.thirdContainer').css('left', navbarLeft + twoThird + 50).css('top', coord.top + 15);						
				} else if(coord.top > 400) {
					console.log('three | navbarTop + navbarHeight + 80: ' + (navbarTop + navbarHeight + 80));
					$('.secondContainer').css('left', navbarLeft + third + 50).css('top', navbarTop + navbarHeight + 80);
					$('.thirdContainer').css('left', navbarLeft + twoThird + 50).css('top', navbarTop + navbarHeight + 80);					
				} else {
					console.log('four | navbarTop + navbarHeight + 15: ' + (navbarTop + navbarHeight + 15));
					$('.secondContainer').css('left', navbarLeft + third + 50).css('top', navbarTop + navbarHeight + 15);
					$('.thirdContainer').css('left', navbarLeft + twoThird + 50).css('top', navbarTop + navbarHeight + 15);					
				}

			
			}
			if(typeof(console) != undefined){
				if(top){
					//console.log('top: ' + top.top + ',  navbarTop: ' + navbarTop + ', navbarHeight: ' + navbarHeight + ', coord.top: ' + coord.top);
				}	
			}
		}
	} */
 }

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
			icon = config.IconImage.Url;
			getTermSet();
		},
		error: function(sender, args){
			console.log('Error: ' + args.get_message());
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
			if(termUrl.url === undefined){termUrl.url = '#';}
			main.push({'term':term,'name':termName,'id':termId,'url':termUrl.url});
		}
	}
	// After all terms are retrieved and main array is populated, resolve main promise
	mainPromise.resolve('main promise resolved ' + main);
	}, function(sender, args){ console.log('Error: ' + args.get_message()); });
}

// Get child terms for each term, called from asyncLoop functions below
function getChildren(level, term, termName, array, callback){
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
	       if(childProperties.url === undefined){childProperties.url = '#';}
	   	   var childObject = {'parent':cleanTermName,'term':childTerm,'name':childTermName,'id':cleanName,'url':childProperties.url};
	   	   array.push(childObject);  
	   	   pushToDOM(level, childObject);
	   }
	   callback(childObject)
	}, 
	function(sender,args){ console.log('Error: ' + args.get_message()); });
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

// Remove spaces to convert item names to CSS selectors
function clean(input){
	var out = "";
	  if(input){
      	out = input.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
      }
      return out;
}