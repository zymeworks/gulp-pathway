window['@nested']('sub', function ($import, $package) { 'use strict';
  function test() {
    // body...
  }

  var version = 1;


  // $exports
  return {
    test: test,
    v: version
  };
});