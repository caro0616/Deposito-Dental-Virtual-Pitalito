"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _examplesMobile = _interopRequireDefault(require("../examples.mobile.json"));
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
var _getExampleNumber = _interopRequireDefault(require("./getExampleNumber.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('getExampleNumber', function () {
  (0, _mocha.it)('should get an example number', function () {
    var phoneNumber = (0, _getExampleNumber["default"])('RU', _examplesMobile["default"], _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.nationalNumber).to.equal('9123456789');
    (0, _chai.expect)(phoneNumber.number).to.equal('+79123456789');
    (0, _chai.expect)(phoneNumber.countryCallingCode).to.equal('7');
    (0, _chai.expect)(phoneNumber.country).to.equal('RU');
  });
  (0, _mocha.it)('should handle a non-existing country', function () {
    (0, _chai.expect)((0, _getExampleNumber["default"])('XX', _examplesMobile["default"], _metadataMin["default"])).to.be.undefined;
  });
});
//# sourceMappingURL=getExampleNumber.test.js.map