define(['text!./links-platform.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing links.json: "+e);

    }
});
