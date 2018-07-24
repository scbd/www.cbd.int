define(['app', 'angular', 'text!./file.html'], function(app, ng, fileDropTemplate) { 'use strict';

	app.directive('type', ['$http', function($http) {
	    return {
	        restrict: 'A',
	        replace: true,
            require: '?ngModel', 
            scope: {
                onUpload : "&onUpload"
            },
	        link: function($scope, element, attr, ctrl) {

                if(element.prop("tagName")!=="INPUT") return;
                if(attr.type              !=="file")  return;

                if(!ctrl) return;

                $scope.$on('$destroy', function(){
                    element.off('change');
                });                
                
	            element.on('change', function() {

                    var htmlFiles = element[0].files;

                    if(isAutoUpload())
                    {
                        var files = [];

                        for(var i=0; i<htmlFiles.length; ++i) {

                            var formData = new FormData();
                            var htmlFile = htmlFiles[i];

                            formData.append("file", htmlFile);

                            var qs = {};

                            if(attr.encrypt!==undefined)
                                qs.encrypt = "true";

                            $http.post('/api/v2015/temporary-files', formData, {
                                params: qs,
                                transformRequest: ng.identity,
                                headers: {'Content-Type': undefined}

                            }).then(function(res){

                                files = files.concat([res.data]);

                                setViewValue(files);

                                onUpload(htmlFile, res.data, null);

                                return res.data;

                            }).catch(function(err){

                                err = err.data || err;

                                files = files.concat([{ error: err }]);

                                setViewValue(files);

                                onUpload(htmlFile, null, err);

                                res.data;
                            });
                        }
                    }
                    else {
                        setViewValue(htmlFiles);
                    }

                    if(isAutoReset())
                        reset();
                });

                function isMutiple() { 
                    return element.attr('multiple')!==undefined; 
                }
                
                function isAutoUpload() { 
                    return attr.onUpload!==undefined; 
                }  
                
                function onUpload(htmlFile, file, err) { 

                    return $scope.onUpload({
                        htmlFile: htmlFile,
                        file:     file, 
                        error:    err
                    }); 
                }   

                function isAutoReset() { 
                    return $scope.$eval(attr.autoReset) || isAutoUpload(); 
                }       

                function reset() { 
                    $scope.$applyAsync(function() { element.val(''); });
                } 
                
                function setViewValue(files){
                    ctrl.$setViewValue(isMutiple() ? files : files[0]);
                }
	        }
	    };
	}]);

	app.directive('fileDrop', ['$compile',  function($compile) {
	    return {
	        restrict: 'E',
	        replace: true,
            template: fileDropTemplate,
            require: 'ngModel', 
            scope: {
                autoReset: '<autoReset',
                caption: '@caption',
                onUpload : "&onUpload",
                danger : "=?"
            },
	        link: function($scope, form, attr, ngModelCtrl) {
                
                var inputFile = ng.element('<span><input class="hidden" ng-disabled="isDisabled()" type="file" auto-reset="autoReset" ng-model="files" ng-change="proxyOnChange()" data-multiple-caption="{count} files selected" /><span>').find('input:file');

                if(attr.multiple!==undefined) inputFile.attr('multiple', '');
                if(attr.accept  !==undefined) inputFile.attr('accept',   attr.accept);
                if(attr.encrypt !==undefined) inputFile.attr('encrypt',   "");
                if(attr.onUpload!==undefined) inputFile.attr('on-upload', "proxyOnUpload({ htmlFile: htmlFile, file: file, error: error})");
                
                inputFile = $compile(inputFile.parent().html())($scope);

                form.find('label').append(inputFile);

                //////////////////////

                $scope.isMutiple  = isMutiple;
                $scope.isDisabled = isDisabled;
                $scope.proxyOnUpload = $scope.onUpload;
                $scope.proxyOnChange = function() { ngModelCtrl.$setViewValue($scope.files); };
                
                var div = document.createElement('div');
                
                $scope.allowDragDrop = (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;

                if ($scope.allowDragDrop) {

        			form.on('drop',                   onFileDrop);
                    form.on('dragover dragenter',     function( ) { $scope.$apply(function() { $scope.dragOver = true;  }); });
        			form.on('dragleave dragend drop', function( ) { $scope.$apply(function() { $scope.dragOver = false; }); });
        		    form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
                        e.preventDefault(); // preventing the unwanted behaviours
                        e.stopPropagation();
                    });
                    
                    $scope.$on('$destroy', function(){
                        form.off('drag dragstart dragend dragover dragenter dragleave drop');
                    });
                }
                
                function isMutiple() {
                    return inputFile.attr('multiple')!==undefined;
                }
                
                function isDisabled() {
                    return form.attr('disabled')!==undefined;
                }
                
                function onFileDrop(e) {

                    e.preventDefault();

                    inputFile[0].files = e.originalEvent.dataTransfer.files;
                }
	        }
	    };
	}]);
    
});
