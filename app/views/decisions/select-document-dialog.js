define(['jquery'], function($) {

    return ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

        $timeout(function(){ $('form #symbol').focus(); }, 100);

        $scope.search = search;
        $scope.save = save;

		//==========================
		//
		//==========================
        function search(text) {

            delete $scope.document;

            if(/^http[s]?\:/.test(text)) {

                $scope.document = {
                    symbol_s : text,
                    url : text
                }

                return;
            }

            var qsParams = {
                q : "schema_s:meetingDocument AND symbol_s:"+solrEscape(text.toUpperCase()),
                fl : "symbol_?,reference_?,title_?,date_*,url_*",
                sort: "symbol_s ASC",
                rows: 1
            };

            $http.get("/api/v2013/index", { params : qsParams, cache : true }).then(function(res){

                var results = res.data.response;

                if(results.numFound) $scope.document = results.docs[0];
                else                 $scope.document = { symbol_s : text.toUpperCase(), notFound : true };
            });
        }

		//==========================
		//
		//==========================
        function save() {

            if(!$scope.document)
                return;

            $scope.closeThisDialog($scope.document.symbol_s || $scope.document)
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
