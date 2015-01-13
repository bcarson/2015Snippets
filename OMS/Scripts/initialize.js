
var OMSbasePath = "https://spcau-t.cop.net/services/APLNG/OMS/SiteAssets/";
requirejs.config({
	// Configure RequireJS file locations for OMS project and dependent scripts
    "paths": {
      "angular": OMSbasePath + "Scripts/angular.min",
      "jquery.block.ui": OMSbasePath + "Scripts/jquery.blockui.min",
      "sly": OMSbasePath + "Scripts/sly.min",
      "cPeople": OMSbasePath + "OMS/Controllers/AssociatedPeopleController",
      "cChild": OMSbasePath + "OMS/Controllers/ChildNodesController",
      "cDocs": OMSbasePath + "OMS/Controllers/DocumentsController",
      "cNodes": OMSbasePath + "OMS/Controllers/NodesController",
      "services": OMSbasePath + "OMS/OMSServices"
    },
    "shim": {
    	// Configure dependencies
    	"angular": ["jquery"],
        "jquery.block.ui": ["jquery"],
        "sly": ["jquery","angular"],
        "cPeople":["angular"],
        "cChild":["angular"],
        "cDocs":["angular"],
        "cNodes":["angular","services"],
        "services":["angular"]
    }
});

require(['jquery','angular','services','cNodes','sly'], function($) {

	$(document).ready(function(){ 
		console.log('jquery works'); 
		$('#DeltaPlaceHolderPageTitleInTitleArea').css('background-color','#ccc');
		//$.getScript('https://spcau-t.cop.net/services/APLNG/OMS/SiteAssets/Scripts/jquery.blockui.min.js');
	});

});