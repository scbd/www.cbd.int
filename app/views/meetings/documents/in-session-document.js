define(['lodash', 'angular', 'filters/lstring', 'directives/print-smart/print-smart-checkout', './meeting-document', 'authentication',
    // Prefetch optimization
    'directives/print-smart/print-smart-checkout', 'text!directives/print-smart/print-smart-checkout.html',
    'ngDialog','directives/view-injector',
    'moment', 'moment-timezone', 'filters/moment',
    'directives/checkbox', 'text!directives/checkbox.html',
    'views/meetings/documents/meeting-document',
    'angular-cache'
], function(_, ng) {
   
	return ["$scope", "$route", "$http", '$q', '$location', '$rootScope', 'authentication', 'showMeeting', 'CacheFactory', function ($scope, $route, $http, $q, $location, $rootScope, authentication, showMeeting, CacheFactory) {
        
        var event = $route.current.params.event;
        var hardTab = false;
        var httpCache = initCache();
    
    }]

});
