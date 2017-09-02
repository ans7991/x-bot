angular.module('VoiceService', []).factory('Voice', ['$http', '$rootScope', function ($http, $rootScope) {

    return {
        init: function () {
            if (annyang) {

                annyang.addCallback('result', (phrases) => {
                    $rootScope.$emit('VOICE_TEXT', phrases);
                });

                SpeechKITT.annyang();

                SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');

                SpeechKITT.displayRecognizedSentence(true);
                SpeechKITT.vroom();
            }
        }
    }

}]);
