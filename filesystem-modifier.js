var _ = require('lodash/core');
var filewalker = require('filewalker');
var snippetService = require('./snippet-service');

function FilesystemModifier(path) {
	this.path = path;
}

FilesystemModifier.prototype.start = function(doneCallback, errorCallback) {
	var self = this;
	snippetService.getAll()
		.then(function(snippets) {
			var fileSelectorsRegexList = _.map(snippets, function(snippet) {
				return new RegExp(snippet.fileSelector);
			});
			filewalker(self.path)
				.on('file', function(path) {
					//if (path.indexOf('.js') > 0) console.info(".>", path);
					fileSelectorsRegexList.forEach(function(regExp) {
						if (regExp.test(path)) {
							console.info(path);
						}
						});
					})
				.on('error', errorCallback)
				.on('done', doneCallback)
				.walk();
		}).catch(function (err) {
			errorCallback(err);
		});
};

module.exports = FilesystemModifier;
