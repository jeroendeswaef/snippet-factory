var _ = require('lodash/core');
var filewalker = require('filewalker');
var path = require('path');

var fs = require('fs');
var snippetService = require('./snippet-service');
var ModificationType = require('./public/app/modification-type').ModificationType;

var inlineReplacerFactory = require('./inline-replacer-factory');

var replacements = {};

function FilesystemModifier(path) {
	this.basePath = path;
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function replaceTarget(targetStr, inlineReplacer, original, count, filename) {
	return inlineReplacer.comment('S_' + count) + ' ' +
		(targetStr
			.replace('||0||', original)
			.replace('||F||', filename))
		+ ' ' + inlineReplacer.comment('E_' + count);
}

FilesystemModifier.prototype.start = function() {
	var self = this;
	return new Promise(function(resolve, reject) {
		replacements = {};
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
								var inlineReplacer = inlineReplacerFactory.getReplaceByFilename(filePath);
								if (inlineReplacer) {
									var fullFilePath = path.join(self.basePath, filePath);
									replacements[fullFilePath] = [];
									fs.readFile(fullFilePath, 'utf8', function(err, contents) {
										if (err) reject(err);
										else {
											if (item.modificationType === ModificationType[ModificationType.RegExp]) {
												var searchRe = new RegExp(item.search, 'g');
												var match;
												var newContents = "";
												var pos = 0;
												while ((match = searchRe.exec(contents)) !== null) {
													var lastReplacementPos = replacements[fullFilePath].length;
												    //console.info(filePath + ", match found at " + match.index, searchRe.lastIndex, contents.substring(match.index, searchRe.lastIndex));
													var original = contents.substring(match.index, searchRe.lastIndex);
													newContents += (
														contents.substring(pos, match.index) +
														/*inlineReplacer.comment('S_' + lastReplacementPos) + ' ' +
														item.replace.replace('||0||', original) +
														' ' + inlineReplacer.comment('E_' + lastReplacementPos)*/
														replaceTarget(item.replace, inlineReplacer, original, lastReplacementPos, filePath)
													);
													replacements[fullFilePath].push(original);
													pos = searchRe.lastIndex;
												}
												newContents += contents.substring(pos, contents.length);
												fs.writeFile(fullFilePath, newContents, function(err) {
										    		if (err) reject(err);
										    	});
											} else if (item.modificationType === ModificationType[ModificationType.InsertAtStartOfFile]) {
												var newContents = replaceTarget(item.insersion, inlineReplacer, '', 0, filePath) + contents;
												replacements[fullFilePath].push('');
												fs.writeFile(fullFilePath, newContents, function(err) {
										    		if (err) reject(err);
										    	});
											}
										}
									});
								} else {
									console.warn('No replacer found for: ' + filePath);
								}
							}
							});
						})
					.on('error', reject)
					.on('done', resolve)
					.walk();
			}).catch(function (err) {
				reject(err);
			});
		});
};

FilesystemModifier.prototype.stop = function() {
	// We can't use Q.defer in this function, because it is being executed upon shutdown,
	// which doesn't return to the main event loop.
	return new Promise(function(resolve, reject) {
		var toProcess =  Object.keys(replacements).length;
		if (toProcess === 0) resolve();
		console.info("Files to restore: ", toProcess);
		for (var replacement in replacements) {
			(function(filePath) {
				var inlineReplacer = inlineReplacerFactory.getReplaceByFilename(filePath);
				if (inlineReplacer) {
					fs.readFile(filePath, 'utf8', function(err, contents) {
						if (err) {
							reject(err);
						} else {
							for(var i = 0; i < replacements[filePath].length; i++) {
								var original = replacements[filePath][i];
								contents = contents.replace(new RegExp(escapeRegExp(inlineReplacer.comment('S_' + i)) + '.*' + escapeRegExp(inlineReplacer.comment('E_' + i)), 'g'), original);
							}
							fs.writeFile(filePath, contents, function(err) {
					    		if (err) {
					    			reject(err);
					    		}
					    		else {
					    			toProcess--;
					    			console.info("Restoring ", filePath);
					    			if (toProcess === 0) {
					    				replacements = {};
					    				resolve();
					    			}
					    		}
					    	});
						}
					});
				} else {
					console.error('No replacer found to restore: ' + filePath);
				}
			}(replacement));
		}
	});
};

module.exports = FilesystemModifier;
