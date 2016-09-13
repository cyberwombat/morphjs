'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _boom = require('boom');

var _boom2 = _interopRequireDefault(_boom);

var _lodash = require('lodash');

var _mask = require('./mask');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SuperPromise = _bluebird2.default.getNewLibraryCopy();

// Promise.onPossiblyUnhandledRejection(function(error){
//     throw error
// })
SuperPromise.prototype.filter = function (fn) {
  return this.then(function (docs) {
    return fn(docs);
  });
};
SuperPromise.prototype.restify = function (schema) {
  return this.then(function (res) {

    if (!res) throw _boom2.default.notFound();

    var docs,
        count = true;

    // Updates/deletes -
    if ((0, _lodash.isArray)(res) && res.length > 1) {

      // Updates and deletes return count and object 2nd with info
      if ((0, _lodash.isNumeric)(res[0])) {
        count = res[0];
      }
      // Saves - return object and count last
      else if ((0, _lodash.isNumeric)(res[1])) {
          count = res[1];
          docs = res[0];
        }
        // Array of docs
        else {
            docs = res;
          }

      // if (!count) throw Boom.notFound()
    }
    // Single updates/inserts
    else if (res.result) {
        if (res.result.nModified) return { success: true };
        // result: { ok: 1, nModified: 1, n: 1
      } else if (res.value) {
        docs = res.value;
      }
      // Check for pagination
      else {
          docs = res.documents ? res.documents : res;
        }

    if (!schema) return;

    try {
      var json = (0, _mask.applyMask)(docs, schema);
    } catch (e) {
      throw _boom2.default.preconditionFailed(e);
    }
    return res.documents ? {
      documents: json,
      total: res.total
    } : json;
  }).catch(function (err) {

    if (err.name === 'MongoError' && err.code && err.code === 11000) {
      var m = err.message.match(/index: \w+\.\w+\.\$(.+)_\d+.*"([^"]+)"/);
      if (m) {
        throw _boom2.default.badRequest((0, _lodash.capitalize)(m[1]) + ' already exists');
      }
    }
    throw _boom2.default.wrap(err);
  });
};

// // Handle Mongo/Mongoose errors
// if (request.response instanceof Error) {
//   var err = request.response
//   if (err.name === 'MongoError' && err.code && err.code === 11000) {
//     var m = err.message.match(/index: \w+\.\w+\.\$(.+)_\d+.*"([^"]+)"/)
//     if (m) {
//       return reply(Boom.badRequest(_.capitalize(m[1]) + ' already exists'))
//     }
//   }
//   if (err.name === 'ValidationError') {
//     return reply(Boom.badRequest('Validation error'))
//   }
// }

exports.default = SuperPromise;