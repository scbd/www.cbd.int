
require(['jquery', 'text!mobile/header.html', 'text!mobile/footer.html'], function($, header, footer) {

    $("head"             ).prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    $(".cmsDesignBar"    ).parent().parent().addClass("hidden-xs");
    $("#t-header"        ).addClass("hidden-xs");
    $(".t-catHeader"     ).addClass("hidden-xs");
    $("#t-centerWrap"    );// by style
    $("#t-sidebarMenu"   ).addClass("hidden-xs");
    $("#t-pageHeader"    ).addClass("hidden-xs");
    $("#CRightContainer" ).addClass("hidden-xs");
    $("#t-content"       ); //by style
    $("#CPageContent"    ); //by style
    $("#t-footer"        ).addClass("hidden-xs");
    $("#t-additionalInfo").addClass("hidden-xs");

    $('#t-pageHeader').after ('<div class="visible-xs">'+header+'</div>');
    $('#t-footer'    ).before('<div class="visible-xs">'+footer+'</div>');

});
