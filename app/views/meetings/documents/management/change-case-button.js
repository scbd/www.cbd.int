define(['app', 'text!./change-case-button.html'], function(app, html) { 'use strict';

	 return app.directive('changeCaseButton', [function() {
		return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
                text :"=ngModel"
            },
			link: function ($scope) {

                //====================================
                //
                //====================================
                $scope.setCase = function(type){

                    if(!$scope.text)
                        return;

                    $scope.text = changeCase($scope.text, type);
                };

                //====================================
                //
                //====================================
                function changeCase(text, type) {

                    if(type == 'lower')    { text = text.toLowerCase(); }
                    if(type == 'upper')    { text = text.toUpperCase(); }
                    if(type == 'sentence') { text = setCharAt(text.toLowerCase(), 0, text[0].toUpperCase()); }
                    if(type == 'title')    {
                        var word = /\b\w/g;
                        var match;

                        text = text.toLowerCase();

                        while((match = word.exec(text)))
                            text = setCharAt(text, match.index, text[match.index].toUpperCase());
                    }

                    return text;
                }

                //====================================
                //
                //====================================
                function setCharAt(text, index, char) {
                    var chars = text.split("");
                    chars[index] = char;
                    return chars.join("");
                }
            }
        };
	}]);
});
