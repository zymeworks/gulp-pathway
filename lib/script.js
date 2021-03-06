var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var escope = require('escope');
var esprima = require('esprima');

var template = fs.readFileSync(path.join(__dirname, 'script.ejs'), 'utf-8');


function render(config, source, pkg, library) {
  var content = source.content || '';
  var ast;
  var exports_;

  try {
    ast = esprima.parse(content, {
      range: true
    });
    exports_ = _parseExports(ast, content);
  } catch (er) {
    throw new Error('Error rendering script (@' + library + '/' + pkg + '/' + source.name + '): ' + er.toString());
  }
  if (exports_.expression) {
    // remove $export expression from source
    content = content.slice(0, exports_.expression.range[0]);
  }

  var script = {
    'global': 'window',
    'library': library,
    'package': pkg,
    'source': source.content,
    'content': content,
    'exports': exports_.names,
    'strict': !config ? true : config.strict,
    'isRootPackage': !pkg || pkg === '/'
  };
  var indent = config && typeof config.indentation === 'string' ? config.indentation : '  ';
  var templ = config && typeof config.template === 'string' ? config.template : template;
  var theTemplate = templ.replace(/\t/g, indent)
  var rendered
  try {
    rendered = ejs.render(theTemplate, script, {strict: false})
  } catch (er) {
    throw new Error('EJS Render Error: ' + er.message);
  }
  script.rendered = rendered

  script.toString = function() {
    return this.rendered;
  };
  //
  return script;
}


function _parseExports(ast, code) {
  var rootSc = escope.analyze(ast).scopes[0];
  var names = [];
  var lastBlock = rootSc.block.body[rootSc.block.body.length - 1] || {};
  var expr = lastBlock.expression;

  // get the $exports statement, extract the
  // identifiers into the exports array
  if (expr && expr.type === 'CallExpression' && expr.callee.name === '$export') {
    expr.arguments.forEach(function(arg) {
      switch (arg.type) {
      case 'Identifier':
        names.push({
          exported: arg.name,
          local: arg.name
        });
        break;
      case 'ObjectExpression':
        arg.properties.forEach(function(prop) {
          var exp = prop.key.name,
            local = code.slice(prop.value.range[0], prop.value.range[1]);
          names.push({
            exported: exp,
            local: local
          });
        });
        break;
      default:
        throw new Error('invalid export expression');
      }
    });
  } else {
    expr = null;
  }
  return {
    names: names,
    expression: expr
  };
}
//
// Exports
//

module.exports = render;