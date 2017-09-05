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
    const client = new ApiAi.ApiAiClient({ accessToken: '6998dfed53b9433c835277251d09e223' });
    
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

    function speak(phrase) {
        if (!('speechSynthesis' in window)) return;
        var msg = new SpeechSynthesisUtterance(phrase);
        window.speechSynthesis.speak(msg);
    }
    
    function fetchByApiAi(event, phrase) {
        const promise = client.textRequest(phrase);

        promise
            .then(handleResponse)
            .catch(handleError);

        function handleResponse(serverResponse) {
            console.log(serverResponse);
            const voiceMsg = serverResponse.result.fulfillment.speech || serverResponse.result.fulfillment.messages.filter((m) => m.type ==='simple_response').map((m) => m.textToSpeech)[0];
            speak(voiceMsg)
            if (serverResponse.result.action === "show") {
                $scope.query = {
                    actor: serverResponse.result.parameters.actor,
                    episodeNo: serverResponse.result.parameters.episodeNo,
                    genre: serverResponse.result.parameters.genre,
                    language: serverResponse.result.parameters.language,
                    title: serverResponse.result.parameters.title
                };
                fetch()
            } else if (serverResponse.result.action === "play") {
                window.location = $scope.clips[serverResponse.result.parameters.ordinal - 1].videoUrl;
            }

        }
        function handleError(serverError) {
            console.log(serverError);
        }
        console.log("you said ", phrase);
    }
});