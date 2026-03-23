"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
var _parse = _interopRequireDefault(require("./parse.js"));
var _metadata = _interopRequireDefault(require("./metadata.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function parseNumber() {
  for (var _len = arguments.length, parameters = new Array(_len), _key = 0; _key < _len; _key++) {
    parameters[_key] = arguments[_key];
  }
  if (parameters.length < 2) {
    // `options` parameter.
    parameters.push(undefined);
  }
  // Convert default country argument to an `options` object.
  if (typeof parameters[1] === 'string') {
    parameters[1] = _objectSpread(_objectSpread({}, parameters[2]), {}, {
      defaultCountry: parameters[1]
    });
  }
  if (parameters[2]) {
    parameters[2] = _metadataMin["default"];
  } else {
    parameters.push(_metadataMin["default"]);
  }
  return _parse["default"].apply(this, parameters);
}
var USE_NON_GEOGRAPHIC_COUNTRY_CODE = false;
(0, _mocha.describe)('parse', function () {
  (0, _mocha.it)('should not parse invalid phone numbers', function () {
    // Too short.
    (0, _chai.expect)(parseNumber('+7 (800) 55-35-35')).to.deep.equal({});
    // Too long.
    (0, _chai.expect)(parseNumber('+7 (800) 55-35-35-55')).to.deep.equal({});
    (0, _chai.expect)(parseNumber('+7 (800) 55-35-35', 'US')).to.deep.equal({});
    (0, _chai.expect)(parseNumber('(800) 55 35 35', {
      defaultCountry: 'RU'
    })).to.deep.equal({});
    (0, _chai.expect)(parseNumber('+1 187 215 5230', 'US')).to.deep.equal({});
    (0, _chai.expect)(parseNumber('911231231', 'BE')).to.deep.equal({});
  });
  (0, _mocha.it)('should parse valid phone numbers', function () {
    // Instant loans
    // https://www.youtube.com/watch?v=6e1pMrYH5jI
    //
    // Restrict to RU
    (0, _chai.expect)(parseNumber('Phone: 8 (800) 555 35 35.', 'RU')).to.deep.equal({
      country: 'RU',
      phone: '8005553535'
    });
    // International format
    (0, _chai.expect)(parseNumber('Phone: +7 (800) 555-35-35.')).to.deep.equal({
      country: 'RU',
      phone: '8005553535'
    });
    // // Restrict to US, but not a US country phone code supplied
    // parseNumber('+7 (800) 555-35-35', 'US').should.deep.equal({})
    // Restrict to RU
    (0, _chai.expect)(parseNumber('(800) 555 35 35', 'RU')).to.deep.equal({
      country: 'RU',
      phone: '8005553535'
    });
    // Default to RU
    (0, _chai.expect)(parseNumber('8 (800) 555 35 35', {
      defaultCountry: 'RU'
    })).to.deep.equal({
      country: 'RU',
      phone: '8005553535'
    });

    // Gangster partyline
    (0, _chai.expect)(parseNumber('+1-213-373-4253')).to.deep.equal({
      country: 'US',
      phone: '2133734253'
    });

    // Switzerland (just in case)
    (0, _chai.expect)(parseNumber('044 668 18 00', 'CH')).to.deep.equal({
      country: 'CH',
      phone: '446681800'
    });

    // China, Beijing
    (0, _chai.expect)(parseNumber('010-852644821', 'CN')).to.deep.equal({
      country: 'CN',
      phone: '10852644821'
    });

    // France
    (0, _chai.expect)(parseNumber('+33169454850')).to.deep.equal({
      country: 'FR',
      phone: '169454850'
    });

    // UK (Jersey)
    (0, _chai.expect)(parseNumber('+44 7700 300000')).to.deep.equal({
      country: 'JE',
      phone: '7700300000'
    });

    // KZ
    (0, _chai.expect)(parseNumber('+7 702 211 1111')).to.deep.equal({
      country: 'KZ',
      phone: '7022111111'
    });

    // Brazil
    (0, _chai.expect)(parseNumber('11987654321', 'BR')).to.deep.equal({
      country: 'BR',
      phone: '11987654321'
    });

    // Long country phone code.
    (0, _chai.expect)(parseNumber('+212659777777')).to.deep.equal({
      country: 'MA',
      phone: '659777777'
    });

    // No country could be derived.
    // parseNumber('+212569887076').should.deep.equal({ countryPhoneCode: '212', phone: '569887076' })

    // GB. Moible numbers starting 07624* are Isle of Man.
    (0, _chai.expect)(parseNumber('07624369230', 'GB')).to.deep.equal({
      country: 'IM',
      phone: '7624369230'
    });
  });
  (0, _mocha.it)('should parse possible numbers', function () {
    // Invalid phone number for a given country.
    (0, _chai.expect)(parseNumber('1112223344', 'RU', {
      extended: true
    })).to.deep.equal({
      country: 'RU',
      countryCallingCode: '7',
      phone: '1112223344',
      carrierCode: undefined,
      ext: undefined,
      valid: false,
      possible: true
    });

    // International phone number.
    // Several countries with the same country phone code.
    (0, _chai.expect)(parseNumber('+71112223344')).to.deep.equal({});
    (0, _chai.expect)(parseNumber('+71112223344', {
      extended: true
    })).to.deep.equal({
      country: undefined,
      countryCallingCode: '7',
      phone: '1112223344',
      carrierCode: undefined,
      ext: undefined,
      valid: false,
      possible: true
    });

    // International phone number.
    // Single country with the given country phone code.
    (0, _chai.expect)(parseNumber('+33011222333', {
      extended: true
    })).to.deep.equal({
      country: 'FR',
      countryCallingCode: '33',
      phone: '011222333',
      carrierCode: undefined,
      ext: undefined,
      valid: false,
      possible: true
    });

    // Too short.
    // Won't strip national prefix `8` because otherwise the number would be too short.
    (0, _chai.expect)(parseNumber('+7 (800) 55-35-35', {
      extended: true
    })).to.deep.equal({
      country: 'RU',
      countryCallingCode: '7',
      phone: '800553535',
      carrierCode: undefined,
      ext: undefined,
      valid: false,
      possible: false
    });

    // Too long.
    (0, _chai.expect)(parseNumber('+1 213 37342530', {
      extended: true
    })).to.deep.equal({
      country: undefined,
      countryCallingCode: '1',
      phone: '21337342530',
      carrierCode: undefined,
      ext: undefined,
      valid: false,
      possible: false
    });

    // No national number to be parsed.
    (0, _chai.expect)(parseNumber('+996', {
      extended: true
    })).to.deep.equal({
      // countryCallingCode : '996'
    });

    // Valid number.
    (0, _chai.expect)(parseNumber('+78005553535', {
      extended: true
    })).to.deep.equal({
      country: 'RU',
      countryCallingCode: '7',
      phone: '8005553535',
      carrierCode: undefined,
      ext: undefined,
      valid: true,
      possible: true
    });

    // https://github.com/catamphetamine/libphonenumber-js/issues/211
    (0, _chai.expect)(parseNumber('+966', {
      extended: true
    })).to.deep.equal({});
    (0, _chai.expect)(parseNumber('+9664', {
      extended: true
    })).to.deep.equal({});
    (0, _chai.expect)(parseNumber('+96645', {
      extended: true
    })).to.deep.equal({
      carrierCode: undefined,
      phone: '45',
      ext: undefined,
      country: 'SA',
      countryCallingCode: '966',
      possible: false,
      valid: false
    });
  });
  (0, _mocha.it)('should parse non-European digits', function () {
    (0, _chai.expect)(parseNumber('+١٢١٢٢٣٢٣٢٣٢')).to.deep.equal({
      country: 'US',
      phone: '2122323232'
    });
  });
  (0, _mocha.it)('should work in edge cases', function () {
    var thrower;

    // No input
    (0, _chai.expect)(parseNumber('')).to.deep.equal({});

    // No country phone code
    (0, _chai.expect)(parseNumber('+')).to.deep.equal({});

    // No country at all (non international number and no explicit country code)
    (0, _chai.expect)(parseNumber('123')).to.deep.equal({});

    // No country metadata for this `require` country code
    thrower = function thrower() {
      return parseNumber('123', 'ZZ');
    };
    (0, _chai.expect)(thrower).to["throw"]('Unknown country');

    // No country metadata for this `default` country code
    thrower = function thrower() {
      return parseNumber('123', {
        defaultCountry: 'ZZ'
      });
    };
    (0, _chai.expect)(thrower).to["throw"]('Unknown country');

    // Invalid country phone code
    (0, _chai.expect)(parseNumber('+210')).to.deep.equal({});

    // Invalid country phone code (extended parsing mode)
    (0, _chai.expect)(parseNumber('+210', {
      extended: true
    })).to.deep.equal({});

    // Too short of a number.
    (0, _chai.expect)(parseNumber('1', 'US', {
      extended: true
    })).to.deep.equal({});

    // Too long of a number.
    (0, _chai.expect)(parseNumber('1111111111111111111', 'RU', {
      extended: true
    })).to.deep.equal({});

    // Not a number.
    (0, _chai.expect)(parseNumber('abcdefg', 'US', {
      extended: true
    })).to.deep.equal({});

    // Country phone code beginning with a '0'
    (0, _chai.expect)(parseNumber('+0123')).to.deep.equal({});

    // Barbados NANPA phone number
    (0, _chai.expect)(parseNumber('+12460000000')).to.deep.equal({
      country: 'BB',
      phone: '2460000000'
    });

    // // A case when country (restricted to) is not equal
    // // to the one parsed out of an international number.
    // parseNumber('+1-213-373-4253', 'RU').should.deep.equal({})

    // National (significant) number too short
    (0, _chai.expect)(parseNumber('2', 'US')).to.deep.equal({});

    // National (significant) number too long
    (0, _chai.expect)(parseNumber('222222222222222222', 'US')).to.deep.equal({});

    // No `national_prefix_for_parsing`
    (0, _chai.expect)(parseNumber('41111', 'AC')).to.deep.equal({
      country: 'AC',
      phone: '41111'
    });

    // https://github.com/catamphetamine/libphonenumber-js/issues/235
    // `matchesEntirely()` bug fix.
    (0, _chai.expect)(parseNumber('+4915784846111‬')).to.deep.equal({
      country: 'DE',
      phone: '15784846111'
    });

    // No metadata
    thrower = function thrower() {
      return (0, _parse["default"])('');
    };
    (0, _chai.expect)(thrower).to["throw"]('`metadata` argument not passed');

    // // Numerical `value`
    // thrower = () => parseNumber(2141111111, 'US')
    // thrower.should.throw('A text for parsing must be a string.')

    // Input string too long.
    (0, _chai.expect)(parseNumber('8005553535                                                                                                                                                                                                                                                 ', 'RU')).to.deep.equal({});
  });
  (0, _mocha.it)('should parse phone number extensions', function () {
    // "ext"
    (0, _chai.expect)(parseNumber('2134567890 ext 123', 'US')).to.deep.equal({
      country: 'US',
      phone: '2134567890',
      ext: '123'
    });

    // "ext."
    (0, _chai.expect)(parseNumber('+12134567890 ext. 12345', 'US')).to.deep.equal({
      country: 'US',
      phone: '2134567890',
      ext: '12345'
    });

    // "доб."
    (0, _chai.expect)(parseNumber('+78005553535 доб. 1234', 'RU')).to.deep.equal({
      country: 'RU',
      phone: '8005553535',
      ext: '1234'
    });

    // "#"
    (0, _chai.expect)(parseNumber('+12134567890#1234')).to.deep.equal({
      country: 'US',
      phone: '2134567890',
      ext: '1234'
    });

    // "x"
    (0, _chai.expect)(parseNumber('+78005553535 x1234')).to.deep.equal({
      country: 'RU',
      phone: '8005553535',
      ext: '1234'
    });

    // Not a valid extension
    (0, _chai.expect)(parseNumber('2134567890 ext. abc', 'US')).to.deep.equal({
      country: 'US',
      phone: '2134567890'
    });
  });
  (0, _mocha.it)('should parse RFC 3966 phone numbers', function () {
    (0, _chai.expect)(parseNumber('tel:+78005553535;ext=123')).to.deep.equal({
      country: 'RU',
      phone: '8005553535',
      ext: '123'
    });

    // Should parse "visual separators".
    (0, _chai.expect)(parseNumber('tel:+7(800)555-35.35;ext=123')).to.deep.equal({
      country: 'RU',
      phone: '8005553535',
      ext: '123'
    });

    // Invalid number.
    (0, _chai.expect)(parseNumber('tel:+7x8005553535;ext=123')).to.deep.equal({});
  });
  (0, _mocha.it)('should parse invalid international numbers even if they are invalid', function () {
    (0, _chai.expect)(parseNumber('+7(8)8005553535', 'RU')).to.deep.equal({
      country: 'RU',
      phone: '8005553535'
    });
  });
  (0, _mocha.it)('should parse carrier codes', function () {
    (0, _chai.expect)(parseNumber('0 15 21 5555-5555', 'BR', {
      extended: true
    })).to.deep.equal({
      country: 'BR',
      countryCallingCode: '55',
      phone: '2155555555',
      carrierCode: '15',
      ext: undefined,
      valid: true,
      possible: true
    });
  });
  (0, _mocha.it)('should parse IDD prefixes', function () {
    (0, _chai.expect)(parseNumber('011 61 2 3456 7890', 'US')).to.deep.equal({
      phone: '234567890',
      country: 'AU'
    });
    (0, _chai.expect)(parseNumber('011 61 2 3456 7890', 'FR')).to.deep.equal({});
    (0, _chai.expect)(parseNumber('00 61 2 3456 7890', 'US')).to.deep.equal({});
    (0, _chai.expect)(parseNumber('810 61 2 3456 7890', 'RU')).to.deep.equal({
      phone: '234567890',
      country: 'AU'
    });
  });
  (0, _mocha.it)('should work with v2 API', function () {
    parseNumber('+99989160151539');
  });
  (0, _mocha.it)('should work with Argentina numbers', function () {
    // The same mobile number is written differently
    // in different formats in Argentina:
    // `9` gets prepended in international format.
    (0, _chai.expect)(parseNumber('+54 9 3435 55 1212')).to.deep.equal({
      country: 'AR',
      phone: '93435551212'
    });
    (0, _chai.expect)(parseNumber('0343 15-555-1212', 'AR')).to.deep.equal({
      country: 'AR',
      phone: '93435551212'
    });
  });
  (0, _mocha.it)('should work with Mexico numbers', function () {
    // Fixed line.
    (0, _chai.expect)(parseNumber('+52 449 978 0001')).to.deep.equal({
      country: 'MX',
      phone: '4499780001'
    });
    // "Dialling tokens 01, 02, 044, 045 and 1 are removed as they are
    //  no longer valid since August 2019."
    //
    // parseNumber('01 (449)978-0001', 'MX').should.deep.equal({
    // 	country: 'MX',
    // 	phone: '4499780001'
    // })
    (0, _chai.expect)(parseNumber('(449)978-0001', 'MX')).to.deep.equal({
      country: 'MX',
      phone: '4499780001'
    });
    // "Dialling tokens 01, 02, 044, 045 and 1 are removed as they are
    //  no longer valid since August 2019."
    //
    // // Mobile.
    // // `1` is prepended before area code to mobile numbers in international format.
    // parseNumber('+52 1 33 1234-5678', 'MX').should.deep.equal({
    // 	country: 'MX',
    // 	phone: '3312345678'
    // })
    (0, _chai.expect)(parseNumber('+52 33 1234-5678', 'MX')).to.deep.equal({
      country: 'MX',
      phone: '3312345678'
    });
    // "Dialling tokens 01, 02, 044, 045 and 1 are removed as they are
    //  no longer valid since August 2019."
    //
    // parseNumber('044 (33) 1234-5678', 'MX').should.deep.equal({
    // 	country: 'MX',
    // 	phone: '3312345678'
    // })
    // parseNumber('045 33 1234-5678', 'MX').should.deep.equal({
    // 	country: 'MX',
    // 	phone: '3312345678'
    // })
  });
  (0, _mocha.it)('should parse non-geographic numbering plan phone numbers', function () {
    (0, _chai.expect)(parseNumber('+870773111632')).to.deep.equal(USE_NON_GEOGRAPHIC_COUNTRY_CODE ? {
      country: '001',
      phone: '773111632'
    } : {});
  });
  (0, _mocha.it)('should parse non-geographic numbering plan phone numbers (default country code)', function () {
    (0, _chai.expect)(parseNumber('773111632', {
      defaultCallingCode: '870'
    })).to.deep.equal(USE_NON_GEOGRAPHIC_COUNTRY_CODE ? {
      country: '001',
      phone: '773111632'
    } : {});
  });
  (0, _mocha.it)('should parse non-geographic numbering plan phone numbers (extended)', function () {
    (0, _chai.expect)(parseNumber('+870773111632', {
      extended: true
    })).to.deep.equal({
      country: USE_NON_GEOGRAPHIC_COUNTRY_CODE ? '001' : undefined,
      countryCallingCode: '870',
      phone: '773111632',
      carrierCode: undefined,
      ext: undefined,
      possible: true,
      valid: true
    });
  });
  (0, _mocha.it)('should parse non-geographic numbering plan phone numbers (default country code) (extended)', function () {
    (0, _chai.expect)(parseNumber('773111632', {
      defaultCallingCode: '870',
      extended: true
    })).to.deep.equal({
      country: USE_NON_GEOGRAPHIC_COUNTRY_CODE ? '001' : undefined,
      countryCallingCode: '870',
      phone: '773111632',
      carrierCode: undefined,
      ext: undefined,
      possible: true,
      valid: true
    });
  });
  (0, _mocha.it)('shouldn\'t crash when invalid `defaultCallingCode` is passed', function () {
    (0, _chai.expect)(function () {
      return parseNumber('773111632', {
        defaultCallingCode: '999'
      });
    }).to["throw"]('Unknown calling code');
  });
  (0, _mocha.it)('shouldn\'t set `country` when there\'s no `defaultCountry` and `defaultCallingCode` is not of a "non-geographic entity"', function () {
    (0, _chai.expect)(parseNumber('88005553535', {
      defaultCallingCode: '7'
    })).to.deep.equal({
      country: 'RU',
      phone: '8005553535'
    });
  });
  (0, _mocha.it)('should correctly parse numbers starting with the same digit as the national prefix', function () {
    // https://github.com/catamphetamine/libphonenumber-js/issues/373
    // `BY`'s `national_prefix` is `8`.
    (0, _chai.expect)(parseNumber('+37582004910060')).to.deep.equal({
      country: 'BY',
      phone: '82004910060'
    });
  });
  (0, _mocha.it)('should autocorrect numbers without a leading +', function () {
    // https://github.com/catamphetamine/libphonenumber-js/issues/376
    (0, _chai.expect)(parseNumber('375447521111', 'BY')).to.deep.equal({
      country: 'BY',
      phone: '447521111'
    });
    // https://github.com/catamphetamine/libphonenumber-js/issues/316
    (0, _chai.expect)(parseNumber('33612902554', 'FR')).to.deep.equal({
      country: 'FR',
      phone: '612902554'
    });
    // https://github.com/catamphetamine/libphonenumber-js/issues/375
    (0, _chai.expect)(parseNumber('61438331999', 'AU')).to.deep.equal({
      country: 'AU',
      phone: '438331999'
    });
    // A case when `49` is a country calling code of a number without a leading `+`.
    (0, _chai.expect)(parseNumber('4930123456', 'DE')).to.deep.equal({
      country: 'DE',
      phone: '30123456'
    });
    // A case when `49` is a valid area code.
    (0, _chai.expect)(parseNumber('4951234567890', 'DE')).to.deep.equal({
      country: 'DE',
      phone: '4951234567890'
    });
  });
  (0, _mocha.it)('should parse extensions (long extensions with explicitl abels)', function () {
    // Test lower and upper limits of extension lengths for each type of label.

    // Firstly, when in RFC format: PhoneNumberUtil.extLimitAfterExplicitLabel
    (0, _chai.expect)(parseNumber('33316005 ext 0', 'NZ').ext).to.equal('0');
    (0, _chai.expect)(parseNumber('33316005 ext 01234567890123456789', 'NZ').ext).to.equal('01234567890123456789');
    // Extension too long.
    (0, _chai.expect)(parseNumber('33316005 ext 012345678901234567890', 'NZ').ext).to.be.undefined;

    // Explicit extension label.
    (0, _chai.expect)(parseNumber('03 3316005ext:1', 'NZ').ext).to.equal('1');
    (0, _chai.expect)(parseNumber('03 3316005 xtn:12345678901234567890', 'NZ').ext).to.equal('12345678901234567890');
    (0, _chai.expect)(parseNumber('03 3316005 extension\t12345678901234567890', 'NZ').ext).to.equal('12345678901234567890');
    (0, _chai.expect)(parseNumber('03 3316005 xtensio:12345678901234567890', 'NZ').ext).to.equal('12345678901234567890');
    (0, _chai.expect)(parseNumber('03 3316005 xtensión, 12345678901234567890#', 'NZ').ext).to.equal('12345678901234567890');
    (0, _chai.expect)(parseNumber('03 3316005extension.12345678901234567890', 'NZ').ext).to.equal('12345678901234567890');
    (0, _chai.expect)(parseNumber('03 3316005 доб:12345678901234567890', 'NZ').ext).to.equal('12345678901234567890');

    // Extension too long.
    (0, _chai.expect)(parseNumber('03 3316005 extension 123456789012345678901', 'NZ').ext).to.be.undefined;
  });
  (0, _mocha.it)('should parse extensions (long extensions with auto dialling labels)', function () {
    (0, _chai.expect)(parseNumber('+12679000000,,123456789012345#').ext).to.equal('123456789012345');
    (0, _chai.expect)(parseNumber('+12679000000;123456789012345#').ext).to.equal('123456789012345');
    (0, _chai.expect)(parseNumber('+442034000000,,123456789#').ext).to.equal('123456789');
    // Extension too long.
    (0, _chai.expect)(parseNumber('+12679000000,,1234567890123456#').ext).to.be.undefined;
  });
  (0, _mocha.it)('should parse extensions (short extensions with ambiguous characters)', function () {
    (0, _chai.expect)(parseNumber('03 3316005 x 123456789', 'NZ').ext).to.equal('123456789');
    (0, _chai.expect)(parseNumber('03 3316005 x. 123456789', 'NZ').ext).to.equal('123456789');
    (0, _chai.expect)(parseNumber('03 3316005 #123456789#', 'NZ').ext).to.equal('123456789');
    (0, _chai.expect)(parseNumber('03 3316005 ~ 123456789', 'NZ').ext).to.equal('123456789');
    // Extension too long.
    (0, _chai.expect)(parseNumber('03 3316005 ~ 1234567890', 'NZ').ext).to.be.undefined;
  });
  (0, _mocha.it)('should parse extensions (short extensions when not sure of label)', function () {
    (0, _chai.expect)(parseNumber('+1123-456-7890 666666#', {
      v2: true
    }).ext).to.equal('666666');
    (0, _chai.expect)(parseNumber('+11234567890-6#', {
      v2: true
    }).ext).to.equal('6');
    // Extension too long.
    (0, _chai.expect)(function () {
      return parseNumber('+1123-456-7890 7777777#', {
        v2: true
      });
    }).to["throw"]('NOT_A_NUMBER');
  });
  (0, _mocha.it)('should not choose `defaultCountry` over the "main" one when both the `defaultCountry` and the "main" one match the phone number', function () {
    // This phone number matches both US and CA because they have the same
    // regular expression for some weird reason.
    // https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/103
    var phoneNumber = parseNumber('8004001000', {
      defaultCountry: 'CA',
      v2: true
    });
    (0, _chai.expect)(phoneNumber.country).not.to.equal('CA');
    (0, _chai.expect)(phoneNumber.country).to.equal('US');

    // This phone number is specific to CA.
    var phoneNumber2 = parseNumber('4389999999', {
      defaultCountry: 'US',
      v2: true
    });
    (0, _chai.expect)(phoneNumber2.country).to.equal('CA');
  });
});
//# sourceMappingURL=parse.test.js.map