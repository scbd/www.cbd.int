define(['require', 'https://cdn.slaask.com/chat.js'], function(require, platform) {

    window.platform = platform;

    window._slaask = new window.slaaskApp();

    window._slaask.createScriptTag = function (url) {

        var app = this;    
        var virtualStriptTag = {};

        require([url], function(emoji) {

            if(!app.emoji)
                app.emoji = emoji;

            if(virtualStriptTag.onload)
                virtualStriptTag.onload();
        });

        return virtualStriptTag;
    };

    return window._slaask;
});
