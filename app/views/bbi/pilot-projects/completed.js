import links from '~/data/bbi/links.json'
import '~/directives/bbi/bbi-project-row'
import '~/directives/bbi/menu'

export { default as template } from './completed.html'

export default  ['$scope','$http','$filter', function ($scope, $http, $filter) {
	var _ctrl 	= this
	_ctrl.links	= links.links

	$scope.$root.page		= {}
	$scope.$root.page.title = 'Completed Projects: Bio Bridge Initiative'
  $scope.orderByCountry = orderByCountry

	getRounds()
		.then(getLatestRound)
		.then(query)
	
	function getLatestRound (res) {
		
		_ctrl.round = 1
		_ctrl.projects = res.data

		for (var i = 0; i < _ctrl.projects.length; i++) 
			if(_ctrl.projects[i].round > _ctrl.round) 
				_ctrl.round=_ctrl.projects[i].round 
			
		return _ctrl.round
	}

	function getRounds () {
		_ctrl.loading  = true
		var params     = { s:{ 'round':1 }, f:{ 'round':1 } }

		return   $http.get('/api/v2018/projects', { params : params })        
	}

	function query () {
		var params  =   {
							s:{ round:1 },
							f:{ round:1, title:1, description:1 , proponent:1, collaborators:1, country:1},
							q:{ round:{ $lt:_ctrl.round } }
						}

		return $http.get('/api/v2018/projects', { params : params })
					.then(mapRounds)
					.catch(function(error) {
						console.log('ERROR: ' + error);
					})
					.finally(function(){
						_ctrl.loading = false;
					})

	}

	function mapRounds(res) {
			
		_ctrl.projects = res.data
		_ctrl.count    = res.data.length
		_ctrl.rounds   = []

		for (var i = 0; i < _ctrl.projects.length; i++) {
			var project = _ctrl.projects[i]
			var round = project.round - 1
			if(!_ctrl.rounds[round])
				_ctrl.rounds[round]=[]
			_ctrl.rounds[round].push(project)
		}
  }
  
  function orderByCountry(project){
    return $filter('term')(project.country)
  }
}]