window['@nested']('sub', function ($import, $package) {
  'use strict';
  //
  function theSubMethod() {
    // body...
  }
  
  
  // $exports
  return {
    theSubMethod: theSubMethod
  };
});