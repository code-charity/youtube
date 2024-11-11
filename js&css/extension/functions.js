/*--------------------------------------------------------------
>>> FUNCTIONS:
/*--------------------------------------------------------------
# GET URL PARAMETER
--------------------------------------------------------------*/
extension.functions.getUrlParameter = (url, parameter) => {
	let match = url.match(new RegExp('(\\?|\\&)' + parameter + '=[^&]+'));
	if (match) { return match[0].substr(3); }
};