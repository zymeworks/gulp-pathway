window['@nested'](function ($import, $package) {
  'use strict';
  //
  var Test, abc;
  
  abc = $import('@abc');
  
  Test = (function() {
    function Test(name) {
      this.name = name;
    }
  
    Test.prototype.toString = function() {
      return "Test:" + this.name;
    };
  
    Test.prototype.turn = function(a, b, c) {
      return a + b + c;
    };
  
    Test.prototype.def = 123;
  
    return Test;
  
  })();
  
  $package.fallback = new Test('Default');
  
  $package.last = new Test('Final');
  
  
  // $exports
  return {
    abc: abc,
    def: def,
    Tester: Test,
    fame: adf,
    asdf: asdf,
    arf: asd
  };
});