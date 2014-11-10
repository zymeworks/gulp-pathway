/*global describe, it*/
'use strict';

require('mocha');

var fs = require('fs'),
  should = require('should'),
  p = require('path');

var gutil = require('gulp-util'),
  pathway = require('../');

describe('gulp-pathway', function() {

  //
  // Load expected files
  //

  var expectedFile = new gutil.File({
    path: 'test/expected/simple/main.js',
    cwd: 'test/',
    base: 'test/expected',
    contents: fs.readFileSync('test/expected/simple/main.js')
  });

  var expectedNestedFile = new gutil.File({
    path: 'test/expected/nested/sub/complex.js',
    cwd: 'test/',
    base: 'test/expected',
    contents: fs.readFileSync('test/expected/nested/sub/complex.js')
  });

  //
  // Specs
  //

  it('should handle a simple file with exports', function(done) {

    var srcFile = new gutil.File({
      path: 'test/fixtures/simple/main.js',
      cwd: 'test/',
      base: 'test/fixtures/simple',
      contents: fs.readFileSync('test/fixtures/simple/main.js')
    });

    var stream = pathway('test/fixtures/simple');

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);

      switch (p.basename(newFile.path)) {
        case 'main.js':
          String(newFile.contents).should.equal(String(expectedFile.contents));
          break;
        case 'simple.js':
          String(newFile.contents).should.containEql('"main.js"');
          done();
          break;
        default:
          done(newFile.path);
      }
    });

    stream.write(srcFile);
    String(p.extname(srcFile.path)).should.equal('.js');

    stream.end();
  });

  it('should handle complex nested files', function(done) {

    var srcFile = new gutil.File({
      path: 'test/fixtures/nested/sub/complex.js',
      cwd: 'test/',
      base: 'test/fixtures/nested',
      contents: fs.readFileSync('test/fixtures/nested/sub/complex.js')
    });

    var stream = pathway('test/fixtures/nested');

    stream.on('error', function(err) {
      should.exist(err);
      done(err);
    });

    stream.on('data', function(newFile) {
      should.exist(newFile);
      should.exist(newFile.contents);

      switch (p.basename(newFile.path)) {
        case 'complex.js':
          String(newFile.contents).should.equal(String(expectedNestedFile.contents));
          break;
        case 'nested.js':
          String(newFile.contents).should.containEql('"sub/complex.js"');
          done();
          break;
        default:
          done(newFile.path);
      }
    });

    stream.write(srcFile);
    String(p.extname(srcFile.path)).should.equal('.js');

    stream.end();
  });

});