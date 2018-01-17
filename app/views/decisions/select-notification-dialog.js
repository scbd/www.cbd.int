define(['jquery'], function($) {

    return ['$scope', '$http', '$timeout', '$q', function ($scope, $http, $timeout, $q) {

        $timeout(function(){ $('form #symbol').focus(); }, 100);

        var searching = null;

        $scope.search = search;
        $scope.save = function() { $q.when(searching).then(save); } ;

		//==========================
		//
		//==========================
        function search(text) {

            searching = null;

            if(!text) {
                $scope.results = null;
                $scope.notification = null;
            }

            text = solrEscape(text).toUpperCase();

            var qsParams = {
                q : "schema_s:notification AND (symbol_s:"+text+"* OR reference_t:"+text+"*)" + " AND (symbol_t:*)",
                fl : "symbol_?,reference_?,title_?",
                sort: "symbol_s ASC",
                rows: 1
            };

            searching = $http.get("/api/v2013/index", { params : qsParams, cache : true }).then(function(res){

                searching = null;
                var results = res.data.response;

                $scope.results = results;
                $scope.notification = results.numFound ? results.docs[0] : null;
            });
        }

		//==========================
		//
		//==========================
        function save() {

            if(!$scope.notification)
                return;

            $scope.closeThisDialog({
                symbol : $scope.notification.symbol_t,
                reference : $scope.notification.reference_t,
                title : $scope.notification.title_t
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
