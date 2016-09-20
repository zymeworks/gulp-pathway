var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var template = fs.readFileSync(path.join(__dirname, 'manifest.ejs'), 'utf-8');
var pathwaySrc = fs.readFileSync(path.join(__dirname, 'pathway.min.js'), 'utf-8');

function render(config, files, packages, library) {
  var pwySrc = config && config.hasOwnProperty('pathwaySrc') ? config.pathwaySrc : pathwaySrc;
  var manifest = {
    'global'        : 'window',
    'pathwaySrc'    : pwySrc.replace(/[ \t\n]+$/gm, ''),
    'library'       : library,
    'files'         : files,
    'packages'      : packages,
    'strict'        : !config ? true : config.strict
  };

  var indent = config && typeof config.indentation === 'string' ? config.indentation : "  ";
  var templ = config && typeof config.template === 'string' ? config.template : template;

  try {
    manifest.rendered = ejs.render(templ.replace(/\t/g, indent), manifest);
  } catch (er) {
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