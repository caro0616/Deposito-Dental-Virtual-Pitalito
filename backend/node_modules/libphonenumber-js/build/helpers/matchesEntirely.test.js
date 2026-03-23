"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _matchesEntirely = _interopRequireDefault(require("./matchesEntirely.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('matchesEntirely', function () {
  (0, _mocha.it)('should work in edge cases', function () {
    // No text.
    (0, _chai.expect)((0, _matchesEntirely["default"])(undefined, '')).to.equal(true);

    // "OR" in regexp.
    (0, _chai.expect)((0, _matchesEntirely["default"])('911231231', '4\d{8}|[1-9]\d{7}')).to.equal(false);
  });
});
//# sourceMappingURL=matchesEntirely.test.js.map