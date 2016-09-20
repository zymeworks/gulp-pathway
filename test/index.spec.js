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

  describe("script", function () {

    it('should handle a simple file with exports', function(done) {

      var srcFile = new gutil.File({
        path: 'test/fixtures/simple/main.js',
        cwd: 'test/',
        base: 'test/fixtures',
        contents: fs.readFileSync('test/fixtures/simple/main.js')
      });

      var stream = pathway.script('simple', 'test/fixtures/simple/');

      stream.on('error', function(err) {
        should.exist(err);
        done(err);
      });

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        String(newFile.contents).should.equal(String(expectedFile.contents));
        done();
      });

      stream.write(srcFile);
      String(p.extname(srcFile.path)).should.equal('.js');

      stream.end();
    });

    it('should handle complex nested files', function(done) {

      var srcFile = new gutil.File({
        path: 'test/fixtures/nested/sub/complex.js',
        cwd: 'test/',
        base: 'test/fixtures',
        contents: fs.readFileSync('test/fixtures/nested/sub/complex.js')
      });

      var stream = pathway.script('nested', 'test/fixtures/nested/');

      stream.on('error', function(err) {
        should.exist(err);
        done(err);
      });

      stream.on('data', function(newFile) {
        should.exist(newFile);
        should.exist(newFile.contents);
        String(newFile.contents).should.equal(String(expectedNestedFile.contents));
        done();
      });

      stream.write(srcFile);
      String(p.extname(srcFile.path)).should.equal('.js');

      stream.end();
    });

  });

  describe("manifest", function () {
    var srcFile, srcFile2;
    beforeEach(function () {
      srcFile = new gutil.File({
        path: 'test/fixtures/simple/main.js',
        cwd: 'test/',
        base: 'test/fixtures'
      });
      srcFile2 = new gutil.File({
       path: 'test/fixtures/nested/sub/complex.js',
       cwd: 'test/',
       base: 'test/fixtures',
     });
    });

    it("should create a simple manifest", function (done) {

      var stream = pathway.manifest('simple', 'test/fixtures/simple/', {});

      stream.on('error', function (er) {
        should.exist(er);
        done(er);
      });

      var files = [];

      stream.on('data', function (newFile) {
        files.push(newFile);
      });

      stream.on('end', function () {
        var mFile = files[files.length - 1];
        should.exist(mFile);
        should.exist(mFile.contents);

        mFile.path.should.equal('test/fixtures/simple/simple.js');
        String(mFile.contents).should.containEql('"main.js"');
        String(mFile.contents).should.containEql('"/"');
        done();
      })

      stream.write(srcFile);
      stream.end();
    });

    it("should handle a more complex file a simple manifest", function (done) {

      var stream = pathway.manifest('nested', 'test/fixtures/nested/', {});

      stream.on('error', function (er) {
        should.exist(er);
        done(er);
      });

      var files = [];

      stream.on('data', function (newFile) {
        files.push(newFile);
      });

      stream.on('end', function () {
        var mFile2 = files[files.length - 1];

        should.exist(mFile2);
        should.exist(mFile2.contents);

        mFile2.path.should.equal('test/fixtures/nested/nested.js');
        String(mFile2.contents).should.containEql('files: ["sub/complex.js"]');
        String(mFile2.contents).should.containEql('packages: ["sub"]');
        done();
      })

      stream.write(srcFile);
      stream.write(srcFile2);
      stream.end();
    });

    it("should ignore non pathway libraries", function (done) {
      var stream = pathway.manifest('simple', 'test/fixtures/simple/');

      var files = [];

      stream.on('data', function (newFile) {
        files.push(newFile);
      });

      stream.on('end', function () {
        var mFile = files[files.length - 1];
        should.exist(mFile);
        should.exist(mFile.contents);

        mFile.path.should.equal('test/fixtures/simple/simple.js');
        String(mFile.contents).should.containEql('"main.js"');
        String(mFile.contents).should.containEql('"/"');

        String(files[0].path).should.equal('test/fixtures/simple/simple/main.js')
        done();
      })

      stream.write(srcFile);
      stream.write(srcFile2);
      stream.end();
    });
  });

  //
  // Specs
  //

});