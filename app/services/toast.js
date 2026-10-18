import angular from 'angular';

export const showInfo    = message => toast('showInfo',    message);
export const showWarning = message => toast('showWarning', message);
export const showSuccess = message => toast('showSuccess', message);
export const showError   = message => toast('showError',   message);

// Toasts are rendered by angular-toastr, wired to these $rootScope events in template.js
function toast(event, message) {
  const $rootScope = angular.element(document.documentElement).injector()?.get('$rootScope');

  if($rootScope) $rootScope.$applyAsync(() => $rootScope.$emit(event, message));
  else           alert(message);
}
