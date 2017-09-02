define(['text!./statements.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing statements.json: "+e);

    }
});
