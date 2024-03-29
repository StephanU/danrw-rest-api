var request = require('request'),
  fs = require('fs'),
  path = require('path'),
  config = require('../config.json'),
  querystring = require('querystring');

/*
 * Copies the given file with the given filename to the users ingest area.
 */
function copyToIngestArea(params) {
  var filePath = path.join(config.ingestArea, params.auth.name);

  fs.exists(filePath, function (exists) {
    if (exists) {
      params.file.pipe(fs.createWriteStream(path.join(filePath, path.basename(params.filename))));
      params.success();
    } else {
      params.error(401, "Unauthorized");
    }
  });

}

/*
 * Returns the ingest status of the package identified by <code>params.query.identifier</code>. If the identifier is not given it returns all ingested packages.
 */
function getIngestStatus(params) {
  var danrwStatusSuffix = '/status/index',
    options = {
      uri: config.daweb.url + danrwStatusSuffix,
      qs: Object.keys(params.query).length === 0 ? {'listallobjects': true} : params.query,
      auth: {
        user: params.auth.name,
        pass: params.auth.pass
      },
      method: 'GET'
    };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      params.success(body);
    } else {
      params.error(response.statusCode, error || body);
    }
  });
}

/**
 * Puts the package identified by <code>params.query.identifier</code> to the working queue to prepare its retrieval.
 */
function queueForRetrieval(params) {
  dawebAuthenticate({
    auth: params.auth,
    success: function(cookie) {
      var danrwStatusSuffix = '/automatedRetrieval/queueForRetrievalJSON',
        options = {
          uri: config.daweb.url + danrwStatusSuffix,
          auth: {
            user: params.auth.name,
            pass: params.auth.pass
          },
          method: 'POST',
          body: JSON.stringify({
            "urn": params.query.urn,
            "identifier": params.query.identifier
          }),
          headers: {
            Cookie: cookie
          }
        };

      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          params.success(body);
        } else {
          params.error(response.statusCode, error || 'Authorization failed');
        }
      });
    },
    error: function(e) {
      params.error(401, error || 'Authorization failed');
    }
  });
}

/**
 * Performs a daweb authentication and returns the resulting authorization cookie to the success handler.
 */
function dawebAuthenticate(params) {
  var authenticationSuffix = '/contractor/authenticate',
    options = {
      uri: config.daweb.url + authenticationSuffix,
      method: 'POST',
      form: {
        login: params.auth.name,
        password: params.auth.pass
      }
    };
    
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 302) {
      params.success(response.headers['set-cookie']);
    } else {
      params.error(error);
    }
  });
}

/**
 * Returns the dissemination package identifed by <code>params.identifier</code>.
 */
function getDip(params) {
  var userArea = path.join(config.userArea, params.auth.name);

  fs.exists(userArea, function (exists) {
    if (exists) {
      var filePath = path.join(userArea, 'outgoing', params.identifier + '.tar');

      fs.exists(filePath, function (exists) {
        if (exists) {
          params.success(filePath);
        } else {
          params.error(404, "File not found");
        }
      });
    } else {
      params.error(401, "Unauthorized");
    }
  });
}

/**
 * Returns the list of packages which are ready for dissemination.
 */
function getDipList(params) {
  var userArea = path.join(config.userArea, params.auth.name);

  fs.exists(userArea, function (exists) {
    if (exists) {
      var filePath = path.join(userArea, 'outgoing');

      fs.exists(filePath, function (exists) {
        if (exists) {
          fs.readdir(filePath, function(err, files) {
            if (err) {
              params.error(500, err);
            } else {
              var result = [];
              for (var i = 0; i < files.length; ++i) {
                var file = files[i],
                  suffixIndex = file.length - 4;
                if (file.indexOf('.tar') === suffixIndex) {
                  result.push({
                    'fileName': files[i]
                  })
                }
              }
              params.success(JSON.stringify(result));
            }
          });
        } else {
          params.error(404, "File not found");
        }
      });
    } else {
      params.error(401, "Unauthorized");
    }
  });
}

/**
 * Queries Fedora using the given query parameters.
 */
function queryFedora(params) {
  var options = {
    uri: config.fedora.url + params.queryPath,
    qs: params.query,
    useQuerystring: true,
    auth: {
      user: params.auth.name,
      pass: params.auth.pass
    },
    method: 'GET'
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      params.success(body);
    } else {
      params.error(response.statusCode, error || body);
    }
  });
}

exports.queueForRetrieval = queueForRetrieval;
exports.getIngestStatus = getIngestStatus;
exports.copyToIngestArea = copyToIngestArea;
exports.getDip = getDip;
exports.getDipList = getDipList;
exports.queryFedora = queryFedora;
