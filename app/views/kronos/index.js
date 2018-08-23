define(['lodash', 'app'], function(_) {

	return ['user', function(user) {
        
        var _ctrl = this;

        _ctrl.isAuthenticated = user.isAuthenticated;
        _ctrl.isKronosUser    = !!_.intersection(user.roles, ['Kronos-FullAccess', 'Kronos-ReadOnly', 'Kronos-Meeting-Nominator', 'Kronos-PriorityPassOnly', 'Kronos-User']).length;
        
    }];
});
