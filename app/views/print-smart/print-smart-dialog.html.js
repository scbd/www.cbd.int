define(['app', 'underscore'], function(app, _) {

	app.directive('printSmartDialog', ["$http", function($http) {
		return {
			restrict : "AC",
			require: '^printSmart',
			replace : true,
			scope :  {},
			templateUrl : "/app/views/print-smart/print-smart-dialog.html",
			link: function (scope, element, attrs, psCtrl) {

				element.on("show.bs.modal", function() {
					scope.documents = psCtrl.getDocuments();
					scope.badgeCode = "";
					scope.error     = null;
					scope.success   = null;
				});

				scope.preferedLanguage = "en";
				scope.badgeCode        = "";
				scope.cleanBadge       = cleanBadge;
				scope.clearError       = clearError;
				scope.isNetworkCall    = false;

				scope.languages = [
					{ code : "ar", name : "العربية" },
					{ code : "en", name : "English" },
					{ code : "es", name : "Español" },
					{ code : "fr", name : "Français" },
					{ code : "ru", name : "Русский" },
					{ code : "zh", name : "中文" },
				];

				//==============================================
				//
				//
				//==============================================
				function cleanBadge() {
					return (scope.badgeCode||"").replace(/[^0-9]/g, "");
				}

				//==============================================
				//
				//
				//==============================================
				function clearError() {
					scope.error = null;
				}

				//==============================================
				//
				//
				//==============================================
				scope.canPrint = function() {
					return cleanBadge().length >= 8 &&
						   scope.documents.length > 0 &&
						   !!scope.preferedLanguage;
				};

				//==============================================
				//
				//
				//==============================================
				scope.print = function() {

					scope.error = null;
					scope.success = null;

					var postData = {
						badge     : cleanBadge(),
						documents : _.map(scope.documents, function(d) {
							return {
								symbol   : d.symbol,
								url      : d.urls[scope.preferedLanguage] || d.en,
								language : d.urls[scope.preferedLanguage] ? scope.preferedLanguage : "en"
							};
						})
					};

					console.log(postData);

					scope.isNetworkCall = true;

					$http.post("/api/v2014/papersmart-requests", postData).success(function(data) {

						scope.isNetworkCall = false;

						if(angular.isObject(data)) 
							scope.success = data

						if(!scope.success.delay)
							scope.success.delay = 10;
						
					}).error(function(data, status){

						scope.isNetworkCall = false;

						if(angular.isObject(data)) scope.error = data
						else if(status==404)       scope.error = { error: "NO_SERVICE", message : "Sevice is unavailable." };
						else                       scope.error = { error: "UNKNOWN",    message : "Unknown error" };
					});
				};

				//==============================================
				//
				//
				//==============================================
				scope.close = function(clearDocuments) {

					if(!!clearDocuments)
						psCtrl.clearDocuments();

					psCtrl.showPrint(false);
				};
			}
		};
	}]);
});