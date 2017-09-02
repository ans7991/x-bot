angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider
        .when('/clips', {
            templateUrl: 'views/clip.html',
            controller: 'ClipController'
        })
        .when('/', {
            templateUrl: 'views/clip.html',
            controller: 'ClipController'
        });
;

    $locationProvider.html5Mode(true);

}]);
