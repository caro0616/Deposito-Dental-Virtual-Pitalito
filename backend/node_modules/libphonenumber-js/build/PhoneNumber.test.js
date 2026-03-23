"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
var _PhoneNumber = _interopRequireDefault(require("./PhoneNumber.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('PhoneNumber', function () {
  (0, _mocha.it)('should create a phone number via a public constructor', function () {
    var phoneNumber = new _PhoneNumber["default"]('+78005553535', _metadataMin["default"]);
    phoneNumber.setExt('1234');
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.countryCallingCode).to.equal('7');
    (0, _chai.expect)(phoneNumber.nationalNumber).to.equal('8005553535');
    (0, _chai.expect)(phoneNumber.formatNational()).to.equal('8 (800) 555-35-35 ext. 1234');
  });
  (0, _mocha.it)('should validate constructor arguments (public constructor)', function () {
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]();
    }).to["throw"]('argument is required');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"](undefined, _metadataMin["default"]);
    }).to["throw"]('argument is required');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]('7', _metadataMin["default"]);
    }).to["throw"]('must consist of a "+"');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]('+7', _metadataMin["default"]);
    }).to["throw"]('too short');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]('+7800');
    }).to["throw"]('`metadata` argument not passed');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"](1234567890);
    }).to["throw"]('must be a string');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]('+1', 1234567890);
    }).to["throw"]('must be a string');
  });
  (0, _mocha.it)('should validate constructor arguments (private constructor)', function () {
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"](undefined, '800', _metadataMin["default"]);
    }).to["throw"]('First argument is required');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]('7', undefined, _metadataMin["default"]);
    }).to["throw"]('`nationalNumber` argument is required');
    (0, _chai.expect)(function () {
      return new _PhoneNumber["default"]('7', '8005553535');
    }).to["throw"]('`metadata` argument not passed');
  });
  (0, _mocha.it)('should accept country code argument', function () {
    var phoneNumber = new _PhoneNumber["default"]('RU', '8005553535', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.countryCallingCode).to.equal('7');
    (0, _chai.expect)(phoneNumber.country).to.equal('RU');
    (0, _chai.expect)(phoneNumber.number).to.equal('+78005553535');
  });
  (0, _mocha.it)('should format number with options', function () {
    var phoneNumber = new _PhoneNumber["default"]('7', '8005553535', _metadataMin["default"]);
    phoneNumber.ext = '123';
    (0, _chai.expect)(phoneNumber.format('NATIONAL', {
      formatExtension: function formatExtension(number, extension) {
        return "".concat(number, " \u0434\u043E\u0431. ").concat(extension);
      }
    })).to.equal('8 (800) 555-35-35 доб. 123');
  });
  (0, _mocha.it)('should compare phone numbers', function () {
    (0, _chai.expect)(new _PhoneNumber["default"]('RU', '8005553535', _metadataMin["default"]).isEqual(new _PhoneNumber["default"]('RU', '8005553535', _metadataMin["default"]))).to.equal(true);
    (0, _chai.expect)(new _PhoneNumber["default"]('RU', '8005553535', _metadataMin["default"]).isEqual(new _PhoneNumber["default"]('7', '8005553535', _metadataMin["default"]))).to.equal(true);
    (0, _chai.expect)(new _PhoneNumber["default"]('RU', '8005553535', _metadataMin["default"]).isEqual(new _PhoneNumber["default"]('RU', '8005553536', _metadataMin["default"]))).to.equal(false);
  });
  (0, _mocha.it)('should tell if a number is non-geographic', function () {
    (0, _chai.expect)(new _PhoneNumber["default"]('7', '8005553535', _metadataMin["default"]).isNonGeographic()).to.equal(false);
    (0, _chai.expect)(new _PhoneNumber["default"]('870', '773111632', _metadataMin["default"]).isNonGeographic()).to.equal(true);
  });
  (0, _mocha.it)('should allow setting extension', function () {
    var phoneNumber = new _PhoneNumber["default"]('1', '2133734253', _metadataMin["default"]);
    phoneNumber.setExt('1234');
    (0, _chai.expect)(phoneNumber.ext).to.equal('1234');
    (0, _chai.expect)(phoneNumber.formatNational()).to.equal('(213) 373-4253 ext. 1234');
  });
  (0, _mocha.it)('should return possible countries', function () {
    // "599": [
    //    "CW", //  "possible_lengths": [7, 8]
    //    "BQ" //  "possible_lengths": [7]
    // ]

    var phoneNumber = new _PhoneNumber["default"]('599', '123456', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal([]);
    phoneNumber = new _PhoneNumber["default"]('599', '1234567', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal(['CW', 'BQ']);
    phoneNumber = new _PhoneNumber["default"]('599', '12345678', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal(['CW']);
    phoneNumber = new _PhoneNumber["default"]('599', '123456789', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal([]);
  });
  (0, _mocha.it)('should return possible countries in case of ambiguity', function () {
    var phoneNumber = new _PhoneNumber["default"]('1', '2223334444', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries().indexOf('US')).to.equal(0);
    (0, _chai.expect)(phoneNumber.getPossibleCountries().length).to.equal(25);
  });

  // it('should return empty possible countries when no national number has been input', () => {
  // 	const phoneNumber = new PhoneNumber('1', '', metadata)
  // 	expect(phoneNumber.country).toBe.undefined
  // 	phoneNumber.getPossibleCountries().should.deep.equal([])
  // })

  (0, _mocha.it)('should return empty possible countries when not enough national number digits have been input', function () {
    var phoneNumber = new _PhoneNumber["default"]('1', '222', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal([]);
  });
  (0, _mocha.it)('should return possible countries in case of no ambiguity', function () {
    var phoneNumber = new _PhoneNumber["default"]('US', '2133734253', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.equal('US');
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal(['US']);
  });
  (0, _mocha.it)('should return empty possible countries in case of an unknown calling code', function () {
    var phoneNumber = new _PhoneNumber["default"]('777', '123', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.country).to.be.undefined;
    (0, _chai.expect)(phoneNumber.getPossibleCountries()).to.deep.equal([]);
  });
  (0, _mocha.it)('should determine phone number type', function () {
    var phoneNumber = new _PhoneNumber["default"]('US', '2015550000', _metadataMin["default"]);
    (0, _chai.expect)(phoneNumber.getType()).to.equal('FIXED_LINE_OR_MOBILE');
  });

  // it('should validate phone number length', () => {
  // 	const phoneNumber = new PhoneNumber('RU', '800', metadata)
  // 	expect(phoneNumber.validateLength()).to.equal('TOO_SHORT')
  //
  // 	const phoneNumberValid = new PhoneNumber('RU', '8005553535', metadata)
  // 	expect(phoneNumberValid.validateLength()).toBe.undefined
  // })
});
//# sourceMappingURL=PhoneNumber.test.js.map