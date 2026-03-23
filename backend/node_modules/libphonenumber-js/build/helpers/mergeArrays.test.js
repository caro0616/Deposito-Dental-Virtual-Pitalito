"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _mergeArrays = _interopRequireDefault(require("./mergeArrays.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('mergeArrays', function () {
  (0, _mocha.it)('should merge arrays', function () {
    (0, _chai.expect)((0, _mergeArrays["default"])([1, 2], [2, 3])).to.deep.equal([1, 2, 3]);
  });
});
//# sourceMappingURL=mergeArrays.test.js.map