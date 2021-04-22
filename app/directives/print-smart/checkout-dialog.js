/* global -close */
import _ from 'lodash'

export { default as template } from './checkout-dialog.html';

export default ["$scope", "documents", "allowPrint", function ($scope, documents, allowPrint) {

		$scope.allowPrint            = allowPrint;
		$scope.printableDocuments    = documents.printable;
		$scope.downloadableDocuments = documents.downloadable;
        $scope.documents             = _.union(documents.downloadable, documents.printable);

		$scope.download = function() { $scope.closeThisDialog('download'); };
		$scope.print    = function() { $scope.closeThisDialog('print');    };
		$scope.close    = function() { $scope.closeThisDialog();           };
	}];