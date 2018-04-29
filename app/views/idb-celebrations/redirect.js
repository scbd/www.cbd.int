define(['app'], function(app) { 'use strict';

	return ['$location','$window', '$routeParams',function($location, $window, $routeParams) {

    if($location.search().path)
      $window.location.href = encodeURIComponent($location.search().path)
    else
      $window.location.href =  $location.absUrl()

	}];
});
