import app from 'app'
import template from './disclaimer.html'

app.directive('disclaimer', ['$cookies', function( $cookies) {
        
        var state = initCookie($cookies)

		return {
            restrict : "E",
            template : template,
            link: function ($scope){
                
                $scope.state  = state
                $scope.toggle = toggle

                function toggle(){
                    $scope.state.hidden = !$scope.state.hidden
                    $cookies.putObject('decisionTrackingDisclaimer', $scope.state, [{path:'/decisions', secure: true, samesite:true}]);
                }
            }
        }
    }]);

    function initCookie($cookies){
        var cookie = $cookies.get('decisionTrackingDisclaimer')
        if(!cookie) {
            var state = { hidden: false }
    
            $cookies.putObject('decisionTrackingDisclaimer', state, [{path:'/decisions', secure: true, samesite:true}]);
            return state;
        }
        
        return JSON.parse(cookie)
    }
