define(['app','moment','directives/es-pages/header-nav','filters/moment','services/fb','services/google-sheet-service'], function(app,moment) { 'use strict';


app.filter("byDate", function() {
  return function(items,d) {

	if(!d) return items;
	var arrayToReturn = [];
	for (var i=0; i<items.length; i++){
		var date = moment(items[i].startDate_dt);

		if (moment(date).isSame(d, 'year'))  {
			arrayToReturn.push(items[i]);
		}
	}
	return arrayToReturn;
 };
});

return ['$location','$scope','$q','$http','fb','$document','ngMeta','user','googleSheetService', function ($location,$scope,$q,$http,fb,$document,ngMeta,user,googleSheetService) {

			var _ctrl = this;
			_ctrl.documents ={}
			var canceler = null;
			_ctrl.goTo = goTo;
      _ctrl.getTypeCount = getTypeCount;
      _ctrl.getYearCount = getYearCount;

      _ctrl.isAdmin  = isAdmin
      _ctrl.years = genYears()

      function genYears(){
        var years = []
        var year = (new Date()).getFullYear()
        var startYear = 2016

        while(year >= startYear){
          years.push(year)
          year--
        }
        return years
      }
      //============================================================
      //
      //============================================================
     function isAdmin () {
        if($scope.user)
           return !!_.intersection($scope.user.roles, ["Administrator","ChmAdministrator","undb-administrator"]).length;
      }

			$scope.$root.page={};
			_ctrl.work = [];
            _ctrl.hasMonthChange = hasMonthChange;

			getStatements()
			getReports()

            angular.element($document).ready(function() {

				$scope.$root.page.title = "Cristiana Pașca Palmer at Work.";
                $scope.$root.page.description = 'A database of statements,news and events of Cristiana Pașca Palmer work on UN Biodiversity Convention.';
				fb.setTitle($scope.$root.page.title,' ');
				fb.set('og:description', $scope.$root.page.description);
				fb.set('og:url',window.location.href);

				fb.setImage('https://attachments.cbd.int/es6.jpg');
				fb.setOgType('profile');
				fb.set('og:profile:first_name','Cristiana');
				fb.set('og:profile:last_name','Pașca Palmer');
				fb.set('og:profile:gender','female');
				fb.set('fb:profile_id','CristianaPascaPalmer');
				fb.set('og:see_also',['https://www.cbd.int/executive-secretary/bio','https://www.cbd.int/executive-secretary','https://www.cbd.int/executive-secretary/media','https://www.cbd.int/executive-secretary/contact']);

                ngMeta.setTag('twitter:creator','@CristianaPascaP');
				ngMeta.setTag('twitter:title',$scope.$root.page.title);
				ngMeta.setTag('twitter:description',$scope.$root.page.description);
				ngMeta.setTag('twitter:image','https://attachments.cbd.int/es6.jpg');
			});
			getEvents();

			function getStatements() {
				var url = 'https://spreadsheets.google.com/feeds/cells/1_RSS-SjMifBEfUetPfr6GX8eJ3M4GMYrTrg4pXFIKkg/2/public/values?alt=json'
				return googleSheetService.get(url, 'statement', 4)
					.then(addDataToWork)
			}
	
			function getReports() {
				var url = 'https://spreadsheets.google.com/feeds/cells/1_RSS-SjMifBEfUetPfr6GX8eJ3M4GMYrTrg4pXFIKkg/3/public/values?alt=json'
				return googleSheetService.get(url, 'report', 4)
					.then(addDataToWork)
			}
	
			function addDataToWork(dataRows) {
				_ctrl.work = _ctrl.work.concat(dataRows)
				_ctrl.work=_ctrl.work.sort(function(a, b) {
					a = new Date(a.startDate_dt);
					b = new Date(b.startDate_dt);
					return a>b ? -1 : a<b ? 1 : 0;
				})
				return _ctrl.work
			}

			//============================================================
			//
			//============================================================
			function goTo (url) {
					$location.path(url);
			}
			//============================================================
			//
			//============================================================
			function getEvents () {
							var q = 'schema_s:event AND thematicArea_ss:BD8F75CA-32D4-427B-A9CE-55079989A0CC';//_state_s:public AND
							return query('event',q);
			}
			//=======================================================================
			//
			//=======================================================================
			function query(schema,query) {

						_ctrl.loading         = true;


					var queryParameters = {
							'q': query,
							'sort': 'createdDate_dt desc',
				//			'fl': 'identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
							'wt': 'json',
							'start': 0,
							'rows': 25,
							'facet': true,
							'facet.field': ['schema_s', 'hostGovernments_ss', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss'],
							'facet.limit': 999999,
							'facet.mincount' : 1
					};

					if (canceler) {
							canceler.resolve(true);
					}

					canceler = $q.defer();
					var pagePromise = $q.when($http.get('https://www.cbd.int/api/v2013/index/select', {  params: queryParameters, timeout: canceler}))
						.then(function (data) {
								data=data.data;
								canceler = null;

							_ctrl.work = 	_ctrl.work.concat(data.response.docs);
							_ctrl.work=_ctrl.work.sort(function(a, b) {
							    a = new Date(a.startDate_dt);
							    b = new Date(b.startDate_dt);
							    return a>b ? -1 : a<b ? 1 : 0;
							});
					}).catch(function(error) {
							console.log('ERROR: ' + error);
					})
					.finally(function(){
						_ctrl.loading = false;
					});
					return pagePromise;
			}// query

            //============================================================
            //
            //============================================================
            function hasMonthChange(dayOne, dayTwo){
              if(!dayTwo || !dayOne) return false;

              if(!moment(dayOne).startOf('month').isSame(moment(dayTwo).startOf('month')))
                return true;
            }//itemSelected
            //============================================================
            //
            //============================================================
            function getTypeCount(type){
              var count=0;
              for(var i=0; i<_ctrl.work.length ;i++)
                if(_ctrl.work[i].schema_s===type)
                    count++;

                return count;

            }//itemSelected
            //============================================================
            //
            //============================================================
            function getYearCount(year){
              var count=0;
              for(var i=0; i<_ctrl.work.length ;i++){

                if(moment(_ctrl.work[i].startDate_dt).startOf('year').isSame(moment(year).startOf('year')))
                    count++;
}
                return count;

            }//itemSelected
    }];

});
