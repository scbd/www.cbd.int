// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// Query String Utilities
// Modified version of NodeJS' querystring.js module made to work in the browser
// with RequireJS and underscore instead of the native Node util module.

import _ from 'lodash';

  var QueryString = {};

  // If obj.hasOwnProperty has been overridden, then calling
  // obj.hasOwnProperty(prop) will break.
  // See: https://github.com/joyent/node/issues/1707
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }


  function charCode(c) {
    return c.charCodeAt(0);
  }


  // a safe fast alternative to decodeURIComponent
  QueryString.unescapeBuffer = function(s) {
    return decodeURIComponent(s);
  };


  QueryString.unescape = function(s, decodeSpaces) {
    return QueryString.unescapeBuffer(s, decodeSpaces).toString();
  };


  QueryString.escape = function(str) {
    return encodeURIComponent(str);
  };

  var stringifyPrimitive = function(v) {
    if (_.isString(v))
      return v;
    if (_.isBoolean(v))
      return v ? 'true' : 'false';
    if (_.isNumber(v))
      return isFinite(v) ? v : '';
    return '';
  };


  QueryString.stringify = QueryString.encode = function(obj, sep, eq) {
    sep = sep || '&';
    eq = eq || '=';
    if (_.isNull(obj)) {
      obj = undefined;
    }

    if (_.isObject(obj)) {
      return Object.keys(obj).map(function(k) {
        var ks = QueryString.escape(stringifyPrimitive(k)) + eq;
        if (_.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return ks + QueryString.escape(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + QueryString.escape(stringifyPrimitive(obj[k]));
        }
      }).join(sep);

    }
    return '';
  };

  // Parse a key=val string.
  QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};

    if (!_.isString(qs) || qs.length === 0) {
      return obj;
    }

    var regexp = /\+/g;
    qs = qs.split(sep);

    var maxKeys = 1000;
    if (options && _.isNumber(options.maxKeys)) {
      maxKeys = options.maxKeys;
    }

    var len = qs.length;
    // maxKeys <= 0 means that we should not limit keys count
    if (maxKeys > 0 && len > maxKeys) {
      len = maxKeys;
    }

    for (var i = 0; i < len; ++i) {
      var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

      if (idx >= 0) {
        kstr = x.substr(0, idx);
        vstr = x.substr(idx + 1);
      } else {
        kstr = x;
        vstr = '';
      }

      try {
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
      } catch (e) {
        k = QueryString.unescape(kstr, true);
        v = QueryString.unescape(vstr, true);
      }

      if (!hasOwnProperty(obj, k)) {
        obj[k] = v;
      } else if (_.isArray(obj[k])) {
        obj[k].push(v);
      } else {
        obj[k] = [obj[k], v];
      }
    }

    return obj;
  };

  export default QueryString;

