import romans from 'romans';

    var items = [];

    for(var i=1; i<=30; ++i) {
        items.push({
            code : romans.romanize(i).toLowerCase(),
            value: i,
            title: '('+romans.romanize(i).toLowerCase()+')'
        });
    }

    export default items;

