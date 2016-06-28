define([], function() {

    var items = [];

    for(var i=1; i<=100; ++i)
        items.push({ code : i.toString(), title: i.toString()+'.' });

    return items;
});
