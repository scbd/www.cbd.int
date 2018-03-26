define(['app', 'lodash'], function(app, _) { 'use strict';

app.filter("initials", function() {
	return function(val) {

        if(val && val.name)     val = val.name;
        if(val && val.lastName) val = (val.firstName||'') + ' ' + (val.middleName||'') + ' ' + (val.lastName||'');
        
		if(typeof val === 'string')
			val = _.startCase(val).replace(/[^A-Z]/g, '');

		return val;
	};
});
});
