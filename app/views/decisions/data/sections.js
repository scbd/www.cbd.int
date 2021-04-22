

    var items = [];
    var seed  = 'A'.charCodeAt(0);

    for(var i=0; i<26; ++i) {
        items.push({
            code : String.fromCharCode(seed+i),
            value: i,
            title: String.fromCharCode(seed+i)+'.'
        });
    }

    export default items;

