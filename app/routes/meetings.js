import app from 'app';
import documentsController,   { template as documentsTemplate   } from '~/views/meetings/documents/documents'
//import interpreterController, { template as interpreterTemplate } from '~/views/meetings/documents/statements/interpreter'
import { securize, resolveLiteral } from './mixin';

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider
    // .when('/import-translations',         { templateUrl : 'views/meetings/documents/management/translations.html', resolveController : true,                       resolve : { user : securize(["Administrator","EditorialService"]) } })
    // .when('/:meeting/documents/status',   { templateUrl : 'views/meetings/documents/documents-progress.html',      resolveController : true, reloadOnSearch:false, resolve : { user : securize(["Administrator","EditorialService", "ScbdStaff"]) } })
    // .when('/:meeting/documents/:id',      { templateUrl : 'views/meetings/documents/management/document-id.html',  resolveController : true, reloadOnSearch:false, resolve : { user : securize(["Administrator","EditorialService"]) } })
    // .when('/:meeting/documents',          { redirectTo  : '/:meeting'} )
    // .when('/:meeting/sessions/:sessionId',{ templateUrl : 'views/meetings/documents/statements/session-prep.html', resolveController : true,  reloadOnSearch:false, resolve : { user : securize(["Administrator","EditorialService", "StatementAdmin"]) } })
    // .when('/:meeting/interpreter-panel',  { template : interpreterTemplate, controller : interpreterController,  resolveController : true,  reloadOnSearch:false, resolve : { user : securize(["Administrator","EditorialService", "StatementAdmin", "ScbdStaff", "Interpreters"]) } })
    .when('/:meeting',                    { template : documentsTemplate,   controller : documentsController,    reloadOnSearch:false, resolve : { showMeeting : resolveLiteral(false) } })
    .otherwise({redirectTo: '/404'});
}]);