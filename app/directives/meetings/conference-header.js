define(['app', 'angular', 'text!./conference-header.html', 'services/conference-service'], function(app, ng, html){

    return app.directive('conferenceHeader', ['$location', 'conferenceService', '$q',
     function($location, conferenceService, $q){
        return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
            },
			link: function ($scope) {

                var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');
                ng.element(document).ready(function () {

                    $q.when(conferenceService.getActiveConference())
                    .then(function(meeting){
                        $scope.meeting = meeting;
                    });   

                });

                $scope.meetingNavCtrl = {
                    fullPath : function(name) {
                        return basePath + $location.path();
                    },

                    isSelected : function(name, exact) {

                        if(name && $scope.meetingNavCtrl.currentSelection)
                            return name==$scope.meetingNavCtrl.currentSelection;

                        var selected = false;
                        var path = basePath + $location.path();

                        path = path && path.toLowerCase();
                        name = name && name.toLowerCase();
      
                        //handle legacy redirect for /2016/mop-08/documents
                        if(/^\/conferences\/2016\/mop-08/.test(path) && /^\/conferences\/2016\/cp-mop-08/.test(name))
                            selected = true;
                                                        
                        if(exact) selected = selected || path === name;
                        else if(name) selected = selected || path.indexOf(name)===0;
                        else     selected = selected || path.indexOf('/conferences/')===0;

                        return selected;
                    },
                    isMajorEventSelected : function(){
                        if(!$scope.meeting)
                            return;
                        var isSelected = false; 
                        
                        for(var i=0; i<$scope.meeting.conference.events.length; i++){
                            isSelected = $scope.meetingNavCtrl.isSelected('/conferences/'+$scope.meeting.code+
                                        '/'+$scope.meeting.conference.events[i].code+'/')
                            if(isSelected)
                                break;
                        }                
                        return isSelected;
                    },
                    hash : function() {
                        return $location.hash();
                    }
                };

            }
        }
    }])
})
