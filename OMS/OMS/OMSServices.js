(function (angular, $, sitePath, spContext) {
    angular.module('omsMessage', [])
        .service('omsMessageService', ['$rootScope',
            function ($rootScope) {
                var messages = {
                    NODE: 'MSG_NODE',
                    DOCUMENT: 'MSG_DOCUMENT',
                    PEOPLE: 'MSG_PEOPLE',
                    CHILD_NODE: 'MSG_CHILD_NODE'
                };

                return {
                    sendMessage: function (message, data) {
                        $rootScope.$broadcast(message, data);
                    },
                    messages: messages
                };
            }
        ])
        .service('omsCommonService', ['$rootScope',
            function ($rootScope) {
                var nameCtrl = null;

                var IsSupportedNPApiBrowserOnWin = function () {
                    return true; // SharePoint does this: IsSupportedChromeOnWin() || IsSupportedFirefoxOnWin()
                };

                var IsNPAPIOnWinPluginInstalled = function (a) {
                    return Boolean(navigator.mimeTypes) && navigator.mimeTypes[a] && navigator.mimeTypes[a].enabledPlugin
                };

                var CreateNPApiOnWindowsPlugin = function (b) {
                    var c = null;
                    if (IsSupportedNPApiBrowserOnWin())
                        try {
                            c = document.getElementById(b);
                            if (!Boolean(c) && IsNPAPIOnWinPluginInstalled(b)) {
                                var a = document.createElement("object");
                                a.id = b;
                                a.type = b;
                                a.width = "0";
                                a.height = "0";
                                a.style.setProperty("visibility", "hidden", "");
                                document.body.appendChild(a);
                                c = document.getElementById(b)
                            }
                        } catch (d) {
                            c = null
                        }
                    return c
                };

                var showLyncPresencePopup = function (userName, offset) {
                    if (!nameCtrl) {
                        return;
                    }

                    nameCtrl.ShowOOUI(userName, 0, offset.X, offset.Y);
                };

                var hideLyncPresencePopup = function () {
                    if (!nameCtrl) {
                        return;
                    }
                    nameCtrl.HideOOUI();
                };

                if (window.ActiveXObject) {
                    nameCtrl = new ActiveXObject("Name.NameCtrl");

                } else {
                    nameCtrl = CreateNPApiOnWindowsPlugin("application/x-sharepoint-uc");
                }

                return {
                    openLink: function (url) {
                        window.open(url);
                    },
                    showLyncPresencePopup: function (username, target) {
                        showLyncPresencePopup(username, target);
                    }, 
                    hideLyncPresencePopup: function () { 
                        hideLyncPresencePopup();
                    }
                };
            }
        ])
        .service('omsDataService', ['$rootScope', function ($rootScope) {

            // Define the SharePoint Context variables.
            var web = spContext.get_web();
            var list = web.get_lists();

            var temp = web.Title;

            var getNodes = function (query, callback) {
                // Object to maintain nodes and related information.
                var nodes = [];

                // Get the node List
                var NodeList = web.get_lists().getByTitle('Nodes');

                var itemsColl = NodeList.getItems(query);

                spContext.load(itemsColl);

                // Execute the query
                spContext.executeQueryAsync(
                    function () {
                        var listItemsEnumerator = itemsColl.getEnumerator();

                        while (listItemsEnumerator.moveNext()) {

                            var listItem = listItemsEnumerator.get_current();

                            // Lookup to obtain the images associated with the nodes.
                            var image = listItem.get_item('Image') ? listItem.get_item('Image').get_lookupValue() : '';

                            // This is the data structure for a node object.
                            var nodeObj = {
                                ID: listItem.get_item('ID'),
                                Title: listItem.get_item('Title'),
                                Body: listItem.get_item('Body'),
                                Excerpt: listItem.get_item('Excerpt'),
                                ParentNodes: [],
                                AssociatedPeople: [],
                                ImageURL: '',
                                ImageTitle: image || '',
                                NodeType: listItem.get_item('NodeType') ? listItem.get_item('NodeType').get_lookupValue() : '',
                                LinkUrl: listItem.get_item('Link_x0020_URL'),
                                SortOrder: listItem.get_item('sortOrder')
                            };

                            if (image) {
                                // Get reference to the image library.
                                var imageList = web.get_lists().getByTitle('NodeImages');
                                var queryImage = new SP.CamlQuery();

                                // Build the query to lookup image for the node.
                                queryImage.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">' + image + '</Value></Eq></Where></Query></View>');

                                var imageItemColl = imageList.getItems(queryImage);
                                spContext.load(imageItemColl, 'Include(FileLeafRef,FileDirRef,Title)');

                                // Execute to get the image reference for the node.
                                spContext.executeQueryAsync(
                                    (function (nodeObj, imageItemColl) {
                                        return function () {
                                            if (imageItemColl.get_count() > 0) {
                                                var enumerator = imageItemColl.getEnumerator();

                                                while (enumerator.moveNext()) {
                                                    var currentItem = enumerator.get_current();

                                                    // Get the actual image file name.
                                                    var fileName = currentItem.get_item('FileLeafRef');

                                                    // Get the directory path.
                                                    var dir = currentItem.get_item('FileDirRef');

                                                    // Format the URL.
                                                    fileName = dir + '/' + fileName;

                                                    nodeObj.ImageURL = fileName;
                                                }

                                                callback();
                                            }
                                        };
                                    })(nodeObj, imageItemColl)
                                );
                            }

                            // Get the contents of the parent node.
                            var parent = listItem.get_item('ParentNode');

                            if (parent) {
                                for (var i = 0; i < parent.length; i++) {
                                    if (parent[i]) {
                                        nodeObj.ParentNodes.push(parent[i].get_lookupValue());
                                    }
                                }
                            }

                            // Get the contents of the associated people.
                            var people = listItem.get_item('AssociatePeople');

                            if (people) {
                                var peoplelist = [];

                                for (var i = 0; i < people.length; i++) {
                                    peoplelist = people[i].get_lookupValue();

                                    if (peoplelist) {
                                        var NodeList = web.get_lists().getByTitle('AssociatedPeople');

                                        var _query = new SP.CamlQuery();

                                        _query.set_viewXml('<View><Query><Where><Eq><FieldRef Name="Title"/><Value Type="Text">' + peoplelist + '</Value></Eq></Where></Query></View>');

                                        var peopleItemColl = NodeList.getItems(_query);

                                        spContext.load(peopleItemColl);

                                        spContext.executeQueryAsync(
                                            (function (node, itemColl) {
                                                return function () {
                                                    if (itemColl.get_count() > 0) {

                                                        var listItemsEnumerator1 = itemColl.getEnumerator();

                                                        while (listItemsEnumerator1.moveNext()) {

                                                            var user = listItemsEnumerator1.get_current();

                                                            var userInfo = spContext.get_web().ensureUser(user.get_item('UserName').get_lookupValue());
                                                            spContext.load(userInfo);

                                                            spContext.executeQueryAsync(
                                                                (function (userInfo, user) {
                                                                    return function () {

                                                                        for (var peopleIndex = 0; peopleIndex < node.AssociatedPeople.length; peopleIndex++) {
                                                                            if (node.AssociatedPeople[peopleIndex].UserName.toLowerCase() === user.get_item('UserName').get_lookupValue().toLowerCase()) {
                                                                                node.AssociatedPeople[peopleIndex].UserID = userInfo.get_loginName().replace("\\", "\\\\").split("\\\\")[1];
                                                                                node.AssociatedPeople[peopleIndex].Email = userInfo.get_email();

                                                                                callback();
                                                                                break;
                                                                            }
                                                                        }
                                                                    }

                                                                })(userInfo, user));

                                                            node.AssociatedPeople.push({
                                                                UserName: user.get_item('UserName').get_lookupValue(),
                                                                Role: user.get_item('Role') ? user.get_item('Role').get_lookupValue() : '',
                                                                SortOrder: user.get_item('sortOrder')
                                                            });

                                                            callback();
                                                        }
                                                    }
                                                }
                                            })(nodeObj, peopleItemColl)
                                        );
                                    }
                                }
                            }

                            // Add the node object to the collection.
                            nodes.push(nodeObj);
                        }

                        // Execute the callback.
                        callback({ isSuccess: true, data: nodes });
                    },
                    function (sender, args) {
                        // Execute the callback.
                        callback({ isSuccess: false, data: 'Request failed.' + args.get_message() + '\n' + args.get_stackTrace() });
                    }
                );
            };

            var getRootNodes = function (callback) {

                var query = new SP.CamlQuery();

                // Prepare the query
                query.set_viewXml('<View><Query><Where><And><Eq><FieldRef Name="NodeType"/><Value Type="Lookup">Top Tile</Value></Eq><IsNull><FieldRef Name="ParentNode"/></IsNull></And></Where></Query></View>');

                getNodes(query, callback);
            };

            var getChildNodes = function (node, callback) {


                var query = new SP.CamlQuery();

                // Prepare the query
                query.set_viewXml('<View><Query><Where><And><IsNotNull><FieldRef Name="ParentNode"/></IsNotNull><Eq><FieldRef Name="ParentNode"/><Value Type="Lookup">' + node.Title + '</Value></Eq></And></Where></Query></View>');

                getNodes(query, callback);
            };

            var getDocuments = function (node, callback) {
                var docNodeList = web.get_lists().getByTitle('NodeDocuments');

                var _query = new SP.CamlQuery();

                _query.set_viewXml('<View><Query><Where><And><Eq><FieldRef Name="Nodes"/><Value Type="Lookup">' + node.Title + '</Value></Eq><Eq><FieldRef Name="isKeyDoc"/><Value Type="Choice">YES</Value></Eq></And></Where></Query></View>');

                var itemsColl = docNodeList.getItems(_query);

                spContext.load(itemsColl);

                spContext.executeQueryAsync(
                    function () {
                        var documents = [];
                        var listItemsEnumerator = itemsColl.getEnumerator();

                        while (listItemsEnumerator.moveNext()) {

                            var listItem = listItemsEnumerator.get_current();

                            documents.push({ Title: listItem.get_item('Title'), Url: listItem.get_item('URL').get_url() });
                        }

                        // Execute the callback.
                        callback({ isSuccess: true, data: documents });
                    },
                    function (sender, args) {
                        // Execute the callback.
                        callback({ isSuccess: false, data: 'Request failed.' + args.get_message() + '\n' + args.get_stackTrace() });
                    }
                );
            };

            return {
                getRootNodes: function (callback) {
                    getRootNodes(callback);
                },

                getChildNodes: function (node, callback) {
                    getChildNodes(node, callback);
                },

                getDocuments: function (node, callback) {
                    getDocuments(node, callback);
                },

                getSiteURL: function () {
                    return sitePath;
                }
            };
        }])
        .directive('omsAttachLyncPopup', ['omsCommonService', function (omsCommonService) {
            return {
                restrict: 'A',
                scope: {
                    sip: '@'
                },
                link: function (scope, element, attr) {
                    var el = $(element);

                    el.on('mouseover', function () {

                        var eLeft = el.offset().left;
                        var x = eLeft - $(window).scrollLeft();

                        var eTop = el.offset().top;
                        var y = eTop - $(window).scrollTop();

                        omsCommonService.showLyncPresencePopup(scope.sip, { X: x, Y: y });
                    });

                    el.on('mouseout', function () {
                        omsCommonService.hideLyncPresencePopup();
                    });
                }
            };
        }])
        .directive('omsRepeater', [function () {
            return {
                restrict: 'A',
                scope: {
                    isLastItem: '=',
                    repeaterCompletedCallback: '&'
                },
                link: function (scope, element, attr) {

                    if (scope.isLastItem) {
                        scope.repeaterCompletedCallback()(true);                        
                    }
                }
            };
        }])
        .directive('portletContainer', ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                transclude: true,
                scope: {
                    onLoad: '=',
                    onLoadComplete: '=',
                    onInitialize: '&',
                },
                link: function (scope, element, attr) {

                    scope.onLoad = function () {
                        // wrapper function to block element(indicate loading)
                        var el = $(element);
                        el.show();

                        el.parent().find('.content-loading').hide();

                        if (el.css('minHeight') === '0px') {
                            $(element).css({
                                minHeight: '150px'
                            });
                        }

                        $(element).block({
                            message: '<img src="' + sitePath + '/Style%20Library/images/ajax-loading.gif" align=""><br/><br/>loading...',
                            centerY: true,
                            css: {
                                top: '10%',
                                border: 'none',
                                padding: '2px',
                                backgroundColor: 'none'
                            },
                            overlayCSS: {
                                backgroundColor: '#000',
                                opacity: 0.05,
                                cursor: 'wait'
                            }
                        });
                    };

                    scope.onLoadComplete = function (loadSly) {

                        // wrapper function to un-block element(finish loading)
                        $(element).unblock({
                            onUnblock: function () {
                                $(element).removeAttr("style");
                            }
                        });

                        if (loadSly) {
                            $timeout(function () {
                                var $wrap = $(element).find('.wrap');

                                $wrap.each(function (index, item) {
                                    var $frame = $(item).find('.frame');

                                    if (!$frame)
                                        return;

                                    // Destroy first.
                                    $frame.sly(false);

                                    // Call Sly on frame
                                    $frame.sly({
                                        horizontal: 1,
                                        itemNav: 'basic',
                                        smart: 1,
                                        activateOn: 'click',
                                        swingSpeed: 0.2,
                                        mouseDragging: 1,
                                        touchDragging: 1,
                                        releaseSwing: 1,
                                        startAt: 0,
                                        scrollBar: $(item).find('.scrollbar'),
                                        scrollBy: 1,
                                        speed: 300,
                                        elasticBounds: 1,
                                        dragHandle: 1,
                                        dynamicHandle: 1,
                                        clickBar: 1
                                    });
                                });

                                if (!$.browser) {
                                    $.browser = {
                                        msie: navigator.userAgent.match(/msie/i)
                                    };
                                }

                                if ($.browser.msie) {
                                    $('.cop-tile').hover(
                                       function () {
                                           $('a ul', this).animate({ top: '0px' }, { queue: false });
                                       },
                                       function () {
                                           $('a ul', this).animate({ top: '25px' }, { queue: false });
                                       }
                                   );
                                }
                            });
                        }
                    };

                    $timeout(function () {
                        scope.onInitialize();
                    });
                }
            };
        }]);

    angular.module('oms', ['omsNode', 'omsChildNodes', 'omsDocument', 'omsAssociatedPeople']);

    // Bootstrap the oms module.
    angular.element(document).ready(function () {
        
        SP.SOD.loadMultiple([
            'init.js',
            'sp.runtime.js',
            'sp.js',
            'sp.ui.dialog.js'       
        ],
        function () {
            spContext = SP.ClientContext.get_current();
            sitePath = spContext.get_url();

            angular.bootstrap(document, ['oms']);
        });
    });
})(angular, jQuery);