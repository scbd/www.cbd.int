define(['lodash', 'app'], function(_) {

	return ['user', function(user) {
        
        var _ctrl = this;
        
        _ctrl.isAuthenticated = user.isAuthenticated;
        _ctrl.isKronosUser    = user.institution=='CBD' && !!_.intersection(user.roles, ['Kronos-FullAccess' /*'Kronos-User', 'Kronos-ReadOnly', 'Kronos-Meeting-Nominator', 'Kronos-PriorityPassOnly'*/]).length;
    }];
});