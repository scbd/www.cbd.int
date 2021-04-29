import app      from '~/app'                         ;
import template from './time-zone-feature-alert.html';

export default app.directive('timeZoneFeatureAlert', [ '$timeout', main ])

function main ($timeout){
  return { restrict : "E", replace: true, scope: {}, template, link }

  function link ($scope) {
    $scope.show = !localStorage.getItem('hideTimeZoneFeatureAlert')
    $scope.hide = hide
  }
  
  function hide(){
    const element = document.getElementById('time-zone-feature-alert');

    $(element).removeClass('show')

    $(element).remove()

    localStorage.setItem('hideTimeZoneFeatureAlert', true)
  }

}

