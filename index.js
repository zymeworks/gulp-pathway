var through = require('through2');
var gutil = require('gulp-util');

var p = require('path');

var compileScript = require('./lib/script');
var compileManifest = require('./lib/manifest');

function script(library, base, options) {
  function write(file, enc, callback) {
    if (file.isStream()) {
      this.emit(
        'error',
        new gutil.PluginError('gulp-pathway#script', 'Streaming not supported')
      );
    }
    // is called with each source file
    var route = p.relative(base, p.dirname(file.path)).split(p.sep);
    var pkg = route.join('/') || '/';

    if (!file.isNull() && route[0] !== '..') {
      try {
        file.contents = new Buffer(compileScript(
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
        file.base = base;
      } catch (er) {
        this.emit('error', new gutil.PluginError('gulp-pathway', er));
      }
    }

    this.push(file);

    callback();
  }
  return through.obj(write);
}

function manifest(library, base, options) {
  var lib = {
    packages: [],
    files: [],
    name: library
  };

  function write(file, encoding, callback) {
    if (file.isStream()) {
      this.emit(
        'error',
        new gutil.PluginError('gulp-pathway#manifest', 'Streaming not supported')
      );
    }
    // is called with each source file
    var route = p.relative(base, p.dirname(file.path)).split(p.sep);
    var pkg = route.join('/') || '/';

    if (lib && route[0] !== '..') {
      if (lib.packages.indexOf(pkg) === -1) {
        lib.packages.push(pkg);
      }
      lib.files.push(p.join.apply(p, route.concat([p.basename(file.path)])));
      lib.base = base;
      lib.pwd = file.pwd;
      file.path = p.join(base, library, p.relative(base, file.path));
    }

    this.push(file);

    return callback();
  }


  function flush(cb) {
    var contents;
    var manifestFile;

    try {
      contents = compileManifest(
        options,
        lib.files,
        lib.packages,
        lib.name
      ).toString();
    } catch (er) {
      this.emit('error', new gutil.PluginError('gulp-pathway', er));
      return;
    }

    // if the content isn't empty add the manifest files
    if (contents && lib.files.length) {
      var filename = options && typeof options.filename === 'string' ? options.filename : lib.name;
      manifestFile = new gutil.File({  // create a new file
        base: lib.base,
        cwd: lib.cwd,
        path: p.join(lib.base, filename + '.js'),
        contents: new Buffer(contents),
        stat: {}
      });

      this.push(manifestFile);
    }

    cb();
  }

  return through.obj(write, flush);
}


module.exports = {
  script: script,
  manifest: manifest
};