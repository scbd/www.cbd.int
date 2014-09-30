define(['underscore'], function(_) {
	return ["$scope", "$http", "$timeout", "$location", function ($scope, $http, $timeout, $location) {

		$scope.requests = [];
		$scope.refresh  = refresh;
		$scope.sum      = sum;
		$scope.distinct = distinct;
		$scope.averageJobTime   = averageJobTime;
		$scope.getFromLast      = getFromLast;
		$scope.isPending        = function(r) { return  is(r, 'pending' ); };
		$scope.isPendingHeld    = function(r) { return  is(r, 'pending-held' ); };
		$scope.isProcessing     = function(r) { return  is(r, 'processing' ); };
		$scope.isProcessingStop = function(r) { return  is(r, 'processing-stopped' ); };
		$scope.isCompleted      = function(r) { return  is(r, 'completed' ); };
		$scope.isCanceled       = function(r) { return  is(r, 'canceled' ); };
		$scope.isAborted        = function(r) { return  is(r, 'aborted' ); };
		$scope.isCleared        = function(r) { return  is(r, 'cleared' ); };

		var qAutoRefresh = null;

		$scope.$on('$routeChangeStart', function(next, current) {
			if(!qAutoRefresh)
				return;

			console.log('Canceling autoRefresh');

			$timeout.cancel(qAutoRefresh);

			qAutoRefresh = null;
		});

		$scope.$watch(function() { return $location.path() }, function(path, oldPath){

			if(path != "/printsmart/") {
				$scope.badge = "";
				$scope.$root.contact = null;
			}
		});

		autoRefresh();

		function autoRefresh() {

			qAutoRefresh = null;

			refresh();

			qAutoRefresh = $timeout(autoRefresh, 30*1000);
		}

		function refresh() {

			$http.get("/api/v2014/printsmart-requests", { params : { badge : $location.search().badge } }).success(function(requests){
				console.log('Requests loaded');
				$scope.requests = requests;
			});

			$http.get("/api/v2014/printsmart-downloads", { params : { badge : $location.search().badge } }).success(function(downloads){
				console.log('Downloads loaded');

				var totalDownloads = 0;

				_.each(downloads, function(d){
					totalDownloads += d.items.length * (d.downloads||0);
				})

				$scope.totalDownloads = totalDownloads;
			});
		}

		function averageJobTime(slot, last) {

			var requests = $scope.requests;

			requests  = _.filter(requests, function(r) { return r && r.status && r.status[slot]; });
			requests  = _.last  (requests, last)

			return sum(_.map(requests, function(r) {
				return r.status[slot] - r.status['time-at-creation'];
			})) / requests.length;
		}

		function is(request, status) {

			if(status=="cleared") {
				return request &&
					   request.completed;
			}

			return request &&
				   request.status &&
				   request.status['job-state'] === status;
		}

		function getFromLast(minutes) {

			var time = new Date();

			time.setMinutes(time.getMinutes()-minutes);

			var sTime = formatDate(time);

			 return _.filter($scope.requests, function(r) {

				return r && r.createdOn && r.createdOn > sTime;

			});
		}


		function distinct(value, member1, member2, member3, member4, member5) {

			if(value===undefined) return [];
			if(value===null)      return [];

			var values = [];

			if(_.isArray(value)) {

				_.each(value, function(entry) {

					if(member1)
						values = _.union(values, distinct(entry[member1], member2, member3, member4, member5));
					else if(value!==undefined && value!==null)
						values = _.union(values, value);
				});

			}
			else if(member1)
				values = _.union(values, distinct(value[member1], member2, member3, member4, member5));
			else
				values = _.union(values, value);

			return _.uniq(values);
		}

		function sum(value, member1, member2, member3, member4, member5) {

			if(value===undefined) return 0;
			if(value===null)      return 0;

			var total = 0;

			if(_.isArray(value)) {

				_.each(value, function(entry) {

					if(member1)
						total += sum(entry[member1], member2, member3, member4, member5);
					else if(_.isNumber(entry))
						total += entry;
				});
			}
			else if(member1) {
				total += sum(value[member1], member2, member3, member4, member5);
			}
			else if(_.isNumber(value)) {
				total += value;
			}

			return total;
		}

		//============================================================
	    //
	    //
	    //============================================================
	    function formatDate(date) {

	        var pad = function(s) { s = ''+s; return s.length<2 ? '0'+s : s; };

	        return pad(date.getUTCFullYear())+'-'+
	               pad(date.getUTCMonth()+1) +'-'+
	               pad(date.getUTCDate())     +'T'+
	               pad(date.getUTCHours())   +':'+
	               pad(date.getUTCMinutes()) +':'+
	               pad(date.getUTCSeconds()) +'.000Z';
	    }
	}];
});
