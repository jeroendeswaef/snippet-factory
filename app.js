var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());  
app.use(express.static('public'));

/*app.get('/', function (req, res) {
  res.send('Hello World!');
});*/

app.post('/add-snippet', function(req, res) {
	console.log('Inside add-snippet', req.body);
	res.json(req.body);
});

app.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
