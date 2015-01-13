angular.module('omsNode', ['omsMessage'])
    .service('nodesService', ['omsMessageService', 'omsDataService', function (omsMessageService, omsDataService) {
        // Register the message on which the updates will be broadcasted.
        var MESSAGE = omsMessageService.messages.NODE;

        this.sendMessage = function (node) {
            
            omsMessageService.sendMessage(MESSAGE, node);
        };

        // Object to maintain nodes and related information.
        var nodes = [];

        this.getNodes = function (callback) {

            if (nodes.length === 0) {
                omsDataService.getRootNodes(callback);
            }
            else {
                callback({ isSuccess: true, data: nodes });
            }
        };
    }])
    .controller('nodesController', ['$scope', '$timeout', 'nodesService', 'omsCommonService',
        function ($scope, $timeout, nodesService, omsCommonService) {
            $scope.nodes = [];
            
            $scope.getParentNodes = function () {

                $scope.onLoad();

                nodesService.getNodes(
                    function (obj) {
                        if (obj) {
                            if (obj.isSuccess) {
                                $scope.nodes = obj.data;
                            }
                            else {
                                // Do some error handling.
                                alert(obj.data);
                            }

                            $scope.onLoadComplete(false);
                        }

                        $timeout(function () {
                            $scope.$apply();
                        });
                    });
            };

            $scope.highlightNode = function (node) {
                for (var index = 0; index < $scope.nodes.length; index++) {
                    $scope.nodes[index].isSelected = false;                    
                }

                node.isSelected = true;
            };

            $scope.selectNode = function (node) {
                if (node.LinkUrl) {
                    if (node.Title.toLowerCase() === 'feedback') {
                        SP.UI.ModalDialog.showModalDialog(
                            {
                                url: node.LinkUrl,
                                width: 700,
                                height: 500,
                                title: node.Title,
                                autoSize: true,
                                showClose: true,
                                allowMaximize: false
                            }
                        );
                    }
                    else {
                        omsCommonService.openLink(node.LinkUrl);
                    }
                }
                else {
                    $scope.highlightNode(node);

                    nodesService.sendMessage(node);
                }
            };
        }
    ]);