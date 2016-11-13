(function() {
	var xmlInlineReplacer = {
		comment: function(commentContents) {
			return ('<!-- ' + commentContents + ' -->');
		}
	};

	module.exports = xmlInlineReplacer;
})();