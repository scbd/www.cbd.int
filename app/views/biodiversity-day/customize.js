
import 'file-saverjs';
import 'bigText';
import _ from 'lodash';
import languageTranslation from './other-langugages-2025.js';
import Vue from 'vue'
import 'ngVue'
import '~/services/article-service'
import CbdArticle from '~/directives/articles/cbd-article.vue';
import 'angular-vue'

export { default as template  } from './customize.html';

export default ['$location', 'user','$http','$scope', '$timeout', '$window', 'ngDialog', 'captchaSiteKeyV2',  function( $location, user,$http, $scope,  $timeout, $window, ngDialog, captchaSiteKeyV2) {
        var recaptchaWidgetId;

        $scope.vueOptions  = { components: { CbdArticle } };

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
                line1_part1         : '',
                line1_part2         : 'International Day',
                line2_part1         : `for Biodiversity ${new Date().getFullYear()}`,
                name:'Name', 
                individual:'Name',
                collective:'Organization',
                line2_part2         : `Harmony with nature and sustainable development`,

                isUNLanguage:true,
                charLimit: 45,
                and:'and'
            },
            es:{
                line1_part1         : '',
                line1_part2         : 'Día Internacional',
                line2_part1         : `de la Biodiversidad ${new Date().getFullYear()}`,
                line2_part2         : `Armonía con la naturaleza y desarrollo sostenible`,
                name:'Nombre',
                individual:'Nombre',
                collective:'Organización',
                isUNLanguage:true,
                and:'y'
            },
            fr:{
                line1_part1         : '',
                line1_part2         : 'Journée Internationale',
                line2_part1         : `de la Biodiversité ${ new Date().getFullYear() }`,
                line2_part2         : `Harmonie avec la nature et développement durable`,
                name:'Nom',
                individual:'Nom',
                collective:'Organisation',
                isUNLanguage:true,
                charLimit: 35,
                and:'et'
            },
            ru:{ 
                line1_part1         : '',
                line1_part2         : 'МЕЖДУНАРОДНЫЙ ДЕНЬ',
                line2_part1         : `БИОРАЗНООБРАЗИЯ ${ new Date().getFullYear() } Г.`,
                line2_part2         : `Гармония с природой и устойчивое развитие`,
                name:'Имя',
                individual:'Имя',
                collective:'Организация',
                isUNLanguage:true,
                charLimit: 30,
                and:'и'
            },
            zh:{
                line1_part1         : '',
                line1_part2         : `${ new Date().getFullYear() }年国际生物多样性日`,
                line2_part2         : `与自然和谐相处和可持续发展`,
                name:'姓名',
                individual:'姓名',
                collective:'组织',
                isUNLanguage:true,
                and:'和'
            },
            ar:{
                line1_part2         : 'اليوم الدولي',
                line2_part1         : `للتنوع البيولوجي ${ new Date().getFullYear()}`,
                line2_part2         : `االانسجام مع الطبيعة والتنمية المستدامة`,
                name:'اسم',
                individual:'اسم',
                collective:'منظمة',
                isUNLanguage:true,
                charLimit: 45,
                and:'و'
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
            $scope.fitText();
            $scope.showSuccessMessage = false;
            $scope.uploading = true;

                if(!generateOnly){  
                    if(~document.location.hostname.indexOf('cbd.int')){
                        $window.gtag('event', 'page_view', {
                            'page_location' : basePath+$location.path(),
                            'name': $scope.text[$scope.language.code].name,
                            'language': $scope.language.code
                        });
                    }
                     uploadImage()
                    .then(function(blob){
                        saveAs(new Blob([blob]), `22-May-Biodiversity-Day_${$scope.language.code||''}.png`);  
                    })
                    .catch(function (e) {
                        console.error('oops, something went wrong!', e);
                        if(e && e.data && e.data.code == "INVALID_CAPTCHA"){
                            $scope.error = 'There was a problem with captcha validation, please try again';
                        }
                        if(e && e.data && e.data.code == "INVALID_CAPTCHA_SCORE"){
                            $scope.error = e.data.message;
                        }
                        else{
                            $scope.error = 'There was a problem generating the logo, please try again';
                        }
                    })
                    .finally(()=>{
                        $scope.$applyAsync(()=> {
                            $scope.uploading = false;
                            $scope.grecaptchaToken = undefined;
                            grecaptcha.reset(recaptchaWidgetId);
                        });
                    });;
                }
            // })
           
        };

        $scope.onLanguageChange = function(){
            $scope.fitText();
        }

        $scope.fitText = function(selector){
            if(!$scope.customText){
                $scope.customText = _.clone($scope.text[$scope.language.code]);
                $scope.customText.logoType =  'individual';
            }

            const isCollective = $scope.customText.logoType == 'collective';

            if(isCollective){
                const individualName = $scope.text[$scope.language.code].individual;
                const collectiveName = $scope.text[$scope.language.code].collective;
                const and = $scope.text[$scope.language.code].and || 'and';
                $scope.text[$scope.language.code].name = `${individualName} ${and} ${collectiveName}`
            }

            const isRightToLeft = $scope.rtlLanguages[$scope.language.code];

            $scope.isRightToLeft = isRightToLeft;
            if(isRightToLeft)
                $('.boxIncon').css('direction', 'rtl')
            else
                $('.boxIncon').css('direction', 'ltr')

            const customTextWidth = $('#customName').width();
            const lineOneWidth = $('#line1_part1').width();


            if(customTextWidth < lineOneWidth && customTextWidth > 30) return;

            selector = selector||'.fit'
            $timeout(function(){
                let maxFontSize = 70;
                if(['zh'].includes($scope.language.code))
                    maxFontSize = 40;

                $('#bigtext').bigtext({
                    maxfontsize:maxFontSize
                });
                resizeMargins();
                // $scope.saveImage(true);
            }, 200)
        }
        
        $scope.customLanguage = function(lang){
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
            customText  .css("line-height", customTextfontSize+'px')

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
            //customText  .css('margin-top', `${equalMargin+languageDetails.line3CutOffMargin}px`)

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

        function uploadImage(){

            var data = {
                year: (new Date()).getFullYear(),
                code: $scope.language.code,
                ...$scope.text[$scope.language.code]
            }
            delete data.individual;
            delete data.collective;
            delete data.charLimit;
            delete data.line1_part1_alt;

            return $http.post('/api/v2021/idb-logos', data, {responseType: "arraybuffer", headers: {'x-captcha-v2-token':$scope.grecaptchaToken}})
            .then(function(success) {
                $scope.showSuccessMessage = true;
                console.log(success)
                return success.data;
            })
        }

        function loadLanguages(){
            
            $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms', {cache:true}).then(function(data){
                data.data.forEach(function(lang){
                    var code = lang.identifier.replace('lang-', '')
                    console.warn('code',languageTranslation[code])
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
            .then(()=>{
                const search = $location.search()||{};
                if(search.lang){ 
                    if(_.find($scope.defaultLanguages, {code : search.lang}))
                        $scope.language = { code : search.lang }
                }
            
                if(search.name)
                    $scope.text[$scope.language.code].name = search.name
                
                $scope.isPrerender = search.prerender=='true';

                $scope.fitText();
            });
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
            $scope.articleAdminTags = tags;
            
            var match = { "adminTags" : { $all: tags }};

            ag.push({"$match"   : match });
            ag.push({"$project" : { title:1, content:1}});
            ag.push({"$sort"    : { "meta.updatedOn":-1}});
            ag.push({"$limit"   : 1 });


            $scope.articleQuery = {ag: JSON.stringify(ag)};
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



        $scope.onArticleLoad = function(article){               
            
            $scope.article = article;
            $scope.isLoading = false;
        } 
        $scope.isCollective = function(){
            return $scope?.customText?.logoType == 'collective';
        }

        $scope.onTypeChange = function(){
            $scope.fitText();
            $timeout(function(){
            $scope.fitText();}, 300);

            if($scope.customText.logoType === 'individual')
                $scope.text[$scope.language.code].name = $scope.text[$scope.language.code].individual;
        }

        $scope.charLimit = function(){
            return $scope.text[$scope.language.code].charLimit || 45;
        }
        $scope.isCharLimitExceeded = function(){
            const limit =  $scope.text[$scope.language.code].charLimit || 45;

            return limit < $scope.text[$scope.language.code].name.length;
        }

        buildQuery();
        loadLanguages();
        


        const search = $location.search()||{};
        if(search.lang){ 
            if(_.find($scope.defaultLanguages, {code : search.lang}))
                $scope.language = { code : search.lang }
        }
    
        if(search.name)
            $scope.text[$scope.language.code].name = search.name
        
        if(search.type)
            $scope.customText.logoType = search.type;

        $scope.isPrerender = search.prerender=='true';
}]
