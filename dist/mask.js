'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyMask = applyMask;

var _lodash = require('lodash');

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _hoek = require('hoek');

var _hoek2 = _interopRequireDefault(_hoek);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Util to manage REST outputs
 *
 * This class accepts a json schema and a json object such as a Mongoose result.
 * It will create new output based on both.
 *
 * Example schema:
 * var schema = { id: '@id' }
 * Given an collection of document it will return something like: [{ id: '123' }, { id: '234' }].
 * If just one doc is provided then the result will be a single object instead of an array.
 * Basically the value parameter is a string - if it starts with '@' it will look for that value in the fields.
 * If '@' is ommitted then it will just return a string as is.
 * One can also pass a function which is given then entire original collection/document and the function can return whatever
 * is needed to be inserted in that place.
 * We can also prepend with '#' which will return the count of that field.
 *
 */

var item = {};
var rekeys = {
  '_id': 'id'
};

// Format an object/collection according to schema structure
function applyMask(data, schema) {
  var self = this;
  if ((0, _lodash.isArray)(data)) {
    var a = [];

    a = data.map(function (d) {
      item = d;
      return processElement(schema);
    });
    return a;
  } else {
    item = data;

    return processElement(schema);
  }
}

// Fetch a deep object path by string
function getPath(el) {
  var path = el;
  var fallback = null;
  if ((0, _lodash.isString)(el)) {
    var bits = el.toString().split(/\s*\|\|\s*/);
    path = bits[0];
    fallback = bits[1] || null;
  }

  if (!(0, _lodash.isString)(path)) return path;
  var obj = item;
  var exists = true;

  if (!path.match(/^#|@/)) {
    obj = path;
  } else {
    var count = path.slice(0, 1) === '#';

    path = path.slice(1).split('.');
    (0, _lodash.each)(path, function (piece) {
      exists = true;
      var m = piece.match(/(\w+)\[(\d+)\]/);
      var segment = m ? m[1] : piece;

      if (!(0, _lodash.isObject)(obj)) return fallback;

      if ((0, _lodash.isArray)(obj)) {
        var t = [];
        (0, _lodash.forIn)(obj, function (v, k) {
          if (v[segment]) t.push(v[segment]);else exists = false;
        });
        obj = t;
      } else {
        obj = m ? obj[segment][m[2]] : obj[segment];
      }
    });
    if (count) obj = obj.length;
  }

  if (obj instanceof Date) {
    return (0, _moment2.default)(obj).toISOString();
  }
  if (!exists || typeof obj === 'undefined' || obj === null) {
    return fallback;
  }

  // Buffer and IDs
  if (Buffer.isBuffer(obj) || obj.toString().match(/^[0-9a-fA-F]{24}$/)) {
    obj = obj.toString();
  }

  return obj;
}

function reKey(o) {
  if (!(0, _lodash.isObject)(o)) return o;

  var self = this;
  var build, key, dest, value;
  build = {};
  (0, _lodash.each)(o, function (key) {

    // Get the destination key
    dest = rekeys[key] || key;

    // Get the value
    value = o[key];

    // If this is an object, recurse
    if ((0, _lodash.isObject)(o)) {
      value = rekey(value);
    }

    // Set it on the result using the destination key
    build[dest] = value;
  });

  return build;
}

// Private function to process path segment
function processSegment(value) {
  var self = this;
  var res;
  if ((0, _lodash.isFunction)(value)) {
    return value(item);
  }
  if ((0, _lodash.isObject)(value)) {
    return processElement(value);
  }
  return getPath(value);
}

// Recursively process each schema element
function processElement(obj) {
  var self = this;
  var i, ret, ret2;

  if ((0, _lodash.isFunction)(obj)) {
    return obj(item);
  } else if ((0, _lodash.isObject)(obj)) {
    if ((0, _lodash.isEmpty)(obj)) {
      return obj;
    }
    if ((0, _lodash.isArray)(obj)) {
      ret = [];
      (0, _lodash.forIn)(obj, function (value, key) {
        ret.push(processSegment(value));
      });
    } else {
      ret = {};
      (0, _lodash.forOwn)(obj, function (prop, key) {
        ret[getPath(key)] = processSegment(prop);
      });
    }
  } else {
    ret = getPath(obj);
  }
  return ret;
}