define(['app','ngMeta'], function(app) {'use strict';
        require(['facebook'], function() {
          if (FB && FB.AppEvents && FB.init) {
            FB.init({
              appId: '168158870409056',
              fbml: true,
              version: 'v2.10',
              cookie: true
            });
            FB.AppEvents.logPageView();
            FB.XFBML.parse();
          }
        }, function(err) {
          FB = {}
          window.FB = {}
        });

        app.factory('fb', ['ngMeta',function(ngMeta) {
          var domain = 'www.cbd.int';
          ngMeta.init();
          if(window.location.hostname==='localhost' || window.location.hostname==='www.cbddev.xyz') domain = 'www.cbddev.xyz';

          ngMeta.setTag('fb:app_id','168158870409056');

          var types= ['apps.saves',
          'article',
          'book',
          'books.author',
          'books.book',
          'books.genre',
          'books.quotes',
          'books.rates',
          'books.reads',
          'books.wants_to_read',
          'business.business',
          'fitness.bikes',
          'fitness.course',
          'fitness.runs',
          'fitness.walks',
          'game.achievement',
          'games.achieves',
          'games.celebrate',
          'games.plays',
          'games.saves',
          'music.album',
          'music.listens',
          'music.playlist',
          'music.playlists',
          'music.radio_station',
          'music.song',
          'news.publishes',
          'news.reads',
          'og.follows',
          'og.likes',
          'pages.saves',
          'place',
          'product',
          'product.group',
          'product.item',
          'profile',
          'restaurant.menu',
          'restaurant.menu_item',
          'restaurant.menu_section',
          'restaurant.restaurant',
          'restaurant.visited',
          'restaurant.wants_to_visit',
          'sellers.rates',
          'video.episode',
          'video.movie',
          'video.other',
          'video.rates',
          'video.tv_show',
          'video.wants_to_watch',
          'video.watches'];

          return {
              set:set,
              setTitle:setTitle,
              setImage:setImage,
              setOgType:setOgType
          };
          // //============================================================
          // //
          // //============================================================
          // function setTitle(title,titleSuffix){
          //   if(!title) return;
          //   ngMeta.setTitle(title, titleSuffix + ' | Circus Living');
          // }

          //============================================================
          //
          //============================================================
          function setTitle(title,titleSuffix){
            if(!title) return;
            // ngMeta.setTitle(title, titleSuffix + ' | Circus Living');
            if(titleSuffix)
              title = title + titleSuffix;
            else
              title = title + ' | Convention on Biological Diversity';
            ngMeta.setTag('og:title',title );
          }
          //============================================================
          //
          //============================================================
          function setImage(uri){
            if(uri.indexOf('http')==-1)
              uri='https://'+domain+uri;

            setDemensions(uri);
            ngMeta.setTag('og:image',uri);
          }
          //============================================================
          //
          //============================================================
          function setDemensions(uri){
            var img = new Image();

            img.src = uri;
            img.onload = function() {
              ngMeta.setTag('og:image:height',this.height);
              ngMeta.setTag('og:image:width',this.width);
            }
          }
          //============================================================
          // og:author
          // og:image
          // og:type
          // og:locale
          // og:description
          //============================================================
          function set(name,value){
            if(!value) return;
            ngMeta.setTag(name, value);
          }

          //============================================================
          //
          //============================================================
          function setOgType(type){
            if(!validateType(type,types))return;
            ngMeta.setTag('og:type',type);
          }


          function validateType(type,types){
              return (types.indexOf(type)>-1);
          }


        }]);
});
