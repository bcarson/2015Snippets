angular.module('omsDocument', ['omsMessage'])
    .service('documentsService', ['omsMessageService', 'omsDataService', function (omsMessageService, omsDataService) {
        // Register the message on which the updates will be broadcasted.
        var MESSAGE = omsMessageService.messages.NODE;

        this.getMessage = function () {
            return MESSAGE;
        };

        this.getChildMessage = function () {
            return omsMessageService.messages.CHILD_NODE;
        };

        this.getDocuments = function (node, callback) {
            if (!node.Documents || node.Documents.length === 0) {
                omsDataService.getDocuments(node,
                    function (obj) {
                        callback(obj);

                        node.Documents = obj.data;
                    });
            }
            else {
                callback({ isSuccess: true, data: node.Documents });
            }
        };
    }])
    .controller('documentsController', ['$scope', '$timeout', 'documentsService',
        function ($scope, $timeout, documentsService) {
            $scope.documents = [];
            $scope.nodeTitle = '';
            $scope.onRepeaterCompleted = function () { };

            $scope.$on(documentsService.getMessage(), function (response, node) { showDocuments(response, node); });

            $scope.$on(documentsService.getChildMessage(), function (response, node) { showDocuments(response, node); });

            var showDocuments = function (response, node) {
                $scope.onLoad();

                $scope.nodeTitle = node.Title;

                documentsService.getDocuments(node,
                    function (obj) {
                        if (obj.isSuccess) {
                            $scope.documents = obj.data;
                        }
                        else {
                            // Do some error handling.
                            alert(obj.data);
                        }

                        $scope.onLoadComplete();

                        $timeout(function () {
                            $scope.$apply();
                        });
                    });
            };
        }
    ]);
    