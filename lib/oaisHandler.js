var fs = require('fs'),
	path = require('path'),
	Busboy = require('busboy'),
  config = require('../config.json');

//TODO user handling
var user = "TEST";

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

exports.handleIngest = handleIngest;
