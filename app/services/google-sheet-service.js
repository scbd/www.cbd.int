import app from '~/app';
    app.factory('googleSheetService', ['$http', function factory($http) {


function get(url, schemaName, numProps) {
    return $http.get(url).then(function(res) {

        var entry = res.data.feed.entry
        return cleanGoogleSheet(entry, schemaName, numProps)
    })
}

function cleanGoogleSheet(entry, schema, numProps) {
    var dataRows = []
    var id = 1
    var propNamesRow = entry.splice(0, numProps)
    var propNames = []

    for (var j = 0; j < numProps; j++)
        propNames[j] = propNamesRow[j].content.$t

    for (var i = 0; i < entry.length; i += numProps) {

        var row = { _id: id, schema_s: schema }

        for (var j = 0; j < numProps; j++)
            row[propNames[j]] = entry[i + j].content.$t

        id++
        dataRows.push(row)
    }

    return dataRows
}

        return {
            get: get.bind(this)
        }
    }])
