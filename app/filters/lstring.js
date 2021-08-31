import app from '~/app'

app.filter("lstring", () => lstring);

export default function lstring(ltext, locale) {
	if(!ltext)
		return ltext;

	if(typeof ltext === 'string')
		return ltext;

	var sText;

	if(!sText && locale)
		sText = ltext[locale];

	if(!sText)
		sText = ltext.en;

	if(!sText) {
		for(var key in ltext) {
			sText = ltext[key];
			if(sText)
				break;
		}
	}

	return sText;	
}