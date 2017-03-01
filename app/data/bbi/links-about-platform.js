define(['text!./links-about-platform.json'], function(rawData) {
  // ,
  // {
  //     "title": {
  //         "en": "What does it do"
  //     },
  //     "source": "what-do"
  // },
  // {
  //     "title": {
  //         "en": "Who it is for"
  //     },
  //     "source": "who-for"
  // },
  // {
  //     "title": {
  //         "en": "Users and responsibilities"
  //     },
  //     "source": "user-res"
  // },
  // {
  //     "title": {
  //         "en": "Types of information available"
  //     },
  //     "source": "info-avail"
  // }
    try
    {
        return JSON.parse(rawData);
    }
    catch(e)
    {
        console.error("Errro parsing links.json: "+e);

    }
});
