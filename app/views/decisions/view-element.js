define(['app', 'text!./view-element.html', 'lodash'], function(app, html, _) { 'use strict';

	return app.directive('info', [function() {
		return {
			restrict : "A",
			template : html,
			transclude: true,
			scope: {},
			link: function ($scope, element, attrs) {

				var info = JSON.parse(attrs.info);

                console.log(info);

                if(info.data && info.data.type=='information')
                    info.data.type = 'informational';

				$scope.infoType = info.type;

                $scope.$emit('registerElement', info);

				if(info.type=='paragraph') {
			        element.addClass('box');

					$scope.type     = info.data.type;
					$scope.session  = info.data.session;
					$scope.decision = info.data.decision;
					$scope.section  = info.data.section;
                    $scope.code     = pad(info.paragraph, '0', 2);
					$scope.name     = 'paragraph ' + info.paragraph;
					$scope.actors   = info.data.actors;
					$scope.statuses = info.data.statuses;

					if(info.item) {

                        var n = info.item.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

                        $scope.code = pad(info.paragraph, '0', 2) + '.' + pad(n, '0', 2);
				        $scope.name += ' item ('+info.item+')';
				    }
				}

                if(info.type=='title')        return;
                if(info.type=='sectionTitle') return;

                $scope.$on('filterElement', function (evt, filters) {

                    element.removeClass('current');

                    if(filters) element.addClass('xhide').removeClass('xshow');
                    else        element.addClass('xshow').removeClass('xhide');

                    if(info.type!='paragraph') {
                        return;
                    }

                    if(!filters)
                        return;

                    var visible = true;

                    if(visible && filters.actors)      visible = _(filters.actors     ).intersection( info.data.actors    ).some();
                    if(visible && filters.statuses)    visible = _(filters.statuses   ).intersection( info.data.statuses  ).some();
                    if(visible && filters.types)       visible = _(filters.types      ).intersection([info.data.type     ]).some();
                    if(visible && filters.routeCodes)  visible = _(filters.routeCodes ).intersection([info.data.code     ]).some();

                    if(visible) {
                        element                                       .addClass('xshow').removeClass('xhide');
                        element.parents()                             .addClass('xshow').removeClass('xhide');
                        element.parents().find('element.sectionTitle').addClass('xshow').removeClass('xhide');
                    }

                    if(filters.routeCodes && ~filters.routeCodes.indexOf(info.data.code)) {
                        element.addClass('current');
                    }
                });


                //==============================
                //
                //==============================
                function pad(input, char, length) {

                    var output = (input || '').toString();

                    while(output.length<length)
                        output = char + output;

                    return output;
                }
			}
		};
	}]);
});
