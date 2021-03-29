define(['app',
'https://cdn.jsdelivr.net/gh/albertjan/jquery.textFit/jquery.textFit.js',
'https://zachleat.github.io/BigText/dist/bigtext.js',
    'https://cdn.cbd.int/fitty@2.3.3/dist/fitty.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.min.js'], function(app) { 'use strict';

    
      
	return ['$location', '$routeParams','$http','$scope', '$rootScope',  function( $location, $routeParams,$http, $scope,  $rootScope) {
        $scope.text = {
            en : {
                date                : '22 MAY 2021',
                day                 : 'BIODIVERSITY DAY',
                collectiveTagline    : 'We’re part of the solution',
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
                collectiveTagline    : '我们是解决方案的一部分',
                individualTagline   : '我是解决方案的一部分',
                hashTag             : '为了大自然',
                colletive           : '呵护自然，你我有份',
                maxfontsize         : 60 
            },
            ar:{
                date                : '22 أيار/مايو 2021',
                day                 : 'يوم التنوع البيولوجي',
                tagline             : 'نحن جزء من الحل',
                individualTagline   : 'أنا جزء من الحل',
                hashTag             : '#من_أجل_الطبيعة',
                colletive           : 'نحن جزء من الحل# من_أجل_الطبيعة',
                maxfontsize         : 60 
            }            
        }
        $scope.name = '';
        $scope.logoType = 'individual';
        $scope.language = 'en'
        $scope.saveImage = function() { 
           
            // $scope.fitText();
            console.log( screen.width, $rootScope.deviceSize);

            var classToAdd = ''
            // if(screen.width > 1440)
                classToAdd= 'margin-nve-10';
            // else
            //     classToAdd = 'margin-pve-10';

            if(classToAdd!='')
                $('.impact-font').addClass(classToAdd);
            html2canvas($("#imgGenerator"), {
                onrendered: function(canvas) {
                    $('#myimage').empty().append(canvas);
                    canvas.toBlob(function(blob) {
                        // saveAs(blob, "logo.jpg"); 
                        if(classToAdd!='')
                           $('.impact-font').removeClass(classToAdd);
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
            // fitty(selector);
            setTimeout(function(){
                console.log( $scope.text[$scope.language].maxfontsize)
                $('#bigtext').bigtext();
                // $('#bigtext').textFit({multiLine:true, reProcess:true})
                getSize();
                // $('.boxIncon #logoImg').css('height', $('#bigtext').height()+'px')
            }, 200)
        }
        setTimeout(function(){
            $scope.fitText();
        }, 200)
        
       function getSize() {
            var myImg       = $('.boxIncon #logoImg');
            var logoDate    = $('.boxIncon #logoDate');
            var logoDay     = $('.boxIncon #logoDay')
            var logoTagline = $('.boxIncon #logoTagline')
            var logoName    = $('.boxIncon #logoName')

            var myImgHeight       = myImg      .height(),
                logoDateHeight    = logoDate   .height(),
                logoDayHeight     = logoDay    .height(),
                logoTaglineHeight = logoTagline.height(),
                logoNameHeight    = logoName   .height();

            var myImgfontSize       = parseInt(myImg      .css("fontSize")),
                logoDatefontSize    = parseInt(logoDate   .css("fontSize")),
                logoDayfontSize     = parseInt(logoDay    .css("fontSize")),
                logoTaglinefontSize = parseInt(logoTagline.css("fontSize")),
                logoNamefontSize    = parseInt(logoName   .css("fontSize")); 
            var totalFontSize = logoDatefontSize +
                                logoDayfontSize  +
                                logoTaglinefontSize+
                                logoNamefontSize
            console.log(
                'myImgHeight      :' + myImgHeight      ,
                'logoDateHeight   :' + logoDateHeight   ,
                'logoDayHeight    :' + logoDayHeight    ,
                'logoTaglineHeight:' + logoTaglineHeight,
                'logoNameHeight   :' + logoNameHeight    ,
                'total height : ' + (logoDateHeight  +
                logoDayHeight   +
                logoTaglineHeight+
                logoNameHeight    )
            )

            console.log( 'font size',  
                logoDatefontSize  , 
                logoDayfontSize    ,
                logoTaglinefontSize,
                logoNamefontSize ,
                
                totalFontSize,
                myImgHeight-totalFontSize)

            console.log(   
                logoDateHeight    - logoDatefontSize  , 
                logoDayHeight     - logoDayfontSize    ,
                logoTaglineHeight - logoTaglinefontSize,
                logoNameHeight    - logoNamefontSize 
            )
            console.log((logoDateHeight    - logoDatefontSize   )/2, (logoDayHeight     - logoDayfontSize    )/2)

            // console.log(
            //     ((logoDayHeight     - logoDayfontSize    )/2) + ((myImgHeight-totalFontSize)/3),
            //     ((logoTaglineHeight - logoTaglinefontSize)/2) + ((myImgHeight-totalFontSize)/3),
            //     ((logoNameHeight    - logoNamefontSize   )/2) + ((myImgHeight-totalFontSize)/3),
            //     ((logoDayHeight     - logoDayfontSize    )/2) , ((myImgHeight-totalFontSize)/3),
            //     ((logoTaglineHeight - logoTaglinefontSize)/2) , ((myImgHeight-totalFontSize)/3),
            //     ((logoNameHeight    - logoNamefontSize   )/2) , ((myImgHeight-totalFontSize)/3)
            // )
            var margin_logoDate    = ((logoDateHeight    - logoDatefontSize   )/2) 
            var margin_logoDay     = ((logoDayHeight     - logoDayfontSize    )/2) 
            var margin_logoTagline = ((logoTaglineHeight - logoTaglinefontSize)/2) 
            var margin_logoName    = ((logoNameHeight    - logoNamefontSize   )/2) 
            var isPositive = false;

            if($scope.name.length>0){
                if($scope.name.length==1)
                    margin_logoName -= 10;                
                else if($scope.name.length==2)
                    margin_logoName -= 15;                
                else if($scope.name.length==3)
                    margin_logoName -= 20;
                else{
                    var namePosition = $('.boxIncon #logoName').position()
                    margin_logoName = (logoNameHeight-logoNamefontSize)/2
                    isPositive=true
                }
            }
            
            logoDate   .css('margin-top', '-' + (margin_logoDate   ) + 'px')
            logoDay    .css('margin-top', '-' + (margin_logoDay     + (margin_logoDate)) + 'px')
            logoTagline.css('margin-top', '-' + (margin_logoTagline + (margin_logoDay)) + 'px')
            logoName   .css('margin-top', (isPositive ? '' : '-') + (margin_logoName    + (0)) + 'px')

        }
        
    }]
});