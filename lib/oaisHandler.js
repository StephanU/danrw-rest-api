var fs = require('fs'),
	path = require('path'),
	request = require('request'),
	url = require('url'),
	querystring = require('querystring'),
	Busboy = require('busboy'),
  config = require('../config.json');

/*
 *
 */
function handleIngest(req, res) {
  var busboy = new Busboy({ headers: req.headers }),
    ingestArea = path.join(config.ingestArea, config.daweb.user);

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var saveTo = path.join(ingestArea, path.basename(filename));
    file.pipe(fs.createWriteStream(saveTo));
  });

  busboy.on('finish', function() {
    res.writeHead(200, { 'Connection': 'close' });
    res.end();
  });
  return req.pipe(busboy);
}

/*
 *
 */
function handleIngestStatus(req, res) {
  var danrwStatusSuffix = '/status/index',
    query = querystring.stringify(Object.keys(req.query).length === 0 ? {'listallobjects': true} : req.query),
    options = {
      uri: config.daweb.url + danrwStatusSuffix + '?' + query,
      auth: {
        user: config.daweb.user,
        pass: config.daweb.password
      },
      method: 'GET'
    };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.writeHead(response.statusCode, {
        'Content-Type': 'application/json'
      });
      res.write(body);
      res.end();
    } else {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 'Error': error }));
    }
  });
}

/*
 *
 */
function handleOrder(req, res) {
  dawebAuthenticate({
    success: function(cookie) {
      var danrwStatusSuffix = '/automatedRetrieval/queueForRetrievalJSON',
        options = {
          uri: config.daweb.url + danrwStatusSuffix,
          auth: {
            user: config.daweb.user,
            pass: config.daweb.password
          },
          method: 'POST',
          form: {
            'identifier': req.query.identifier
          },
          headers: {
            Cookie: cookie
          }
        };

      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          res.writeHead(response.statusCode, {
            'Content-Type': 'application/json'
          });
          res.write(body);
          res.end();
        } else {
          res.writeHead(response.statusCode, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify({ 'Error': error || 'Authorization failed'}));
        }
      });
    },
    error: function(e) {
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 'Error': e }));
    }
  });

}

/**
 *
 */
function dawebAuthenticate(callback) {
  var authenticationSuffix = '/contractor/authenticate',
    options = {
      uri: config.daweb.url + authenticationSuffix,
      method: 'POST',
      form: {
        login: config.daweb.user,
        password: config.daweb.password
      }
    };
    
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 302) {
      callback.success(response.headers['set-cookie']);
    } else {
      callback.error(error || 'Authorization failed');
    }
  });
}

exports.handleIngest = handleIngest;
exports.handleIngestStatus = handleIngestStatus;
exports.handleOrder = handleOrder;
