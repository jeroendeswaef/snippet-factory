var _ = require('lodash/core');
var Sequelize = require('sequelize');
var Snippet = require('./public/app/snippet').Snippet;

var snippetTable;

var createSnippetFromDBAttrs = function(attrs) {
	return new Snippet(attrs.id, attrs.name, attrs.fileSelector, attrs.search, attrs.replace);
};

module.exports = {
	initialize: function() {
		var sequelize = new Sequelize('sqlite://snippets.db', { logging: function() {} });
		snippetTable = sequelize.define('snippet', {
		    name: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { notEmpty: true } },
		    fileSelector: { type: Sequelize.STRING, allowNull: false },
		    search: { type: Sequelize.STRING, allowNull: false },
		    replace: { type: Sequelize.STRING, allowNull: false }
		});
		return sequelize.sync();
	},

	/**
	 * @return Snippet[]
	 */
	getAll: function() {
		return new Promise(function(resolve, reject) {
			snippetTable.findAll({}).then(function(rows) {
				try {
					var snippets = [];
					rows.forEach(function(attrs) {
						var snippet = createSnippetFromDBAttrs(attrs);
						snippets.push(snippet);
					});
					resolve(snippets);
				}
				catch(err) {
					reject(err);
				}
			});
		});
	},

	/**
	 * @param id number 
	 * @return Snippet 
	 */
	get: function(id) {
		return new Promise(function(resolve, reject) {
			snippetTable.findById(id)
				.then(function(dbSnippet) {
					var snippet = createSnippetFromDBAttrs(dbSnippet);
					resolve(snippet);
				}).catch(function (err) {
					reject(err);
				});
		});
	},

	/**
	 * @param snippet Snippet
	 */
	save: function(snippet) {
		return new Promise(function(resolve, reject) {
			if (snippet.id) {
				snippetTable.findById(snippet.id)
					.then(function(dbSnippet) {
						dbSnippet = _.extend(dbSnippet, snippet);
						dbSnippet.save().then(function() {
							resolve(snippet);
						});
					})
					.catch(function (err) {
						reject(err);
					});
			} else {
				// No id yet -> creating a new snippet
				snippetTable.create(snippet).then(function(dbSnippet) {
					resolve(dbSnippet);
				}).catch(function (err) {
					reject(err);
				});
			}
		});
	},

	/**
	 * @param id number
	 */
	remove: function(id) {
		return new Promise(function(resolve, reject) {
			snippetTable.destroy({ where: { id: id }  })
		 		.then(function() {
					resolve(id);
				}).catch(function (err) {
					reject(err);
				});
		});
	}
};

