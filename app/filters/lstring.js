import app from '~/app'
import lstring from '../services/lstring.js';

app.filter("lstring", ['locale', function(appLocale) {
	return function(ltext, locale) {
		return lstring(ltext, locale || appLocale)
	};
}]);

export default lstring;