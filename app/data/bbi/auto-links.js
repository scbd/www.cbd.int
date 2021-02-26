define(['text!./auto-links.json'], function(rawData) {
    return JSON.parse(rawData).autoLinks;
});
