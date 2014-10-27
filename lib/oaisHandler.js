var fs = require('fs'),
	path = require('path'),
    config = require('../config.json');

exports.handleIngest = handleIngest;

function handleIngest(req, res) {
  var filename = path.basename(req.params.filename),
    dst = fs.createWriteStream(config.ingestArea + '/' + filename);

  req.pipe(dst);
  req.on('end', function() {
    res.sendStatus(200);
  }); 
}
