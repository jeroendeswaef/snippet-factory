var express = require('express');
var bodyParser = require('body-parser');

var Snippet = require('./public/app/snippet').Snippet;
var snippetService = require('./snippet-service');
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

var modifier = new FileSystemModifier(args.directory);

// Getting all snippets
app.get('/api/snippets', function(req, res) {
	snippetService.getAll()
		.then(function(snippets) {
			res.json(snippets);
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

// Getting one snippet by id
app.get('/api/snippet/:id', function(req, res) {
	snippetService.get(req.params.id)
		.then(function(snippet) {
			res.json(snippet);
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

// Saving a snippet (creating or editing)
app.post('/api/snippet', function(req, res) {
	var snippet = new Snippet(req.body.id, req.body.name, req.body.fileSelector, req.body.search, req.body.replace);
	snippetService.save(snippet)
		.then(function(snippet) {
			res.json(snippet);
		}).catch(function (err) {
			res.status(400).send(err);
		});
});

// Deleting a snippet
app.delete('/api/snippet/:id', function(req, res) {
	snippetService.remove(req.params.id)
 		.then(function(id) {
			res.json({ id: id });
		}).catch(function (err) {
			res.status(500).send(err);
		});
});

// Restoring the original values
app.post('/api/stop', function(req, res) {
	modifier.stop().then(function() {
		res.send("OK");
	}).catch(function (err) {
		res.status(500).send(err);
	});
});

// Re-applying the modifications
app.post('/api/start', function(req, res) {
	modifier.start().then(function() {
		res.send("OK");
	}).catch(function (err) {
		res.status(500).send(err);
	});
});

app.all('*', function(req, res) {
	res.sendFile('index.html', {root: './public'});
});

process.stdin.resume();//so the program will not close instantly

/**
 * Implementing a graceful shutdown method, so when you hit Ctrl-C,
 * all modifications are reverted.
 *
 * Because we can only execute synchronous stuff in this phase,
 * we need to 'wrap' our async 'modifier.stop' method, so it executes synchronously.
 */
function cleanup(){
    var ret;
    modifier.stop().then(function() {
  	    ret = true;
    }).catch(function(err) {
    	console.error(err);
    });
    while(ret === undefined) {
        require('deasync').runLoopOnce();
    }
    return ret;    
}

function exitHandler(options, err) {
    if (options.cleanup) {
		cleanup();
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

snippetService.initialize().then(function() {
	modifier.start().then(function() {
		app.listen(3000, function () {
			console.log('Started ui on http://localhost:3000/');
		});
	}).catch(function(err) {
		console.error("Unable to start modifier", err);
	});
});
