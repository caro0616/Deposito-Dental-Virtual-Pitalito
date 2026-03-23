"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _getNumberType = _interopRequireDefault(require("./getNumberType.js"));
var _metadataMin = _interopRequireDefault(require("../../test/metadata/1.0.0/metadata.min.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('getNumberType', function () {
  (0, _mocha.it)('should get number type when using old metadata', function () {
    (0, _chai.expect)((0, _getNumberType["default"])({
      nationalNumber: '2133734253',
      country: 'US'
    }, {
      v2: true
    }, _metadataMin["default"])).to.equal('FIXED_LINE_OR_MOBILE');
  });
  (0, _mocha.it)('should return `undefined` when the phone number is a malformed one', function () {
    (0, _chai.expect)((0, _getNumberType["default"])({}, {
      v2: true
    }, _metadataMin["default"])).to.be.undefined;
  });
});
//# sourceMappingURL=getNumberType.test.js.map