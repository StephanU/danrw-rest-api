var express = require('express'),
  app = express(),
  oaisHandler = require('./lib/danrwOaisHandler'),
  basicAuth = require('basic-auth');


// add basic authentication handler
app.use(function (req, res, next) {
  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    res.writeHead(401);
    res.end();
  } else {
    // for now, the authentication is done by the specific danrw urls
    // Note: for the ingest and dissemination api pathes only the existence of the user folder is checked,
    // no authentication is done for these two urls
    next();
  };
})

// add api handler
app.post('/api/v1/ingest', oaisHandler.handleIngest);
app.get('/api/v1/ingest/status', oaisHandler.handleIngestStatus);
app.get('/api/v1/order', oaisHandler.handleOrder);
app.get('/api/v1/order/status', oaisHandler.handleOrderStatus);
app.get('/api/v1/disseminate', oaisHandler.handleDissemination);
app.get('/api/v1/query*', oaisHandler.handleQuery);

// start the server
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('DA-NRW API listening at http://%s:%s', host, port);
});
