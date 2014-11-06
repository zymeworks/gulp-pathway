var through = require('through2');
var gutil = require('gulp-util');

var p = require('path');

var script = require('./lib/script');
var manifest = require('./lib/manifest');

function pathway(libPath, options) {
  var library = p.basename(libPath);
  var packages = [];
  var files = [];

  function write(file, encoding, callback) {
    // is called with each source file
    var pkg = p.dirname(p.relative(libPath, file.path)).split(p.sep).join('/');
    pkg = pkg === '.' ? '/' : pkg;

    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    if (file.isStream()) {
      this.emit(
        'error',
        new gutil.PluginError('gulp-pathway', 'Streaming not supported')
      );
    }

    try {
      file.contents = new Buffer(script(
        options,
        {
          content: file.contents.toString(),
          path: file.path,
          name: p.basename(file.path)
        },
        pkg,
        library
      ).toString());
      file.path = gutil.replaceExtension(file.path, '.js');
    } catch (er) {
      this.emit('error', new gutil.PluginError('gulp-pathway', er));
    }

    if (packages.indexOf(pkg)) {
      packages.push(pkg);
    }

    files.push(p.relative(libPath, file.path));

    this.push(file);

    callback();
  }

  function flush(cb) {
    var contents;
    try {
      contents = manifest(
        options,
        files,
        packages,
        library
      ).toString();
    } catch (er) {
      this.emit('error', new gutil.PluginError('gulp-pathway', er));
    }

    // called after source files have been consumed
    var manifestFile = new gutil.File({  // create a new file
      base: __dirname,
      cwd: __dirname,
      path: p.dirname(libPath) + '/' + library + '.js',
      contents: new Buffer(contents)
    });

    this.push(manifestFile);

    cb();
  }

  return through.obj(write, flush);
}

module.exports = pathway;