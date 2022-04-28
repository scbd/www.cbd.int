
import 'file-saverjs';
import 'bigText';
import _ from 'lodash';
import ngDialog from 'ngDialog';
import languageTranslation from './other-langugages.json';
import '~/directives/articles/cbd-article';
import * as htmlToImage from 'html-to-image'
      
export { default as template  } from './customize.html';

export default ['$location', 'user','$http','$scope', '$timeout', '$window', 'ngDialog', 'captchaSiteKeyV2',  function( $location, user,$http, $scope,  $timeout, $window, ngDialog, captchaSiteKeyV2) {
        var recaptchaWidgetId;

        $scope.$root.page={
            title : "International Biodiversity Day logo : customize",
            description : $('#logo-description').text()
        };
        $scope.defaultLanguages = [
            {code:'ar', language            : 'Arabic'  , group:'UN languages'},
            {code:'en', language            : 'English' , group:'UN languages'},
            {code:'fr', language            : 'French'  , group:'UN languages'},
            {code:'ru', language            : 'Russian' , group:'UN languages'},
            {code:'es', language            : 'Spanish' , group:'UN languages'},
            {code:'zh', language            : 'Chinese' , group:'UN languages'},
        ]
        $scope.text = {
            en : {
                line1_part1         : 'BIODIVERSITY',
                line2_part1         : 'Day',
                line2_part2         : '22 MAY',
                line2_part2_css     : 'outline-text',
                hashTag             : '#ForNature', 
                name:'Biodiversity', 
                isUNLanguage:true,
                line2CutOffMargin : 17,
                line3CutOffMargin : 13 
            },
            es:{
                line1_part1         : '22 DE MAYO',
                line1_part2         : 'DÍA DE LA',
                line2_part1         : 'BIODIVERSIDAD',
                line1_part1_css     : 'outline-text',
                hashTag             : '#PorLaNaturaleza', name:'La biodiversidad', isUNLanguage:true,
                line2CutOffMargin : 17,
                line3CutOffMargin : 5 
            },
            fr:{
                line1_part1         : '22 MAI',
                line1_part2         : 'JOURNÉE DE LA',
                line2_part1         : 'BIODIVERSITÉ',
                line1_part1_css     : 'outline-text',
                hashTag             : '#PourLaNature', name:'Biodiversité', isUNLanguage:true,
                line2CutOffMargin : 18,
                line3CutOffMargin : 4 
            },
            ru:{
                line1_part1         : '22 МАЯ',
                line1_part2         : 'ДЕНЬ',
                line2_part1         : 'БИОРАЗНООБРАЗИЯ',
                line1_part1_css     : 'outline-text',
                hashTag             : '#ЗаПрироду', name:'Биоразнообразие', isUNLanguage:true,
                line2CutOffMargin : 35,
                line3CutOffMargin : -5 
            },
            zh:{
                line1_part1         : '生物多样性日',                
                line2_part2         : '5月22日',
                line2_part2_css     : 'outline-text',
                hashTag             : '有份', name:'生物多样性', isUNLanguage:true,
                line2CutOffMargin : 19,
                line3CutOffMargin : 8 
            },
            ar:{
                line1_part1         : 'يوم',
                line1_part2         : '٢٢ أيار/مايو',
                line2_part1         : 'يوم التنوع البيولوجي',
                line1_part2_css     : 'outline-text',
                hashTag             : 'من#_أجل_الطبيعة', name:'التنوع البيولوجي', isUNLanguage:true,
                line2CutOffMargin : 13,
                line3CutOffMargin : 1 
            },
            ...languageTranslation            
        }
        $scope.rtlLanguages = {
            ar	: 'Arabic',
            dv	: 'Divehi',
            fa	: 'Persian',
            ha	: 'Hausa',
            iw	: 'Hebrew',
            ks	: 'Kashmiri',
            ps	: 'Pashto',
            ur	: 'Urdu',
            ji	: 'Yiddish',
        }
        
        $scope.language = { code : 'en' }
        $scope.isAdmin  = _.intersection(['Administrator', 'idb-logo-administrator'], user.roles).length

        var basePath  = $scope.basePath = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');

        $scope.saveImage = function(generateOnly) { 
            $scope.showSuccessMessage = false;
            $scope.uploading = true;
            var node =document.getElementById("imgGenerator");

            htmlToImage.toPng(node)
            .then(function (dataUrl) {
                var img = new Image();
                img.src = dataUrl;
                // $('#newImage').empty().append(img);

                if(!generateOnly){  
                    if(~document.location.hostname.indexOf('cbd.int')){
                        $window.ga('set',  'page', basePath+$location.path() + '?name='+$scope.text[$scope.language.code].name+'&language='+$scope.language.code);
                        $window.ga('send', 'pageview');
                    }
                    const blob = dataURLtoBlob(dataUrl);
                    return uploadImage(dataUrl)
                    .then(function(){
                        saveAs(blob, `22-May-Biodiversity-Day_${$scope.language.code||''}.png`);  
                    });
                }
            })
            .catch(function (e) {
                console.error('oops, something went wrong!', e);
                if(e.data.code == "INVALID_CAPTCHA"){
                    $scope.error = 'There was a problem with captcha validation, please try again';
                }
                if(e.data.code == "INVALID_CAPTCHA_SCORE"){
                    $scope.error = e.data.message;
                }
                else{
                    $scope.error = 'There was a problem connecting to our server, please try again';
                }
            })
            .finally(()=>{
                $scope.$applyAsync(()=> {
                    $scope.uploading = false;
                    $scope.grecaptchaToken = undefined;
                    grecaptcha.reset(recaptchaWidgetId);
                });
            });
        };

        $scope.onLanguageChange = function(){
            $scope.fitText();
            // if(!['ar', 'en', 'fr', 'ru', 'es', 'zh',].includes($scope.language.code))
            //     $scope.customLanguage($scope.language.code);
        }

        $scope.fitText = function(selector){

            if($scope.rtlLanguages[$scope.language.code])
                $('.boxIncon').css('direction', 'rtl')
            else
                $('.boxIncon').css('direction', 'ltr')

            selector = selector||'.fit'
            $timeout(function(){
                let maxFontSize;// = 120;
                if(['zh'].includes($scope.language.code))
                    maxFontSize = 150;

                $('#bigtext').bigtext({
                    maxfontsize:maxFontSize
                });
                resizeMargins();
                // $scope.saveImage(true);
            }, 200)
        }
        
        $scope.customLanguage = function(lang){

            return;
            $scope.customText = _.clone($scope.text[lang]);
            if(! $scope.customText){
                $scope.customText = $scope.text[lang] = _.clone($scope.text['en']);
                $scope.fitText();
            }

            $scope.customText.language = _.find($scope.defaultLanguages, {code:lang});
            $scope.customText.logoType = $scope.customText.logoType || 'individual'
            ngDialog.open({
                template: 'customLanguage',
                closeByDocument: false,
                scope: $scope,
            });
        };
        $scope.closeDialog = function(){
            $scope.customText = undefined;
            ngDialog.close();
        }
        $scope.applyTranslation = function(translation){

            if(!translation.language){
                translation.missingLanguage = true;
                return 
            }
            else{
                translation.missingLanguage = undefined;
            }
                        translation.isCustomLanguage  = true;
            $scope.text[translation.language.code]    = translation;
                        $scope.language               = translation.language ;
                        $scope.customText             = undefined;
                        $scope.logoType               = translation.logoType;

            if(!_.find($scope.defaultLanguages, translation.language ))
                $scope.defaultLanguages.push(translation.language);

            $scope.fitText();
            ngDialog.close();
        }

        $scope.capitalize = function(){
            $scope.customText.date = ($scope.customText.date||'').toUpperCase()
            $scope.customText.day = ($scope.customText.day||'').toUpperCase()

        }
        
        function resizeMargins() {
            var logs = {};
            
            const languageDetails = $scope.text[$scope.language.code];
            languageDetails.line2CutOffMargin = languageDetails.line2CutOffMargin || 14;
            languageDetails.line3CutOffMargin = languageDetails.line3CutOffMargin || 9;

            var idbLogo    = $('.boxGenerate #logoImg');

            var line1      = $('#bigtext #line1');
            var line1_part1= $('#bigtext #line1_part1');
            var line1_part2= $('#bigtext #line1_part2');
            var line2_part1= $('#bigtext #line2_part1')
            var line2_part2= $('#bigtext #line2_part2')
            var line2      = $('#bigtext #line2')
            var customText = $('#bigtext #customText')

            var myImgHeight      = idbLogo   .height(),
                line1Height      = line1     .height(),
                line2Height      = line2     .height(),
                customTextHeight = customText.height();



            var idbLogoFontSize    = parseInt(idbLogo   .css("fontSize")||0),
                line1fontSize      = parseInt(line1     .css("fontSize")||0),
                line2fontSize      = parseInt(line2     .css("fontSize")||0),
                customTextfontSize = parseInt(customText.css("fontSize")||0);

            line1       .css("height", line1fontSize     +'px')
            line2       .css("height", line2fontSize     +'px')           
            customText  .css("height", customTextfontSize+'px')
            

            var totalFontSize = line1fontSize +
                                line2fontSize  +
                                customTextfontSize;
            
            let customTextMarginAdjust = 21;
            let line2MarginAdjust      = 4;
            var equalMargin  = (myImgHeight-totalFontSize)/2;
            var margin_line1 = ((line1Height    - line1fontSize   )/2)
            var margin_line2 = ((line2Height    - line2fontSize   )/2)
            var margin_customText = ((customTextHeight    - customTextfontSize   )/2)

            if($scope.language.code== 'ru'){
                customTextMarginAdjust = 28;
                line2MarginAdjust      = -9;
            }

            line1       .css('margin-top', `-${margin_line1}px`);            
            line2       .css('margin-top', `${(-margin_line2+equalMargin)+languageDetails.line2CutOffMargin}px`)
            customText  .css('margin-top', `${equalMargin+languageDetails.line3CutOffMargin}px`)

            logs = {
                ...logs,
                myImgHeight,
                idbLogoFontSize,
                line1Height,
                line1fontSize,     
                line2Height,
                line2fontSize,    
                customTextHeight, 
                customTextfontSize,
                totalFontSize,
                equalMargin,
                ...languageDetails
            }
            $scope.logs = logs
        }        

        function onResize() {
            $scope.fitText();
        }

        function uploadImage(blob){

            var data = {
                'file': blob,
                year: (new Date()).getFullYear(),
                'language': $scope.language.code,
                ...$scope.text[$scope.language.code]
            }

            return $http.post('/api/v2021/idb-logos', data, {headers: {'x-captcha-v2-token':$scope.grecaptchaToken}})
            .then(function(success) {
                $scope.showSuccessMessage = true;
                return success.data;
            })
        }

        function loadLanguages(){
            
            $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms', {cache:true}).then(function(data){
                data.data.forEach(function(lang){
                    var code = lang.identifier.replace('lang-', '')
                    if(languageTranslation[code] && !_.find($scope.defaultLanguages, {code : code})){
                        var lang = {
                            ...languageTranslation[code],
                            code: code,
                            language: lang.title.en,
                            group:'Other Languages',
                        }
                        $scope.defaultLanguages.push(lang)
                        return lang;
                    }
                });
                $scope.defaultLanguages = _($scope.defaultLanguages).compact().uniq().sort(function(a,b){
                    if(a.language<b.language) return -1;
                    if(a.language>b.language) return  1;
                    return 0;
                }).value();
            })
        }

        function recaptchaCallback(token){
            $scope.$applyAsync(function(){
                $scope.grecaptchaToken = token;
                $scope.error = undefined;
            })
        }

        function buildQuery(){
            var ag   = [];
            var tags = ['biodiversity-day', 'logo', 'customize', 'introduction'];
            
            
            var match = { "adminTags" : { $all: tags }};

            ag.push({"$match"   : match });
            ag.push({"$project" : { title:1, content:1}});
            ag.push({"$sort"    : { "meta.updatedOn":-1}});
            ag.push({"$limit"   : 1 });

            $scope.articleQuery = ag;
        }

        function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type:mime});
        }

        angular.element($window).on('resize', onResize);
        $scope.$on('$destroy', function(){
            angular.element($window).off('resize', onResize);
        });

        $timeout(function(){
            $scope.fitText();           

            recaptchaWidgetId = grecaptcha.render('g-recaptcha', {
                'sitekey' : captchaSiteKeyV2,
                'callback' : recaptchaCallback,
            });

        }, 200);


        loadLanguages();
        buildQuery();
}]
