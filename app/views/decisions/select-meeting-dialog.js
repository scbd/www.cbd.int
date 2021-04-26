import $ from 'jquery'

export { default as template }  from './select-meeting-dialog.html'

export default ['$scope', '$http', '$timeout', '$q', function ($scope, $http, $timeout, $q) {

        $timeout(function(){ $('form #symbol').focus(); }, 100);

        var searching = null;

        $scope.search = search;
        $scope.save = function() { $q.when(searching).then(save); } ;
        $scope.canSave = canSave;
        $scope.isUrl= isUrl;


		//==========================
		//
		//==========================
        function search(text) {

            searching = null;

            if(!text) {
                $scope.results = null;
                $scope.meeting = null;
            }

            text = solrEscape(text).toUpperCase();

            var qsParams = {
                q : "schema_s:meeting AND (symbol_s:"+text+"* OR title_t:"+text+"*)",
                fl : "symbol_?,title_EN_t,eventCountry_EN_t,eventCity_EN_t,startDate_dt,endDate_dt",
                sort: "symbol_s ASC",
                rows: 1
            };

            searching = $http.get("/api/v2013/index", { params : qsParams, cache : true }).then(function(res){

                searching = null;
                var results = res.data.response;

                $scope.results = results;
                $scope.meeting = results.numFound ? results.docs[0] : null;
            });
        }

		//==========================
		//
		//==========================
        function save() {

            if(!canSave())
                return;

            var result;

            if(isUrl($scope.symbol)) {
                result = {
                    symbol : $scope.symbol,
                    url: $scope.symbol,
                    title: $scope.symbol
                };
            }

            if($scope.meeting) {
                result = {
                    symbol : $scope.meeting.symbol_s,
                    title : $scope.meeting.title_EN_t
                }
            }

            if(result)
                $scope.closeThisDialog(result);
        }

        //====================================
        //
        //====================================
        function canSave() {
            return $scope.meeting || isUrl($scope.symbol);
        }

        //====================================
        //
        //====================================
        function isUrl(text) {
            return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/i.test(text||'');
        }

		//==========================
		//
		//==========================
		function solrEscape(value) {

			if(value===undefined) throw "Value is undefined";
			if(value===null)      throw "Value is null";
			if(value==="")        throw "Value is null";

			if(typeof(value) == "number") value = value.toString();
			if(value instanceof Date)     value = value.toISOString();

			//TODO add more types

			value = value.toString();

			value = value.replace(/\\/g,   '\\\\');
			value = value.replace(/\+/g,   '\\+');
			value = value.replace(/\-/g,   '\\-');
			value = value.replace(/\&\&/g, '\\&&');
			value = value.replace(/\|\|/g, '\\||');
			value = value.replace(/\!/g,   '\\!');
			value = value.replace(/\(/g,   '\\(');
			value = value.replace(/\)/g,   '\\)');
			value = value.replace(/\{/g,   '\\{');
			value = value.replace(/\}/g,   '\\}');
			value = value.replace(/\[/g,   '\\[');
			value = value.replace(/\]/g,   '\\]');
			value = value.replace(/\^/g,   '\\^');
			value = value.replace(/\"/g,   '\\"');
			value = value.replace(/\~/g,   '\\~');
			value = value.replace(/\*/g,   '\\*');
			value = value.replace(/\?/g,   '\\?');
			value = value.replace(/\:/g,   '\\:');

			return value;
		}
	}];