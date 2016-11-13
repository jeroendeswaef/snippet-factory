var express = require('express');
var bodyParser = require('body-parser');

var server = require('http').createServer();
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ server: server });

var Snippet = require('./public/app/snippet').Snippet;
var ServerStatus = require('./public/app/server-status').ServerStatus;
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
var port = 3000;
var args = parser.parseArgs();
app.use(bodyParser.json());  
app.use('/static', express.static('public'));

var wsConnections = [];
var currentServerStatus = ServerStatus.Running;

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
	var snippet = new Snippet(req.body.id, req.body.name, req.body.fileSelector, req.body.modificationType, req.body.search, req.body.replace, req.body.insersion);
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
app.post('/api/pause', function(req, res) {
	modifier.stop().then(function() {
		res.send("OK");
		currentServerStatus = ServerStatus.Paused;
		broadcastServerStatus();
	}).catch(function (err) {
		res.status(500).send(err);
	});
});

// Re-applying the modifications
app.post('/api/start', function(req, res) {
	modifier.start().then(function() {
		res.send("OK");
		currentServerStatus = ServerStatus.Running;
		broadcastServerStatus();
	}).catch(function (err) {
		res.status(500).send(err);
	});
});

app.all('/api/*', function(req, res) {
	res.status(500).send("Route not found");
});

app.all('*', function(req, res) {
	res.sendFile('index.html', {root: './public'});
});

process.stdin.resume();//so the program will not close instantly


function broadcastServerStatus() {
	for(var i = 0; i < wsConnections.length; i++) {
    	// Could have been set to null if client closed
    	if (wsConnections[i] !== null) {
	    	wsConnections[i].send(ServerStatus[currentServerStatus]);
	    }
	}
}

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
  	    for(var i = 0; i < wsConnections.length; i++) {
  	    	// Could have been set to null if client closed
  	    	if (wsConnections[i] !== null) {
	  	    	wsConnections[i].send(ServerStatus[ServerStatus.Stopped]);
	  	    	wsConnections[i].close(1000);
	  	    	// Unfortunately, the callback on the close-method is not working
	  	    	// So we have to do it with setTimeout.
	  	    }
  	    }
  	    setTimeout(function() {
  	    	ret = true;
  	    }, 1000);
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
	var startUi = function() {
		server.on('request', app);
		server.listen(port, null, null, function () {
			console.log('Started ui on http://localhost:' + port + '/');
		});
	};
	modifier.start().then(function() {
		startUi();
	}).catch(function(err) {
		console.error("Unable to start modifier", err);
		startUi();
	});
	var connectionCount = 0;
	wss.on('connection', function connection(ws) {

		ws.on('close', function() {
		  	wsConnections[this.mId] = null;
		});

		ws.send(ServerStatus[currentServerStatus]);
		ws.mId = connectionCount;
		connectionCount++;
		wsConnections.push(ws);
	});

});
