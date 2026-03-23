"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _stripIddPrefix = _interopRequireDefault(require("./stripIddPrefix.js"));
var _metadataMin = _interopRequireDefault(require("../../metadata.min.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('stripIddPrefix', function () {
  (0, _mocha.it)('should strip a valid IDD prefix', function () {
    (0, _chai.expect)((0, _stripIddPrefix["default"])('01178005553535', 'US', '1', _metadataMin["default"])).to.equal('78005553535');
  });
  (0, _mocha.it)('should strip a valid IDD prefix (no country calling code)', function () {
    (0, _chai.expect)((0, _stripIddPrefix["default"])('011', 'US', '1', _metadataMin["default"])).to.equal('');
  });
  (0, _mocha.it)('should strip a valid IDD prefix (valid country calling code)', function () {
    (0, _chai.expect)((0, _stripIddPrefix["default"])('0117', 'US', '1', _metadataMin["default"])).to.equal('7');
  });
  (0, _mocha.it)('should strip a valid IDD prefix (not a valid country calling code)', function () {
    (0, _chai.expect)((0, _stripIddPrefix["default"])('0110', 'US', '1', _metadataMin["default"])).to.be.undefined;
  });
});
//# sourceMappingURL=stripIddPrefix.test.js.map