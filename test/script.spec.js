var renderer = require('../lib/script');
var should = require('should');

describe("pathway script render", function () {
  it("should provide the renderer function", function () {
    renderer.should.be.instanceof(Function);
  });

  describe("rendering", function () {
    var script;
    beforeEach(function () {
      script = renderer({mock: "config"}, {content: "$export(a, b, {c: d});"}, 'a/b/c', 'myLibrary', [{path: "a/b/c.js"}]);
    });

    it("should create a script object", function () {
      script.should.be.ok;
    });

    it("should have the global name", function () {
      script.global.should.equal('window');
    });

    it("should have compiled the template", function () {
      script.toString().should.containEql("window['@myLibrary']");
    });

    it("should catch exports", function () {
      script.toString().should.containEql('a: a')
      script.toString().should.containEql('b: b')
      script.toString().should.containEql('c: d')
    });

    it("should remove old exports statement", function () {
      script.toString().should.not.containEql('$export(a, b, {c: d});');
    });

    it("should catch an error in the syntax", function () {
      should(function () {
        renderer({}, {content: "$export(a, b, 123);", name: "test.js", }, 'a/b/c', 'myLibrary', []);
      }).throw('Error rendering script (@myLibrary/a/b/c/test.js): Error: invalid export expression');
    });

    it("should render a supplied template", function() {
      script = renderer({template: "<%= package %>"}, {content: "$export(a, b, {c: d});"}, 'a/b/c', 'myLibrary', [{path: "a/b/c.js"}]);
      script.toString().should.eql('a/b/c');
    });
  });
});