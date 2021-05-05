import app from '~/app';
import ng from 'angular'; 

	export default app.directive('viewInjector', ['$injector', '$compile', '$q', function($injector, $compile, $q) {
		return {
			restrict : "EA",
            scope: true,
			link: function ($scope, element, attr) {

                var options = $scope.$eval(attr.viewInjector);
                var resolve = ng.extend({}, options.resolve);

                ng.forEach(resolve, function (value, key) {
                    resolve[key] = ng.isString(value) ? $injector.get(value) : $injector.invoke(value, null, null, key);
                });

                $q.all(resolve).then(async function (locals) {

                    let view = null;

                    if(options.module === 'views/schedules/index-id') view = await import('~/views/schedules/index-id');
                    if(view === null) throw new Error('Unknown module');

                    const {
                        template : html,
                        default :  controllerCtr
                    } = view

                    var ctrl = $injector.instantiate(controllerCtr, {...locals, $scope });

                    if(options.controllerAs)
                        $scope[options.controllerAs] = ctrl;

                    const $template = $compile(html)($scope);

                    element.html($template);
                });
            }
        };
	}]);

