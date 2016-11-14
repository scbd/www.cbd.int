/* global -close */
define(['lodash'], function(_) {

    var PDF = 'application/pdf';

	return ["$scope", "documents", function ($scope, documents) {

		$scope.documents = documents;

		$scope.download = function() { $scope.closeThisDialog('download'); };
		$scope.print    = function() { $scope.closeThisDialog('print');    };
		$scope.close    = function() { $scope.closeThisDialog();           };
        $scope.canPrint = true;
        $scope.printableDocuments = _(documents).filter(function(d) {
            return d.type=='in-session' && _(d.files||[]).some({ mime: PDF }) ;
        }).value();
	}];
});
