import app from '~/app';
import require from 'require';
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

                $q.all(resolve).then(function (locals) {

                    require([''+options.module+'.html', options.module], function(html, controllerCtr) {

                        element.html($compile(html)($scope));

                        var ctrl = $injector.instantiate(controllerCtr, ng.extend(locals, {
                            $scope: $scope
                        }));

                        if(options.controllerAs)
                            $scope[options.controllerAs] = ctrl;
                    });
                });
            }
        };
	}]);

