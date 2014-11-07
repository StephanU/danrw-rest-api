var Busboy = require('busboy'),
  danrw = require('./danrw'),
  basicAuth = require('basic-auth');

/*
 *
 */
function handleIngest(req, res) {
  var busboy = new Busboy({ headers: req.headers }),
    user = basicAuth(req);

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    danrw.copyToIngestArea({
      file: file,
      filename: filename,
      auth: user,
      success: function() {
        // nothing to do, the finish event of busboy will be called if the file was piped successfully
      },
      error: handleError(res)
    });
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
  var query = req.query,
    user = basicAuth(req);
  // TODO error when query parameter is missing

  danrw.getIngestStatus({
    query: query,
    auth: user,
    success: handleSuccess(res),
    error: handleError(res)
  });
}

/*
 *
 */
function handleOrder(req, res) {
  var identifier = req.query.identifier,
    user = basicAuth(req);
  // TODO error when query parameter is missing

  danrw.queueForRetrieval({
    identifier: identifier,
    auth: user,
    success: handleSuccess(res),
    error: handleError(res)
  });
}

/*
 *
 */
function handleOrderStatus(req, res) {
  var query = req.query,
    user = basicAuth(req);
  // TODO error when query parameter is missing

  danrw.getIngestStatus({
    query: query,
    auth: user,
    success: function(responseString) {
      var retrievalStatusCodeRegexp = /in progress waiting : \((9[0-9]{2})\)/,
        response = JSON.parse(responseString),
        result = [];

      // iterate all found packages and pick the one's having a retrieval status (9XX)
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
    error: handleError(res)
  });
}

/*
 *
 */
function handleDissemination(req, res) {
  var identifier = req.query.identifier,
    user = basicAuth(req);
  // TODO error when query parameter is missing

  danrw.getDip({
    identifier: identifier,
    auth: user,
    success: function(filePath) {
      res.download(filePath);
    },
    error: handleError(res)
  })
}

/*
 *
 */
function handleQuery(req, res) {
  var query = req.query,
    queryPath = req.params[0];
  // TODO error when query parameter is missing

  danrw.queryFedora({
    queryPath: queryPath,
    query: query,
    success: handleSuccess(res),
    error: handleError(res)
  })
}

/*
 *
 */
function handleSuccess(res) {
  return function(result) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.write(result);
    res.end();
  }
}

/*
 *
 */
function handleError(res) {
  return function(statusCode, error) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ 'Error': error }));
  };
}

exports.handleIngest = handleIngest;
exports.handleIngestStatus = handleIngestStatus;
exports.handleOrder = handleOrder;
exports.handleOrderStatus = handleOrderStatus;
exports.handleDissemination = handleDissemination;
exports.handleQuery = handleQuery;
