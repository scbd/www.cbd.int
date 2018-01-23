define(['text-loader!./meetings.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing meetings.json: "+e);

    }
});
