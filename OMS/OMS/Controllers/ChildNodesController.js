angular.module('omsChildNodes', ['omsMessage'])
    .service('childNodesService', ['omsMessageService', 'omsDataService', function (omsMessageService, omsDataService) {
        // Register the message on which the updates will be broadcasted.
        var MESSAGE = omsMessageService.messages.NODE;
        var CHILD_NODE_MESSAGE = omsMessageService.messages.CHILD_NODE;

        this.getMessage = function () {
            return MESSAGE;
        };

        this.sendMessage = function (node) {

            omsMessageService.sendMessage(CHILD_NODE_MESSAGE, node);
        };

        this.getSiteBasePath = function () {
            return omsDataService.getSiteURL();
        };

        // Object to maintain nodes and related information.
        var rootNode = null;

        var getChildNodes = function (node, id) {
            if (node.nodes && node.nodes.length > 0) {
                for (var index = 0; index < node.nodes.length; index++) {
                    if (node.nodes[index].ID === id) {
                        return node.nodes[index].nodes;
                    }

                    if (node.nodes[index].nodes && node.nodes[index].nodes.length > 0) {
                        getChildNodes(node.nodes[index], id);
                    }
                }
            }
        };

        this.setRootNode = function (node) {
            rootNode = node;
        };

        this.getNodes = function (node, callback) {
            var childNodes = getChildNodes(rootNode, node.ID);

            if (childNodes) {
                callback({ isSuccess: true, data: childNodes });
            }
            else {
                omsDataService.getChildNodes(node,
                function (obj) {
                    callback(obj);

                    if (obj) {
                        node.nodes = obj.data;
                    }
                });
            }
        };
    }])
    .controller('childNodesController', ['$scope', '$timeout', 'childNodesService', 'omsCommonService',
        function ($scope, $timeout, childNodesService, omsCommonService) {
            $scope.nodes = [];
            $scope.nodeTypes = [];
            $scope.hasDependents = true;
            $scope.siteBasePath = childNodesService.getSiteBasePath();

            $scope.$on(childNodesService.getMessage(),
                function (response, node) {
                    $scope.nodeTypes = [];
                    $scope.nodes = [];

                    // First set the root node.
                    childNodesService.setRootNode(node);

                    // Now get the child nodes.
                    $scope.getChildNodes(node);
                    $scope.loaded = true;
                });

            $scope.getChildNodes = function (node) {
                $scope.onLoad();

                childNodesService.getNodes(node,
                    function (obj) {
                        if (obj) {
                            if (obj.isSuccess) {

                                for (var index = 0; index < obj.data.length; index++) {
                                    if ($scope.nodeTypes.indexOf(obj.data[index].NodeType) === -1) {
                                        $scope.nodeTypes.push(obj.data[index].NodeType);
                                    }

                                    obj.data[index].isSelected = false;

                                    $scope.nodes.push(obj.data[index]);
                                }

                                $scope.hasDependents = obj.data.length;
                            }
                            else {
                                // Do some error handling.
                                alert(obj.data);
                            }

                            $scope.onLoadComplete();
                        }

                        $timeout(function () {
                            $scope.$apply();
                        });
                    });
            };

            $scope.loadDependents = function (node) {
                var spliceIndexNT = 0, spliceIndexN = 0;

                for (var index = 0; index < $scope.nodeTypes.length; index++) {
                    if ($scope.nodeTypes[index] === node.NodeType) {
                        spliceIndexNT = index;
                        break;
                    }
                }

                var tempArr = [];

                // Collect all the items that based on the node types to remove from the local nodes collection.
                for (var index = 0; index < $scope.nodes.length; index++) {
                    if ($scope.nodeTypes.indexOf($scope.nodes[index].NodeType, spliceIndexNT + 1) !== -1) {
                        tempArr.push($scope.nodes[index]);
                    }
                }

                for (var index = 0; index < tempArr.length; index++) {
                    $scope.nodes.splice($scope.nodes.indexOf(tempArr[index]), 1);
                }

                $scope.nodeTypes.splice(spliceIndexNT + 1, $scope.nodeTypes.length);

                $scope.getChildNodes(node);
            };

            $scope.showSeperator = function (isLast) {
                return !isLast;
            };

            $scope.filterByType = function (nodeType) {
                return function (node) {
                    return node.NodeType === nodeType;
                };
            };

            $scope.highlightNode = function (node) {
                for (var index = 0; index < $scope.nodes.length; index++) {
                    if (node.NodeType === $scope.nodes[index].NodeType) {
                        $scope.nodes[index].isSelected = false;
                    }
                }

                node.isSelected = true;
            };

            $scope.selectNode = function (node) {
                $scope.loadDependents(node);
                $scope.highlightNode(node);

                childNodesService.sendMessage(node);
            };

            $scope.openLink = function (url) {
                omsCommonService.openLink(url);
            };
        }
    ]);
