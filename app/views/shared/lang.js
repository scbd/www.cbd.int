import app from '~/app';
import '~/providers/locale';
import sharedT from '~/i18n/shared/index.js';
import '~/services/translation-service'

export { default as template } from './lang.html';
export default ["$scope", "$location", "locale","$timeout", "$window", "$routeParams", "$cookies", 'translationService',
		function ($scope, $location, locale, $timeout, $window, $routeParams, $cookies, translationService){

				translationService.set('sharedT', sharedT);
				
			    let lang = 'en';
				if($routeParams.langCode)
					lang = $routeParams.langCode;

				$cookies.put("locale", lang, {path: "/"});	

                $scope.currentLanguage = lang;
								
				$timeout(function(){
					var langRegex = new RegExp('^\/(ar|en|es|fr|ru|zh)(\/|$)');
					var returnUrl = $location.search().returnUrl;

					// if(!langRegex.test(returnUrl)){
					// 	returnUrl = '/' + lang + '/' + returnUrl.replace(/^\//, ''); 
					// }
//					$window.location.href = returnUrl;

				}, 1000);
		}];

