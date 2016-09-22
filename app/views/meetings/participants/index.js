define(['app', 'underscore', 'alasql', 'xlsx', 'moment', 'authentication'], function(app, _, alasql, xlsx, moment) { "use strict";

	return ['$scope', '$http', '$q', function($scope, $http, $q) {

		$q.all([getMeetings(),getCountries()]).then(function (results) {
			$scope.meetings  = results[0];
			$scope.countries = results[1];

			return _.map(results[0], function (meeting) {
					   return { code: meeting.EVT_CD, name: meeting.EVT_TIT_EN };
					});
		}).then(function (meetings) {

			$scope.options = {
					 meetings: meetings,
					 selectedMeeting : null,
					 registrationStatuses : [
				 		{ code:'nominated',  name: 'Nominated participants'},
						{ code:'accredited', name: 'Accredited participants'},
						{ code:'registered', name: 'Registered participants'}
					],
					 selectedRegistrationStatus : 'nominated', // default
			 };
		}).catch(function(error) {
			throw { error:error.data, errorCode : error.status };
		});

		//============================================================
		//
		//============================================================
		$scope.$watch('options.selectedMeeting', function(newValue, oldValue) {
		  	if(newValue !== oldValue && !_.isEmpty(newValue)){

				$scope.participants = [];

				$q.when(getData(newValue)).then(function (documents) {
					$scope.documents = documents;
				}).then(function () {
					$scope.participants = filterData($scope.options.selectedRegistrationStatus);
				}).catch(function(error) {
					throw { error:error.data, errorCode : error.status };
				});
			}
		});

		//============================================================
		//
		//============================================================
		$scope.$watch('options.selectedRegistrationStatus', function(newValue, oldValue) {
		  	if(newValue !== oldValue){
				$scope.participants = filterData(newValue);
			}
		});

		//============================================================
		//
		//============================================================
		$scope.$watch('options.selectedMeetingTreaty', function(newValue, oldValue) {
		  	if(newValue !== oldValue){
				$scope.participants =  filterData($scope.options.selectedRegistrationStatus);
			}
		});

		//============================================================
		//
		//============================================================
		$scope.hasMeetingSelected = function () {
			return !!($scope.options && $scope.options.selectedMeeting);
		};

		//============================================================
		//
		//============================================================
		$scope.exportDataToExcel = function () {
			var filename = 'list-of-participants_' + moment(new Date()).format("YYYY-MM-DD") + '.xlsx';

			if($scope.participants && $scope.participants.length > 0)
				alasql('SELECT * INTO XLSX("' + filename + '",{sheetid: "Participants", headers:true}) FROM ? ORDER BY TYPE_ORDER, PARTY_ORDER, GOVERNMENT, ORGANIZATION, LASTNAME',[$scope.participants]);
		};


		//============================================================
		//
		//============================================================
		var filterData = function (status) {

			if($scope.documents && $scope.documents.registrations) {

				var filteredRegistrations = $scope.documents.registrations;

				if(status === 'accredited') filteredRegistrations  = _.filter($scope.documents.registrations, { 'REG_PRE_YN': true });
				if(status === 'registered') filteredRegistrations  = _.filter($scope.documents.registrations, { 'REG_YN': true });

				return _.map(filteredRegistrations, getRow);
			}
		};


		//============================================================
		//
		//============================================================
		function getData(meetingCode){

			return $http.get('/api/v2016/kronos/participants/'+meetingCode.toUpperCase()).then(function(res) {

				return res.data;
			});
		}

		//============================================================
		//
		//============================================================
		function getRow(reg){

		    var pcp      = _.find($scope.documents.participants,      { _id : reg.REG_PCP_ID });
		    var org      = _.find($scope.documents.organizations,     { _id : pcp.PCP_ORG_ID });

		    var typeCode = _.has(org, 'ORG_TYP_CD') ? org.ORG_TYP_CD : "ERR";
		    var orgType  = _.find($scope.documents.organizationTypes, { TYP_CD : typeCode });

			var treaty   = getTreaty($scope.options.selectedMeeting);

		    return loadRow(reg, pcp,org, orgType, treaty);
		}

		//============================================================
		//
		//============================================================
		function loadRow(reg, pcp, org, orgType, treaty) {

		    var mailingAdddress = getMailingAddress(pcp, org);

		    return  {
		                MEETING               : reg.REG_MTG_CD,
		                TYPE_ORDER            : orgType.TYP_ORD  ,
		                PARTY_ORDER           : (_.isEmpty(org.ORG_GOV_CTR_CD) || org.ORG_TYP_CD !== "GOV") ? "" : getPartyStatus(org.ORG_GOV_CTR_CD, treaty) ,
		                GOVERNMENT            : _.isEmpty(org.ORG_GOV_CTR_CD) ? "" : getCountryName(org.ORG_GOV_CTR_CD),
		                TYPE                  : orgType.TYP_CD,
		                TYPENAME              : orgType.TYP_TIT == "Governments" ? getPartyStatus(org.ORG_GOV_CTR_CD, treaty).replace('Party', 'Parties') : orgType.TYP_TIT,
		                REG_ORDER             : !!reg.REG_DLG_ORD ? reg.REG_DLG_ORD : 999,
		                TITLE                 : pcp.PCP_TIT,
		                FIRSTNAME             : pcp.PCP_FST_NM,
		                LASTNAME              : pcp.PCP_LST_NM,
		                FUNCTION              : pcp.PCP_FCT,
		                DEPARTMENT            : pcp.PCP_DPT_NM,
		                ORGANIZATION          : org.ORG_NM,
		                ACRONYM               : org.ORG_SHT_NM,
		                ADDRESS               : mailingAdddress.addressLine,
		                POSTALCODE            : mailingAdddress.postalcode,
		                CITY                  : mailingAdddress.city,
		                PROVINCE              : mailingAdddress.province,
		                COUNTRY               : mailingAdddress.country,
		                EMAIL                 : pcp.PCP_EML1,
		                EMAILCC               : pcp.PCP_EML2,
		                PHONE                 : pcp.PCP_TEL,
		                FAX                   : pcp.PCP_FAX,
		                WEB                   : pcp.PCP_WEB,
		                FUNDED                : (_.isUndefined(reg.REG_DLG_FUND_YN)       || _.isNull(reg.REG_DLG_FUND_YN)) ? "false" : reg.REG_DLG_FUND_YN.toString(),
		                ISNOTOFFICIALDELEGATE : (_.isUndefined(reg.IsNotOfficialDelegate) || _.isNull(reg.IsNotOfficialDelegate)) ? "false" : reg.IsNotOfficialDelegate.toString()
		            };
		}


		// ============================================================
		//
		// ============================================================
		function getMailingAddress(pcp, org)
		{
		    var province_post_countries = ['CA', 'GB'];
		    var o = { };

		    if(pcp && _.has(pcp, 'PCP_ADR_PRIV_YN') && pcp.PCP_ADR_PRIV_YN === true){
		        o.addressLine = (_.compact([pcp.PCP_ADR_L1, pcp.PCP_ADR_L2])).join(", ");
		        o.postalcode  = pcp.PCP_ADR_POSTAL_CODE;
		        o.city        = pcp.PCP_ADR_CITY;
		        o.province    = pcp.PCP_ADR_ZIP_PROV;
		        o.country     = _.isEmpty(pcp.PCP_ADR_CTR_CD)  ? "" : (_.find($scope.countries, { code: pcp.PCP_ADR_CTR_CD.toUpperCase() })).name.en;
		        o.countryCode = pcp.PCP_ADR_CTR_CD || "";
		    }
		    else {
		        o.addressLine = (_.compact([org.ORG_ADR_L1, org.ORG_ADR_L2])).join(", ");
		        o.postalcode  = org.ORG_ADR_POST;
		        o.city        = org.ORG_ADR_CITY;
		        o.province    = org.ORG_ADR_ZIP_PROV;
		        o.country     = _.isEmpty(org.ORG_ADR_CTR_CD)  ? "" :(_.find($scope.countries, { code: org.ORG_ADR_CTR_CD.toUpperCase() })).name.en;
		        o.countryCode = org.ORG_ADR_CTR_CD || "";
		    }
		    // Montreal, Quebec H8Z 1N9
		    if(_.includes(province_post_countries, o.countryCode.toUpperCase())){
		        o.province    = (_.compact([o.province , o.postalcode])).join(", ");
		        o.postalcode  = "";
		    }

		    return o;
		}

		//============================================================
		//
		//============================================================
		function getCountryName(code) {

		    var countryCode = code.toUpperCase();

			if(countryCode === 'EUR') countryCode = 'EU';

			var country =  _.find($scope.countries , {code: countryCode});

			if(country && country.name)
				return country.name.en;

		    return "";
		}

		//============================================================
		//
		//============================================================
		function getTreaty(meetingCode)
		{
			var meeting = _.find($scope.meetings, { EVT_CD: meetingCode });

			if(meeting.EVT_THM_CD == "CPB") return "XXVII8a";
			if(meeting.EVT_THM_CD == "ABS") return "XXVII8b";

			return "XXVII8"; // default to CBD
		}

		//============================================================
		//
		//============================================================
		function getPartyStatus(code, treaty)
		{
		    var countryCode = code.toUpperCase();

		    if(countryCode == 'EUR') countryCode = 'EU'; // eu

			var country =  _.find($scope.countries, {code: countryCode});

		    var isParty;

		    if(country && country.treaties){

		        switch (treaty) {

		            case "XXVII8a": //CPB
		                isParty = country.treaties.XXVII8a.party !== null;
		                break;
		            case "XXVII8b":	// NP
		                isParty = country.treaties.XXVII8b.party !== null;
		                break;
		            default: // CBD
		                isParty = country.treaties.XXVII8.party !== null;
		        }
		    }

		    return isParty ? "Party" : "Non-Party";
		}

		//=======================================================================
		//
		//=======================================================================
		function getMeetings(limit) {

			var params = {
				q: {
					EVT_REG_YN  : true,
					EVT_ORG1_ID : 3406
				},
				f: {
					EVT_CD     : 1,
					EVT_TIT_EN : 1,
					EVT_FROM_DT: 1,
					EVT_TO_DT  : 1,
					EVT_THM_CD : 1
				},
				s: { EVT_FROM_DT: -1, EVT_CD: 1 } ,
				l: limit || 20
			};

			return $http.get('/api/v2016/meetings', { cache : true, params: params }).then(function (res) {
				return res.data;
			});
		}

		//=======================================================================
		//
		//=======================================================================
		function getCountries() {

			return $http.get('/api/v2015/countries', {
				cache: true,
			}).then(function(response) {
				return response.data;
			});
		}

	}];
});
