"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../../metadata.min.json"));
var _isPossibleNumber2 = _interopRequireDefault(require("./isPossibleNumber.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function isPossibleNumber() {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }
  parameters.push(_metadataMin["default"]);
  return _isPossibleNumber2["default"].apply(this, parameters);
}
(0, _mocha.describe)('isPossibleNumber', function () {
  (0, _mocha.it)('should work', function () {
    (0, _chai.expect)(isPossibleNumber('+79992223344')).to.equal(true);
    (0, _chai.expect)(isPossibleNumber({
      phone: '1112223344',
      country: 'RU'
    })).to.equal(true);
    (0, _chai.expect)(isPossibleNumber({
      phone: '111222334',
      country: 'RU'
    })).to.equal(false);
    (0, _chai.expect)(isPossibleNumber({
      phone: '11122233445',
      country: 'RU'
    })).to.equal(false);
    (0, _chai.expect)(isPossibleNumber({
      phone: '1112223344',
      countryCallingCode: 7
    })).to.equal(true);
  });
  (0, _mocha.it)('should work v2', function () {
    (0, _chai.expect)(isPossibleNumber({
      nationalNumber: '111222334',
      countryCallingCode: 7
    }, {
      v2: true
    })).to.equal(false);
    (0, _chai.expect)(isPossibleNumber({
      nationalNumber: '1112223344',
      countryCallingCode: 7
    }, {
      v2: true
    })).to.equal(true);
    (0, _chai.expect)(isPossibleNumber({
      nationalNumber: '11122233445',
      countryCallingCode: 7
    }, {
      v2: true
    })).to.equal(false);
  });
  (0, _mocha.it)('should work in edge cases', function () {
    // Invalid `PhoneNumber` argument.
    (0, _chai.expect)(function () {
      return isPossibleNumber({}, {
        v2: true
      });
    }).to["throw"]('Invalid phone number object passed');

    // Empty input is passed.
    // This is just to support `isValidNumber({})`
    // for cases when `parseNumber()` returns `{}`.
    (0, _chai.expect)(isPossibleNumber({})).to.equal(false);
    (0, _chai.expect)(function () {
      return isPossibleNumber({
        phone: '1112223344'
      });
    }).to["throw"]('Invalid phone number object passed');

    // Incorrect country.
    (0, _chai.expect)(function () {
      return isPossibleNumber({
        phone: '1112223344',
        country: 'XX'
      });
    }).to["throw"]('Unknown country');
  });
});
//# sourceMappingURL=isPossibleNumber.test.js.map