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
          {code:"STEP_NOT_COMPLETE", title:'Step incomplete', description:'You must complete the steps sequentially.', state:'danger'},
          {title:'Manditory', description:'', state:'warning'},
          {code:"NO_SERVICE", title:'Service not available', description:'Service is not avialibale at {{config.method}} {{config.url}}', state:'danger'},
          {code:"NOT_FOUND", title:'Service not available or document was not found', description:'Service is not avialibale or not found  at {{config.url}}', state:'danger'},
          {code:"INVALID_SCHEMA", title:'The data passed to the server is not in the required format.', description:'Please contact the SCBD IT unit to report this error.  it@cbd.int <pre>{{data |json}}</pre>', state:'danger'}
        ]


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

          var exists = false
          for (var i = 0; i < $scope.msg.length; i++)
            if(msgTemplate.code===$scope.msg[i].code)
              exists = true

          if(!exists)
            $scope.msg.push(msgTemplate)


        }

			}
		};
	}]);
});
