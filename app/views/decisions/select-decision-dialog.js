define([], function() {

    return ['$scope', function ($scope) {

        $scope.getBodies    = getBodies;
        $scope.getMeetings  = getMeetings;
        $scope.getDecisions = getDecisions;

        var bodies = [
            { code : "COP",     title : "COP" },
            { code : "SBI",     title : "SBI/WGRI" },
            { code : "SBSTTA",  title : "SBSTTA" },
            { code : "WG8J",    title : "WG8J" },
            { code : "WGPA",    title : "WGPA" },
            { code : "ABS-MOP", title : "ABS COP-MOP" },
            { code : "BS-MOP",  title : "BS COP-MOP" },
        ];

        var meetings = {
            "COP" : [
                { code : "cop-01", title : "COP 1 (1994, Nassau, Bahamas)" },
                { code : "cop-02", title : "COP 2 (1995, Jakarta, Indonesia)" },
                { code : "cop-03", title : "COP 3 (1996, Buenos Aires, Argentina)" },
                { code : "cop-04", title : "COP 4 (1998, Bratislava, Slovakia)" },
                { code : "cop-05", title : "COP 5 (2000, Nairobi, Kenya)" },
                { code : "cop-06", title : "COP 6 (2002, the Hague, Netherlands)" },
                { code : "cop-07", title : "COP 7 (2004, Kuala Lumpur, Malaysia)" },
                { code : "cop-08", title : "COP 8 (2006, Curitiba, Brazil)" },
                { code : "cop-09", title : "COP 9 (2008, Bonn, Germany)" },
                { code : "cop-10", title : "COP 10 (2010, Nagoya, Japan)" },
                { code : "cop-11", title : "COP 11 (2012, Hyderabad, India)" },
                { code : "cop-12", title : "COP 12 (2014, Pyeongchang, Republic of Korea)" },
            ]
        };

        var decisions = {
            "cop-08": [
                { code : 'VIII/1', symbol: 'Decision VIII/1' },
                { code : 'VIII/2', symbol: 'Decision VIII/2' },
                { code : 'VIII/3', symbol: 'Decision VIII/3' },
                { code : 'VIII/4', symbol: 'Decision VIII/4' },
                { code : 'VIII/5', symbol: 'Decision VIII/5' },
                { code : 'VIII/6', symbol: 'Decision VIII/6' },
                { code : 'VIII/7', symbol: 'Decision VIII/7' },
                { code : 'VIII/8', symbol: 'Decision VIII/8' },
                { code : 'VIII/9', symbol: 'Decision VIII/9' },
                { code : 'VIII/10', symbol: 'Decision VIII/10' },
                { code : 'VIII/11', symbol: 'Decision VIII/11' },
                { code : 'VIII/12', symbol: 'Decision VIII/12' },
                { code : 'VIII/13', symbol: 'Decision VIII/13' },
                { code : 'VIII/14', symbol: 'Decision VIII/14' },
                { code : 'VIII/15', symbol: 'Decision VIII/15' },
                { code : 'VIII/16', symbol: 'Decision VIII/16' },
                { code : 'VIII/17', symbol: 'Decision VIII/17' },
                { code : 'VIII/18', symbol: 'Decision VIII/18' },
                { code : 'VIII/19', symbol: 'Decision VIII/19' },
                { code : 'VIII/20', symbol: 'Decision VIII/20' },
                { code : 'VIII/21', symbol: 'Decision VIII/21' },
                { code : 'VIII/22', symbol: 'Decision VIII/22' },
                { code : 'VIII/23', symbol: 'Decision VIII/23' },
                { code : 'VIII/24', symbol: 'Decision VIII/24' },
                { code : 'VIII/25', symbol: 'Decision VIII/25' },
                { code : 'VIII/26', symbol: 'Decision VIII/26' },
                { code : 'VIII/27', symbol: 'Decision VIII/27' },
                { code : 'VIII/28', symbol: 'Decision VIII/28' },
                { code : 'VIII/29', symbol: 'Decision VIII/29' },
                { code : 'VIII/30', symbol: 'Decision VIII/30' },
                { code : 'VIII/31', symbol: 'Decision VIII/31' },
                { code : 'VIII/32', symbol: 'Decision VIII/32' },
                { code : 'VIII/33', symbol: 'Decision VIII/33' },
                { code : 'VIII/34', symbol: 'Decision VIII/34' }
            ]
        };

		//==========================
		//
		//==========================
        function getBodies() {
            return bodies;
        }

		//==========================
		//
		//==========================
        function getMeetings(body) {
            return meetings[body] || [];
        }

		//==========================
		//
		//==========================
        function getDecisions(meeting) {
            return decisions[meeting] || [];
        }
	}];
});
