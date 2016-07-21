/*!
 * stringify-changelog <https://github.com/jonschlinkert/stringify-changelog>
 *
 * Copyright (c) 2015-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

require('mocha');
var assert = require('assert');
var moment = require('moment');
var changelog = require('./');

describe('changelog', function() {
  it('should generate a changelog from a yaml file:', function() {
    assert.equal(changelog('fixtures/a.yaml'), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      '',
      '## [v0.1.0] - 2015-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in a chimney last night.',
      ''
    ].join('\n'));
  });

  it('should add reflinks when options.repo is defined', function() {
    assert.equal(changelog('fixtures/a.yaml', {repo: 'foo/bar'}), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      '',
      '## [v0.1.0] - 2015-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in a chimney last night.',
      '',
      '[v0.2.0]: https://github.com/foo/bar/compare/v0.1.0...v0.2.0'
    ].join('\n'));
  });

  it('should add reflinks when options.owner and options.name are defined', function() {
    assert.equal(changelog('fixtures/a.yaml', {owner: 'foo', name: 'bar'}), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      '',
      '## [v0.1.0] - 2015-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in a chimney last night.',
      '',
      '[v0.2.0]: https://github.com/foo/bar/compare/v0.1.0...v0.2.0'
    ].join('\n'));
  });

  it('should generate a changelog from a yml file:', function() {
    assert.equal(changelog('fixtures/a.yml'), [
      '## [v0.1.0] - 2015-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in a chimney last night.',
      ''
    ].join('\n'));
  });

  it('should generate a changelog from a yaml file with no extension:', function() {
    assert.equal(changelog('fixtures/changelog'), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      ''
    ].join('\n'));
  });

  it('should generate a changelog from an object:', function() {
    var data = { 'v0.2.0': { date: '2016-12-26', changes: [ 'Got stuck in another chimney.' ] } };
    assert.equal(changelog(data), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      ''
    ].join('\n'));
  });

  it('should generate a changelog from an array:', function() {
    var data = [
      {date: '2016-12-26', version: 'v0.2.0', changes: [ 'Got stuck in another chimney.' ]
    }];

    assert.equal(changelog(data), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      ''
    ].join('\n'));
  });

  it('should allow a custom date function:', function() {
    var data = [
      {date: '2016-12-26', version: 'v0.2.0', changes: [ 'Got stuck in another chimney.' ]
    }];

    var opts = {};
    opts.dateFn = function(date) {
      return ' * ' + moment(date).format('YYYY-MM-DD');
    };

    assert.equal(changelog(data, opts), [
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      ''
    ].join('\n'));
  });

  it('should add a key when `options.key` is true', function() {
    assert.equal(changelog('fixtures/a.yaml', {repo: 'foo/bar', key: true}), [
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
      '## [v0.2.0] - 2016-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in another chimney.',
      '',
      '## [v0.1.0] - 2015-12-26',
      '',
      '**changes**',
      '',
      '- Got stuck in a chimney last night.',
      '',
      '[v0.2.0]: https://github.com/foo/bar/compare/v0.1.0...v0.2.0'
    ].join('\n'));
  });

  it('should throw an error:', function(cb) {
    try {
      changelog();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'stringify-changelog expects an object or array');
      cb();
    }
  });
});
