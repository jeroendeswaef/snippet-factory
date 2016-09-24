var _ = require('lodash/core');
var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var FileSystemModifier = require('./filesystem-modifier');

var app = express();

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
    version: '1.0.0',
    addHelp: true,
    description: 'Modifies files temporarily under the specified directory according to the rules specified in the ui'
});
parser.addArgument(
    [ '-d', '--directory' ],
    {
        help: 'The parent directory that contains all files you want to change',
        required: true
    }
);
var args = parser.parseArgs();
app.use(bodyParser.json());  
app.use('/static', express.static('public'));

var sequelize = new Sequelize('sqlite://snippets.db');
var modifier = new FileSystemModifier(args.directory);

var SnippetRow = sequelize.define('snippet', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { notEmpty: true } },
    fileSelector: { type: Sequelize.STRING, allowNull: false },
    search: { type: Sequelize.STRING, allowNull: false },
    replace: { type: Sequelize.STRING, allowNull: false }
});

app.post('/api/snippet', function(req, res) {
	var props = {
		name: req.body.name,
		fileSelector: req.body.fileSelector,
		search: req.body.search,
		replace: req.body.replace
	};
	if (req.body.id) {
		SnippetRow.findById(req.body.id)
			.then(function(snippet) {
				snippet = _.extend(snippet, props);
				snippet.save().then(function() {
					res.json(snippet);
				}).catch(function (err) {
					res.status(400).send(err);
				});
			}).catch(function (err) {
				res.status(400).send(err);
			});
	} else {
		SnippetRow.create(props).then(function(snippet) {
			res.json(snippet);
		}).catch(function (err) {
			res.status(400).send(err);
		});
	}
});

app.get('/api/snippets', function(req, res) {
	SnippetRow.findAll({})
		.then(function(snippets) {
			res.json(snippets);
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

app.delete('/api/snippet/:id', function(req, res) {
	SnippetRow.destroy({ where: { id: req.params.id }  })
 		.then(function(snippet) {
			res.json(snippet);
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

app.get('/api/snippet/:id', function(req, res) {
	SnippetRow.findById(req.params.id)
		.then(function(snippet) {
			res.json(snippet);
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

app.all('*', function(req, res) {
	res.sendFile('index.html', {root: './public'});
});

sequelize.sync().then(function() {
	modifier.start();
	app.listen(3000, function () {
		console.log('Listening on port 3000!');
	});
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});