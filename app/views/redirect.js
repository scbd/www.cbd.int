export { default as template } from './redirect.html'

export default ['$window', function($window) { 

    if($window.location.host.indexOf('www.cbd.int')>-1)
      return $window.location.reload()

    $window.location.replace('https://www.cbd.int'+$window.location.pathname)
}]