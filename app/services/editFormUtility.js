define(['app','linqjs', 'providers/realm','services/storage','services/workflows'], function(app,Enumerable) {
  'use strict';
  app.factory('guid', function() {
  	function S4() {
  		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  	}
  	return function() {
  		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
  	};
  });
  app.factory("htmlUtility", function() {
    return {
      encode: function(srcText) {
        return $('<div/>').text(srcText).html();
      }
    };
  });

  app.factory('Enumerable', [function() {

		return Enumerable;
	}]);

	app.factory('linqjs', [function() {
		return Enumerable;
	}]);
  app.factory('Thesaurus', ['linqjs', function(Enumerable) {
      return {
          buildTree: function(terms) {
              var oTerms = [];
              var oTermsMap = {};

              Enumerable.from(terms).forEach(function(value) {
                  var oTerm = {
                      identifier: value.identifier,
                      title: value.title,
                      description: value.description
                  }

                  oTerms.push(oTerm);
                  oTermsMap[oTerm.identifier] = oTerm;
              });

              for (var i = 0; i < oTerms.length; ++i) {
                  var oRefTerm = terms[i];
                  var oBroader = oTerms[i];

                  if (oRefTerm.narrowerTerms && oRefTerm.narrowerTerms.length > 0) {
                      angular.forEach(oRefTerm.narrowerTerms, function(identifier) {
                          var oNarrower = oTermsMap[identifier];

                          if (oNarrower) {
                              oBroader.narrowerTerms = oBroader.narrowerTerms || [];
                              oNarrower.broaderTerms = oNarrower.broaderTerms || [];

                              oBroader.narrowerTerms.push(oNarrower);
                              oNarrower.broaderTerms.push(oBroader);
                          }
                      });
                  }
              }

              return Enumerable.from(oTerms).where("o=>!o.broaderTerms").toArray();
          }
      }
  }]);
  app.factory('underscore', [function() {
  return _;
}]);
  app.factory('editFormUtility', ["IStorage", "IWorkflows", "$q", "$route", "realm", function(storage, workflows, $q, $route, realm) {


    var schemasWorkflowTypes = {
      "aichiTarget"               : { name: "publishReferenceRecord", version: undefined },
      "contact"                   : { name: "publishReferenceRecord", version: undefined },
      "caseStudy"                 : { name: "publishReferenceRecord", version: undefined },
      "marineEbsa"                : { name: "publishReferenceRecord", version: undefined },
      "strategicPlanIndicator"    : { name: "publishReferenceRecord", version: undefined },
      "resource"                  : { name: "publishReferenceRecord", version: undefined },
      "capacityBuildingInitiative": { name: "publishReferenceRecord", version: undefined },
      "organization"              : { name: "publishReferenceRecord", version: undefined },
      "lwCampaigns"               : { name: "publishReferenceRecord", version: undefined },
      "lwProject"                 : { name: "publishReferenceRecord", version: undefined },
      "lwDonor"                   : { name: "publishReferenceRecord", version: undefined },
      "bbiContact"                : { name: "publishReferenceRecord", version: undefined },
      "bbiProfile"                : { name: "publishReferenceRecord", version: undefined },
      "bbiOpportunity"            : { name: "publishReferenceRecord", version: undefined },

      "database"                  : { name: "publishNationalRecord", version: "0.4" },
      "implementationActivity"    : { name: "publishNationalRecord", version: "0.4" },
      "nationalIndicator"         : { name: "publishNationalRecord", version: "0.4" },
      "nationalReport"            : { name: "publishNationalRecord", version: "0.4" },
      "nationalSupportTool"       : { name: "publishNationalRecord", version: "0.4" },
      "nationalTarget"            : { name: "publishNationalRecord", version: "0.4" },
      "nationalAssessment"        : { name: "publishNationalRecord", version: "0.4" },
      "resourceMobilisation"      : { name: "publishNationalRecord", version: "0.4" },
      "nationalReport6"           : { name: "publishNationalRecord", version: "0.4" },
    };
    var documentRealmCache = {};
    var _self = {
        //==================================
        //
        //==================================
        getRealm: function(identifier, config) {

          if(documentRealmCache[identifier])
            return $q.when(documentRealmCache[identifier]);

          return storage.drafts.getRealm(identifier)
          .then(function(success) {
              if(!success.data) return false;

              return documentRealmCache[identifier] = success.data;
          })
        },
      //==================================
      //
      //==================================
      load: function(identifier, expectedSchema, config) {

        return storage.drafts.get(identifier, {info: ""}, config).then(
          function(success) { return success; },
          function(error) {
            if (error.status == 404)
              return storage.documents.get(identifier, {info: ""}, config);
            throw error;
          }).then(
          function(success) {
            var info = success.data;

            if (expectedSchema && info.type != expectedSchema)
              throw {
                data: {
                  error: "Invalid schema type"
                },
                status: "badSchema"
              };

            var hasDraft = !!info.workingDocumentCreatedOn;
            var securityPromise = hasDraft ?
              storage.drafts.security.canUpdate(info.identifier, info.type, undefined, config) :
              storage.drafts.security.canCreate(info.identifier, info.type, undefined, config);

            return securityPromise.then(
              function(isAllowed) {
                if (!isAllowed)
                  throw {
                    data: {
                      error: "Not allowed"
                    },
                    status: "notAuthorized"
                  };

                var documentPromise = hasDraft ?
                  storage.drafts.get(identifier, undefined, config) :
                  storage.documents.get(identifier, undefined, config);

                return documentPromise.then(
                  function(success) {
                    return success.data;
                  });
              });
          });
      },

      //==================================
      //
      //==================================
      draftExists: function(identifier, config) {

        return storage.drafts.exists(identifier, null, config);
      },

      //==================================
      //
      //==================================
      canSaveDraft: function(document, config) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if document exists

        return _self.draftExists(identifier, config).then(function(exists) {

          // Check user security on document

          var qCanWrite = exists ? storage.drafts.security.canUpdate(identifier, schema, metadata, config) :
            storage.drafts.security.canCreate(identifier, schema, metadata, config);

          return qCanWrite;

        });
      },
      //==================================
      //
      //==================================
      saveDraft: function(document, config) {

        var identifier = document.header.identifier;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        return _self.draftExists(identifier).then(
          function(hasDraft) {

            var securityPromise = hasDraft ?
              storage.drafts.security.canUpdate(identifier, document.header.schema, metadata, config) :
              storage.drafts.security.canCreate(identifier, document.header.schema, metadata, config);

            return securityPromise.then(
              function(isAllowed) {
                if (!isAllowed)
                  throw {
                    error: "Not authorized to save draft"
                  };

                return storage.drafts.put(identifier, document, config);
              });
          });
      },

      //==================================
      //
      //==================================
      documentExists: function(identifier, config) {

        return storage.documents.exists(identifier, undefined, config);
      },


      //==================================
      //
      //==================================
      canPublish: function(document, config) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if document exists

        return _self.documentExists(identifier, config).then(function(exists) {

          // Check user security on document

          var qCanWrite = exists ? storage.documents.security.canUpdate(identifier, schema, metadata, config) :
            storage.documents.security.canCreate(identifier, schema, metadata, config);

          return qCanWrite;

        });
      },

      //==================================
      //
      //==================================
      publish: function(document, config) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if document exists

        return _self.documentExists(identifier, config).then(function(exists) {

          // Check user security on document

          var qCanWrite = exists ? storage.documents.security.canUpdate(identifier, schema, metadata, config) :
            storage.documents.security.canCreate(identifier, schema, metadata, config);

          return qCanWrite;

        }).then(function(canWrite) {

          if (!canWrite)
            throw {
              error: "Not allowed"
            };

          //Save document
          var processRequest;
          if ($route.current.params.workflowId) {
            // if the user is editing a locked record, remove the lock, update draft,
            // lock the draft and then update the workflow status.
            var metadata = {};
            processRequest = storage.drafts.locks.get(document.header.identifier, { lockID: ''}, config)
              .then(function(lockInfo) {
                return storage.drafts.locks.delete(document.header.identifier, lockInfo.data[0].lockID, config)
                  .then(function() {
                    return storage.drafts.put(document.header.identifier, document, config);
                  })
                  .then(function(draftInfo) {
                    return storage.drafts.locks.put(document.header.identifier, {
                      lockID: lockInfo.data[0].lockID
                    }, config);
                  }).then(function(draftInfo) {
                    console.log(draftInfo);

                  });
              })
              .then(function(data) {
                return workflows.updateActivity($route.current.params.workflowId, 'publishRecord', {
                  action: 'approve'
                })
              });
          } else {
            processRequest = storage.drafts.put(identifier, document, config).then(function(draftInfo) {
              return createWorkflow(draftInfo); // return workflow info
            }); //editFormUtility.publish(document);
          }
          return $q.when(processRequest);
        });
      },

      //==================================
      //
      //==================================
      publishRequest: function(document, config) {

        var identifier = document.header.identifier;
        var schema = document.header.schema;
        var metadata = {};

        if (document.government)
          metadata.government = document.government.identifier;

        // Check if doc & draft exists

        return _self.draftExists(identifier, config).then(function(exists) {

          // Check user security on drafts

          var qCanWrite = exists ?
            storage.drafts.security.canUpdate(identifier, schema, metadata, config) :
            storage.drafts.security.canCreate(identifier, schema, metadata, config);

          return qCanWrite;

        }).then(function(canWrite) {

          if (!canWrite)
            throw {
              error: "Not allowed"
            };

          //Save draft
          return storage.drafts.put(identifier, document, config);

        }).then(function(draftInfo) {
          return createWorkflow(draftInfo); // return workflow info
        });
      }
    };

    function createWorkflow(draftInfo, additionalInfo) {
      var type = schemasWorkflowTypes[draftInfo.type];

      if (!type)
        throw "No workflow type defined for this record type: " + draftInfo.type;

      var workflowData = {
        "realm": draftInfo.realm || realm,
        "documentID": draftInfo.documentID,
        "identifier": draftInfo.identifier,
        "title": draftInfo.workingDocumentTitle,
        "abstract": draftInfo.workingDocumentSummary,
        "metadata": draftInfo.workingDocumentMetadata,
        "additionalInfo": additionalInfo
      };

      return workflows.create(type.name, type.version, workflowData); // return workflow info
    }


    return _self;

  }]);

});
