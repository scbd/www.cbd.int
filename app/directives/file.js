define(['app', 'text!./file.html'], function(app, fileDropTemplate) { 'use strict';

	app.directive('type', [function() {
	    return {
	        restrict: 'A',
	        replace: true,
	        require: '?ngModel', 
	        link: function($scope, element, attr, ctrl) {

                if(element.prop("tagName")!=="INPUT") return;
                if(attr.type              !=="file")  return;

                if(!ctrl) return;
                
	            element.on('change', function() {
                    
                    var value = element[0].files;

	                $scope.$apply(function() {
                        
	                    if(!isMutiple())
                            value = value[0];
                        
                        ctrl.$setViewValue(value);
	                });

                    if($scope.$eval(attr.autoReset)) {
                        $scope.$applyAsync(function() { element.val(''); });
                    }

	            });
                
                $scope.$on('$destroy', function(){
                    element.off('change');
                });                
                
                function isMutiple() { 
                    return element.attr('multiple')!==undefined; 
                }
	        }
	    };
	}]);

	app.directive('fileDrop', [function() {
	    return {
	        restrict: 'E',
	        replace: true,
	        require: 'ngModel', 
            template: fileDropTemplate,
            scope: {
                autoReset: '<autoReset',
                caption: '@caption'
            },
	        link: function($scope, form, attr, ngModelCtrl) {
                
                var inputFile = form.find('input:file');
                
                if(attr.multiple!==undefined) inputFile.attr('multiple', '');
                if(attr.accept  !==undefined) inputFile.attr('accept',   attr.accept);
                
                $scope.isMutiple  = isMutiple;
                $scope.isDisabled = isDisabled;
                $scope.onFile     = ngModelCtrl.$setViewValue.bind(ngModelCtrl);
                
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
                    
                    var value = e.originalEvent.dataTransfer.files;
                    
                    $scope.$apply(function() { 
                        
                        if(!isMutiple()) 
                            value = value[0];

                        $scope.onFile(value);
                    });
                }
	        }
	    };
	}]);
    
});
