define(['text!./auto-links.json'], function(rawData) {

    try
    {
        return JSON.parse(rawData).autoLinks;
    }
    catch(e)
    {
        console.error("Errro parsing links.json: "+e);

    }
});
