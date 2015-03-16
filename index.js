/*!
 * stringify-changelog <https://github.com/jonschlinkert/stringify-changelog>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var moment = require('moment');
var columnify = require('columnify');
var merge = require('mixin-deep');

module.exports = function changelog(data, opts) {
  if (typeof data === 'string') {
    data = readChangelog(data);
  }

  if (!data) {
    throw new Error('helper-changelog cannot find data or a file to read.');
  }

  if (typeof data !== 'object') {
    throw new Error('helper-changelog expects data to be an array or object.');
  }

  var changes = [];

  if (Array.isArray(data)) {
    var len = data.length;
    while (len--) {
      var ele = data[len];
      var res = {};
      res.date = formatDate(ele.date, opts),
      res.version = ele.version;
      res.changes = ele.changes;
      changes.push(res);
    }
  } else {
    // Convert changelog object to an array. We want the
    // version key to convert to `version: "v0.1.0"`
    for (var version in data) {

      changes.push({
        date: formatDate(data[version].date, opts),
        version: version,
        changes: data[version].changes
      });
    }
  }

  // free up memory
  data = null;
  opts = opts || {};

  opts = merge({}, opts, {
    columnSplitter: '   ',
    headingTransform: function (heading) {
      return formatHeading(heading, opts);
    },
    config: {changes: {maxWidth: 60, }}
  });

  // Prettify the changelog with columnify
  return columnify(changes, opts);
};


function formatHeading(heading, opts) {
  if (opts && opts.headingFn) {
    return opts.headingFn(heading);
  }
  return '**' + heading.toUpperCase() + '**';
}

function formatDate(date, opts) {
  if (opts && opts.dateFn) {
    return opts.dateFn(date);
  }
  return ' * ' + moment(date).format('YYYY-MM-DD');
}

function readChangelog(fp) {
  try {
    var str = fs.readFileSync(fp, 'utf8');
    return yaml.load(str);
  } catch (err) {}
  return null;
}
