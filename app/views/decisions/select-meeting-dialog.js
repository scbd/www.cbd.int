define(['jquery'], function($) {

    return ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

        $timeout(function(){ $('form #symbol').focus(); }, 100);

        $scope.search = search;
        $scope.save = save;

		//==========================
		//
		//==========================
        function search(text) {

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

            $http.get("/api/v2013/index", { params : qsParams, cache : true }).then(function(res){

                var results = res.data.response;

                $scope.results = results;
                $scope.meeting = results.numFound ? results.docs[0] : null;
            });
        }

		//==========================
		//
		//==========================
        function save() {

            if(!$scope.meeting)
                return;

            $scope.closeThisDialog({
                symbol : $scope.meeting.symbol_s,
                title : $scope.meeting.title_EN_t
            });
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
});
