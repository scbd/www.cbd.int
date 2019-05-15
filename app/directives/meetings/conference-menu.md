


```
"menus" : [ 
            {
                "code"          : "code of the menu, used to look up for articles, or build the menu url",
                "icon"          : "fa icon class used when on xs screen",
                "title"         : { en : "large screen title" },
                "shortTitle"    : { en : "small screen title (ipad)" },
                "url"           : "if available will be used when the menu is clicked else the system will generate one using the meeting codes",
                "behavior"      : "used when has sub-menus and the menu should have collapse behavior. ['fixed', 'collapsed', 'expanded']',
                "links"         : [
                                    {  "when available the menu will be converted to links menu if length more then 1 then a drop down menu will appear on hover",                                   
                                        "url"    : "",
                                        "title"  : { en : "" },
                                        "target" : "'_blank' or specific 'name' to reuse the same tab"
                                    }
                                ],
                "startDate"     : "UTC date from which the menu needs to be visible (Schedule, webcast etc)",
                "endDate"       : "UTC date from which the menu needs to stop displaying (Schedule, webcast etc)",

                "menus"         : [" repeat of the above object", " when the header has sub menus"],
                "style"         : " « name » for special display: eg: _webcast_",
                "target"        : "'_blank' or specific 'name' to reuse the same tab",
                "description"   : "description of the menu for reference" 
            }
        ]
```


```
{
    "code"          : "",
    "icon"          : "",
    "title"         : { en : "" },
    "shortTitle"    : { en : "" },
    "url"           : "",
    "behavior"      : "",
    "links"         : [
                        {  
                            "url"    : "",
                            "title"  : { en : "" },
                            "target" : ""
                        }
                    ],
    "startDate"     : "",
    "endDate"       : "",

    "menus"         : [],
    "style"         : "" 
},
```
