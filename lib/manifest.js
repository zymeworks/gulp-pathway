var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var template = fs.readFileSync(path.join(__dirname, 'manifest.ejs'), 'utf-8');

function render(config, files, packages, library) {
  var manifest = {
    'global'        : 'window',
    'library'       : library,
    'files'         : files,
    'packages'      : packages,
    'strict'        : !config ? true : config.strict
  };

  var indent = config && typeof config.indentation === 'string' ? config.indentation : "  ";

  try {
    manifest.rendered = ejs.render(template.replace(/\t/g, indent), manifest);
  } catch(er) {
    throw new Error('EJS Render Error: ' + er.message);
  }

  manifest.toString = function () {
    return this.rendered;
  };
  //
  return manifest;
}

//
// Exports
//

module.exports = render;