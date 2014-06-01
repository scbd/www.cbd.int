/*
function initialize() {
	var mapOptions = {
	  center: new google.maps.LatLng(30.581937,12.5048663),
	  zoom: 2,
	  mapTypeId: google.maps.MapTypeId.SATELLITE
};
*/

/*
var map = new google.maps.Map(document.getElementById("map"),
    mapOptions);

var infoWindow = new google.maps.InfoWindow();

var infoText = '';
*/

/*
var layer = new google.maps.FusionTablesLayer({
    query: {
      select: 'World Countries',
      from: '1N2LBk4JHwWpOY4d9fobIn27lfnZ5MDy-NoqqRpk',	
    },
    styles: [{
      polygonOptions: {
        fillColor: '#DDDDDD', // white-grey   
        fillOpacity: 0.5
      }
    },{
      where: 'Shape_Area > 75',
      polygonOptions: {
        fillColor: '#DD5112', // orange  
        infoText: 'National Report, date, country name, report title, list of available languages'
      }
    }, {
      where: 'Shape_Area > 125',
      polygonOptions: {
        fillColor: '#E5D220', // yellow   
        infoText: 'National Target, link to more details »'
      }
    }, {
      where: 'Shape_Area > 250',
      polygonOptions: {
        fillColor: '#36C941', // light green  
        infoText: 'National Target, link to more details »'
      }
    }]
  });

  layer.setMap(map);
  
  google.maps.event.addListener(layer, 'click', function(e) {
	  windowControl(e, infoWindow, map);
	});

	function windowControl(e, infoWindow, map) {
	     e.infoWindowHtml = "<h4>" + e.row['Name'].value + "</h4>";
	     
	     if (e.row['Shape_Area'].value > 200) {
          */  /* Name of the Report + Date */
           // e.infoWindowHtml += '<p><strong>Fourth National Report</strong><br />2009-02-17<br />';
            /* Documents to Download */
           /*
 e.infoWindowHtml += '<img src="images/pdf_button.png" alt="PDF document" /><a href="#">en »</a><a class="pull-right" href="#">en »</a><img class="pull-right" src="images/icon-doc.gif" alt="Word document" /></p><br />';
         }
	     
	     else{
		    
*//* Name of the Target + Date */
           // e.infoWindowHtml += '<p><span class="important">Main related Aichi Targets: 1</span><br /><strong>Awareness increased</strong><br />';
            /* Documents to Download */
           /* e.infoWindowHtml += '<a class="pull-right" href="#">Details »</a><br /><br />';  
	     }
	     
	    infoWindow.open(map);
	  }
  
}
*/

//google.maps.event.addDomListener(window, 'load', initialize);

/* POP OVER   */
$('#reports').popover('hide');
$('#nbsap').popover('hide');
$('#progresses').popover('hide');

/* Targets */
$('.targets').popover();

$('#progresses').on('show.bs.popover', function(){
	$('#reports').popover('hide');
	$('#nbsap').popover('hide');
});

$('#nbsap').on('show.bs.popover', function(){
	$('#reports').popover('hide');
	$('#progresses').popover('hide');
});

$('#reports').on('show.bs.popover', function(){
	$('#nbsap').popover('hide');
	$('#progresses').popover('hide');
});


/* Change Directions */
function directionlang(textdirection){
	$("body").removeClass().addClass(textdirection);
}
