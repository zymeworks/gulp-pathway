
Gulp Pathway is a [gulp.js](http://gulpjs.com/) plugin which is designed to automatically wrap JavaScript source code with [Pathway Module](https://github.com/zymeworks/pathway) declarations based upon directory structure. This is useful for large code bases where refactoring is frequent.

	var gulp = require('gulp');
	var pathway = require('gulp-pathway');

	gulp.task('compile', function () {
	  return gulp.src('./src')
	    .pipe(pathway.script('myLib', './src', {indentation: "  ", strict: true}))
	    .pipe(pathway.manifest('myLib', './src', {}))
	    .pipe(gulp.dest('./build'));
	});

## Script

	pathway.script('name', 'base/path', {'opions': true})

The following [Pathway](https://github.com/zymeworks/pathway) features are made available to the script:

- $import
- $package
- $export

The script..

	var Math2 = $import('@Math2');
	function divide(a, b) {
	  return Math2.pretty(a/b);
	}
	$export(divide);

...will compile to

	window["@myLib"]('utils', function ($import, $package) { 'use stict';
	  var Math2 = $import('@Math2');
	  function divide(a, b) {
	    return Math2.pretty(a/b);
	  }
	  return {
	    divide: divide
	  };
	});

__$import__ and __$package__ are normal JavaScript identifiers at runtime, read the [Pathway Module System](https://github.com/zymeworks/pathway) page for information on how they work.

__$export__ is special to gulp-pathway, it is a function-like compiler macro which is replaced, in situ, by a return statement. It will only be matched if it is the final statement in the script.

A shorthand has also been incorporated into this which allows you to export local named variables directly, without the mapping. For example

	$export(a, b, {c: x}, d);

compiles to:

	return {a: a, b: b, c: x, d: d};

NB. Conflicting names will be ignored

### Directory Structure
Scripts are organized into modules based upon the position of their enclosing directory on the file system. For example,

If the base directory is <code>./src</code> and the library name is <code>'myLib'</code>; the following files will have the these properties within Pathway:

	./src/pkg/a/script.js
	{library: 'myLib', package: 'pkg/a'}

	./src/hello.js
	{library: 'myLib', package: '/'}

#### Output
Script contents will be outputted as plain JavaScript in the same file structure as the source files passed in. Use other Gulp based tools in your gulpfile.js to determine what to do next, as shown in the gulp file example.

The two files referenced above will each have the following paths after passing through pathway.source

	./src/myLib/pkg/a/script.js
	./src/myLib/hello.js

## Manifest

	pathway.manifest('name', 'base/path', {'opions': true})

### Library Main (myLib.js)
The 'main file' contains the module initialization code, along with a <code>\_\_manifest\_\_</code>  module which lists all files and packages in this library (for debugging). In the case of the directory structure example, this plugin would add the following file to the stream:

	[BASE]/myLib.js

With the following contents

	;(...pathway source here...)('myLib')('__manifest__', function () {
	  return {
	    files: ["main.js", "pkg/a/script.js"],
	    packages: ["/", "pkg/a"]
	  };
	});

At runtime the main file must be loaded before all other code in the library. This is a separate step because it may be desirable for you to bootstrap the Pathway library your own way.