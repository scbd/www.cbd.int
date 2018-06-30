define(['app', 'text!./user-messages.html'], function(app, html) { 'use strict';

	return app.directive('userMessage', ['$interpolate',function($interpolate) {
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
        var messages = [
          {title:'Saved', description:'Your data was successfully saved.', state:'success'},
          {title:'Manditory', description:'', state:'warning'},
          {code:"NO_SERVICE", title:'Service not available', description:'Service is not avialibale at {{config.url}}', state:'danger'}
        ]


        $scope.$watch('error',function(){
            if(!$scope.error) return

            if($scope.error.status==-1)
              createMsg('NO_SERVICE',$scope.error)
        })

        function remove(i){
          $scope.msg.splice(i,1)
        }

        function getTemplate(code){
          for(var i=0; i<messages.length;i++)
            if(messages[i].code===code)return messages[i]

        }

        function createMsg(code, e){
          var msgTemplate = JSON.parse(JSON.stringify(getTemplate(code)))

          for (var p in msgTemplate){
            var intFcn = $interpolate(msgTemplate[p])
            msgTemplate[p] = intFcn(e)
          }

          if(!Array.isArray($scope.msg))$scope.msg=[]
          $scope.msg.push(msgTemplate)
        }

			}
		};
	}]);
});
