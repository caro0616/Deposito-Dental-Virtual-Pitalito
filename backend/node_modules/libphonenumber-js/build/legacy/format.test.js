"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../../metadata.min.json"));
var _format = _interopRequireDefault(require("./format.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function formatNumber() {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }
  parameters.push(_metadataMin["default"]);
  return _format["default"].apply(this, parameters);
}
(0, _mocha.describe)('format', function () {
  (0, _mocha.it)('should work with the first argument being a E.164 number', function () {
    (0, _chai.expect)(formatNumber('+12133734253', 'NATIONAL')).to.equal('(213) 373-4253');
    (0, _chai.expect)(formatNumber('+12133734253', 'INTERNATIONAL')).to.equal('+1 213 373 4253');

    // Invalid number.
    (0, _chai.expect)(formatNumber('+12111111111', 'NATIONAL')).to.equal('(211) 111-1111');

    // Formatting invalid E.164 numbers.
    (0, _chai.expect)(formatNumber('+11111', 'INTERNATIONAL')).to.equal('+1 1111');
    (0, _chai.expect)(formatNumber('+11111', 'NATIONAL')).to.equal('1111');
  });
  (0, _mocha.it)('should work with the first object argument expanded', function () {
    (0, _chai.expect)(formatNumber('2133734253', 'US', 'NATIONAL')).to.equal('(213) 373-4253');
    (0, _chai.expect)(formatNumber('2133734253', 'US', 'INTERNATIONAL')).to.equal('+1 213 373 4253');
  });
  (0, _mocha.it)('should support legacy "National" / "International" formats', function () {
    (0, _chai.expect)(formatNumber('2133734253', 'US', 'National')).to.equal('(213) 373-4253');
    (0, _chai.expect)(formatNumber('2133734253', 'US', 'International')).to.equal('+1 213 373 4253');
  });
  (0, _mocha.it)('should format using formats with no leading digits (`format.leadingDigitsPatterns().length === 0`)', function () {
    (0, _chai.expect)(formatNumber({
      phone: '12345678901',
      countryCallingCode: 888
    }, 'INTERNATIONAL')).to.equal('+888 123 456 78901');
  });
  (0, _mocha.it)('should sort out the arguments', function () {
    var options = {
      formatExtension: function formatExtension(number, extension) {
        return "".concat(number, " \u0434\u043E\u0431. ").concat(extension);
      }
    };
    (0, _chai.expect)(formatNumber({
      phone: '8005553535',
      country: 'RU',
      ext: '123'
    }, 'NATIONAL', options)).to.equal('8 (800) 555-35-35 доб. 123');

    // Parse number from string.
    (0, _chai.expect)(formatNumber('+78005553535', 'NATIONAL', options)).to.equal('8 (800) 555-35-35');
    (0, _chai.expect)(formatNumber('8005553535', 'RU', 'NATIONAL', options)).to.equal('8 (800) 555-35-35');
  });
  (0, _mocha.it)('should format with national prefix when specifically instructed', function () {
    // With national prefix.
    (0, _chai.expect)(formatNumber('88005553535', 'RU', 'NATIONAL')).to.equal('8 (800) 555-35-35');
    // Without national prefix via an explicitly set option.
    (0, _chai.expect)(formatNumber('88005553535', 'RU', 'NATIONAL', {
      nationalPrefix: false
    })).to.equal('800 555-35-35');
  });
  (0, _mocha.it)('should format valid phone numbers', function () {
    // Switzerland
    (0, _chai.expect)(formatNumber({
      country: 'CH',
      phone: '446681800'
    }, 'INTERNATIONAL')).to.equal('+41 44 668 18 00');
    (0, _chai.expect)(formatNumber({
      country: 'CH',
      phone: '446681800'
    }, 'E.164')).to.equal('+41446681800');
    (0, _chai.expect)(formatNumber({
      country: 'CH',
      phone: '446681800'
    }, 'RFC3966')).to.equal('tel:+41446681800');
    (0, _chai.expect)(formatNumber({
      country: 'CH',
      phone: '446681800'
    }, 'NATIONAL')).to.equal('044 668 18 00');

    // France
    (0, _chai.expect)(formatNumber({
      country: 'FR',
      phone: '169454850'
    }, 'NATIONAL')).to.equal('01 69 45 48 50');

    // Kazakhstan
    (0, _chai.expect)(formatNumber('+7 702 211 1111', 'NATIONAL')).to.equal('8 (702) 211 1111');
  });
  (0, _mocha.it)('should format national numbers with national prefix even if it\'s optional', function () {
    // Russia
    (0, _chai.expect)(formatNumber({
      country: 'RU',
      phone: '9991234567'
    }, 'NATIONAL')).to.equal('8 (999) 123-45-67');
  });
  (0, _mocha.it)('should work in edge cases', function () {
    var thrower;

    // No phone number
    (0, _chai.expect)(formatNumber('', 'RU', 'INTERNATIONAL')).to.equal('');
    (0, _chai.expect)(formatNumber('', 'RU', 'NATIONAL')).to.equal('');
    (0, _chai.expect)(formatNumber({
      country: 'RU',
      phone: ''
    }, 'INTERNATIONAL')).to.equal('+7');
    (0, _chai.expect)(formatNumber({
      country: 'RU',
      phone: ''
    }, 'NATIONAL')).to.equal('');

    // No suitable format
    (0, _chai.expect)(formatNumber('+121337342530', 'US', 'NATIONAL')).to.equal('21337342530');
    // No suitable format (leading digits mismatch)
    (0, _chai.expect)(formatNumber('28199999', 'AD', 'NATIONAL')).to.equal('28199999');

    // Numerical `value`
    thrower = function thrower() {
      return formatNumber(89150000000, 'RU', 'NATIONAL');
    };
    (0, _chai.expect)(thrower).to["throw"]('A phone number must either be a string or an object of shape { phone, [country] }.');

    // No metadata for country
    (0, _chai.expect)(function () {
      return formatNumber('+121337342530', 'USA', 'NATIONAL');
    }).to["throw"]('Unknown country');
    (0, _chai.expect)(function () {
      return formatNumber('21337342530', 'USA', 'NATIONAL');
    }).to["throw"]('Unknown country');

    // No format type
    thrower = function thrower() {
      return formatNumber('+123');
    };
    (0, _chai.expect)(thrower).to["throw"]('`format` argument not passed');

    // Unknown format type
    thrower = function thrower() {
      return formatNumber('123', 'US', 'Gay');
    };
    (0, _chai.expect)(thrower).to["throw"]('Unknown "format" argument');

    // No metadata
    thrower = function thrower() {
      return (0, _format["default"])('123', 'US', 'E.164');
    };
    (0, _chai.expect)(thrower).to["throw"]('`metadata`');

    // No formats
    (0, _chai.expect)(formatNumber('012345', 'AC', 'NATIONAL')).to.equal('012345');

    // No `fromCountry` for `IDD` format.
    (0, _chai.expect)(formatNumber('+78005553535', 'IDD')).to.be.undefined;

    // `fromCountry` has no default IDD prefix.
    (0, _chai.expect)(formatNumber('+78005553535', 'IDD', {
      fromCountry: 'BO'
    })).to.be.undefined;

    // No such country.
    (0, _chai.expect)(function () {
      return formatNumber({
        phone: '123',
        country: 'USA'
      }, 'NATIONAL');
    }).to["throw"]('Unknown country');
  });
  (0, _mocha.it)('should format phone number extensions', function () {
    // National
    (0, _chai.expect)(formatNumber({
      country: 'US',
      phone: '2133734253',
      ext: '123'
    }, 'NATIONAL')).to.equal('(213) 373-4253 ext. 123');

    // International
    (0, _chai.expect)(formatNumber({
      country: 'US',
      phone: '2133734253',
      ext: '123'
    }, 'INTERNATIONAL')).to.equal('+1 213 373 4253 ext. 123');

    // International
    (0, _chai.expect)(formatNumber({
      country: 'US',
      phone: '2133734253',
      ext: '123'
    }, 'INTERNATIONAL')).to.equal('+1 213 373 4253 ext. 123');

    // E.164
    (0, _chai.expect)(formatNumber({
      country: 'US',
      phone: '2133734253',
      ext: '123'
    }, 'E.164')).to.equal('+12133734253');

    // RFC3966
    (0, _chai.expect)(formatNumber({
      country: 'US',
      phone: '2133734253',
      ext: '123'
    }, 'RFC3966')).to.equal('tel:+12133734253;ext=123');

    // Custom ext prefix.
    (0, _chai.expect)(formatNumber({
      country: 'GB',
      phone: '7912345678',
      ext: '123'
    }, 'INTERNATIONAL')).to.equal('+44 7912 345678 x123');
  });
  (0, _mocha.it)('should work with Argentina numbers', function () {
    // The same mobile number is written differently
    // in different formats in Argentina:
    // `9` gets prepended in international format.
    (0, _chai.expect)(formatNumber({
      country: 'AR',
      phone: '3435551212'
    }, 'INTERNATIONAL')).to.equal('+54 3435 55 1212');
    (0, _chai.expect)(formatNumber({
      country: 'AR',
      phone: '3435551212'
    }, 'NATIONAL')).to.equal('03435 55-1212');
  });
  (0, _mocha.it)('should work with Mexico numbers', function () {
    // Fixed line.
    (0, _chai.expect)(formatNumber({
      country: 'MX',
      phone: '4499780001'
    }, 'INTERNATIONAL')).to.equal('+52 449 978 0001');
    (0, _chai.expect)(formatNumber({
      country: 'MX',
      phone: '4499780001'
    }, 'NATIONAL')).to.equal('449 978 0001');
    // or '(449)978-0001'.
    // Mobile.
    // `1` is prepended before area code to mobile numbers in international format.
    (0, _chai.expect)(formatNumber({
      country: 'MX',
      phone: '3312345678'
    }, 'INTERNATIONAL')).to.equal('+52 33 1234 5678');
    (0, _chai.expect)(formatNumber({
      country: 'MX',
      phone: '3312345678'
    }, 'NATIONAL')).to.equal('33 1234 5678');
    // or '045 33 1234-5678'.
  });
  (0, _mocha.it)('should format possible numbers', function () {
    (0, _chai.expect)(formatNumber({
      countryCallingCode: '7',
      phone: '1111111111'
    }, 'E.164')).to.equal('+71111111111');
    (0, _chai.expect)(formatNumber({
      countryCallingCode: '7',
      phone: '1111111111'
    }, 'NATIONAL')).to.equal('1111111111');
    (0, _chai.expect)(formatNumber({
      countryCallingCode: '7',
      phone: '1111111111'
    }, 'INTERNATIONAL')).to.equal('+7 1111111111');
  });
  (0, _mocha.it)('should format IDD-prefixed number', function () {
    // No `fromCountry`.
    (0, _chai.expect)(formatNumber('+78005553535', 'IDD')).to.be.undefined;

    // No default IDD prefix.
    (0, _chai.expect)(formatNumber('+78005553535', 'IDD', {
      fromCountry: 'BO'
    })).to.be.undefined;

    // Same country calling code.
    (0, _chai.expect)(formatNumber('+12133734253', 'IDD', {
      fromCountry: 'CA'
    })).to.equal('1 (213) 373-4253');
    (0, _chai.expect)(formatNumber('+78005553535', 'IDD', {
      fromCountry: 'KZ'
    })).to.equal('8 (800) 555-35-35');

    // formatNumber('+78005553535', 'IDD', { fromCountry: 'US' }).should.equal('01178005553535')
    (0, _chai.expect)(formatNumber('+78005553535', 'IDD', {
      fromCountry: 'US'
    })).to.equal('011 7 800 555 35 35');
  });
  (0, _mocha.it)('should format non-geographic numbering plan phone numbers', function () {
    // https://github.com/catamphetamine/libphonenumber-js/issues/323
    (0, _chai.expect)(formatNumber('+870773111632', 'INTERNATIONAL')).to.equal('+870 773 111 632');
    (0, _chai.expect)(formatNumber('+870773111632', 'NATIONAL')).to.equal('773 111 632');
  });
  (0, _mocha.it)('should use the default IDD prefix when formatting a phone number', function () {
    // Testing preferred international prefixes with ~ are supported.
    // ("~" designates waiting on a line until proceeding with the input).
    (0, _chai.expect)(formatNumber('+390236618300', 'IDD', {
      fromCountry: 'BY'
    })).to.equal('8~10 39 02 3661 8300');
  });
});
//# sourceMappingURL=format.test.js.map