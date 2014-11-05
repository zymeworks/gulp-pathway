/*globals makePathway*/
// nested manifest
makePathway("nested", window)('__manifest__', function () {
  'use strict';
  return {
    files: ["nested/main.js","nested/sub/preprocess.coffee.js","nested/sub/sub.js","nested/sub/sub2.js"],
    packages: ["/","sub"]
  };
});