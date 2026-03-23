"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _parseDigits = _interopRequireDefault(require("./parseDigits.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('parseDigits', function () {
  (0, _mocha.it)('should parse digits', function () {
    (0, _chai.expect)((0, _parseDigits["default"])('+٤٤٢٣٢٣٢٣٤')).to.equal('442323234');
  });
});
//# sourceMappingURL=parseDigits.test.js.map