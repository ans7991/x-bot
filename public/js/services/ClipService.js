angular.module('ClipService', []).factory('Clip', ['$http', function ($http) {

    return {

        get: function (query) {
            var q = "";
            if (query.actor)
                q = q + "actor=" + query.actor + "&";
            if (query.genre)
                q = q + "genre=" + query.genre + "&";
            if (query.language)
                q = q + "language=" + query.language + "&";
            if (query.episodeNo)
                q = q + "episodeNo=" + query.episodeNo + "&";
            if (query.title)
                q = q + "title=" + query.title + "&";
            console.log(q);
            return $http.get('/api/query?' + q);
        },

        create: function (data) {
            return $http.post('/api/nerds', data);
        }
    }

}]);
