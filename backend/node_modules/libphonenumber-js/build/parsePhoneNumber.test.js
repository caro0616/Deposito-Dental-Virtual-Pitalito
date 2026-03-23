"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _parsePhoneNumber2 = _interopRequireDefault(require("./parsePhoneNumber.js"));
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function parsePhoneNumber() {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }
  parameters.push(_metadataMin["default"]);
  return _parsePhoneNumber2["default"].apply(this, parameters);
}
var USE_NON_GEOGRAPHIC_COUNTRY_CODE = false;
(0, _mocha.describe)('parsePhoneNumber', function () {
  (0, _mocha.it)('should parse phone numbers from string', function () {
    (0, _chai.expect)(parsePhoneNumber('Phone: 8 (800) 555 35 35.', 'RU').nationalNumber).to.equal('8005553535');
    (0, _chai.expect)(parsePhoneNumber('3', 'RU')).to.be.undefined;
  });
  (0, _mocha.it)('should work in edge cases', function () {
    (0, _chai.expect)(parsePhoneNumber('')).to.be.undefined;
  });
  (0, _mocha.it)('should parse phone numbers when invalid country code is passed', function () {
    (0, _chai.expect)(parsePhoneNumber('Phone: +7 (800) 555 35 35.', 'XX').nationalNumber).to.equal('8005553535');
    (0, _chai.expect)(parsePhoneNumber('Phone: 8 (800) 555-35-35.', 'XX')).to.be.undefined;
  });
  (0, _mocha.it)('should parse non-geographic numbering plan phone numbers (extended)', function () {
    var phoneNumber = parsePhoneNumber('+870773111632');
    (0, _chai.expect)(phoneNumber.number).to.equal('+870773111632');
    if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
      (0, _chai.expect)(phoneNumber.country).to.equal('001');
    } else {
      (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    }
    (0, _chai.expect)(phoneNumber.countryCallingCode).to.equal('870');
  });
  (0, _mocha.it)('should parse non-geographic numbering plan phone numbers (default country code) (extended)', function () {
    var phoneNumber = parsePhoneNumber('773111632', {
      defaultCallingCode: '870'
    });
    (0, _chai.expect)(phoneNumber.number).to.equal('+870773111632');
    if (USE_NON_GEOGRAPHIC_COUNTRY_CODE) {
      (0, _chai.expect)(phoneNumber.country).to.equal('001');
    } else {
      (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    }
    (0, _chai.expect)(phoneNumber.countryCallingCode).to.equal('870');
  });
  (0, _mocha.it)('should determine the possibility of non-geographic phone numbers', function () {
    var phoneNumber = parsePhoneNumber('+870773111632');
    (0, _chai.expect)(phoneNumber.isPossible()).to.equal(true);
    var phoneNumber2 = parsePhoneNumber('+8707731116321');
    (0, _chai.expect)(phoneNumber2.isPossible()).to.equal(false);
  });
  (0, _mocha.it)('should support `extract: false` flag', function () {
    var testCorrectness = function testCorrectness(number, expectedResult) {
      var result = (0, _chai.expect)(parsePhoneNumber(number, {
        extract: false,
        defaultCountry: 'US'
      }));
      if (expectedResult) {
        result.to.not.be.undefined;
      } else {
        result.to.be.undefined;
      }
    };
    testCorrectness('Call: (213) 373-4253', false);
    testCorrectness('(213) 373-4253x', false);
    testCorrectness('(213) 373-4253', true);
    testCorrectness('- (213) 373-4253 -', true);
    testCorrectness('+1 (213) 373-4253', true);
    testCorrectness(' +1 (213) 373-4253', false);
  });
  (0, _mocha.it)('should not prematurely strip a possible national prefix from Chinese numbers', function () {
    // https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/57
    var phoneNumber = parsePhoneNumber('+86123456789');
    (0, _chai.expect)(phoneNumber.isPossible()).to.equal(true);
    (0, _chai.expect)(phoneNumber.isValid()).to.equal(false);
    (0, _chai.expect)(phoneNumber.nationalNumber).to.equal('123456789');
  });
  (0, _mocha.it)('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', function () {
    // Tests that Californian numbers `+1310xxxx` are considered possible.
    // https://gitlab.com/catamphetamine/react-phone-number-input/-/issues/228#note_1872536721

    var phoneNumber = parsePhoneNumber('+13100000');
    (0, _chai.expect)(phoneNumber.country).to.equal('CA');
    (0, _chai.expect)(phoneNumber.isPossible()).to.equal(true);
    (0, _chai.expect)(phoneNumber.isValid()).to.equal(true);
    (0, _chai.expect)(phoneNumber.nationalNumber).to.equal('3100000');
    var phoneNumberLocal = parsePhoneNumber('3100000', 'CA');
    (0, _chai.expect)(phoneNumberLocal.country).to.equal('CA');
    (0, _chai.expect)(phoneNumberLocal.isPossible()).to.equal(true);
    (0, _chai.expect)(phoneNumberLocal.isValid()).to.equal(true);
    (0, _chai.expect)(phoneNumberLocal.nationalNumber).to.equal('3100000');
  });
});
//# sourceMappingURL=parsePhoneNumber.test.js.map