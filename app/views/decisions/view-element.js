define(['app', 'text!./view-element.html'], function(app, html) { 'use strict';

	return app.directive('info', ["$http", function($http) {

        console.log('dataInfo registered')
		return {
			restrict : "A",
		//	replace : true,
			template : html,
			transclude: true,
		//	require: '?^printSmart',
			scope: true,//  {
		//		documentsFn : "&documents",
		//		tag : "@tag"
		//	},
			link: function ($scope, element, attrs) {

				var info = JSON.parse(attrs.info);

		//     if(info.type=='title') {
		//         $(this).addClass('always');
		//     }
		//
			    if(info.type=='sectionTitle') {
			        element.addClass('sectionTitle');
			    }

				if(info.type=='paragraph') {
console.log(info)
					$scope.type     = info.data.type;
					$scope.session  = info.data.session;
					$scope.decision = info.data.decision;
					$scope.section  = info.data.section;
					$scope.code     = info.data.paragraph;
					$scope.name     = 'paragraph ' + info.paragraph;
					$scope.actors   = info.data.actors;
					$scope.statuses = info.data.statuses;




					if(info.item) {

						var n = info.item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

				        $scope.code += '.' + n;
				        $scope.name += ' item ('+info.item+')';
				    }
				}

				if($scope.type=='information') $scope.type = 'informational';


	            //     if(info.data && info.data.code==routeCode) {
	            //         $(this).addClass('current');
	            //         $scope.current = info;
	            //     }



	            //	TO MOVE TO PARENT
				//
	            //     if(info.data && info.data.actors) {
	            //         $scope.actors = _.union($scope.actors, info.data.actors);
	            //     }
	            //
				//         if(info.data && info.data.statuses && info.data.statuses.includes('implemented')) $(this).addClass('implemented');
	            //         if(info.data && info.data.statuses && info.data.statuses.includes('superseded')) $(this).addClass('superseded');
	            //         if(info.data && info.data.statuses && info.data.statuses.includes('elapsed')) $(this).addClass('elapsed');
	            //         if(info.data && info.data.statuses && info.data.statuses.includes('active')) $(this).addClass('active');



	            //
	            //         $(this).addClass('box');
	            //
	            //                 });
	            //             }
	            //
	            //         }
	            //     }
	            //
	            //
	            //
	            //     if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('implemented'))
	            //         $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> implemented</span> ');
	            //     if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('superseded'))
	            //         $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> superseded</span> ');
	            //     if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('elapsed'))
	            //         $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> elapsed</span> ');
	            //     if($scope.list && info.data && info.data.statuses && info.data.statuses.includes('active'))
	            //         $(this).prepend('<span class="pull-right label label-success" style="opacity:0.5;margin-right:6px"><i class="fa fa-info-circle" aria-hidden="true"></i> active</span> ');
	            //
	            //         if(info.paragraph && $scope.list && type=='operational')
	            //             $(this).prepend('<span class="pull-right label label-info" style="opacity:0.5;"><i class="fa fa-cog" aria-hidden="true"></i> '+type+'</span>');
	            //         if(info.paragraph && $scope.list && type=='informational')
	            //             $(this).prepend('<span class="pull-right label label-default" style="opacity:0.5;"><i class="fa fa-info-circle" aria-hidden="true"></i> '+type+'</span>');
	            //
	            //
	            //     // if(info.data)
	            //     //     $(this).append(JSON.stringify(info.data));
	            //
	            //     if(type=='informational') $scope.infoCount++;
	            //     if(type=='operational'  ) $scope.operCount++;
	            //
	            //     if(info.data && info.data.statuses && info.data.statuses.includes('implemented')) $scope.statusCounts.implemented++;
	            //     if(info.data && info.data.statuses && info.data.statuses.includes('superseded'))  $scope.statusCounts.superseded++;
	            //     if(info.data && info.data.statuses && info.data.statuses.includes('elapsed'))     $scope.statusCounts.elapsed++;
	            //     if(info.data && info.data.statuses && info.data.statuses.includes('active'))      $scope.statusCounts.active++;
	            //
	            //
	            // });
	            //
	            // if(!$scope.list)
	            //     $scope.filter('current', 1);
			}
		};
	}]);
});
