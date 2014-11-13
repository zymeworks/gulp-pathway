var renderer = require('../lib/manifest');

describe("pathway manifest render", function () {
  it("should provide the renderer function", function () {
    renderer.should.be.instanceof(Function);
  });

  describe("rendering", function () {
    var manifest;
    beforeEach(function () {
      manifest = renderer({mock: "config"}, ["a/b/c.js"], ["a/b"], "myLibrary");
    });

    it("should create a manifest object", function () {
      manifest.should.be.ok;
    });

    it("should have the global name", function () {
      manifest.global.should.equal('window');
    });

    it("should have the files", function () {
      manifest.files.should.eql(["a/b/c.js"])
    });

    it("should have compiled the template", function () {
      manifest.toString().should.containEql('makePathway("myLibrary", window)');
    });

    it("should include the list of files", function() {
      manifest.toString().should.containEql('files: ["a/b/c.js"]');
    });

    it("should include the list of packages", function() {
      manifest.toString().should.containEql('packages: ["a/b"]');
    });

    it("should render a supplied template", function() {
      manifest = renderer({template: "<%= packages %>"}, ["a/b/c.js"], ["a/b"], "myLibrary");
      manifest.toString().should.eql('a/b');
    });
  });
});