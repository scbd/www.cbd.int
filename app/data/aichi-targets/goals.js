define(['text!./goals.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing goals.json: "+e);

    }
});
