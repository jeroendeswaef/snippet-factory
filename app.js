var express = require('express');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var app = express();

app.use(bodyParser.json());  
app.use(express.static('public'));

var sequelize = new Sequelize('sqlite://snippets.db');

var SnippetRow = sequelize.define('snippet', {
    name: Sequelize.STRING,
    fileSelector: Sequelize.STRING,
    search: Sequelize.STRING,
    replace: Sequelize.STRING
});

/*app.get('/', function (req, res) {
  res.send('Hello World!');
});*/

app.post('/add-snippet', function(req, res) {
	console.log('Inside add-snippet', req.body);
	var ret = SnippetRow.create({
		name: req.body.name,
		fileSelector: req.body.fileSelector,
		search: req.body.search,
		replace: req.body.replace
	}).then(function(m){
  console.log(m.dataValues.id); // Prints the id of the newly created model
});
	//console.log(ret);
	res.json(req.body);
});

sequelize.sync().then(function() {
	app.listen(3000, function () {
		console.log('Example app listening on port 3000!');
	});
});
