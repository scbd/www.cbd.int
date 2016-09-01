define(['./romans'], function(romans) {

    var items = [];

    for(var i=1; i<=30; ++i) {
        items.push({
            code : romans[i].toLowerCase(),
            value: i,
            title: '('+romans[i].toLowerCase()+')'
        });
    }

    return items;
});
