﻿import app from '~/app';
import ng from 'angular';
import html from './conference-header.html';
import '~/services/conference-service';
import '~/filters/lstring';
import '~/filters/html-sanitizer.js';

    export default app.directive('conferenceHeader', ['$location', 'conferenceService', '$q', '$rootScope',
     function($location, conferenceService, $q, $rootScope){
        return {
			restrict : "E",
			template : html,
            replace: true,
			scope: {
            },
			link: function ($scope) {

                var basePath = (ng.element('base').attr('href')||'').replace(/\/+$/g, '');
                ng.element(document).ready(function () {

                    angular.element('body').addClass("conference")

                    $q.when(conferenceService.getActiveConference()).then(function(conference){
                        $scope.conference = $scope.meeting = conference; //Keep meeting for tmp compatibility
                    });   

                });

                $scope.cssClass = function(code){
                    return (code||'').replace(/\-([a-z]{3})\-.*/, '').toUpperCase();
                }
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
                        
                        else if(name) selected = selected || (path+'/').indexOf(name+'/')===0;
                        else     selected = selected || path.indexOf('/conferences/')===0;

                        return selected;
                    },
                    isMajorEventSelected : function(code){
                        if(!$scope.meeting)
                            return;
                        var isSelected = false; 
                        var selectedMenu;
                        var menus = $scope.meeting.conference.menus || $scope.meeting.conference.events;
                        for(var i=0; i<menus.length; i++){

                            var event = menus[i];

                            isSelected = code == event.code && $scope.meetingNavCtrl.isSelected('/conferences/'+$scope.meeting.code+'/'+event.code, true)
                            if(isSelected){
                                break;
                            }

                            for(var j=0; j<(event.menus||[]).length; j++){                                
                                isSelected = code == event.code && $scope.meetingNavCtrl.isSelected('/conferences/'+$scope.meeting.code+'/'+event.menus[j].code, true)
                                if(isSelected){
                                    selectedMenu = event.menus[j];
                                    if(!event.isExpanded)
                                        $scope.meetingNavCtrl.expandMenu(event)
                                    break;
                                }
                                
                                isSelected = code == event.code && $scope.meetingNavCtrl.isSelected('/conferences/'+$scope.meeting.code+'/'+event.menus[j].code)
                                if(isSelected){
                                    selectedMenu = event.menus[j];
                                    if(!event.isExpanded)
                                        $scope.meetingNavCtrl.expandMenu(event)
                                    break;
                                }
                            }
                            if(isSelected){
                                $rootScope.conference = { selectedMenu : selectedMenu};
                                break;
                            }
                        }                
                        return isSelected;
                    },
                    hash : function() {
                        return $location.hash();
                    },
                    expandMenu : function(menu){
                        _.each($scope.conference.conference.menus, function(menu){
                            if(menu.behavior != 'fixed' && menu.menus)//expand behavior is only for menus with sub-menu
                                menu.isExpanded = false;

                            menu.isSelected = false;
                             _.each(menu.menus, function(menu){
                                    menu.isSelected = false;
                             });
                        });
                        if(menu.behavior == 'collapsed'){
                            menu.isExpanded = true;
                        }
                        menu.isSelected = true;
                        if(menu.parent)
                            menu.parent.isSelected = true;
                    }
                };

            }
        }
    }])

