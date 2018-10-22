define(['angular', 'lodash', 'dropbox-dropins', 'directives/checkbox'], function(angular, _, Dropbox) {'use strict';

    return ['$scope', '$http', 'documents','$rootScope', function ($scope, $http, documents,$rootScope) {

		var publicComputer    = true; // TODO
		var signedInToDropbox = false;

		$scope.close            = close;
		$scope.documents        = documents;
		$scope.languages        = _(documents).map('files').flatten().map('language').uniq().sortBy().value();
		$scope.formats          = _(documents).map('files').flatten().map('type'  ).uniq().sortBy().value();
		$scope.selectedLanguages= {};
		$scope.selectedFormats  = {};
        $scope.canDropbox       = canDropbox;
        $scope.sendToDropbox    = sendToDropbox;
    $scope.download        = download

		if($scope.languages.length==1) $scope.selectedLanguages[$scope.languages[0]] = true;
		if($scope.formats  .length==1) $scope.selectedFormats[$scope.formats[0]] = true;

		$scope.$watch('selectedFormats', initDownloadLink, true);
		$scope.$watch('selectedLanguages', initDownloadLink, true);

		if(canDropbox && publicComputer)
			signoutDropbox();

		//==============================================
		//
		//
		//==============================================
		function initDownloadLink()	{

			delete $scope.success;
			delete $scope.downloadLink;

			var urls = selectedLinks();

			if(urls.length) {
        if($rootScope.viewOnly)
          return $scope.downloadLink = ''
          
				$http.post('/api/v2014/printsmart-downloads', urls).then(function(res){
					$scope.downloadLink = '/api/v2014/printsmart-downloads/'+res.data._id;
				}).catch(function(err){
					console.error(err);
				});
			}
		}

    function download(event){
      console.log()
      $scope.success='download'
      if($rootScope.viewOnly){
        event.preventDefault()
        $scope.downloadLink = ''
        window.parent.postMessage(JSON.stringify(selectedLinks()),'*');
      }
    }
        //==============================================
        //
        //
        //==============================================
        function logDownloadHit(urls) {

            if(urls && urls.length) {
                $http.post('/api/v2014/printsmart-downloads/hit', urls);
            }
        }

		//==============================================
		//
		//
		//==============================================
		function selectedLinks() {

            return _(documents).map(function(doc){
                return _(doc.files||[])
                    .filter(function(f){ return $scope.selectedLanguages[f.language] && $scope.selectedFormats[f.type]; })
                    .pluck('url')
                    .value();

            }).flatten()
              .compact()
              .uniq()
              .value();
		}

		//==============================================
		//
		//
		//==============================================
		function canDropbox() {
			return Dropbox && Dropbox.isBrowserSupported();
		}

		//==============================================
		//
		//
		//==============================================
		function sendToDropbox() {

			$scope.success = null;

            var urls  = selectedLinks();
			var files = _.map(urls, function(url) { return { url : url }; });

			if(!files.length)
				return;

			signedInToDropbox = true;

			var started = false;

			Dropbox.save({
			    files : files,
			    progress : function () {

					if(started)
						return;

					started = true;

					$scope.$applyAsync(function() {
						$scope.success = 'dropbox';
                        logDownloadHit(urls);
					});
				},
			    error : function (errorMessage) {

					console.error('DROPBOX ERROR', errorMessage);

					$scope.$applyAsync(function() {
						$scope.error = {
							error   : 'DROPBOX',
							message : errorMessage
						};
					});
				}
			});
		}

		//==============================================
		//
		//
		//==============================================
		function signoutDropbox() {

			angular.element('body').append('<iframe height="0" width="0" style="display:none" src="https://www.dropbox.com/logout"></iframe>');
		}

		//==============================================
		//
		//
		//==============================================
		function close(target) {

			if(signedInToDropbox && publicComputer)
				signoutDropbox();

            $scope.closeThisDialog(target);
		}
	}];
});
