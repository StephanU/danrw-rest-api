var express = require('express'),
	app = express(),
	oaisHandler = require('./lib/oaisHandler');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// add api handler
app.post('/api/v1/ingest', oaisHandler.handleIngest);
app.get('/api/v1/ingest/status', oaisHandler.handleIngestStatus);

// start the server
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
