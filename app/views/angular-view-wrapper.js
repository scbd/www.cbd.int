import ng from 'angular'
export { default as template } from './angular-view-wrapper.html';

export default ['$scope', '$injector', '$compile', '$route', 'component', function ($scope, $injector, $compile, $route, component) {

  // Init template

  const templateHtml = component.template;
  const bindFn       = $compile(templateHtml);

  // init controller

  const { component:drop, ...locals } = { ...$route.current.locals } ;

  const controllerFn   = component.default ;
  const controllerAs   = $route.current.$$route.controllerAs || '$ctrl';
  const controller     = $injector.instantiate(controllerFn,locals);
  $scope[controllerAs] = controller;  

  const element = bindFn($scope);

  ng.element('ng-view').html(element);

  return controller;
}];
