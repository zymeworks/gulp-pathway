var through = require('through2');
var gutil = require('gulp-util');

var p = require('path');

var script = require('./lib/script');

function pathway(libPath, options) {
  var library = p.basename(libPath);

  return through.obj(function (file, encoding, callback) {
    var pkg = p.dirname(p.relative(libPath, file.path)).split(p.sep).join('/');
    pkg = pkg === '.' ? null : pkg;

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

    this.push(file);
    callback();
  });
}

module.exports = pathway;