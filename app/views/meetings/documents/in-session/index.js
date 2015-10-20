define(['app', 'data/in-session/meetings', 'underscore'], function(app, meetingsData, _) { "use strict";

	return ['$scope', '$http', function($scope, $http) {

		$scope.meetings = _.where(_.clone(meetingsData, true), { list:true }); // deep clone;

		//========================================
		//
		// LOAD meetings info from db/index
		//
		//========================================
		var query = {
			q : 'schema_s:'+solrEscape('meeting')+' AND symbol_s:(' + _($scope.meetings).pluck('code').map(solrEscape).value().join(' ') + ')',
			fl : 'symbol_s,title_t,startDate_dt,endDate_dt'
		};

		$http.get('/api/v2013/index', {params : query }).then(function(res){

			var now = new Date();

			$scope.meetings.forEach(function(meeting) {

				var m = _.findWhere(res.data.response.docs, { symbol_s : meeting.code });

				if(!m)
					return;

				meeting.name      = m.title_t;
				meeting.startDate = new Date(m.startDate_dt);
				meeting.endDate   = new Date(m.endDate_dt);

				var start = new Date(m.startDate_dt);
				var end   = new Date(m.endDate_dt);

				end.setDate(end.getDate()+1); // + 24h

				meeting.primary   = start < now && now < end;
			});
		});


		//========================================
		//
		// LOAD meetings stats
		//
		//========================================
		$scope.meetings.forEach(function(meeting) {

			var query = {
				q : {
					meeting : meeting.code,
					section : { $in : _.pluck(meeting.sections, 'code') },
					locales : { $exists: true, $not: {$size: 0} }
				},
				c : 1
			};

			$http.get('/api/v2015/insession-documents', { params : query }).then(function(res){
				meeting.documentCount = res.data.count;
			});
		});

		//========================================
		//
		//
		//========================================
		function solrEscape(value) {

			if(value===undefined) throw "Value is undefined";
			if(value===null)      throw "Value is null";
			if(value==="")        throw "Value is null";

			if(_.isNumber(value)) value = value.toString();
			if(_.isDate  (value)) value = value.toISOString();

			//TODO add more types

			value = value.toString();

			value = value.replace(/\\/g,   '\\\\');
			value = value.replace(/\+/g,   '\\+');
			value = value.replace(/\-/g,   '\\-');
			value = value.replace(/\&\&/g, '\\&&');
			value = value.replace(/\|\|/g, '\\||');
			value = value.replace(/\!/g,   '\\!');
			value = value.replace(/\(/g,   '\\(');
			value = value.replace(/\)/g,   '\\)');
			value = value.replace(/\{/g,   '\\{');
			value = value.replace(/\}/g,   '\\}');
			value = value.replace(/\[/g,   '\\[');
			value = value.replace(/\]/g,   '\\]');
			value = value.replace(/\^/g,   '\\^');
			value = value.replace(/\"/g,   '\\"');
			value = value.replace(/\~/g,   '\\~');
			value = value.replace(/\*/g,   '\\*');
			value = value.replace(/\?/g,   '\\?');
			value = value.replace(/\:/g,   '\\:');

			return value;
		}
	}];
});
