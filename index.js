var express = require('express'),
  app = express(),
  oaisHandler = require('./lib/danrwOaisHandler'),
  basicAuth = require('basic-auth');


// add basic authentication handler
app.use(function (req, res, next) {
  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    if ('OPTIONS' !== req.method) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="DA-NRW needs authentication"'
      });
      res.end();  
    } else {
      next();
    }
  } else {
    // for now, the authentication is done by the specific danrw urls
    // Note: for the ingest and dissemination api pathes only the existence of the user folder is checked,
    // no authentication is done for these two urls
    next();
  }
});

// allow CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length');

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.sendStatus(200);
    res.end();
  }
  else {
    next();
  }
});

// add api handler
app.post('/api/v1/ingest', oaisHandler.handleIngest);
app.get('/api/v1/ingest/:id', oaisHandler.handleIngestStatus);
app.get('/api/v1/archive', oaisHandler.handleArchive);
app.post('/api/v1/order/:id', oaisHandler.handleOrder);
app.get('/api/v1/order/:id', oaisHandler.handleOrderStatus);
app.get('/api/v1/disseminate', oaisHandler.handleDisseminationList);
app.get('/api/v1/disseminate/:id', oaisHandler.handleDissemination);
app.get('/api/v1/query*', oaisHandler.handleQuery);

// start the server
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('DA-NRW API listening at http://%s:%s', host, port);
});
