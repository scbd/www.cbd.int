define(['text!./media.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing media.json: "+e);

    }
});
