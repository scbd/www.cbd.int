import sectionList   from './data/sections'
import paragraphList from './data/paragraphes'
import itemList      from './data/items'
import subItemList   from './data/sub-items'

export { default as template } from './select-decision-dialog.html'

export default ['$scope', function ($scope) {

        $scope.collections = {
            bodies : [
                { code : "COP",     title : "COP" },
                { code : "EXCOP",      title : "ExCOP" },
                { code : "NP/COP-MOP", title : "NP COP-MOP" },
                { code : "BS/COP-MOP", title : "BS COP-MOP" },
                { code : "SBSTTA",  title : "SBSTTA" },
                { code : "SBI",     title : "SBI" },
                { code : "WGRI",    title : "WGRI" },
                { code : "WG8J",    title : "WG8J" },
                { code : "WGPA",    title : "WGPA" },
                { code : "ICCP",    title : "ICCP" },
                { code : "ICNP",    title : "ICNP" },
            ],
            sessions    : paragraphList, //TODO
            decisions   : paragraphList, //TODO
            sections    : sectionList,
            paragraphes : paragraphList,
            items       : itemList,
            subItems    : subItemList
        };

        //==============================
        //
        //==============================
        $scope.$watch(function() {

            delete $scope.symbol;

            if(!$scope.body || !$scope.session || !$scope.decision)
                return;

            var parts = ['CBD', $scope.body, pad($scope.session), pad($scope.decision)];

            if($scope.section || $scope.paragraph) {

                var paragraphParts = [
                    ($scope.section||'') +
                    ($scope.paragraph && pad($scope.paragraph)||'')
                ];

                if($scope.item)                   paragraphParts.push(pad($scope.item));
                if($scope.item && $scope.subItem) paragraphParts.push(pad($scope.subItem));

                parts.push(paragraphParts.join('.'));
            }

            $scope.symbol = parts.join('/');

        });

        //==============================
        //
        //==============================
        function pad(input) {

            var output = (input || '').toString();

            while(output.length<2)
                output = '0' + output;

            return output;
        }

	}];