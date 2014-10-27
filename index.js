var express = require('express'),
	app = express(),
	oaisHandler = require('./lib/oaisHandler');

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/api/v1/ingest', oaisHandler.handleIngest);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
