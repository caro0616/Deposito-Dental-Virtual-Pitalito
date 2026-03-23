"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _applyInternationalSeparatorStyle = _interopRequireDefault(require("./applyInternationalSeparatorStyle.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('applyInternationalSeparatorStyle', function () {
  (0, _mocha.it)('should change Google\'s international format style', function () {
    (0, _chai.expect)((0, _applyInternationalSeparatorStyle["default"])('(xxx) xxx-xx-xx')).to.equal('xxx xxx xx xx');
    (0, _chai.expect)((0, _applyInternationalSeparatorStyle["default"])('(xxx)xxx')).to.equal('xxx xxx');
  });
});
//# sourceMappingURL=applyInternationalSeparatorStyle.test.js.map