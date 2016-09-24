var _ = require('lodash/core');
var filewalker = require('filewalker');
var path = require('path');

var fs = require('fs');
var snippetService = require('./snippet-service');

function FilesystemModifier(path) {
	this.basePath = path;
}

FilesystemModifier.prototype.start = function(doneCallback, errorCallback) {
	var self = this;
	snippetService.getAll()
		.then(function(snippets) {
			var snippetsById = _.reduce(snippets, function(acc, item) {
				item.fileRe = new RegExp(item.fileSelector);
				acc[item.id] = item;
				return acc;
			}, {});
			filewalker(self.basePath)
				.on('file', function(filePath) {
					Object.keys(snippetsById).forEach(function(id) {
						var item = snippetsById[id];
						if (item.fileRe.test(filePath)) {
							var fullFilePath = path.join(self.basePath, filePath);
							fs.readFile(fullFilePath, 'utf8', function(err, contents) {
								if (err) errorCallback(err);
								else {
									var searchRe = new RegExp(item.search, 'g');
									var match;
									var newContents = "";
									var pos = 0;
									while ((match = searchRe.exec(contents)) !== null) {
									    //console.info(filePath + ", match found at " + match.index, searchRe.lastIndex, contents.substring(match.index, searchRe.lastIndex));
										newContents += (contents.substring(pos, match.index) + item.replace.replace('||0||', contents.substring(match.index, searchRe.lastIndex)));
										pos = searchRe.lastIndex;
									}
									newContents += contents.substring(pos, contents.length);
									fs.writeFile(fullFilePath, newContents, function(err) {
							    		if (err) errorCallback(err);
							    	});
								}
							});
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
