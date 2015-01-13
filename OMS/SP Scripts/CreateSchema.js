<script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
<script type="text/javascript" src="/_layouts/15/sp.js"></script>
<script type="text/javascript" src="/_layouts/15/sp.publishing.js"></script>
<script>
'use strict';

var clientContext = SP.ClientContext.get_current();
var web=clientContext.get_web();
var list=web.get_lists();
var listCreationInfo;
var tempTitle;
var oList;
var APMainList;
var NodeTypeList;
var NodeImagesList;
var MainList;
var RolesList;
var NodeList;
var contentType;
var contenttypes;
var field;
var oDocField1;
var oDocField2;
var allItems;
var pubWeb;
var oWebPart;
var relativeURL;
//Page Name 
var pageName;
//webpart properties
var webpartProperties;
var fieldSchemaCollection = ["<Field Name='sortOrder' DisplayName='Order' Type='Number' Required='FALSE'></Field>"];

function CreateSchema(){		
        
    //createList("NodeType");
    //createList("Roles");
    //createAssociatedPeopleList("AssociatedPeople");
    //createNodeImages("NodeImages");
    //createNodes("Nodes");
    //createNodeDocument("NodeDocuments");
   // createFeedbackList("Feedback");
//    SPReady();    
    //addFields(fieldSchemaCollection,"Nodes");
    addFields(fieldSchemaCollection,"AssociatedPeople");
}	

function addFields(fieldSchemaCollection,listTitle)
{
    var _list = list.getByTitle(listTitle);
    var fieldCollection = _list.get_fields();

    for(var i=0;i<fieldSchemaCollection.length;i++)
    {
        var fields = fieldCollection.addFieldAsXml(fieldSchemaCollection[i], true, SP.AddFieldOptions.addFieldInternalNameHint);
    }    
    clientContext.load(fields);    
    clientContext.executeQueryAsync(fieldSuccess,fieldFailure);
}

function fieldSuccess(){
   
    alert("Field(s) added successfully");
}

function fieldFailure(sender, args){
    alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
}
function createNodes(title) {    	
        listCreationInfo = new SP.ListCreationInformation();
    	listCreationInfo.set_title(title);
    	listCreationInfo.set_templateType(SP.ListTemplateType.genericList);
		list.add(listCreationInfo);
    	clientContext.load(list);    
    		
    	 NodeImagesList = list.getByTitle('NodeImages');
    	clientContext.load(NodeImagesList);		
		 
		NodeTypeList = list.getByTitle('NodeType');
        clientContext.load(NodeTypeList);      
        
		RolesList = list.getByTitle('Roles');
		clientContext.load(RolesList);		
		
		APMainList = list.getByTitle('AssociatedPeople');
    	clientContext.load(APMainList);
        
    	NodeList= list.getByTitle('Nodes');    
    	clientContext.load(NodeList);

   		clientContext.executeQueryAsync(onNodeCreationSuccess, onNodeCreationFail);
	}
	function onNodeCreationSuccess() {
    var oField;
   	    var fieldLookup; 	    
   	      	var createNode= list.getByTitle('Nodes');    
    	  
      			oField = createNode.get_fields().addFieldAsXml("<Field Type='Note' RichText='TRUE' RichTextMode='FullHtml' IsolateStyles='TRUE' NumLines='15' Name='Body' DisplayName='Body' Sortable='FALSE' StaticName='Body' />",       
        		true, 
      	 		SP.AddFieldOptions.defaultValue
    	); 
    	
			oField = createNode.get_fields().addFieldAsXml("<Field  Name='Excerpt' DisplayName='Excerpt' Type='Text' Required='FALSE' Overwrite='TRUE' />",
   		 true,
   		 SP.AddFieldOptions.defaultValue
    		); 		
   			
        oField = createNode.get_fields().addFieldAsXml("<Field Name='ParentNode' DisplayName='ParentNode' Type='LookupMulti' Required='FALSE' Mult='TRUE' Overwrite='TRUE' />", true, 
      	 		SP.AddFieldOptions.defaultValue
    	); 
      
      		fieldLookup = clientContext.castTo(oField, SP.FieldLookup);
   			fieldLookup.set_lookupList(NodeList.get_id());
    		fieldLookup.set_lookupField("Title");
    		fieldLookup.update();   		
    		
    		oField = createNode.get_fields().addFieldAsXml("<Field Name='AssociatePeople' DisplayName='AssociatePeople'  Type='LookupMulti' Required='FALSE' Mult='TRUE' Overwrite='TRUE' />", true, 
      	 		SP.AddFieldOptions.defaultValue
    	); 
      
      		fieldLookup = clientContext.castTo(oField, SP.FieldLookup);
   			fieldLookup.set_lookupList(APMainList.get_id());
    		fieldLookup.set_lookupField("Title");
    		fieldLookup.update();  	    		
    		
    			
    		oField = createNode.get_fields().addFieldAsXml("<Field DisplayName='Image' Type='Lookup' />", true, 
      	 		SP.AddFieldOptions.defaultValue
    	); 
      
      		fieldLookup = clientContext.castTo(oField, SP.FieldLookup);
   			fieldLookup.set_lookupList(NodeImagesList.get_id());
    		fieldLookup.set_lookupField("Title");
    		fieldLookup.update();
    		
   			
    		oField = createNode.get_fields().addFieldAsXml("<Field DisplayName='NodeType' Type='Lookup' />", true, 
      	 		SP.AddFieldOptions.defaultValue
    	); 
      
      		fieldLookup = clientContext.castTo(oField, SP.FieldLookup);
   			fieldLookup.set_lookupList(NodeTypeList.get_id());
    		fieldLookup.set_lookupField("Title");
    		fieldLookup.update();
    		
		oField = createNode.get_fields().addFieldAsXml("<Field  Name='LinkUrl' DisplayName='Link URL' Type='Text' Required='FALSE' Overwrite='TRUE' />",
   		 true,
   		 SP.AddFieldOptions.defaultValue
    		);   
    		
    		clientContext.load(oField);   
   			clientContext.executeQueryAsync();				
		
}

function onNodeCreationFail(sender, args) {
        alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
}
	function createFeedbackList(title){
	    listCreationInfo = new SP.ListCreationInformation();
	    listCreationInfo.set_title(title);
	    listCreationInfo.set_templateType(SP.ListTemplateType.genericList);
	    list.add(listCreationInfo);
	    clientContext.load(list);    	
	    clientContext.executeQueryAsync(onFeedbackListCreationSuccess, onFeedbackListCreationFail);
    }	
	function onFeedbackListCreationSuccess(sender,args) {

	    var feedbackList = list.getByTitle('Feedback');
	    var noteField = feedbackList.get_fields().addFieldAsXml("<Field  Name='Notes' DisplayName='Notes' Type='Note' RichText='TRUE' RichTextMode='ThemeHtml' Required='FALSE'/>",
          true,
          SP.AddFieldOptions.defaultValue
             );   	
        clientContext.load(noteField);   
        clientContext.executeQueryAsync(feedbackfieldSuccess,feedbackfieldfailure);
    }

	function onFeedbackListCreationFail(sender, args) {
        alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
	}

	function feedbackfieldSuccess()
	{
	    //alert("feedback field created");
	}
	function feedbackfieldfailure(sender, args){
	    alert('Request failed. ' + args.get_message() + 
                '\n' + args.get_stackTrace());	
	}

	function createAssociatedPeopleList(title) {    	
        listCreationInfo = new SP.ListCreationInformation();
    	listCreationInfo.set_title(title);
    	listCreationInfo.set_templateType(SP.ListTemplateType.genericList);
		list.add(listCreationInfo);
    	clientContext.load(list);
    	oList = list.getByTitle('Roles');
    	clientContext.load(oList);
   		clientContext.executeQueryAsync(onAPListCreationSuccess, onAPListCreationFail);
	}
    	
     function onAPListCreationSuccess(sender,args) {
     //alert("success");        
        //var result = oList.get_title() + ' created.';
    //alert(result);
    var oField; 
    	
    	var APList = list.getByTitle('AssociatedPeople');    	
      	oField = APList.get_fields().addFieldAsXml("<Field DisplayName='Role' Type='Lookup' />",       
        		true, 
      	 		SP.AddFieldOptions.defaultValue
    	);       
      		var fieldLookup = clientContext.castTo(oField, SP.FieldLookup);
   			fieldLookup.set_lookupList(oList.get_id());
    		fieldLookup.set_lookupField("Title");
    		fieldLookup.update();
    		
		oField = APList.get_fields().addFieldAsXml("<Field  Name='UserName' DisplayName='UserName' Type='User' Required='FALSE' UserSelectionMode='PeopleOnly' />",
   		 true,
   		 SP.AddFieldOptions.defaultValue
    		);   	
    		clientContext.load(oField);   
   			clientContext.executeQueryAsync(
       		function(sender,args){ alert("Lists and Libraries Created Successfully");}
      		 );        
}

function onAPListCreationFail(sender, args) {
        alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
}


function createList(title) {    	
        listCreationInfo = new SP.ListCreationInformation();
    	listCreationInfo.set_title(title);
    	listCreationInfo.set_templateType(SP.ListTemplateType.genericList);
		list.add(listCreationInfo);
    	clientContext.load(list);    	
   		clientContext.executeQueryAsync(onListCreationSuccess, onListCreationFail);
	}	
    	function onListCreationSuccess(sender,args) {
       			// alert("success"); 
        }

		function onListCreationFail(sender, args) {
        alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
		}
		
	function createNodeImages(title){
	listCreationInfo = new SP.ListCreationInformation();
    	listCreationInfo.set_title(title);
    	listCreationInfo.set_templateType(SP.ListTemplateType.pictureLibrary);
		list.add(listCreationInfo);		
    	clientContext.load(list);    	
   		clientContext.executeQueryAsync(onNodeImagesSuccess, onNodeImagesFail);
	}	
    	function onNodeImagesSuccess(sender,args) {
       			 
       			// alert("success");        			 
       			
			clientContext.executeQueryAsync()
        }

		function onNodeImagesFail(sender, args) {
        alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
		}	
	


//(function(){

//createNodeDocument("NodeDocuments");

function createNodeDocument(title) {    	
        listCreationInfo = new SP.ListCreationInformation();
    	listCreationInfo.set_title(title);
    	listCreationInfo.set_templateType(SP.ListTemplateType.documentLibrary);
		list.add(listCreationInfo);
    	clientContext.load(list);    	
    	MainList = list.getByTitle('Nodes');
    	clientContext.load(MainList);
    	
		var listDoc = list.getByTitle('NodeDocuments');
    	clientContext.load(listDoc); 
    	
	    var contentTypeCollection = clientContext.get_site().get_rootWeb().get_contentTypes();
		contentType = contentTypeCollection.getById("0x01010A");				
		var listContentTypeColl = listDoc.get_contentTypes();
		listContentTypeColl.addExistingContentType(contentType);
		clientContext.load(listContentTypeColl);  
		
    	field = listDoc.get_fields().getByTitle("Title");
    	clientContext.load(field);
 		   		

		clientContext.executeQueryAsync(onNodeDocumentCreationSuccess, onNodeDocumentCreationFail);
	}
	function onNodeDocumentCreationSuccess() {
     //alert("success");       
        
    	var Nodedocument = list.getByTitle('NodeDocuments');  	
    	
    	Nodedocument.set_contentTypesEnabled('true');
    	Nodedocument.update();
       	oDocField1 = Nodedocument.get_fields().addFieldAsXml("<Field  Name='isKeyDoc' DisplayName='isKeyDoc' Type='Choice' Required='TRUE' Overwrite='TRUE'><CHOICES><CHOICE>YES</CHOICE><CHOICE>NO</CHOICE></CHOICES> </Field>",
   		 true,SP.AddFieldOptions.AddToNoContentType);   	
    		clientContext.load(oDocField1); 
    	
		
    	oDocField2 = Nodedocument.get_fields().addFieldAsXml("<Field DisplayName='Nodes' Type='LookupMulti' Required='TRUE' Mult='TRUE' Overwrite='TRUE'/>", true, 
      	 		SP.AddFieldOptions.AddToNoContentType);//defaultValue 
      
  		var fieldLookup = clientContext.castTo(oDocField2, SP.FieldLookup);
		fieldLookup.set_lookupList(MainList.get_id());
		fieldLookup.set_lookupField("Title");
		fieldLookup.update();		
	    clientContext.load(oDocField2); 
		    
		var viewColl = Nodedocument.get_defaultView();
		viewColl.get_viewFields().add("Title");
		viewColl.update();	    	
    	viewColl.get_viewFields().add("URL");
    	viewColl.update();					  
    	clientContext.executeQueryAsync(s,f);
   		}
   	  function s(){
   	   var fieldLink = new SP.FieldLinkCreationInformation();
   	    fieldLink.set_field(field);
       contentType.get_fieldLinks().add(fieldLink);
       contentType.update(true);
       fieldLink.set_field(oDocField1);
       contentType.get_fieldLinks().add(fieldLink);
       contentType.update(true);
       fieldLink.set_field(oDocField2);
       contentType.get_fieldLinks().add(fieldLink);
       contentType.update(true);

       clientContext.load(contentType);
       clientContext.executeQueryAsync();
   		}
   		function f(){
   		 alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());

   		}
function onNodeDocumentCreationFail(sender, args) {
        alert('Request failed. ' + args.get_message() + 
            '\n' + args.get_stackTrace());
}

//})();


function SPReady(){  
    relativeURL = clientContext.get_url();  
    pageName = "OMS_Template.aspx";
    webpartProperties = [
        {serverRelativeUrl : relativeURL +"/Pages/"+pageName, title: "Nodes",frameType:"None",description: "",zone: "Header",zoneId: "Header",zoneIndex:1,height:"",width:1000,contentLink: relativeURL+'/Style%20Library/OMS/Templates/Node.html'},	 
        {serverRelativeUrl : relativeURL +"/Pages/"+pageName, title: "",frameType:"None",description: "",zone: "CenterColumn",zoneId: "Center",zoneIndex:1,height:"",width:600,contentLink: relativeURL+'/Style%20Library/OMS/Templates/ChildNodes.html'},
        {serverRelativeUrl : relativeURL +"/Pages/"+pageName, title: "Associated People",frameType:"None",description: "",zone: "CenterRightColumn",zoneId: "Center Right",zoneIndex:1,height:"",width:400,contentLink: relativeURL+'/Style%20Library/OMS/Templates/AssociatedPeople.html'},
        {serverRelativeUrl : relativeURL +"/Pages/"+pageName, title: "Key Documents",frameType:"None",description: "",zone: "CenterRightColumn",zoneId: "Center Right",zoneIndex:2,height:"",width:400,contentLink: relativeURL+'/Style%20Library/OMS/Templates/Node.html/Documents.html'},
        {serverRelativeUrl : relativeURL +"/Pages/"+pageName, title: "Common Scripts",frameType:"None",description: "",zone: "Footer",zoneId: "Footer",zoneIndex:1,height:"",width:"",contentLink: relativeURL+'/Style%20Library/OMS/Common.js'}
    ];

    //function call to create a page
    createPage();
}

function createPage() {
   
    pubWeb = SP.Publishing.PublishingWeb.getPublishingWeb(clientContext, web);    
    clientContext.load(pubWeb);
    //Get the data from Master Page Gallery
    var pageLibrary = clientContext.get_site().get_rootWeb().get_lists().getByTitle("Master Page Gallery");   
    var camlQuery = new SP.CamlQuery();
    //Query to filter on blank webpart pages
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">ConocoPhillips Home Page Layout</Value></Eq></Where></Query></View>');
    allItems= pageLibrary.getItems(camlQuery);
    clientContext.load(allItems, 'Include(Id,Title,File)');
    clientContext.executeQueryAsync(querySuccess,onFailure);
}
        
function querySuccess() {

    var listItemEnumerator = allItems.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var olistItem= listItemEnumerator.get_current();
    }
    //Information to creating a blankwebpart page 
    var pageInfo = new SP.Publishing.PublishingPageInformation();
    //Name of the page
    pageInfo.set_name(pageName);
    //Layout of the page - BlankWebPartPage
    pageInfo.set_pageLayoutListItem(olistItem);    
    pubWeb.addPublishingPage(pageInfo);
    //adding webparts to the page       
    
    for(var i=0;i<webpartProperties.length;i++)
    {
        createWebpart(webpartProperties[i]);        
    }
    clientContext.executeQueryAsync(onSuccess, onFailure);

}

function onSuccess(){
     alert('Web Part added: ' + oWebPart.get_title());
}
function onFailure(sender, args){
    alert('Request failed. ' + args.get_message() + 
           '\n' + args.get_stackTrace());
}
function createWebpart(webpartProperties){

    var oFile = web.getFileByServerRelativeUrl(webpartProperties.serverRelativeUrl);
    var limitedWebPartManager = oFile.getLimitedWebPartManager(SP.WebParts.PersonalizationScope.shared);
    var webPartXml = '<?xml version=\"1.0\" encoding=\"utf-8\"?>' + 
   '<WebPart xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"' + 
   ' xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\"' + 
   ' xmlns=\"http://schemas.microsoft.com/WebPart/v2\">' + 
   '<Title>'+webpartProperties.title+'</Title><FrameType>'+webpartProperties.frameType+'</FrameType>' + 
   '<Description>'+webpartProperties.description+'</Description>' + 
   '<IsIncluded>true</IsIncluded><ZoneID>'+webpartProperties.zoneId+'</ZoneID><PartOrder>'+webpartProperties.zoneIndex+'</PartOrder>' + 
   '<FrameState>Normal</FrameState><Height>'+webpartProperties.height+'</Height><Width>'+webpartProperties.width+'</Width><AllowRemove>true</AllowRemove>' + 
   '<AllowZoneChange>true</AllowZoneChange><AllowMinimize>true</AllowMinimize>' + 
   '<AllowConnect>true</AllowConnect><AllowEdit>true</AllowEdit>' + 
   '<AllowHide>true</AllowHide><IsVisible>true</IsVisible><DetailLink /><HelpLink />' + 
   '<HelpMode>Modeless</HelpMode><Dir>Default</Dir><PartImageSmall />' + 
   '<MissingAssembly>Cannot import this Web Part.</MissingAssembly>' + 
   '<PartImageLarge>/_layouts/images/mscontl.gif</PartImageLarge><IsIncludedFilter />' + 
   '<Assembly>Microsoft.SharePoint, Version=13.0.0.0, Culture=neutral, ' + 
   'PublicKeyToken=94de0004b6e3fcc5</Assembly>' + 
   '<TypeName>Microsoft.SharePoint.WebPartPages.ContentEditorWebPart</TypeName>' + 
   '<ContentLink xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" >'+webpartProperties.contentLink+'</ContentLink>'+ 
   '<Content xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\"></Content>' + 
   '<PartStorage xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" /></WebPart>';
                   
    var oWebPartDefinition = limitedWebPartManager.importWebPart(webPartXml);
    oWebPart = oWebPartDefinition.get_webPart();
    limitedWebPartManager.addWebPart(oWebPart, webpartProperties.zone, webpartProperties.zoneIndex);
    clientContext.load(oWebPart);							
}	
</script>
<html>
<body>
<button onclick="CreateSchema()">Create Schema</button>
</body>
</html>

