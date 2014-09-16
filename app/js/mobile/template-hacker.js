/* global */
require(['jquery'], function($) {

    var hidden  = "hidden-xs";

    $("body").append("<style>@media (max-width: 767px){#t-centerWrap{width:auto !important}}</style>");
    $("body").append("<style>@media (max-width: 767px){#t-content   {width:auto !important;float:none !important;margin:auto !important}}</style>");
    $("body").append("<style>@media (max-width: 767px){#CPageContent{margin-right:auto !important;padding-right:inherit !important}}</style>");


    $(".cmsDesignBar"    ).parent().parent().addClass(hidden);
    $("#t-header"        ).addClass(hidden);
    $(".t-catHeader"     ).addClass(hidden);
    $("#t-centerWrap"    );// by style
    $("#t-sidebarMenu"   ).addClass(hidden);
    $("#t-pageHeader"    ).addClass(hidden);
    $("#CRightContainer" ).addClass(hidden);
    $("#t-content"       ); //by style
    $("#CPageContent"    ); //by style
    $("#t-footer"        ).addClass(hidden);
    $("#t-additionalInfo").addClass(hidden);
});
