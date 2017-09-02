angular.module('ClipCtrl', []).controller('ClipController', function ($scope, $rootScope, $timeout, Clip, Voice) {

    $scope.tagline = 'Nothing beats a pocket protector!';

    $scope.query = {
        title: "spotlight"
    }

    Clip.get($scope.query)
        .then(function (data) {
            $scope.clips = data.data;
        });

    Voice.init();
    $scope.fetch = fetch;

    function fetch() {
        console.log("Fetching", $scope.query)
        return Clip.get($scope.query)
            .then(function (data) {
                $timeout(() => {
                    $scope.clips = data.data;
                });
            });
    }
    $rootScope.$on('VOICE_TEXT', fetchByApiAi);

    function fetchByApiAi(event, phrases) {
        const client = new ApiAi.ApiAiClient({ accessToken: '6998dfed53b9433c835277251d09e223' });
        const promise = client.textRequest(phrases[0]);

        promise
            .then(handleResponse)
            .catch(handleError);

        function handleResponse(serverResponse) {
            console.log(serverResponse);
            $scope.query = {
                actor: serverResponse.result.parameters.actor,
                episodeNo: serverResponse.result.parameters.episodeNo,
                genre: serverResponse.result.parameters.genre,
                language: serverResponse.result.parameters.language,
                title: serverResponse.result.parameters.title
            };
            fetch()
        }
        function handleError(serverError) {
            console.log(serverError);
        }
        console.log("you said ", phrases[0]);
    }
});