(function() {
	var javascriptInlineReplacer = require('./javascript-inline-replacer');
	var xmlInlineReplacer = require('./xml-inline-replacer');

	var inlineReplacerFactory = {
		getReplaceByFilename: function(filename) {
			if (filename.endsWith('.js')) {
				return javascriptInlineReplacer;
			} else if (filename.endsWith('.html')) {
				return xmlInlineReplacer;
			}
			return null;
		}
	};

	module.exports = inlineReplacerFactory;
})();