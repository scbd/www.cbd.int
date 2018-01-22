define([], function() {

    var items = [];

    for(var i=1; i<=200; ++i) {
        items.push({
            code : i.toString(),
            value: i,
            title: i.toString()+'.'
        });
    }

    return items;
});
