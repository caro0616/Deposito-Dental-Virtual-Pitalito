"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../../metadata.min.json"));
var _isValidNumberForRegion2 = _interopRequireDefault(require("./isValidNumberForRegion.js"));
var _isValidNumberForRegion_ = _interopRequireDefault(require("./isValidNumberForRegion_.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function isValidNumberForRegion() {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }
  parameters.push(_metadataMin["default"]);
  return _isValidNumberForRegion2["default"].apply(this, parameters);
}
(0, _mocha.describe)('isValidNumberForRegion', function () {
  (0, _mocha.it)('should detect if is valid number for region', function () {
    (0, _chai.expect)(isValidNumberForRegion('07624369230', 'GB')).to.equal(false);
    (0, _chai.expect)(isValidNumberForRegion('07624369230', 'IM')).to.equal(true);
  });
  (0, _mocha.it)('should validate arguments', function () {
    (0, _chai.expect)(function () {
      return isValidNumberForRegion({
        phone: '7624369230',
        country: 'GB'
      });
    }).to["throw"]('number must be a string');
    (0, _chai.expect)(function () {
      return isValidNumberForRegion('7624369230');
    }).to["throw"]('country must be a string');
  });
  (0, _mocha.it)('should work in edge cases', function () {
    // Not a "viable" phone number.
    (0, _chai.expect)(isValidNumberForRegion('7', 'GB')).to.equal(false);

    // `options` argument `if/else` coverage.
    (0, _chai.expect)((0, _isValidNumberForRegion_["default"])('07624369230', 'GB', {}, _metadataMin["default"])).to.equal(false);
  });
});
//# sourceMappingURL=isValidNumberForRegion.test.js.map