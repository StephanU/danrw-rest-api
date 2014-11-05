var request = require('request'),
  fs = require('fs'),
  path = require('path'),
  config = require('../config.json');

/*
 * Copies the given file with the given filename to the users ingest area.
 */
function copyToIngestArea(file, filename) {
  var filePath = path.join(config.ingestArea, config.daweb.user, path.basename(filename));

  file.pipe(fs.createWriteStream(filePath));
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
        user: config.daweb.user,
        pass: config.daweb.password
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
            'identifier': params.identifier
          },
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
        login: config.daweb.user,
        password: config.daweb.password
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
 * Returns the dissemination package identifed by <code>params.query.identifier</code>.
 */
function getDip(params) {
  var filePath = path.join(config.userArea, config.daweb.user, 'outgoing', params.identifier + '.tgz');
  // TODO error handling if file does not exist
  fs.exists(filePath, function (exists) {
    if (exists) {
      params.success(filePath);
    } else {
      params.error(404, "File not found");
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
exports.queryFedora = queryFedora;
