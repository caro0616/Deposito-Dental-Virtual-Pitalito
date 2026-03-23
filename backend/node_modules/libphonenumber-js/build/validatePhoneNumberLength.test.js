"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _validatePhoneNumberLength2 = _interopRequireDefault(require("./validatePhoneNumberLength.js"));
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function validatePhoneNumberLength() {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }
  parameters.push(_metadataMin["default"]);
  return _validatePhoneNumberLength2["default"].apply(this, parameters);
}
(0, _mocha.describe)('validatePhoneNumberLength', function () {
  (0, _mocha.it)('should detect whether a phone number length is valid', function () {
    // Not a phone number.
    (0, _chai.expect)(validatePhoneNumberLength('+')).to.equal('NOT_A_NUMBER');
    (0, _chai.expect)(validatePhoneNumberLength('abcde')).to.equal('NOT_A_NUMBER');

    // No country supplied for a national number.
    (0, _chai.expect)(validatePhoneNumberLength('123')).to.equal('INVALID_COUNTRY');

    // Too short while the number is not considered "viable"
    // by Google's `libphonenumber`.
    (0, _chai.expect)(validatePhoneNumberLength('2', 'US')).to.equal('TOO_SHORT');
    (0, _chai.expect)(validatePhoneNumberLength('+1', 'US')).to.equal('TOO_SHORT');
    (0, _chai.expect)(validatePhoneNumberLength('+12', 'US')).to.equal('TOO_SHORT');

    // Test national (significant) number length.
    (0, _chai.expect)(validatePhoneNumberLength('444 1 44', 'TR')).to.equal('TOO_SHORT');
    (0, _chai.expect)(validatePhoneNumberLength('444 1 444', 'TR')).to.be.undefined;
    (0, _chai.expect)(validatePhoneNumberLength('444 1 4444', 'TR')).to.equal('INVALID_LENGTH');
    (0, _chai.expect)(validatePhoneNumberLength('444 1 4444444444', 'TR')).to.equal('TOO_LONG');
  });
});
//# sourceMappingURL=validatePhoneNumberLength.test.js.map