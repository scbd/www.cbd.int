define(['app',
'https://cdn.jsdelivr.net/combine/npm/blueimp-canvas-to-blob',
'https://zachleat.github.io/BigText/dist/bigtext.js',
'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js', 'ngDialog'], function(app) { 'use strict';

    
      
	return ['$location', 'user','$http','$scope', '$timeout', '$window', 'ngDialog',  function( $location, user,$http, $scope,  $timeout, $window, ngDialog) {
        
        $scope.$root.page={
            title : "International Biodiversity Day logo : customize",
            description : $('#logo-description').text()
        };

        $scope.defaultLanguages = [
            {code:'ar', language            : 'Arabic'  },
            {code:'en', language            : 'English' },
            {code:'fr', language            : 'French'  },
            {code:'ru', language            : 'Russian' },
            {code:'es', language            : 'Spanish' },
            {code:'zh', language            : 'Chinese' },
        ]
        $scope.text = {
            en : {
                date                : '22 MAY 2021',
                day                 : 'BIODIVERSITY DAY',
                collectiveTagline   : 'We’re part of the solution',
                individualTagline   : 'I’m part of the solution',
                hashTag             : '#ForNature'
            },
            es:{
                date                : '22 DE MAYO DE 2021',
                day                 : 'DÍA DE LA BIODIVERSIDAD',
                collectiveTagline    : 'Somos parte de la solución',
                individualTagline   : 'Soy parte de la solución',
                hashTag             : '#PorLaNaturaleza'
            },
            fr:{
                date                : '22 MAI 2021',
                day                 : 'JOURNÉE DE LA BIODIVERSITÉ',
                collectiveTagline    : 'Nous faisons partie de la solution',
                individualTagline   : 'Je fais partie de la solution',
                hashTag             : '#PourLaNature'
            },
            ru:{
                date                : '22 МАЯ 2021 ГОДА',
                day                 : 'ДЕНЬ БИОРАЗНООБРАЗИЯ',
                collectiveTagline    : 'Мы часть решения',
                individualTagline   : 'Я часть решения',
                hashTag             : '#ЗаПрироду'
            },
            zh:{
                date                : '2021年5月22日',
                day                 : '生物多样性日',
                collectiveTagline    : '呵护自然，',
                individualTagline   : '呵护自然，',
                hashTag             : '有份'
            },
            ar:{
                date                : '٢٢ أيار/مايو ٢٠٢١',
                day                 : 'يوم التنوع البيولوجي',
                tagline             : 'نحن جزء من الحل',
                individualTagline   : 'أنا جزء من الحل',
                hashTag             : 'من#_أجل_الطبيعة'
            },
            mr:{
                date                : '22 मे 2021',
                day                 : 'जीवदिन दिवस',
                tagline             : 'मी समाधानाचा एक भाग आहे',
                individualTagline   : 'मी समाधानाचा एक भाग आहे',
                hashTag             : '#निसर्गासाठी',
                language            : 'Marathi'
            }
            
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
        
        $scope.name     = 'Biodiversity';
        $scope.logoType = 'individual';
        $scope.language = { code : 'en' }
        $scope.isAdmin  = _.intersection(['Administrator', 'idb-logo-administrator'], user.roles).length


        var basePath  = $scope.basePath = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');

        $scope.saveImage = function(generateOnly) { 
            $scope.showSuccessMessage = false;
            
            if(~document.location.hostname.indexOf('cbd.int')){
                $window.ga('set',  'page', basePath+$location.path() + '?name='+$scope.name+'&language='+$scope.language.code+'&logoType='+$scope.logoType);
                $window.ga('send', 'pageview');
            }

            html2canvas($("#imgGenerator"), {
                onrendered: function(canvas) {
                    $('#newImage').empty().append(canvas);
                    canvas.toBlob(function(blob) {
                        if(!generateOnly){  
                            uploadImage(canvas.toDataURL());                        
                            saveAs(blob, "22-May-Biodiversity-Day.jpg");                            
                        }
                    });
                }
            });
        };

        $scope.fitText = function(selector){

            if($scope.rtlLanguages[$scope.language.code])
                $('.boxIncon').css('direction', 'rtl')
            else
                $('.boxIncon').css('direction', 'ltr')

            selector = selector||'.fit'
            $timeout(function(){
                $('#bigtext').bigtext();
                getSize();
                $scope.saveImage(true);
            }, 200)
        }
        
        $scope.customLanguage = function(lang){
            lang = lang || 'en'
            $scope.customText = _.clone($scope.text[lang])
            $scope.customText.logoType = $scope.customText.logoType || 'individual'
            ngDialog.open({
                template: 'customLanguage',
                closeByDocument: false,
                scope: $scope,
                // width: '60%'
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
                        // translation.individualTagline = translation.collectiveTagline;
            $scope.text[translation.language.code]    = translation;
                        $scope.name                   = translation.name;
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

            var collectiveTagline = ($scope.customText.collectiveTagline||'')
            var individualTagline = ($scope.customText.individualTagline||'')
            if(collectiveTagline.length)
                $scope.customText.collectiveTagline = collectiveTagline[0].toUpperCase() + (collectiveTagline.length > 1 ? collectiveTagline.substr(1) : '')

            if(individualTagline.length)
                $scope.customText.individualTagline = individualTagline[0].toUpperCase() + (individualTagline.length > 1 ? individualTagline.substr(1) : '')
        }
        
        function getSize() {
            var myImg       = $('.boxGenerate #logoImg');
            var logoDate    = $('#bigtext #logoDate');
            var logoDay     = $('#bigtext #logoDay')
            var logoTagline = $('#bigtext #logoTagline')
            var logoName    = $('#bigtext #logoName')

            var myImgHeight       = myImg      .height(),
                logoDateHeight    = logoDate   .height(),
                logoDayHeight     = logoDay    .height(),
                logoTaglineHeight = logoTagline.height(),
                logoNameHeight    = logoName   .height();



            var myImgfontSize       = parseInt(myImg      .css("fontSize")||0),
                logoDatefontSize    = parseInt(logoDate   .css("fontSize")||0),
                logoDayfontSize     = parseInt(logoDay    .css("fontSize")||0),
                logoTaglinefontSize = parseInt(logoTagline.css("fontSize")||0),
                logoNamefontSize    = parseInt(logoName   .css("fontSize")||0); 

                logoDate   .css("height", logoDatefontSize    +'px')
                logoDay    .css("height", logoDayfontSize     +'px')
                logoTagline.css("height", logoTaglinefontSize +'px')
                logoName   .css("height", logoNamefontSize    +'px')


            var totalFontSize = logoDatefontSize +
                                logoDayfontSize  +
                                logoTaglinefontSize+
                                logoNamefontSize
            var equalMargin = (myImgHeight-totalFontSize)/3;
            var margin_logoDate    = ((logoDateHeight    - logoDatefontSize   )/2)

            // if($scope.language!= 'zh')
                logoDate   .css('margin-top', '-' + (margin_logoDate   ) + 'px')

            if($scope.language.code== 'fr'){
                logoDay    .css('margin-top', '' + (equalMargin +10) + 'px');
                $('.impact-font.text-box-width').css('margin-top', '-10px');
            }
            else{
                logoDay    .css('margin-top', '' + (equalMargin ) + 'px')
                $('.impact-font.text-box-width').css('margin-top', '0px');
            }
            logoTagline.css('margin-top', '' + (equalMargin ) + 'px')

            if($scope.language.code== 'zh')
                logoName   .css('margin-top', '' + (equalMargin +10) + 'px')
            else
                logoName   .css('margin-top', '' + (equalMargin ) + 'px')


        }        

        function onResize() {
            $scope.fitText();
        }

        function uploadImage(blob){
           $scope.uploading = true;
            var data = {
                'file': blob,
                'name': $scope.name,
                'logoType': $scope.logoType,
                'language': $scope.language.code,
                ...$scope.text[$scope.language.code]
            }

            return $http.post('/api/v2021/idb-logos', data)
            .then(function(success) {
                $scope.showSuccessMessage = true;
                return success.data;
            })
            .finally(function(){
                $scope.uploading = false;
            });
        }

        function loadLanguages(){
            $http.get('/api/v2013/thesaurus/domains/ISO639-2/terms', {cache:true}).then(function(data){
                $scope.languages = _(data.data).map(function(lang){
                    var code = lang.identifier.replace('lang-', '')
                    if(!_.find($scope.defaultLanguages, {code : code})){
                        return {
                            code: code,
                            language: lang.title.en
                        }
                    }
                }).compact().uniq().value();
                console.log($scope.languages)
            })
        }
        angular.element($window).on('resize', onResize);
        $scope.$on('$destroy', function(){
            angular.element($window).off('resize', onResize);
        });

        $timeout(function(){
            $scope.fitText();           
        }, 200);

        loadLanguages();
    }]
});


