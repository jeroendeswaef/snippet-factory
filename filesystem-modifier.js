var _ = require('lodash/core');
var filewalker = require('filewalker');
var path = require('path');
var Promise = require("bluebird");

var fs = require('fs');
var ignoreParser = require('gitignore-parser');

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

FilesystemModifier.prototype.applySnippetOnFile = function (snippet, filePath, replacements) {
  const self = this;

  var inlineReplacer = inlineReplacerFactory.getReplaceByFilename(filePath);
  if (inlineReplacer) {
    return new Promise(function (resolveReplacer, rejectReplacer) {
      const fullFilePath = path.join(self.basePath, filePath);
      replacements[fullFilePath] = (replacements[fullFilePath] || []);
      fs.readFile(fullFilePath, 'utf8', function (err, contents) {
        console.info('reading ' + fullFilePath, contents.length);
        if (err) {
          rejectReplacer(err);
        } else {
          if (snippet.modificationType === ModificationType[ModificationType.RegExp]) {
            var searchRe = new RegExp(snippet.search, 'g');
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
                snippet.replace.replace('||0||', original) +
                ' ' + inlineReplacer.comment('E_' + lastReplacementPos)*/
                replaceTarget(snippet.replace, inlineReplacer, original, lastReplacementPos, filePath)
              );
              replacements[fullFilePath].push(original);
              pos = searchRe.lastIndex;
            }
            newContents += contents.substring(pos, contents.length);
            fs.writeFile(fullFilePath, newContents, function (err) {
              if (err) {
                rejectReplacer(err);
              }
              else {
                resolveReplacer();
              }
            });
          } else if (snippet.modificationType === ModificationType[ModificationType.InsertAtStartOfFile]) {
            var lastReplacementPos = replacements[fullFilePath].length;
            var newContents = replaceTarget(snippet.insersion, inlineReplacer, '', lastReplacementPos, filePath) + contents;
            replacements[fullFilePath].push('');
            fs.writeFile(fullFilePath, newContents, function (err) {
              if (err) {
                rejectReplacer(err);
              }
              else {
                resolveReplacer();
              }
            });
          }
        }
      });
    });
  } else {
    console.warn('No replacer found for: ' + filePath);
  }
};

FilesystemModifier.prototype.start = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    let ignore;
    if (fs.existsSync(path.join(self.basePath, '.gitignore'))) {
      ignore = ignoreParser.compile(fs.readFileSync(path.join(self.basePath, '.gitignore'), 'utf8'));
    }
    replacements = {};
    let filesSeenCount = 0;
    const filePromises = [];
    snippetService.getAll()
      .then(function (snippets) {
        var snippetsById = _.reduce(snippets, function (acc, item) {
          item.fileRe = new RegExp(item.fileSelector);
          acc[item.id] = item;
          return acc;
        }, {});
        filewalker(self.basePath)
          .on('file', function (filePath) {
            if (!ignore || ignore.accepts(filePath)) {
              filesSeenCount++;
              const appliedSnippets = Object.keys(snippetsById)
                .filter((snippetId) => snippetsById[snippetId].fileRe.test(filePath));
              if (appliedSnippets.length > 0) {
                // Running the modifications for the same file sequentially
                filePromises.push(appliedSnippets.reduce(function (previous, snippetId) {
                  return previous.then(function () {
                    return self.applySnippetOnFile(snippetsById[snippetId], filePath, replacements);
                  });
                }, Promise.resolve()));
              }
            }
          })
          .on('error', reject)
          .on('done', () => {
            console.info(`Files seen: ${filesSeenCount}, # promises: ${filePromises.length}`);
            Promise.all(filePromises)
              .then(() => {
                resolve();
              })
              .catch((err) => {
                reject(err);
              });
          })
          .walk();
      }).catch(function (err) {
        reject(err);
      });
  });
};

FilesystemModifier.prototype.stop = function () {
  // We can't use Q.defer in this function, because it is being executed upon shutdown,
  // which doesn't return to the main event loop.
  return new Promise(function (resolve, reject) {
    var toProcess = Object.keys(replacements).length;
    if (toProcess === 0) resolve();
    console.info("Files to restore: ", toProcess);
    for (var replacement in replacements) {
      (function (filePath) {
        var inlineReplacer = inlineReplacerFactory.getReplaceByFilename(filePath);
        if (inlineReplacer) {
          fs.readFile(filePath, 'utf8', function (err, contents) {
            if (err) {
              reject(err);
            } else {
              for (var i = 0; i < replacements[filePath].length; i++) {
                var original = replacements[filePath][i];
                contents = contents.replace(new RegExp(escapeRegExp(inlineReplacer.comment('S_' + i)) + '.*' + escapeRegExp(inlineReplacer.comment('E_' + i)), 'g'), original);
              }
              fs.writeFile(filePath, contents, function (err) {
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
