import app from '~/app'
import * as meta from '~/services/meta'

        import('facebook').then(function(FB) {
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
        }, function() {
          window.FB = {};
        });

        app.factory('fb', [function() {
          var domain = 'www.cbd.int';

          if(window.location.hostname==='localhost' || window.location.hostname==='www.cbddev.xyz') domain = 'www.cbddev.xyz';

          meta.meta('fb:app_id','168158870409056');

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

          //============================================================
          //
          //============================================================
          function setTitle(title,titleSuffix){
            if(!title) return;

            if(titleSuffix)
              title = title + titleSuffix;
            else
              title = title + ' | Convention on Biological Diversity';
            meta.title(title);
          }
          //============================================================
          //
          //============================================================
          function setImage(uri){
            if(uri.indexOf('http')==-1)
              uri='https://'+domain+uri;

            setDemensions(uri);
            meta.image(uri);
          }
          //============================================================
          //
          //============================================================
          function setDemensions(uri){
            var img = new Image();

            img.src = uri;
            img.onload = function() {
              meta.meta('og:image:height',this.height);
              meta.meta('og:image:width',this.width);
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
            meta.meta(name, value);
          }

          //============================================================
          //
          //============================================================
          function setOgType(type){
            if(!validateType(type,types))return;
            meta.meta('og:type',type);
          }


          function validateType(type,types){
              return (types.indexOf(type)>-1);
          }


        }]);