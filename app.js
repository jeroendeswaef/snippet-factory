var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var app = express();

app.use(bodyParser.json());  
app.use(express.static('public'));

var sequelize = new Sequelize('sqlite://snippets.db');

var SnippetRow = sequelize.define('snippet', {
    name: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { notEmpty: true } },
    fileSelector: { type: Sequelize.STRING, allowNull: false },
    search: { type: Sequelize.STRING, allowNull: false },
    replace: { type: Sequelize.STRING, allowNull: false }
});

/*app.get('/', function (req, res) {
  res.send('Hello World!');
});*/

app.post('/add-snippet', function(req, res) {
	SnippetRow.create({
		name: req.body.name,
		fileSelector: req.body.fileSelector,
		search: req.body.search,
		replace: req.body.replace
	}).then(function(m){
  		console.log(m.dataValues.id); // Prints the id of the newly created model
		res.json(req.body);
	}).catch(function (err) {
		res.status(400).send(err);
	});
});

app.get('/snippets', function(req, res) {
	SnippetRow.findAll({})
		.then(function(snippets) {
			res.json(snippets);
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

sequelize.sync().then(function() {
	app.listen(3000, function () {
		console.log('Example app listening on port 3000!');
	});
});
