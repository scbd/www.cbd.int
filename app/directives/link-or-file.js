import app from '~/app';
import html from './link-or-file.html';
import '~/directives/file'
import _ from 'lodash'
import sharedT from '~/i18n/shared/index.js';

	export default app.directive('linkOrFile', ['$http','$filter','translationService','locale',function($http,$filter, $i18n, locale) {
		return {
			restrict : "E",
			template : html,
      		replace: true,
      		scope: { 
				tempBinding: "=?ngModel" ,
				tag:'=?tag',
				autoReset: '<autoReset',
                caption: '@caption',
                onUpload : "&onUpload",
                danger : "=?"
			},
			link: function ($scope, element, attr ) {

        		$i18n.set('sharedT', sharedT );
				closeAll();

				$scope.proxyOnUpload = $scope.onUpload;
				$scope.urlSet = { title: '', url: '', tag: $scope.tag };

				const URL_PATTERN = /^(?:(http|https):\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=%]+$/;
				$scope.multiple = attr.multiple!==undefined
			
				$scope.attr       = attr;
				$scope.closeAll   = closeAll;
				$scope.toggleFile = toggleFile;
				$scope.toggleUrl  = toggleUrl;
				$scope.listData   = listData;
				$scope.submitForm = submitForm;
				$scope.remove     = remove;
				$scope.isUrlValid = isUrlValid;
				$scope.isValidForm = isValidForm;
				$scope.onChange = onChange;

				function toggleFile(){
					$scope.showFile = !$scope.showFile;
				}

				function toggleUrl(){
					$scope.showUrl = !$scope.showUrl;
				}

				function closeAll(){
					$scope.showFile   = false;
					$scope.showUrl    = false;
				}

				function submitForm(){
					console.log('save')
					$scope.tempBinding.push(_.clone($scope.urlSet))
					$scope.urlSet = { title: '', name: '', tag: $scope.tag};
					$scope.showUrl    = false;
				}

				function listData(){
					if(!$scope.tempBinding?.length) return [];

					return $scope.tempBinding.filter((fileSet)=>fileSet.tag === $scope.tag)
				}

				function remove({ title, url, tag }){
					$scope.closeAll();
					if($scope.tag)
						$scope.tempBinding = $scope.tempBinding.filter((f)=> !(f.title === title && f.url === url && f.tag === tag))
					else
						$scope.tempBinding = $scope.tempBinding.filter((f)=> !(f.title === title && f.url === url ))
				}

				function isUrlValid(url) {
					const  urlRegX = new RegExp(URL_PATTERN,"i");

					return urlRegX.test(url);
				}

				function isValidForm(){
					if(!$scope.urlSet.title) return false
					if(!$scope.urlSet.url) return false
					if(! isUrlValid($scope.urlSet.url)) return false


					return true
				}

				function onChange(){
					$scope.closeAll();
				}
			}
		};
	}]);

