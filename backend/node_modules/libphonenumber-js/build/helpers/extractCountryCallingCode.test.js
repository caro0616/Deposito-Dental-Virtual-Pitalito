"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _extractCountryCallingCode = _interopRequireDefault(require("./extractCountryCallingCode.js"));
var _metadataMin = _interopRequireDefault(require("../../metadata.min.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('extractCountryCallingCode', function () {
  (0, _mocha.it)('should extract country calling code from a number', function () {
    (0, _chai.expect)((0, _extractCountryCallingCode["default"])('+78005553535', null, null, null, _metadataMin["default"])).to.deep.equal({
      countryCallingCodeSource: 'FROM_NUMBER_WITH_PLUS_SIGN',
      countryCallingCode: '7',
      number: '8005553535'
    });
    (0, _chai.expect)((0, _extractCountryCallingCode["default"])('+7800', null, null, null, _metadataMin["default"])).to.deep.equal({
      countryCallingCodeSource: 'FROM_NUMBER_WITH_PLUS_SIGN',
      countryCallingCode: '7',
      number: '800'
    });
    (0, _chai.expect)((0, _extractCountryCallingCode["default"])('', null, null, null, _metadataMin["default"])).to.deep.equal({});
  });
});
//# sourceMappingURL=extractCountryCallingCode.test.js.map