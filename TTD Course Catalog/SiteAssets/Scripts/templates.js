app.run(["$templateCache.html", function($templateCache) {
	  $templateCache.put("templateClass.html",
		<accordion-group is-open="opencourse{{ $index }}">
			<accordion-heading>
				<h3 class="courseTitles">{{ class.StartDate | date:'MMM dd'}} - {{ class.course.Title }}, {{ class.Title }}
				<i class="glyphicon" ng-class="{'glyphicon-chevron-down': opencourse{{ $index }}, 'glyphicon-chevron-right': !opencourse{{$index}} }"></i></h3>
				<div class="rightIcons mini" style="margin-top:-30px;width:125px;text-align:left;">
											<div class="icon {{ class.ClassType | truncate:4 | lowercase }}">
												<a href="#" tooltip-placement="left" tooltip="Course Type: {{ class.ClassType }}">
												{{ class.ClassType | truncate:1 }}
												</a>
											</div>
											<div class="icon disc {{ class.course.PrimaryDiscipline | truncate:4 }}">
											<a href="#" tooltip-placement="left" tooltip="Primary Discipline: {{ class.course.PrimaryDiscipline }}">
												{{ class.course.PrimaryDiscipline| truncate:1 }}
											</a>
											</div>
											<div ng-repeat="ad in course.AdditionalDisciplines.results">
												<div class="icon {{ ad | truncate:4 }}">
												<a href="#" tooltip-placement="left" tooltip="Additional Discipline: {{ ad }}">
												{{ ad | truncate:1 }}
												</a>
												</div>
											</div>
										</div>

			</accordion-heading>
			<div class="courseBody">
		      <a href="#" class="btn btn-primary go-btn" ng-show="class.Link.Url">Register</a>
		      <strong>Location: </strong>{{ class.City }} {{ class.Country }} {{ class.Region }}<br />
		      <strong>Start Date: </strong>{{ class.StartDate | date:'medium' }}<br />
		      <strong>End Date: </strong>{{ class.EndDate | date:'medium' }}<br />
			  <br />
		      <strong>Function: </strong>{{ class.course.CorpFunction }}<br />
		      <strong>Discipline: </strong>{{ class.course.PrimaryDiscipline }}<br />
		      <strong>Additional Disciplines:</strong>
		      <div ng-repeat="ad in class.course.AdditionalDisciplines.results">{{ ad }}</div>
		      <strong>Skill Level: </strong>{{ class.course.SkillLevel }}<br />
		      <strong>Type: </strong>{{ class.ClassType }}<br />
		      <strong>Vendor: </strong>{{ class.Vendor }}<br />
		      
		      
		      <br />
		      
		      <p><strong>Class Details: </strong><span ng-bind-html="class.ClassDetails"></span></p>
		      <p style="line-height:1.2;"><strong>Course Description: </strong><span ng-bind-html="class.course.CourseDescription"></span></p>

			</div>
		</accordion-group>
	  );
	  $templateCache.put("templateCourses.html",
		<accordion close-others="false">
			<div ng-repeat="course in filteredCourses | filter:{ PrimaryDiscipline:selected } | filter:search | limitTo:limit">
				<accordion-group is-open="$parent.opencourse{{ $index }}{{ course.Title | truncate: 3 | clean }}">
					<accordion-heading >
						<h3 class="courseTitles">{{ course.Title }}
						<i class="glyphicon" ng-class="{'glyphicon-chevron-down': opencourse{{ $index }}{{ course.Title | truncate: 3 | clean }}, 'glyphicon-chevron-right': !opencourse{{$index}}{{ course.Title | truncate: 3 | clean }} }"></i></h3>
						<div class="rightIcons mini" style="margin-top:-30px;width:125px;text-align:left;">
							<div class="icon level {{ course.SkillLevel | truncate:4 | lowercase }}">
								<a href="#" tooltip-placement="left" tooltip="Skill Level: {{ course.SkillLevel }}">
								{{ course.SkillLevel | truncate:1 }}</a>
							</div>
							<div class="icon disc {{ course.PrimaryDiscipline | truncate:4 }}">
								<a href="#" tooltip-placement="left" tooltip="Primary Discipline: {{ course.PrimaryDiscipline }}">
								{{ course.PrimaryDiscipline| truncate:1 }}</a>
							</div>
							<div ng-repeat="ad in course.AdditionalDisciplines | limitTo:2">
								<div class="icon disc {{ ad | truncate:4 }}">
								<a href="#" tooltip-placement="left" tooltip="Additional Discipline: {{ ad }}">
								{{ ad | truncate:1 }}</a>
								</div>
							</div>
						</div>
		
					</accordion-heading>
					<div class="courseBody" >
						<!--<a href="#" class="btn btn-primary go-btn" ng-click="findclasses(course.Title)">Find Upcoming Classes</a>-->
						<strong>Skill Level: </strong>{{ course.SkillLevel }}<br />
						<strong>Discipline: </strong>{{ course.PrimaryDiscipline }}<br />
						<strong>Function: </strong>{{ course.CorpFunction }}<br />
						<div ng-show="course.AdditionalDisciplines.length"><strong>Additional Disciplines:</strong>
						<div ng-repeat="ad in course.AdditionalDisciplines">{{ ad }}</div></div>
						<br />
						<div  ng-show="course.CourseDescription"><br /><strong>Description: </strong><span ng-bind-html="course.CourseDescription"></span>
						<br /><br /></div>
						<div ng-show="course.TargetAudience"><strong>Target Audience: </strong><span ng-bind-html="course.TargetAudience"></span>
						<br /><br /></div>
						<strong ng-show="course.LearningObjectives">Learning Objectives: </strong><span ng-bind-html="course.LearningObjectives"></span>
		
					</div>
				</accordion-group>
			</div>
			<h3 class="courseTitles" ng-click="limit=500" ng-hide="(filteredCourses | filter:{ PrimaryDiscipline:selected }).length < limit"><strong>Show More</strong></h3>
		</accordion> 
	  );
	  $templateCache.put("templateSearchResults.html",
		<h2 class="searchResults dateBar" style="display:block;font-size:1.6em;background-color:#888;margin-top:5px;" 
		ng-show="behavior.courseview || behavior.classview">
			<span style="float:left;height:20px;">Searching for: 
		
			<span style="font-size:0.9em;">{{ search }} </span> 
			<a href="" class="clear" ng-show="search" ng-click="search=''"><i class="glyphicon glyphicon-remove"></i></a>
			<br />
			</span>
			
			<div>
				<span ng-repeat="disc in coursefilters.disciplines | filter:{selected:true}" class="searchResults">
					{{ disc.name }}
					<a href="#" class="clear" ng-click="disc.selected=!disc.selected"><i class="glyphicon glyphicon-remove"></i></a>
				</span>
			</div>
			
			<div>
			<span ng-repeat="skill in coursefilters.skills | filter:{selected:true}" class="searchResults">
				{{ skill.name }}
				<a href="#" class="clear" ng-click="skill.selected=!skill.selected"><i class="glyphicon glyphicon-remove"></i></a>
			</span>
			</div>
				
			<div>
			<span ng-repeat="type in classfilters.types | filter:{selected:true}" class="searchResults">
				{{ type.name }}
				<a href="#" class="clear" ng-click="type.selected=!type.selected"><i class="glyphicon glyphicon-remove"></i></a>
			</span>
			</div>
			
			<div>
			<span ng-repeat="location in classfilters.locations | filter:{selected:true}" class="searchResults">
				{{ location.name }}
				<a href="#" class="clear" ng-click="location.selected=!location.selected"><i class="glyphicon glyphicon-remove"></i></a>
			</span>
			<span class="searchResults" ng-show="classfilters.date">
				Classes starting {{ classfilters.date | date:'MM/dd/yyyy'}} or later
				<a href="#" class="clear" ng-click="classfilters.date=''"><i class="glyphicon glyphicon-remove"></i></a>
			</span>
			</div>
		
			<a href="#" ng-click="behavior.clear()" class="clear" style="font-size:0.8em;">Clear Filters<i class="glyphicon glyphicon-remove"></i></a>
		</h2>
	  );
	  $templateCache.put("viewCalendar.html",
		<results />
		<div><accordion close-others="false">
			<accordion-group is-open="$parent.thismonth" ng-show="thismonth" ng-hide="classfilters.date"> 
				<accordion-heading  ng-init="limit=10">
					<h2 class="discTitles">{{ date.thisMonth.string + ' ' + date.thisMonth.year }} 
					<i class="glyphicon" ng-class="{'glyphicon-chevron-down': thismonth, 'glyphicon-chevron-right': !thismonth }"></i></h2>
					<div ng-init="current=thismonth" />
				</accordion-heading>
				<accordion close-others="false">
					<div ng-repeat="class in filteredClasses | filter:{ current: 'thisMonth' } | orderBy:'StartDate' | limitTo:limit">
						<class />
					</div>
					
				</accordion>
				<h3 class="courseTitles" ng-click="limit=500" ng-hide="limit > 10"><strong>Show All</strong></h3>
			</accordion-group>
			
			<accordion-group is-open="$parent.nextmonth" ng-show="nextmonth"> 
				<accordion-heading>
					<h2 class="discTitles">{{ date.nextMonth.string + ' ' + date.nextMonth.year }} 
					<i class="glyphicon" ng-class="{'glyphicon-chevron-down': nextmonth, 'glyphicon-chevron-right': !nextmonth }"></i></h2>
					<div ng-init="current=thismonth" />
				</accordion-heading>
				<accordion close-others="false">
					<div ng-repeat="class in filteredClasses | filter:{ current: 'nextMonth' } | orderBy:'StartDate' | limitTo:limit">
						<class />
					</div>
					
				</accordion>
				<h3 class="courseTitles" ng-click="limit=500" ng-hide="limit > 10"><strong>Show All</strong></h3>
			</accordion-group>
			
			<accordion-group is-open="$parent.monthafter" ng-show="monthafter"> 
				<accordion-heading >
					<h2 class="discTitles">{{ date.monthAfter.string + ' ' + date.monthAfter.year }} 
					<i class="glyphicon" ng-class="{'glyphicon-chevron-down': monthafter, 'glyphicon-chevron-right': !monthafter }"></i></h2>
					<div ng-init="current=thismonth" />
				</accordion-heading>
				<accordion close-others="false">
					<div ng-repeat="class in filteredClasses | filter:{ current: 'monthAfter' } | orderBy:'StartDate' | limitTo:limit">
						<class />
					</div>
					
				</accordion>
				<h3 class="courseTitles" ng-click="limit=500" ng-hide="limit > 10"><strong>Show All</strong></h3>
			</accordion-group>
			<accordion-group is-open="$parent.showall.open" ng-click="behavior.showall()"> 
				<accordion-heading>
					<h2 class="discTitles">Show All Dates 
					<i class="glyphicon" ng-class="{'glyphicon-chevron-down': showall.open, 'glyphicon-chevron-right': !showall.open }"></i></h2>
					<div ng-init="current=thismonth" />
				</accordion-heading>
				<accordion close-others="false">
					<div ng-repeat="class in filteredClasses | filter:{ current: '!past' } | orderBy:'StartDate'">
						<class />
					</div>
					
				</accordion>
			</accordion-group>
		
		</accordion></div> 
	  );
	  $templateCache.put("viewNav.html",
<img src="../SiteAssets/Images/cop-logo.png" style="float:right;"/><br/><br/>
<div class="banner-div">
	<img src="../SiteAssets/Images/headericon.jpg"/>Learning Central
</div>
<nav id="mega" class="collapse navbar-collapse">
    <ul class="main">
    <li><a href="Home.aspx">Home</a></li>
    <li><a href="https://spprod.coplearningexpress.com/conocophillips/?q=node">Learning Express</a></li>
	<li><a href="http://hr.conocophillips.net/EN/employeedev/careerdev/supervisory/Pages/index.aspx">Leadership</a>
	  <!--  <div class="subNav" style="font-weight:normal;padding-top:20px;">
			<div class="subNavOne" >
				<h3>Left Heading</h3>
				<ul id="subNavLi">
					<li class="off">
						<a href="#">Link One</a>
					</li>
					<li class="off">
						<a href="#">Link Two</a>
					</li>
					<li class="off">
						<a href="#">Link Three</a>
					</li>
				</ul>
			
			</div>
			<div class="subNavOne right">
				<h3>Right Heading</h3>
			</div>
	    </div>-->
	</li>
	
	<li><a href="http://hr.conocophillips.net/EN/employeedev/careerdev/Pages/index.aspx">Professional</a>
	 <!--   <div class="subNav" style="font-weight:normal;padding-top:20px;">
			<div class="subNavOne" >
				<h3>Left Heading</h3>
				<ul id="subNavLi">
					<li class="off">
						<a href="#">Link One</a>
					</li>
					<li class="off">
						<a href="#">Link Two</a>
					</li>
					<li class="off">
						<a href="#">Link Three</a>
					</li>
				</ul>
			
			</div>
			<div class="subNavOne right">
				<h3>Right Heading</h3>
			</div>
	    </div>-->
	</li>
	
	<li>Technical
	    <div class="subNav" id="" style="font-weight:normal;padding-top:20px;">
			<div class="subNavOne" style="width:30%;">
				<h3>Programs</h3>
				<ul id="subNavLi">
					<li class="off">
						<a href="#">Engineering Academy</a>
					</li>
					<li class="off">
						<a href="#">Early Career Development</a>
					</li>
					<li class="off">
						<a href="#">Production Engineering Academy</a>
					</li>	
					<li class="off">
						<a href="#">Technical Instructor Program</a>
					</li>
					<li class="off">
						<a href="#">Retiree Excellence Program</a>
					</li>
					<li class="off">
						<a href="#">Geoscience New Hire Training Session A</a>
					</li>
	                <li class="off">
						<a href="#">Geoscience New Hire Training Session B</a>
					</li>
					<li class="off">
						<a href="#">Geophysical Excellence Training</a>
					</li>

				</ul>
			
			</div>
			<div class="subNavOne right" style="width:70%;">
				<h3>Tools & Resources</h3>
				<!-- titles -->
				<ul id="subNavLi" class="panelLinks">
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-1" id="item-1">Technical Development NoE</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-2" id="item-2">Competency Maps</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-3" id="item-3">Discipline Curricula</a>
					</li>
					<li class="off">
						<a href="http://cop.ipims.com/userlogon/logon.asp" data-panel="panel-4" id="item-1">IPIMS</a>
					</li>
					<li class="off">
						<a href="https://www.petroskills.com/" data-panel="panel-5" id="item-2">PetroSkills</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-6" id="item-3">PetroCore</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-7" id="item-1">Petroleum Online</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-8" id="item-2">Business Essentials</a>
					</li>
					<li class="off">
						<a href="http://www.nautilusworld.com/" data-panel="panel-9" id="item-3">Nautilus</a>
					</li>
					<li class="off">
						<a href="http://www.nexttraining.net/" data-panel="panel-10" id="item-1">NExT</a>
					</li>
					<li class="off">
						<a href="http://www.spe.org/training/" data-panel="panel-11" id="item-2">SPE</a>
					</li>
					<li class="off">
						<a href="http://onewiki.conocophillips.net/wiki/Main_Page" data-panel="panel-12" id="item-3">OneWiki</a>
					</li>
					<li class="off">
						<a href="https://www.onepetro.org/" data-panel="panel-13" id="item-1">OnePetro</a>
					</li>
					<li class="off">
						<a href="http://site.ebrary.com/lib/conocophillips/home.action" data-panel="panel-14" id="item-2">ebrary</a>
					</li>
					<li class="off">
						<a href="http://petrowiki.spe.org/PetroWiki" data-panel="panel-15" id="item-3">PetroWiki</a>
					</li>
					<li class="off">
						<a href="https://www.petroed.com/courses.php" data-panel="panel-16" id="item-1">PetroEd</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-17" id="item-2"> COP Video Library</a>
					</li>

				</ul>
				
				<div id="panels"><!-- panels -->
					<div class="panel mainpanel" style="display:block;">
					<h4>Tools & Resources</h4>
					<p>Hover for summary, click to visit page.</p>
					</div>
					<div id="panel-1" class="panel">
						<h4>Technical Development NoE (Network of Excellence)</h4>
						<p>A place where the engineering community can find information about technical development opportunities, and share training expertise and best practices.</p> 									
						<img src="../SiteAssets/Images/TDNoE.jpg" style="max-height:160px;" />
						</div>
						
					<div id="panel-2" class="panel">
						<h4>Competency Maps</h4>
						<p>A profile that maps responsiblities and routine activites to a recognized standard and skill level for each technical discipline.  A competency profile is a list of competencies necessary to perform a job well.</p> 									</div>
						
					<div id="panel-3" class="panel">
						<h4>Discipline Curricula</h4>
						<p>A prescribed set of development courses within the skill levels for each technical discipline.</p> 									
						</div>
						
					<div id="panel-4" class="panel">
						<h4>IPIMS (International Petroleum Industry Mutlimedia System)</h4>
						<p>An e-Learning system for building competencies in Upstream Petroleum Technology.  It provides a comprehensive and flexible learning system that can be tailored to meet each individual’s specific needs.  The courses are designed around two levels of learning: Background Learning and Action Learning.</p> 									
						<img src="../SiteAssets/Images/IPIMS.jpg" style="max-height:160px;" />

						</div>
						
					<div id="panel-5" class="panel">
						<h4>PetroSkills</h4>
						<p>PetroSkills offers a broad spectrum of instructor led courses and learning tools to develop competencies in all technical processes.</p> 
					<img src="../SiteAssets/Images/PetroSkills.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-6" class="panel">
						<h4>PetroCore</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 									
						</div>
						
					<div id="panel-7" class="panel">
						<h4>Petroleum Online</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 									
						</div>
						
					<div id="panel-8" class="panel">
						<h4>Business Essentials</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 
					</div>
					
					<div id="panel-9" class="panel">
						<h4>Nautilus</h4>
						<p>Nautilus is a leader in providing subsurface training.   In addition, Nautilus provides instructor led and field course to the geoscience community.</p> 
					<img src="../SiteAssets/Images/Nautilus.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-10" class="panel">
						<h4>NExT (Network for Excellence in Training)</h4>
						<p>A Schlumberger training resource; NExT provides a full suite of training courses in upstream oil and gas industry disciplines as well as surface facility and midstream training for operators and technicians, as well as training on industry leading software tools and software certification.</p> 
					<img src="../SiteAssets/Images/NExT.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-11" class="panel">
						<h4> SPE (Society of Petroleum Engineers)</h4>
						<p>The largest individual-member organization serving managers, engineers, scientists and other professionals worldwide in the upstream segment of the oil and gas industry.  The organization’s mission is to collect, disseminate, and exchange technical knowledge concerning the exploration, development and production of oil and gas resources, and related technologies for the public benefit; and to provide opportunities for professionals to enhance their technical and professional competence.</p> 
					<img src="../SiteAssets/Images/SPE.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-12" class="panel">
						<h4>OneWiki</h4>
						<p>ConocoPhillips’ web-based English language encyclopedia.  The OneWiki supports and enables the continuous collaborative development, maintenance and re-use or application of trusted knowledge content. It enables knowledge sharing and serves as a place to go to for reliable information across ConocoPhillips.</p> 
						<img src="../SiteAssets/Images/OneWiki.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-13" class="panel">
						<h4>OnePetro</h4>
						<p>An online library of technical literature for the oil and gas exploration and production (E&P) industry.  The Society of Petroleum Engineers (SPE) uses its resources and technology to operate OnePetro on behalf of its publishing partners.</p> 
						<img src="../SiteAssets/Images/OnePetro.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-14" class="panel">
						<h4>ebrary</h4>
						<p>ConocoPhillips library of electronic books through the Houston Library.  The ebrary provides leading science and engineering books in full-text.</p> 
						<img src="../SiteAssets/Images/Ebrary.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-15" class="panel">
						<h4>PetroWiki</h4>
						<p>PetroWiki was created from the seven volume Petroleum Engineering Handbook (PEH) published by the Society of Petroleum Engineers (SPE). PetroWiki preserves the PEH content in unaltered form (page names that start with PEH:), while allowing SPE's membership to update and expand content from the published version.  Content of PetroWiki is intended for personal use only and to supplement, not replace, engineering judgment.</p> 
						<img src="../SiteAssets/Images/PetroWiki.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-16" class="panel">
						<h4>PetroEd</h4>
						<p>Offers self-paced Multimedia eLearning modules for the oil & gas industry.</p> 
						<img src="../SiteAssets/Images/PetroEd.jpg" style="max-height:160px;" />
					</div>
					
					<div id="panel-17" class="panel">
						<h4> COP Video Library</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 
					</div>
					
				</div>

		
			</div>
	    </div>
	</li>
	
	<li>BU & Function Resources
<div class="subNav">
		<div class="subNavOne accordionLinks">
			<h3>Functional</h3>
			<div class="accordion-heading">
				<a href="http://finance.conocophillips.net/EN/globaltraining/Pages/index.aspx">Finance</a>
			</div>
			<div class="accordion" id="humanresources">
				<div class="accordion-heading">
					<a href="#hr" data-toggle="collapse" data-parent="#humanresources">Human Resources
					<i class="glyphicon glyphicon-chevron-down"></i></a>
				</div>
				<div class="accordion-body collapse" id="hr">
					<div class="accordion-inner">
						<a href="http://spthr.conocophillips.net/sites/hr/WebDocs/COE%20%20Talent%20Management/GlobalLearning/Global-Course-Schedule.xls">
						Global COP Non-Technical Training Course List and Calendar</a><br />
						<a href="http://hr.conocophillips.net/EN/employeedev/global%20training%20workshops/Pages/index.aspx">
						HR Individual Effectiveness Development</a><br />
						<a href="http://hr.conocophillips.net/EN/employeedev/careerdev/supervisory/Pages/index.aspx">Supervisor Training</a>
					</div><!-- END .accordion-inner  -->
				</div><!-- END .accordion-body -->	
			</div><!-- END #humanresources -->
			<div class="accordion-heading">
				<a href="http://itapps.conocophillips.net/UserProductivityCentral/">IT</a>
			</div>
			<div class="accordion" id="capitalprojects">
				<div class="accordion-heading">
					<a href="#cp" data-toggle="collapse" data-parent="#capitalprojects">Capital Projects
					<i class="glyphicon glyphicon-chevron-down"></i></a>
				</div>
				<div class="accordion-body collapse" id="cp">
					<div class="accordion-inner">
						<a href="http://gps.conocophillips.net/EN/plsc/p2p/Pages/index.aspx">
						Procure to Pay (P2P) Training</a><br />
						<a href="http://pd.conocophillips.net/en/college/Pages/index.aspx">
						Projects College</a>
					</div><!-- END .accordion-inner  -->
				</div><!-- END .accordion-body -->	
			</div><!-- END #capitalprojects -->
				
			<div class="accordion" id="sap">
				<div class="accordion-heading">
					<a href="#sp" data-toggle="collapse" data-parent="#sap">SAP
					<i class="glyphicon glyphicon-chevron-down"></i></a>
				</div>
				<div class="accordion-body collapse" id="sp">
					<div class="accordion-inner">
						<a href="http://gis.conocophillips.net/EN/sap/Pages/Computer%20Based%20Training.aspx">
						Computer Based Training</a><br />
						<a href="http://gis.conocophillips.net/EN/sap/Pages/index.aspx">
						Production Support</a>
						<a href="https://bvlcesns2.conocophillips.net/vportal/VideoPlayer.jsp?ccsid=C-5f8fee37-e736-494d-8149-bc6097a75df8:-1">
						Request Access - How to Video</a>
						<a href="http://gis.conocophillips.net/EN/SAP/SECURITY/Pages/index.aspx">
						Security Related Help</a>
					</div><!-- END .accordion-inner  -->
				</div><!-- END .accordion-body -->	
			</div><!-- END #sap -->
			<div class="accordion-heading">
				<a href="http://share.conocophillips.net/sites/scc/Pages/home.aspx">Supply Chain</a>
			</div>
			<div class="accordion-heading">
				<a href="http://share.conocophillips.net/sites/wellsexcell/pages/training2013.aspx">Wells</a>
			</div>

		</div><!-- END #subNavOne.accordionLinks -->
		
		<div class="subNavOne right accordionLinks">
			<h3>BU Training</h3>
			<div class="accordion-heading">
				<a href="http://australia.conocophillips.net/EN/Documents/2013%20Training%20Calendar.pdf">Australia</a>
			</div>
			<div class="accordion-heading">
				<a href="http://www.oilsandsacademy.ca/">Canada</a>
			</div>
			<div class="accordion" id="lower">
				<div class="accordion-heading">
					<a href="#low" data-toggle="collapse" data-parent="#lower">Lower 48
					<i class="glyphicon glyphicon-chevron-down"></i></a>
				</div>
				<div class="accordion-body collapse" id="low">
					<div class="accordion-inner">
						<a href="http://lower48.conocophillips.net/EN/Gulfcoast/Training/Pages/index.aspx">
						GCBU - Training and Development</a><br />
						<a href="http://sjbutraining.conocophillips.net/EN/Pages/default.aspx">
						San Juan BU Training</a>
					</div><!-- END .accordion-inner  -->
				</div><!-- END .accordion-body -->			
			</div><!-- END #lower -->	
			<div class="accordion-heading">
				<a href="http://nor1.conocophillips.net/EN/businesses/functions/eggre/trai/Pages/index.aspx">Norway</a>
			</div>
			<div class="accordion-heading">
				<a href="http://upstreamuk.conocophillips.net/EN/businesses/functions/IT/SAP/Pages/index.aspx">UK - SAP</a>
			</div>
		</div>

	    </div>
	         
	</li>
	
<!--<li>Links & Resources
	    <div class="subNav">        
		<h2>Links and Resources</h2>
		<div class="subNavOne"><h3>Global Links</h3>
		</div>
		<div class="subNavOne right long"><h3>Local Links</h3>
		</div>
	    </div>
	</li>-->
	
	<li style="text-align:right;float:right;padding-left:4%;">Need Help?
	    <div class="subNav" id="">        
		<div class="subNavOne" id="requestHelp" style="width:30%;"><h3>Request Help</h3>
		{{ requestHelpGreeting }}<br />
		<textarea ng-model="question" placeholder="Enter your message..." rows="6" cols="42"></textarea><br />
		<a href="#" ng-click="form()" style="display:block;padding:5px 2px;margin:5px;background-color:#ebebeb;text-align:center;color:#555;width:30%;float:right;">Submit</a>
		</div>

			<div class="subNavOne right" style="width:70%;">
				<h3>Tools & Resources</h3>
				<!-- titles -->
				<ul id="subNavLi" class="panelHelp" style="width:30%;float:left;">
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-1" id="item-1">Technical Development NoE</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-2" id="item-2">Competency Maps</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-3" id="item-3">Discipline Curricula</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-4" id="item-1">IPIMS</a>
					</li>
					<li class="off">
						<a href="EngineeringAcademy.aspx" data-panel="panel-5" id="item-2">PetroSkills</a>
					</li>

				</ul>
				
				<div id="panels"><!-- panels -->
					<div class="panel mainpanel" style="display:block;">
					<h4>Tools & Resources</h4>
					<p>Hover for summary, click to visit page.</p>
					</div>
					<div id="panel-1" class="panel">
						<h4>Technical Development NoE (Network of Excellence)</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 									</div>
						
					<div id="panel-2" class="panel">
						<h4>This is Panel 2</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 									</div>
						
					<div id="panel-3" class="panel">
						<h4>This is Panel 3</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 									</div>
						
					<div id="panel-4" class="panel">
						<h4>IPIMS (International Petroleum Industry Mutlimedia System)</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 									</div>
						
					<div id="panel-5" class="panel">
						<h4>This is Panel 2</h4>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed nibh a eros varius pulvinar. Sed a sodales metus, sit amet accumsan magna. Sed sed lectus ultricies, feugiat mauris ut, accumsan nunc. Cras hendrerit semper magna, ac vestibulum libero ultrices vel. In hac habitasse platea dictumst. Fusce blandit gravida ligula, et congue risus commodo et. Praesent porta nulla nunc, sed dignissim dolor auctor id.</p> 
					</div>
					
				</div>
			
	    </div>
		
	    </div>    
	</li>
    </ul>
</nav>

<br />

<script type="text/javascript">
	/* Show panels when links are hovered */
	$('.panelLinks a, .panelHelp a').hover(function(){
		$('.mainpanel').hide();
		$('#' + $(this).data('panel')).show();
	}, function(){
		$('#' + $(this).data('panel')).hide();
		$('.mainpanel').show();
	});
	
	/* Main Nav Dropdown Panels */
    $('#mega ul li, #mega ul li > .subNav').hover(function(){
		/*$(this).children('.subNav').css('display','block');*/
        var where = $('#mega').offset();
        var megaWidth = $('#mega').width();
        //$('body').delay(100).addClass('shadow');
		$('.subNav').css('top',where.top + 37);
		$('.subNav').css('left',where.left);
		$('.subNav').css('width',megaWidth);
		$(this).children('.subNav').show();		
	}, function(){
		$(this).children('.subNav').stop().hide();
		//$('body').removeClass('shadow');		
	});
	
	/* Home Page Slideshow	*/
	$('.carousel').carousel();
	
	$('#slideshow').hover(function(){
		$('.carousel-description').show().effect('slide',{direction:"down"}, 'slow');
		$('.carousel-caption').hide();
	}, function(){ 
		$('.carousel-description').hide().effect('slide',{direction:"up"},'slow');
		$('.carousel-caption').show();
	});
	
</script>
	  );
	  $templateCache.put("viewSearchOptions.html",
		<div class="jumbotron" resize>		
			<p id="message" class="col-med-3 col-sm-12">
			<span ng-hide="greeting">Please wait, building page...</span>{{ greeting }}
			</p>
			
			<input ng-model="search" type="text" class="form-control search col-med-3 col-sm-12" 
			placeholder="Start typing to search..." ng-change="behavior.viewcourses()" />
			<br />			
			<div class="accordion search-options" id="accordion1">
				<div class="accordion-group">
					<div class="accordion-heading pull-right col-med-3" id="searchMain" >
						<a class="accordion-toggle search" data-toggle="collapse" data-parent="#accordion2" href="#collapseMain" ng-click="showFilters()">
						Search Options<i class="glyphicon glyphicon-chevron-down"></i>				
						</a>
					</div>
						
					<div id="collapseMain" class="accordion-body collapse in" >
						<div class="accordion-inner" style="height:35px;width:100%;margin-top:-4px;">
		
							<div class="accordion" id="accordion2">
							      <div class="accordion-group searchGroup" float>
							        <div class="accordion-heading"><!-- Discipline Checkbox Filter -->
							          <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseOne">
							          Discipline<i class="glyphicon glyphicon-chevron-down"></i>
							          </a>
							        </div>
							        <div id="collapseOne" class="accordion-body collapse">
							          <div class="accordion-inner" ng-repeat="disc in coursefilters.disciplines">
							          	<div class="checkboxes">
											<input class="{{ disc.name | clean }} checkBox" type="checkbox" 
											ng-click="disc.selected=!disc.selected; behavior.viewcourses()" />
											<span class="icon checkbox disc {{ disc.name | truncate:4 }}">{{ disc.name | truncate:1 }}</span>
											<span class="title"> {{ disc.name | truncate:30 }}</span>
										</div>
							          </div>       
							        </div>
							      </div>
							      
							     
							      <div class="accordion-group searchGroup" float>
							        <div class="accordion-heading"><!-- Skill Level Checkbox Filter -->
							          <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseTwo">
							            Skill Level<i class="glyphicon glyphicon-chevron-down"></i>
							          </a>
							        </div>
							        <div id="collapseTwo" class="accordion-body collapse" style="padding-top:5px;">
							          <div class="accordion-inner">
							         <div ng-repeat="skill in coursefilters.skills">
							          	<div class="checkboxes">
											
											<input class="{{ skill.name | clean }} checkBox" type="checkbox" 
											ng-click="skill.selected=!skill.selected; behavior.viewcourses()"/>
											<span class="icon checkbox level {{ skill.name | truncate:4 }}">{{ skill.name | truncate:1 }}</span>
											<span class="title"> {{ skill.name }}<br/></span>
										</div>
							          </div>
							          </div>
							        </div>
							      </div>
							    
							    
							          <div class="accordion-group searchGroup" float>
							        <div class="accordion-heading"><!-- Course Type Checkbox Filter -->
							          <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseThree">
							            Course Type<i class="glyphicon glyphicon-chevron-down"></i>
							          </a>
							        </div>
							        <div id="collapseThree" class="accordion-body collapse">
							          <div class="accordion-inner">
							            <div ng-repeat="type in classfilters.types | orderBy:'toString()'">
							          	<div class="checkboxes">
											<input class="{{ type.name | clean }} checkBox" type="checkbox" 
											ng-click="type.selected=!type.selected; behavior.viewclasses()"/>
											<span class="icon checkbox type {{ type.name | clean | truncate:4 }}">{{ type.name | truncate:1 }}</span>
											<span class="title"> {{ type.name }}</span>
										</div>
							          </div>
							          </div>						          
							        </div>
							      </div>
							
								  <div class="accordion-group searchGroup drop" float>
							        <div class="accordion-heading"><!-- Location Filter -->
							          <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseFour">
							           Location<i class="glyphicon glyphicon-chevron-down"></i>
							          </a>
							        </div>
							        <div id="collapseFour" class="accordion-body collapse">
							        	<div class="accordion-inner">
										  <div ng-repeat="loc in classfilters.locations | orderBy:'name' ">
											<div class="checkboxes">
												<input class="{{ loc.name | clean }} checkBox" type="checkbox" 
												ng-click="loc.selected=!loc.selected; behavior.viewclasses()"/>	
												<span class="title" style="padding-left:5px;"> {{ loc.name }}</span>										
								          </div>
										 </div>
										</div>										
							        </div>
							      </div>
		
								  <div class="accordion-group searchGroup drop" float>
							        <div class="accordion-heading">
							          <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapseFive">
							            Start Date<i class="glyphicon glyphicon-chevron-down"></i>
							          </a>
							        </div>
							        <div id="collapseFive" class="accordion-body collapse">
							          <div class="accordion-inner">
							          		<input class="datepicker" ng-model="classfilters.date" ng-change="behavior.viewclasses()" />
							          		<script>$('.datepicker').datepicker()</script>
							          </div>
							          <span class="checkboxFooter">(Filters Courses by Date)</span>							          
							        </div>
							      </div>
		
								<div class="accordion-heading expand drop">
									<a href="#" ng-click="behavior.clear()">
									Clear Filters<i class="glyphicon glyphicon-remove"></i>
									</a>
								</div>
												</div>
						</div><!-- END #collapseMain .accordion-inner -->
					</div><!-- END #collapseMain -->
				</div><!-- END .accordion-group -->
			</div> <!-- End Search Options -->
		
		</div><!-- END .jumbotron -->
	  );
	  $templateCache.put("viewUI.html", 
		<results />
		<div><accordion ng-init="limit=10" close-others="false">
			<accordion-group ng-repeat="disc in coursefilters.disciplines | orderBy:'CorpOrder'" ng-init="selected=disc.name" is-open="$parent.opendisc{{ $index }}" ng-show="(filteredCourses | filter:{ PrimaryDiscipline:selected } | filter:search).length"> 
				<accordion-heading >
					<h2 class="discTitles">{{ disc.CorpFunction }} - {{ disc.name }} 
					<i class="glyphicon" ng-class="{'glyphicon-chevron-down': opendisc{{ $index }}, 'glyphicon-chevron-right': !opendisc{{$index}} }"></i></h2>
				</accordion-heading>
				<courses />
			</accordion-group>
		</accordion></div>
	  );