(function() {
	var javaScriptInlineReplacer = {
		comment: function(commentContents) {
			return ('/* ' + commentContents + ' */');
		}
	};

	module.exports = javaScriptInlineReplacer;
})();