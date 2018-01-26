define(['text!./projects.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing projects.json: "+e);

    }
});
