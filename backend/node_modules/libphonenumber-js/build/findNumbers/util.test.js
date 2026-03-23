"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _util = require("./util.js");
(0, _mocha.describe)('findNumbers/util', function () {
  (0, _mocha.it)('should generate regexp limit', function () {
    var thrower = function thrower() {
      return (0, _util.limit)(1, 0);
    };
    (0, _chai.expect)(thrower).to["throw"]();
    thrower = function thrower() {
      return (0, _util.limit)(-1, 1);
    };
    (0, _chai.expect)(thrower).to["throw"]();
    thrower = function thrower() {
      return (0, _util.limit)(0, 0);
    };
    (0, _chai.expect)(thrower).to["throw"]();
  });
  (0, _mocha.it)('should trimAfterFirstMatch', function () {
    (0, _chai.expect)((0, _util.trimAfterFirstMatch)(/\d/, 'abc123')).to.equal('abc');
    (0, _chai.expect)((0, _util.trimAfterFirstMatch)(/\d/, 'abc')).to.equal('abc');
  });
  (0, _mocha.it)('should determine if a string starts with a substring', function () {
    (0, _chai.expect)((0, _util.startsWith)('𐍈123', '𐍈')).to.equal(true);
    (0, _chai.expect)((0, _util.startsWith)('1𐍈', '𐍈')).to.equal(false);
  });
  (0, _mocha.it)('should determine if a string ends with a substring', function () {
    (0, _chai.expect)((0, _util.endsWith)('123𐍈', '𐍈')).to.equal(true);
    (0, _chai.expect)((0, _util.endsWith)('𐍈1', '𐍈')).to.equal(false);
  });
});
//# sourceMappingURL=util.test.js.map