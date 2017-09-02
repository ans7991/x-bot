angular.module('ClipCtrl', []).controller('ClipController', function ($scope, Clip) {

    $scope.tagline = 'Nothing beats a pocket protector!';

    $scope.query = {
        actor: "salman"
    }

    Clip.get($scope.query)
        .then(function (data) {
            $scope.clips = data.data;
        });

    $scope.fetch = function () {
        Clip.get($scope.query)
            .then(function (data) {
                $scope.clips = data.data;
            });
    }
});