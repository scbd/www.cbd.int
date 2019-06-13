define(['app'], loadGlobalModules)


// requirejs global modules
function loadGlobalModules(app) {
    app.factory('googleSheetService', ['$http', factory.bind(this)])
}

// angularJS factory definition
function factory($http) {
    this.$http = $http

    return {
        get: get.bind(this)
    }
}

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

    for (let j = 0; j < numProps; j++)
        propNames[j] = propNamesRow[j].content.$t

    for (let i = 0; i < entry.length; i += 4) {

        var row = { _id: id, schema_s: schema }

        for (let j = 0; j < numProps; j++)
            row[propNames[j]] = entry[i + j].content.$t

        id++
        dataRows.push(row)
    }

    return dataRows
}