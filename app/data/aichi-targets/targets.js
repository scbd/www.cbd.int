define(['text!./targets.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing targets.json: "+e);

    }
});
