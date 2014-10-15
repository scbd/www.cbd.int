define(['app', './solrQuery.js', 'underscore', 'angular'], function(module, Query, _, angular) {
  return module.factory('reports', ['$http', '$locale', '$q',
    function($http, $locale, $q) {

      var baseUrl = '/api/v2013/index',
        baseQuery = 'schema_s:meeting',
        reports = {},
        fieldMap = {
          id :  "id",
          aichiTarget :  "aichiTarget_s",
          aichiTargets : 'aichiTarget_ss',
          countryCode :  "government_s",
          endDate :  "endDate_s",
          government : 'government_s',
          identifier :  "identifier_s",
          reportUrl :  "url_ss",
          progressGuid :  "progress_s",
          reportType: 'reportType_s',
          schema: 'schema_s',
          startDate :  "startDate_s",
          title :  "title_s",
          summary :  "summary_s",
          updated :  "updateDate_dt",
          nationalTarget :  "nationalTarget_s"
        },
        reportTypes = {
          'nbsap': 'B0EBAE91-9581-4BB2-9C02-52FCF9D82721', //National Biodiversity Strategies and reportTypes[Action Plan(NBSAP])
          'status': '5471756B-6B33-46AD-9D51-15443C5E5315', //Status of the programme of work for the Global Taxonomy Initiative(2004)
          'forests': '98B63E49-28D0-4D65-A7A4-A56D0CC97B4B', //Voluntary report on the implementation of the expanded work programme for forests(2003)
          '5th': 'B3079A36-32A3-41E2-BDE0-65E4E3A51601', //5th National Report(2009 - 2014)
          '4th': '272B0A17-5569-429D-ADF5-2A55C588F7A7', //4th National Report(2005 - 2009)
          '2nd': 'A49393CA-2950-4EFD-8BCC-33266D69232F', //2nd National Report(1997 - 2001)
          '3rd': 'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4', //3rd National Report(2001 - 2005)
          '1st': 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3', //1st National Report(1992 - 1998)
        };

      reports.normalizeReports = function(response, counts) {
        var processed = [];

        response.docs.forEach(function(doc) {
          var r = {};

          r.id = doc.id;
          r.identifier = doc.identifier_s;
          r.aichiTargets = doc.aichiTarget_ss;
          r.reportUrl = doc.url_ss;
          r.title = doc.title_s;
          r.summary = doc.summary_s;
          r.startDate = doc.startDate_s;
          r.endDate = doc.endDate_s;
          r.countryCode = doc.government_s.toUpperCase();

          processed.push(r);
        });

        if (counts) {
          processed.counts = counts.facet_fields.government_s;
        }

        return processed;
      };

      reports.normalizeAssessments = function(response) {
        var processed = [];

        response.docs.forEach(function(assessment) {
          var a = {};

          a.aichiTarget = assessment.aichiTarget_s;
          a.progressGuid =  assessment.progress_s;
          a.title = assessment.title_s;
          a.updated = assessment.updateDate_dt;
          a.nationalTarget = assessment.nationalTarget_s;

          processed.push(a);
        });

        return processed;
      };

      reports.getAll = function(cb) {
        $http.get(baseUrl, { params: {q: baseQuery } })
          .then(function(results) {
            cb(results.data);
          });
      };

      function issueRequest(query, shouldNormalize, normalizationFunction) {
        // because we build the query by hand using solrQuery, we
        // dont use the usual params hash the $http.get() accepts, otherwise
        // angular will escape our already escaped characters.
        var deferred = $q.defer();
        $http.get([baseUrl, query].join('?'))
          .then(function(results) {
            var counts = !(_.isEmpty(results.data.facet_counts)) ? results.data.facet_counts : false;
            var data;
            if (shouldNormalize) data = normalizationFunction(results.data.response, counts);
            else data = results.data.response.docs;
            deferred.resolve(data);
          })
          .catch(function(results) {
            if (results.status !== 200) {
              deferred.reject(results.statusText);
            }
          });

        return deferred.promise;
      }

      reports.createDateRange = function(start, end) {
        return '[' + start + ' TO ' + end + ']';
      };

      reports._buildSolrQuery = function(paramMap) {
        // clean out any keys that have falsy values so that we don't
        // send empty params to Solr.
        var cleanMap = _.chain(paramMap)
          .pairs()
          .filter(function(val) {
            return !!val[1];
          })
          .object()
          .value();

        var query = new Query();
        var q = {}, sortParams, start;

        query.fl(_.uniq(_.values(fieldMap)));

        angular.forEach(cleanMap, function(val, fname) {
          switch (fname) {

            case 'schema':
            case 'country':
              q[reports._translateFieldName(fname)] = val;
              break;

            case 'reportType':
              q[reports._translateFieldName(fname)] = reportTypes[val];
              break;

            case 'startDate':
              // the year param is more specific than startDate and we favour
              // it over startDate's wider range.
              if (cleanMap.year) break;
              var ranges = ['NOW', '*'],
                startRange = reports.createDateRange.apply(
                  this,
                  val === 'upcoming' ? ranges : ranges.reverse()
                );

              q[reports._translateFieldName(fname)] = startRange;
              break;

            case 'year':
              //create a range from [Jan 1st, yearGiven TO Dec 31st, yearGiven]
              var start = (new Date(val, 0)).toISOString(),
                end = (new Date(val, 11, 31)).toISOString();
              var range = reports.createDateRange(start, end);
              q[reports._translateFieldName(fname)] = range;
              break;

            case 'sort':
              sortParams = _.object([val.map(reports._translateFieldName)]);
              break;

            case 'start':
              start = val;
              break;

            case 'rows':
              query.rows(val);
              break;

            case 'aichiTarget':
              q[reports._translateFieldName(fname)] = ['(', val, ')'].join('');
              break;

            case 'byNationalTarget':
            case 'byAichiTarget':
              if (val.length) {
                // Add quotes to the values otherwise solr fails.
                val = val.map(function(guid) { return '"' + guid + '"'; });
                q[reports._translateFieldName(fname)] = ['(', val.join(', '), ')'].join('');
              }
              break;

            case 'facet':
              // for facets we pass the options object directly to
              // the underlying solrQuery.
              query.facet(val);
              break;

            default:
              q[reports._translateFieldName(fname)] = val;
              break;
          }
        });

        query.q(q);
        if (start) query.start(start);
        if (_.keys(sortParams).length) query.sort(sortParams);

        return query.build();
      };

      reports._translateFieldName = function(fieldName) {
        return fieldMap[fieldName] || fieldName;
      };

      reports.getProgressAssessments = function(schema, guids, targetType) {
        var params = {schema: schema};

        // possible values for targetType are 'national' and 'aichi';
        params[targetType === 'national' ? 'byNationalTarget' : 'byAichiTarget'] = guids;

        var query = reports._buildSolrQuery(params);

        return issueRequest(query, true, reports.normalizeAssessments);
      };

      reports.getReports = function(options) {
        options = options || {};
		if(options.reportType === 'nbsap'){
  			options.startDate_s = '[2010-12-22 TO *]';
  		}
        var params = angular.extend({}, options);
        params.rows = 1000;
        var solrQuery = reports._buildSolrQuery(params);

        return issueRequest(solrQuery, true, reports.normalizeReports);
      };

      return reports;
    }
  ]);
});
