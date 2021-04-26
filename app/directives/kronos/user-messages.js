import app from '~/app';
import html from './user-messages.html'; 

	export default app.directive('userMessage', ['$interpolate',function($interpolate) {
		return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        msg:'=?',
        error:'=?'
      },
			link: function ($scope) {
        $scope.remove = remove



        $scope.$watch('error',function(){
            if(!$scope.error) return

            if($scope.error.status==-1)
              createMsg('NO_SERVICE',$scope.error)

            if($scope.error.status==502)
              createMsg('NO_SERVICE',$scope.error)

            if($scope.error.status==404)
              createMsg('NOT_FOUND',$scope.error)

            if($scope.error.status==400)
                createMsg('INVALID_SCHEMA',$scope.error)
            if($scope.error.status==='STEP_NOT_COMPLETE')
              createMsg('STEP_NOT_COMPLETE',$scope.error)

            $scope.error=false
        })

        function remove(code){
          delete($scope.msg[code])
        }

        function createMsg(code, e){
          if(!$scope.msg)$scope.msg={}
          $scope.msg[code]={error:e}
        }

			}
		};
	}]);

