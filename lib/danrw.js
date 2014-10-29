var request = require('request'),
  fs = require('fs'),
  path = require('path'),
  config = require('../config.json');

/*
 *
 */
function copyToIngestArea(file, filename) {
  var ingestArea = path.join(config.ingestArea, config.daweb.user),
    saveTo = path.join(ingestArea, path.basename(filename));

  file.pipe(fs.createWriteStream(saveTo));
}

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
 *
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
 *
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

exports.queueForRetrieval = queueForRetrieval;
exports.getIngestStatus = getIngestStatus;
exports.copyToIngestArea = copyToIngestArea;
