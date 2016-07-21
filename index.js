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
var isObject = require('isobject');
var extend = require('extend-shallow');

module.exports = function changelog(val, options) {
  var changes = [];
  var filepath;

  if (typeof val === 'string') {
    filepath = val;
    val = readChangelog(val);
  }

  if (!val && filepath) {
    throw new Error(`stringify-changelog cannot read <${filepath}>`);
  }

  if (isObject(val)) {
    for (var key in val) {
      var entry = val[key];
      entry.version = key;
      changes.push(entry);
    }
  } else if (val && typeof val === 'string') {
    var opts = extend({}, options);
    var links = createReflinks(val, opts);
    var result = val + '\n\n' + links;
    if (opts.stripHeading) {
      result = stripHeading(result);
    }
    if (opts.key) {
      result = addKey(result);
    }
    return result;
  } else if (!Array.isArray(val)) {
    throw new TypeError('stringify-changelog expects an object or array');
  } else {
    changes = val;
  }

  return formatChangelog(changes, options);
};

function formatChangelog(entries, options) {
  var opts = extend({}, options);
  var len = entries.length;
  var versions = [];
  var idx = -1;
  var res = '';

  while (++idx < len) {
    var entry = entries[idx];
    versions.push(entry.version);
    if (idx) res += '\n\n';
    res += formatEntry(entry, opts);
  }
  var links = createReflinks(versions, opts);
  var result = res + '\n\n' + links;
  if (opts.key) {
    result = addKey(result);
  }
  return result.replace(/\n+$/, '\n');
}

function formatEntry(entry, options) {
  if (typeof options.format === 'function') {
    return options.format(entry);
  }
  var str = `## [${entry.version}] - ${entry.date}`;
  for (var key in entry) {
    if (entry.hasOwnProperty(key) && key !== 'date' && key !== 'version') {
      str += `\n\n**${key}**\n\n`;
      str += formatList(entry[key]);
    }
  }
  return str;
}

function formatList(val) {
  if (typeof val === 'string') {
    val = [val];
  }
  if (Array.isArray(val)) {
    return val.map(function(ele) {
      return `- ${ele.toString()}`;
    }).join('\n');
  }
  return val.toString();
}

function createReflinks(versions, options) {
  var opts = extend({}, options);
  var repo = getRepo(opts);
  if (!repo) return '';

  if (typeof versions === 'string') {
    versions = getVersions(versions);
  }
  var len = versions.length;
  var idx = -1;
  var res = [];
  while (++idx < len) {
    var curr = versions[idx];
    var prev = versions[idx + 1];
    if (!prev) continue;
    if (/unreleased/i.test(curr)) {
      res.push(unreleased(prev, repo));
    } else {
      res.push(createLink(curr, prev, repo));
    }
  }
  return res.join('\n');
}

function getVersions(str) {
  var re = /^#+ (\[[^\]]+\])/gm;
  return (str.match(re) || []).map(function(heading) {
    return heading.replace(/^#+ \[|\]$/g, '');
  });
}

function unreleased(prev, repo) {
  return `[Unreleased]: https://github.com/${repo}/compare/${prev}...HEAD`;
}

function createLink(curr, prev, repo) {
  return `[${curr}]: https://github.com/${repo}/compare/${prev}...${curr}`;
}

function addKey(str) {
  var key = [
    '## key',
    '',
    'Changelog entries are classified using the following labels from [keep-a-changelog][]:',
    '',
    '- `added`: for new features',
    '- `changed`: for changes in existing functionality',
    '- `deprecated`: for once-stable features removed in upcoming releases',
    '- `removed`: for deprecated features removed in this release',
    '- `fixed`: for any bug fixes',
    '',
    '[keep-a-changelog]: https://github.com/olivierlacan/keep-a-changelog',
    '',
    ''
  ].join('\n');
  return key + str;
}

function stripHeading(str) {
  str = str.replace(/^\s+/, '');
  return str.replace(/^#[^\n]+/, '');
}

function getRepo(options) {
  var repo = options.repo;
  if (repo) return repo;
  if (options.name && (options.owner || options.username)) {
    return (options.owner || options.username) + '/' + options.name;
  }
}

function readChangelog(filepath) {
  var ext = path.extname(filepath);
  try {
    var str = fs.readFileSync(filepath, 'utf8');
    switch (ext) {
      case '.json':
        return JSON.parse(str);
      case '.yaml':
      case '.yml':
      case '':
        return yaml.safeLoad(str);
      default: {
        return str;
      }
    }
  } catch (err) {
    return filepath;
  }
}
