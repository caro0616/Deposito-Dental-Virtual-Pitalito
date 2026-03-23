"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
var _getCountryCallingCode = _interopRequireDefault(require("./getCountryCallingCode.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('getCountryCallingCode', function () {
  (0, _mocha.it)('should get country calling code', function () {
    (0, _chai.expect)((0, _getCountryCallingCode["default"])('US', _metadataMin["default"])).to.equal('1');
  });
  (0, _mocha.it)('should throw if country is unknown', function () {
    (0, _chai.expect)(function () {
      return (0, _getCountryCallingCode["default"])('ZZ', _metadataMin["default"]);
    }).to["throw"]('Unknown country: ZZ');
  });
});
//# sourceMappingURL=getCountryCallingCode.test.js.map