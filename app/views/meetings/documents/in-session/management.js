define(['app', 'underscore', 'angular', 'data/in-session/meetings'], function(app, _, ng, meetingsData) { "use strict";

	app.directive('file', function() {
	    return {
	        restrict: 'E',
	        template: '<input type="file" />',
	        replace: true,
	        require: 'ngModel',
	        link: function(scope, element, attr, ctrl) {
	            var listener = function() {
	                scope.$apply(function() {
	                    if(attr.multiple) ctrl.$setViewValue(element[0].files);
	                    else              ctrl.$setViewValue(element[0].files[0]);
	                });
	            };

	            element.bind('change', listener);
	        }
	    };
	});

	return ['$scope', '$http', '$location', '$q', function($scope, $http, $location, $q) {

		loadMeetings();

	    //=================================================
	    //
	    //
	    //=================================================
	    function loadMeetings() {

	        delete $scope.error;
	        $scope.loading = true;

	        return $q.when(_.cloneDeep(meetingsData)).then(function(meetings) {

	            $scope.meetings  = meetings;
	            $scope.meeting   = _.findWhere(meetings, { code : $location.search().meeting });

	            return loadSections();

	        }).catch(function(error){

	            $scope.error = ((error||{}).data||{}).message || (error||{}).data || error;

	        }).finally(function(){

	            delete $scope.loading;
	        });
	    }

	    //=================================================
	    //
	    //
	    //=================================================
	    function loadSections() {

	        if(!$scope.meeting && $scope.meetings) {
	            $scope.sections = null;
	            return;
	        }

	        delete $scope.error;
	        $scope.loading = true;

	        return $q.when($scope.meeting.sections).then(function(sections){ //simulate http call using { data : ... }

	            $scope.sections = sections;
	            $scope.section  = _.findWhere(sections, { code : $location.search().section });

	            return loadDocuments();

	        }).catch(function(error){

	            $scope.error = ((error||{}).data||{}).message || (error||{}).data || error;

	        }).finally(function(){

	            delete $scope.loading;
	        });
	    }

	    //=================================================
	    //
	    //
	    //=================================================
	    function loadDocuments() {

	        if(!$scope.section && $scope.sections){
	            $scope.documents = null;
	            return;
	        }

	        delete $scope.error;
	        $scope.loading = true;

			var query = {
				q : {
					meeting : $scope.meeting.code,
					section : $scope.section.code
				},
				s : {
					position : 1
				}
			};

	        return $http.get('/api/v2015/insession-documents', { params : query }).then(function(res){

	            var selectedId = (_.findWhere($scope.documents, {selected : true})||{})._id;

	            $scope.document  = null;
	            $scope.documents = _.map(res.data, function(d) {

					createBackup(d);

	                return d;
	            });

	            if(selectedId)
	                (_.findWhere($scope.documents, {_id : selectedId})||{}).selected = true;

	            return res.data;

	        }).catch(function(error){

	            $scope.error = ((error||{}).data||{}).message || (error||{}).data || error;

	        }).finally(function(){

	            delete $scope.loading;
	        });
	    }

		//=================================================
	    //
	    //
	    //=================================================
		function createBackup(doc) {

			delete doc.$bak;
			doc.$bak = ng.fromJson(ng.toJson(doc));

			return doc;
		}

	    //=================================================
	    //
	    //
	    //=================================================
	    function upload(file) {

			var filenameRE  = /^([a-z0-9\-]+)-[a-z]{2}\.doc$/i;
			var filePattern = null;

			$q.when(file).then(function(file) {

				//sanitize

				$('input[type=file]').val(""); // clear input value;

				if(!file.name)
					throw "Filename inaccessible. Please use modern browser.";

				if(!filenameRE.test(file.name))
					throw "Filename is invalid. It must match aaa-bbb-ccc-xx.doc";

				filePattern = file.name.replace(filenameRE, "$1").toLowerCase();

				return filePattern;

			}).then(function(filePattern){

				// check if pattern already in use

				return $http.get('/api/v2015/insession-documents', { params : { q : { filePattern : filePattern } } });

			}).then(function(res){

				if(res.data.length) {

					var dbDoc         = res.data[0];
					var inThisSection = !!_.findWhere($scope.documents, { _id : dbDoc._id });

					if(!inThisSection)
						throw { message : "Another document already uses the same filename", document : dbDoc };
				}

			}).then(function() {

				// Create a temp file location to upload to

				var postData = {
					filename : file.name,
					metadata : {
						source  : 'in-session',
						meeting : $scope.meeting.code,
						section : $scope.section.code,
					}
				};

				return $http.post('/api/v2015/temporary-files', postData).then(function(res) {
					return res.data;
				});

			}).then(function(target) {

				// Upload file to a temp location

				return $http.put(target.url, file, { headers : { 'Content-Type' : target.contentType } }).then(function () {
					return target;
				});

	        }).then(function(){

	            delete $scope.info;
	            $scope.success = file.name + " " + Math.round(file.size/1024) + " kB uploaded successfully";

				var doc = _.findWhere($scope.documents, { filePattern : filePattern });

				if(doc)	$scope.select(doc);
				else    $scope.add(0, { filePattern : filePattern });

	        }).catch(function(error){

	            delete $scope.info;
	            delete $scope.success;

	            $scope.error = ((error||{}).data||{}).message || (error||{}).data || error;

	        }).finally(function(){

	            delete $scope.loading;
	        });
	    }

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.moveTo = function(doc, newIndex) {

	        var oldIndex = $scope.documents.indexOf(doc);

	        if(newIndex<0)                       newIndex = 0;
	        if(newIndex>$scope.documents.lenght) newIndex = $scope.documents.lenght;

	        $scope.documents.splice(oldIndex, 1);
	        $scope.documents.splice(newIndex, 0, doc);

	        doc.moved = true;
	    };

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.select = function(doc) {

	        if($scope.isEditing())
	            return;

	        _.each($scope.documents, function(d) {
	            d.selected = d==doc;
	        });
	    };

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.edit = function(d) {

	        if($scope.isEditing())
	            return;

	        $scope.select(d);

	        d.edit = true;
	    };

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.revert = function() {
	        loadDocuments();
	    };


	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.isEditing = function() {
	        return _($scope.documents).some(function(d) {
	            return d.edit || d.delete || d.moved;
	        });
	    };

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.add = function(position, options) {

	        if($scope.isEditing())
	            return;

	        $scope.select(null);

	        var doc = {
	            bak : {},
	            edit : true,
	            new : true,
	            selected : true,
	            path : $scope.meeting.baseUrl,
				meeting : $scope.meeting.code,
				section : $scope.section.code,
	        };

			_.extend(doc, options || {});

	        position = position || 0;

	        if(position<0) position = 0;
	        if(position>$scope.documents.length) position = $scope.documents.length;

	        $scope.documents.splice(position, 0, doc);
	    };

		var filePatternRE = /^[a-z0-9\-]*[a-z0-9]$/;

		//=================================================
	    //
	    //
	    //=================================================
	    $scope.validPattern = function(filePattern) {

			return filePatternRE.test(filePattern||'');
		};

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.delete = function(d) {

	        if($scope.isEditing())
	            return;

	        $scope.select(d);

	        d.edit   = false;
	        d.delete = true;
	    };

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.save = function(doc) {

	        var index  = _.indexOf($scope.documents, doc);
	        var Create = doc.new;
	        var Delete = doc.delete;
	        var Update = !!_.keys(getPatches(doc)).length;

			delete $scope.error;
	        delete doc   .error;
	        $scope.loading = true;

	        return $q.when(doc).then(function(doc){

	            if(Create) {

					if(!doc.title)        throw "'Title' not set";
					if(!doc.path)         throw "'Path' not set";
					if(!doc.filePattern)  throw "'filePattern' not set";

					doc.$bak = {};

					var newDoc = getPatches(doc);

					newDoc.position = index;
					newDoc.meeting  = $scope.meeting.code;
					newDoc.section  = $scope.section.code;

	                return $http.post('/api/v2015/insession-documents', newDoc).then(function(res) {

						doc._id = res.data.id;

						createBackup(doc);

						return doc;
					});

	            }

				if(Delete) {

	                return $http.delete('/api/v2015/insession-documents/'+doc._id).then(function() {
	                    return null;
	                });

	            }

				if(Update) {

					if(!doc.title)        throw "'Title' not set";
					if(!doc.path)         throw "'Path' not set";
					if(!doc.filePattern)  throw "'filePattern' not set";

					var patches = getPatches(doc);

	                return $http.patch('/api/v2015/insession-documents/'+doc._id, patches).then(function() {

						createBackup(doc);

						return doc;
					});
	            }

	            return doc;

	        }).then(function(doc) {

				if(!doc) {
					$scope.documents[index] = null;
					$scope.documents = _.compact($scope.documents);
				}

				return updatePositions();

	        }).then(function(){

	            return $q.when(loadDocuments());


	        }).catch(function(error){

				doc   .error = ((error||{}).data||{}).message || (error||{}).data || error;
	            $scope.error = ((error||{}).data||{}).message || (error||{}).data || error;

	        }).finally(function(){

	            delete $scope.loading;
	        });
	    };

		//=================================================
	    //
	    //
	    //=================================================
		function updatePositions() {

			$scope.documents.forEach(function(doc, index){
				doc.position = index;
			});

			var calls = _.map($scope.documents, function(doc) {

				var patches = getPatches(doc, ['position']);

				if(patches)
					return $http.patch('/api/v2015/insession-documents/'+doc._id, patches);
			});

			return $q.all(calls);
		}

		//=================================================
	    //
	    //
	    //=================================================
		function getPatches(doc, fields) {

			fields   = fields || ['item','symbol','title','superseded','info','warning','alert','path','filePattern'];

			var bakupDoc = doc.$bak || {};
			var patches  = {};

			fields.forEach(function(field){

				if(doc[field] !== bakupDoc[field])
					patches[field] = doc[field];
			});

			return _.isEmpty(patches) ? null : patches;
		}

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.isDirty = function(doc) {

	        var position = _.indexOf($scope.documents, doc);

	        return doc.delete || position != (doc.$bak||{}).position || !!_.keys(getPatches(doc)).length;
	    };

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.$watch("file", function(file) {

	        if(file)
	            upload(file);
	    });

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.$watch("meeting", function(value) {

	        if(value) {
	            $location.search("meeting", value.code);
	            loadSections();
	        }
	    });

	    //=================================================
	    //
	    //
	    //=================================================
	    $scope.$watch("section", function(value) {

	        if(value) {
	            $location.search("section", value.code);
	            loadDocuments();
	        }
	    });
	}];
});
