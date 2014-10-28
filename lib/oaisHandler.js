var fs = require('fs'),
	path = require('path'),
	http = require('http'),
	url = require('url'),
	querystring = require('querystring'),
	Busboy = require('busboy'),
  config = require('../config.json');

/*
 *
 */
function handleIngest(req, res) {
  var busboy = new Busboy({ headers: req.headers }),
    ingestArea = path.join(config.ingestArea, user);

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
    query = querystring.stringify(req.query),
    parsedUrl = url.parse(config.daweb.url),
    options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path + danrwStatusSuffix + '?' + query,
      auth: config.daweb.user + ':' + config.daweb.password,
      method: 'GET'
    };

  http.request(options, function(response) {
    res.writeHead(response.statusCode, {
      'Content-Type': 'application/json'
    });
    response.on("data", function(chunk) {
        res.write(chunk);
    });
    response.on("end", function() {
        res.end();
    });
  }).on('error', function(e) {
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ 'Error': e }));
  }).end();
}

exports.handleIngest = handleIngest;
exports.handleIngestStatus = handleIngestStatus;
