var express = require('express'),
	app = express(),
	oaisHandler = require('./lib/danrwOaisHandler');

// add api handler
app.post('/api/v1/ingest', oaisHandler.handleIngest);
app.get('/api/v1/ingest/status', oaisHandler.handleIngestStatus);
app.get('/api/v1/order', oaisHandler.handleOrder);

// start the server
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('DA-NRW API listening at http://%s:%s', host, port);
});
