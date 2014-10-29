var Busboy = require('busboy'),
  danrw = require('./danrw');

/*
 *
 */
function handleIngest(req, res) {
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    danrw.copyToIngestArea(file, filename);
  });

  busboy.on('finish', function() {
    res.writeHead(200, { 'Connection': 'close' });
    res.end(JSON.stringify({
      'success': true,
      'msg': 'Ingest successful'
    }));
  });
  return req.pipe(busboy);
}

/*
 *
 */
function handleIngestStatus(req, res) {
  // TODO error when query parameter is missing

  danrw.getIngestStatus({
    query: req.query,
    success: function(result) {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.write(result);
      res.end();
    },
    error: function(statusCode, error) {
      res.writeHead(statusCode, {
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
  var identifier = req.query.identifier;

  // TODO error when query parameter is missing

  danrw.queueForRetrieval({
    identifier: identifier,
    success: function(result) {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      });
      res.write(result);
      res.end();
    },
    error: function(statusCode, error) {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 'Error': error }));
    }
  });
}

/*
 *
 */
function handleOrderStatus(req, res) {
  // TODO error when query parameter is missing

  danrw.getIngestStatus({
    query: req.query,
    success: function(responseString) {
      var retrievalStatusCodeRegexp = /in progress waiting : \((9[0-9]{2})\)/,
        response = JSON.parse(responseString),
        result = [];

      // iterate all found packages and pick the one's having an retrieval status (9XX)
      for (var i = 0; i < response.result.length; ++i) {
        var retrievelStatus = response.result[i];

        if (Object.keys(retrievelStatus).length > 0) {
          var matching = retrievelStatus.status.match(retrievalStatusCodeRegexp);

          if (matching !== null) {
            // add retrieval status code
            retrievelStatus.statusCode = matching[1];
            result.push(retrievelStatus);
          }
        }
      }

      if (result.length > 0) {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.write(JSON.stringify(result));
      } else {
        res.writeHead(404);
      }

      res.end();
    },
    error: function(statusCode, error) {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({ 'Error': error }));
    }
  });
}

exports.handleIngest = handleIngest;
exports.handleIngestStatus = handleIngestStatus;
exports.handleOrder = handleOrder;
exports.handleOrderStatus = handleOrderStatus;
