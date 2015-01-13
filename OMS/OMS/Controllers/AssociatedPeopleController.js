angular.module('omsAssociatedPeople', ['omsMessage'])
    .service('associatedPeopleService', ['omsMessageService', function (omsMessageService) {
        // Register the message on which the updates will be broadcasted.
        var MESSAGE = omsMessageService.messages.NODE;

        this.getMessage = function () {
            return MESSAGE;
        };

        this.getChildMessage = function () {
            return omsMessageService.messages.CHILD_NODE;
        };

        this.getAssociatedPeople = function (node) {
            return node.AssociatedPeople;
        };
    }])
    .controller('associatedPeopleController', ['$scope', '$timeout', 'associatedPeopleService',
        function ($scope, $timeout, associatedPeopleService) {
            $scope.people = [];
            $scope.roles = [];
            $scope.onRepeaterCompleted = function () { };

            $scope.$on(associatedPeopleService.getMessage(), function (response, node) { showAssociatedPeople(response, node); });

            $scope.$on(associatedPeopleService.getChildMessage(), function (response, node) { showAssociatedPeople(response, node); });

            var showAssociatedPeople = function (response, node) {
                $scope.onLoad();

                $scope.people = associatedPeopleService.getAssociatedPeople(node);

                $scope.people.sort(function (a, b) { return a.SortOrder - b.SortOrder });

                $scope.roles = [];

                for (var index = 0; index < $scope.people.length; index++) {
                    if ($scope.roles.indexOf($scope.people[index].Role) === -1) {
                        $scope.roles.push($scope.people[index].Role);
                    }
                }

                $scope.onLoadComplete();

                $timeout(function () {
                    $scope.$apply();
                });                
            }
        }
    ]);