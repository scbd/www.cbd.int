define([], function() {

    var items = [];
    var seed  = 'a'.charCodeAt(0);

    for(var i=0; i<26; ++i) {
        items.push({
            code : String.fromCharCode(seed+i),
            value: i+1,
            title: String.fromCharCode(seed+i)+'.'
        });
    }

    return items;
});
