define(['app',
'https://zachleat.github.io/BigText/dist/bigtext.js',
'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js'], function(app) { 'use strict';

    
      
	return ['$location', '$routeParams','$http','$scope', '$rootScope', '$window',  function( $location, $routeParams,$http, $scope,  $rootScope, $window) {
        $scope.text = {
            en : {
                date                : '22 MAY 2021',
                day                 : 'BIODIVERSITY DAY',
                collectiveTagline   : 'We’re part of the solution',
                individualTagline   : 'I’m part of the solution',
                hashTag             : '#ForNature',
                colletive           : 'We’re part of the solution',
                maxfontsize         : 60 
            },
            es:{
                date                : '22 DE MAYO DE 2021',
                day                 : 'DÍA DE LA BIODIVERSIDAD',
                collectiveTagline    : 'Somos parte de la solución',
                individualTagline   : 'Soy parte de la solución',
                hashTag             : '#PorLaNaturaleza',
                colletive           : 'Somos parte de la solución #PorLaNaturaleza',
                maxfontsize         : 55 
            },
            fr:{
                date                : '22 MAI 2021',
                day                 : 'JOURNÉE DE LA BIODIVERSITÉ',
                collectiveTagline    : 'Nous faisons partie de la solution',
                individualTagline   : 'Je fais partie de la solution',
                hashTag             : '#PourLaNature',
                colletive           : 'Nous faisons partie de la solution #PourLaNature',
                maxfontsize         : 60 
            },
            ru:{
                date                : '22 МАЯ 2021 ГОДА',
                day                 : 'ДЕНЬ БИОРАЗНООБРАЗИЯ',
                collectiveTagline    : 'Мы часть решения',
                individualTagline   : 'Я часть решения',
                hashTag             : '#ЗаПрироду',
                colletive           : 'Мы часть решения #ЗаПрироду',
                maxfontsize         : 60 
            },
            zh:{
                date                : '2021年5月22日',
                day                 : '生物多样性日',
                collectiveTagline    : '呵护自然，',
                individualTagline   : '呵护自然，',
                hashTag             : '有份',
                colletive           : '呵护自然，',
                maxfontsize         : 60 
            },
            ar:{
                date                : '٢٢ أيار/مايو ٢٠٢١',
                day                 : 'يوم التنوع البيولوجي',
                tagline             : 'نحن جزء من الحل',
                individualTagline   : 'أنا جزء من الحل',
                hashTag             : 'من#_أجل_الطبيعة',
                colletive           : 'نحن جزء من الحل# من_أجل_الطبيعة',
                maxfontsize         : 60 
            },
            mr:{
                date                : '22 मे 2021',
                day                 : 'जीवदिन दिवस',
                tagline             : 'मी समाधानाचा एक भाग आहे',
                individualTagline   : 'मी समाधानाचा एक भाग आहे',
                hashTag             : '#निसर्गासाठी'
            }
            
        }
        $scope.name = 'CBD';
        $scope.logoType = 'individual';
        $scope.language = 'en'


        var basePath  = (angular.element('base').attr('href')||'').replace(/\/+$/g, '');

        $scope.saveImage = function(generateOnly) { 
           
            $window.ga('set',  'page', basePath+$location.path() + '?name='+$scope.name+'&language='+$scope.language+'&logoType='+$scope.logoType);
            $window.ga('send', 'pageview');

            html2canvas($("#imgGenerator"), {
                onrendered: function(canvas) {
                    $('#newImage').empty().append(canvas);
                    canvas.toBlob(function(blob) {
                        if(!generateOnly)
                            saveAs(blob, "22-May-Biodiversity-Day.jpg");                        
                    });
                }
            });
        };

        $scope.fitText = function(selector){

            if($scope.language == 'ar')
                $('.boxIncon').css('direction', 'rtl')
            else
                $('.boxIncon').css('direction', 'ltr')

            selector = selector||'.fit'
            setTimeout(function(){
                $('#bigtext').bigtext();
                getSize();
                $scope.saveImage(true);
            }, 200)
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

            if($scope.language== 'fr'){
                logoDay    .css('margin-top', '' + (equalMargin +10) + 'px');
                $('.impact-font.text-box-width').css('margin-top', '-10px');
            }
            else{
                logoDay    .css('margin-top', '' + (equalMargin ) + 'px')
                $('.impact-font.text-box-width').css('margin-top', '0px');
            }
            logoTagline.css('margin-top', '' + (equalMargin ) + 'px')

            if($scope.language== 'zh')
                logoName   .css('margin-top', '' + (equalMargin +10) + 'px')
            else
                logoName   .css('margin-top', '' + (equalMargin ) + 'px')


        }        

        function onResize() {
            $scope.fitText();
        }
        angular.element($window).on('resize', onResize);
        $scope.$on('$destroy', function(){
            angular.element($window).off('resize', onResize);
        });

        setTimeout(function(){
            $scope.fitText();           
        }, 200)
    }]
});


