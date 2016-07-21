/*!
 * stringify-changelog <https://github.com/jonschlinkert/stringify-changelog>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml-lite');
var moment = require('moment');
var columnify = require('columnify');
var merge = require('mixin-deep');

module.exports = function changelog(data, opts) {
  var filepath;
  if (typeof data === 'string') {
    filepath = data;
    data = readChangelog(data);
  }

  if (filepath && !data) {
    throw new Error(`stringify-changelog cannot read <${filepath}>`);
  }

  if (!data || typeof data !== 'object') {
    throw new TypeError('stringify-changelog expects an object or array');
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

function readChangelog(filepath) {
  var ext = path.extname(filepath);
  if (ext === '.yaml' || ext === '.yml' || ext === '') {
    try {
      var str = fs.readFileSync(filepath, 'utf8');
      return yaml.load(str);
    } catch (err) {}
  }
  if (ext === '.json') {
    try {
      var str = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(str);
    } catch (err) {}
  }
  return null;
}
