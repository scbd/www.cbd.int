define([], function() {

    return ['$scope', '$http', function ($scope, $http) {

        $scope.search = search;

		//==========================
		//
		//==========================
        function search(text) {

            if(!text) {
                $scope.results = null;
                $scope.notification = null;
            }

            text = solrEscape(text).toUpperCase();

            var qsParams = {
                q : "schema_s:notification AND (symbol_s:"+text+"* OR reference_t:"+text+"*)" + " AND (symbol_t:*)",
                fl : "symbol_t,reference_t,title_t",
                sort: "symbol_s ASC",
                rows: 1
            };

            $http.get("/api/v2013/index", { params : qsParams, cache : true }).then(function(res){

                var results = res.data.response;

                $scope.results = results;
                $scope.notification = results.numFound ? results.docs[0] : null;
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
