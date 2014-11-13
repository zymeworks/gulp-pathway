var through = require('through2');
var gutil = require('gulp-util');

var p = require('path');

var compileScript = require('./lib/script');
var compileManifest = require('./lib/manifest');

function script(libs, options) {
  function write(file, enc, callback) {
    if (file.isStream()) {
      this.emit(
        'error',
        new gutil.PluginError('gulp-pathway#script', 'Streaming not supported')
      );
    }
    // is called with each source file
    var route = p.relative(file.base, p.dirname(file.path)).split(p.sep),
        library = libs.indexOf(route[0]) > -1 ? route[0] : null,
        pkg = route.slice(1).join('/') || '/';

    if (!file.isNull() && library) {
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
      } catch (er) {
        this.emit('error', new gutil.PluginError('gulp-pathway', er));
      }
    }

    this.push(file);

    callback();
  }
  return through.obj(write);
}

function manifest(libs_, options) {
  var libs = libs_.reduce(function (map, lib) {
    map[lib] = {
      packages: [],
      files: [],
      name: lib
    };
    return map;
  }, {});

  function write(file, encoding, callback) {
    if (file.isStream()) {
      this.emit(
        'error',
        new gutil.PluginError('gulp-pathway#manifest', 'Streaming not supported')
      );
    }
    // is called with each source file
    var route = p.relative(file.base, p.dirname(file.path)).split(p.sep),
        lib = libs.hasOwnProperty(route[0]) ? libs[route[0]] : null,
        pkg = route.slice(1).join('/') || '/';


    if (lib) {
      if (lib.packages.indexOf(pkg) === -1) {
        lib.packages.push(pkg);
      }
      lib.files.push(p.join.apply(p, route.slice(1).concat([p.basename(file.path)])));
      lib.base = file.base;
      lib.pwd = file.pwd;
    }

    this.push(file);

    return callback();
  }


  function flush(cb) {
    var contents,
        manifestFile,
        libName,
        lib;

    for (libName in libs) {
      lib = libs[libName];
      try {
        contents = compileManifest(
          options,
          lib.files,
          lib.packages,
          libName
        ).toString();
      } catch (er) {
        this.emit('error', new gutil.PluginError('gulp-pathway', er));
        break;
      }

      // if the content isn't empty add the manifest files
      if (contents && lib.files.length) {
        manifestFile = new gutil.File({  // create a new file
          base: lib.base,
          cwd: lib.cwd,
          path: p.join(lib.base, lib.name + '.js'),
          contents: new Buffer(contents),
          stat: {}
        });

        this.push(manifestFile);
      }
    }

    cb();
  }

  return through.obj(write, flush);
}


module.exports = {
  script: script,
  manifest: manifest
};