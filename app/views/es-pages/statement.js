define(['app','directives/es-pages/header-nav','filters/title-case','services/fb','services/google-sheet-service'], function(app) { 'use strict';

return ['$routeParams','$scope','$location','fb','$document','$filter','ngMeta','googleSheetService', function ($routeParams,$scope,$location,fb,$document,$filter,ngMeta,googleSheetService) {

			var _ctrl = this;
			_ctrl.statement = ''
			getStatements()

			function getStatements() {
				var url = 'https://spreadsheets.google.com/feeds/cells/1_RSS-SjMifBEfUetPfr6GX8eJ3M4GMYrTrg4pXFIKkg/2/public/values?alt=json'
				return googleSheetService.get(url, 'statement', 4)
					.then(addDataToCtrl)
			}

			function loadHeader () {
				angular.element($document).ready(function() {
					$scope.$root.page = {};
					$scope.$root.page.title = "Statement from Cristiana Pașca Palmer: "+$filter('titleCase')(_ctrl.statement.title_s);
	
					fb.setTitle($scope.$root.page.title,' ');
					fb.setOgType('article');
					fb.set('article:author',['https://www.facebook.com/CristianaPascaPalmer/']);
					fb.set('article:published_time',_ctrl.statement.startDate_dt);
					fb.set('article:publisher',['https://www.facebook.com/UN.CBD/']);
					fb.set('article:section','statements');
	
					fb.set('og:url',window.location.href);
	
					fb.setImage(_ctrl.statement.img);
	
					ngMeta.setTag('twitter:creator','@CristianaPascaP');
					ngMeta.setTag('twitter:title',$scope.$root.page.title);
					ngMeta.setTag('twitter:image',_ctrl.statement.img);
	
				});
			}

			
			function addDataToCtrl(dataRows) {
				
				for(var i=0; i<dataRows.length; i++)
					if(dataRows[i]._id==$routeParams.id)
						_ctrl.statement=dataRows[i]

		

				if(!_ctrl.statement) $location.path('/404');

				loadHeader()

				return _ctrl.statement
			}
    }];
});