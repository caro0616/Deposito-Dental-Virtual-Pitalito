"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
var _metadataMin2 = _interopRequireDefault(require("../test/metadata/1.0.0/metadata.min.json"));
var _metadataMin3 = _interopRequireDefault(require("../test/metadata/1.1.11/metadata.min.json"));
var _metadataMin4 = _interopRequireDefault(require("../test/metadata/1.7.34/metadata.min.json"));
var _metadataMin5 = _interopRequireDefault(require("../test/metadata/1.7.37/metadata.min.json"));
var _metadata = _interopRequireWildcard(require("./metadata.js"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
(0, _mocha.describe)('metadata', function () {
  (0, _mocha.it)('should return undefined for non-defined types', function () {
    var FR = new _metadata["default"](_metadataMin["default"]).country('FR');
    (0, _chai.expect)(type(FR.type('FIXED_LINE'))).to.equal('undefined');
  });
  (0, _mocha.it)('should validate country', function () {
    var thrower = function thrower() {
      return new _metadata["default"](_metadataMin["default"]).country('RUS');
    };
    (0, _chai.expect)(thrower).to["throw"]('Unknown country');
  });
  (0, _mocha.it)('should tell if a country is supported', function () {
    (0, _chai.expect)((0, _metadata.isSupportedCountry)('RU', _metadataMin["default"])).to.equal(true);
    (0, _chai.expect)((0, _metadata.isSupportedCountry)('XX', _metadataMin["default"])).to.equal(false);
  });
  (0, _mocha.it)('should return ext prefix for a country', function () {
    (0, _chai.expect)((0, _metadata.getExtPrefix)('US', _metadataMin["default"])).to.equal(' ext. ');
    (0, _chai.expect)((0, _metadata.getExtPrefix)('CA', _metadataMin["default"])).to.equal(' ext. ');
    (0, _chai.expect)((0, _metadata.getExtPrefix)('GB', _metadataMin["default"])).to.equal(' x');
    // expect(getExtPrefix('XX', metadata)).to.equal(undefined)
    (0, _chai.expect)((0, _metadata.getExtPrefix)('XX', _metadataMin["default"])).to.equal(' ext. ');
  });
  (0, _mocha.it)('should cover non-occuring edge cases', function () {
    new _metadata["default"](_metadataMin["default"]).getNumberingPlanMetadata('999');
  });
  (0, _mocha.it)('should support deprecated methods', function () {
    (0, _chai.expect)(new _metadata["default"](_metadataMin["default"]).country('US').nationalPrefixForParsing()).to.equal('1');
    (0, _chai.expect)(new _metadata["default"](_metadataMin["default"]).chooseCountryByCountryCallingCode('1').nationalPrefixForParsing()).to.equal('1');
  });
  (0, _mocha.it)('should tell if a national prefix is mandatory when formatting a national number', function () {
    var meta = new _metadata["default"](_metadataMin["default"]);
    // No "national_prefix_formatting_rule".
    // "national_prefix_is_optional_when_formatting": true
    meta.country('US');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat()).to.equal(false);
    // "national_prefix_formatting_rule": "8 ($1)"
    // "national_prefix_is_optional_when_formatting": true
    meta.country('RU');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat()).to.equal(false);
    // "national_prefix": "0"
    // "national_prefix_formatting_rule": "0 $1"
    meta.country('FR');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat()).to.equal(true);
  });
  (0, _mocha.it)('should validate metadata', function () {
    var thrower = function thrower() {
      return (0, _metadata.validateMetadata)();
    };
    (0, _chai.expect)(thrower).to["throw"]('`metadata` argument not passed');
    thrower = function thrower() {
      return (0, _metadata.validateMetadata)(123);
    };
    (0, _chai.expect)(thrower).to["throw"]('Got a number: 123.');
    thrower = function thrower() {
      return (0, _metadata.validateMetadata)('abc');
    };
    (0, _chai.expect)(thrower).to["throw"]('Got a string: abc.');
    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        a: true,
        b: 2
      });
    };
    (0, _chai.expect)(thrower).to["throw"]('Got an object of shape: { a, b }.');
    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        a: true,
        countries: 2
      });
    };
    (0, _chai.expect)(thrower).to["throw"]('Got an object of shape: { a, countries }.');
    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        country_calling_codes: true,
        countries: 2
      });
    };
    (0, _chai.expect)(thrower).to["throw"]('Got an object of shape');
    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        country_calling_codes: {},
        countries: 2
      });
    };
    (0, _chai.expect)(thrower).to["throw"]('Got an object of shape');
    (0, _metadata.validateMetadata)({
      country_calling_codes: {},
      countries: {},
      b: 3
    });
  });
  (0, _mocha.it)('should work around `nonGeographical` typo in metadata generated from `1.7.35` to `1.7.37`', function () {
    var meta = new _metadata["default"](_metadataMin5["default"]);
    meta.selectNumberingPlan('888');
    (0, _chai.expect)(type(meta.nonGeographic())).to.equal('object');
  });
  (0, _mocha.it)('should work around `nonGeographic` metadata not existing before `1.7.35`', function () {
    var meta = new _metadata["default"](_metadataMin4["default"]);
    (0, _chai.expect)(type(meta.getNumberingPlanMetadata('800'))).to.equal('object');
    (0, _chai.expect)(type(meta.getNumberingPlanMetadata('000'))).to.equal('undefined');
  });
  (0, _mocha.it)('should work with metadata from version `1.1.11`', function () {
    var meta = new _metadata["default"](_metadataMin3["default"]);
    meta.selectNumberingPlan('US');
    (0, _chai.expect)(meta.numberingPlan.possibleLengths()).to.deep.equal([10]);
    (0, _chai.expect)(meta.numberingPlan.formats().length).to.equal(1);
    (0, _chai.expect)(meta.numberingPlan.nationalPrefix()).to.equal('1');
    (0, _chai.expect)(meta.numberingPlan.nationalPrefixForParsing()).to.equal('1');
    (0, _chai.expect)(meta.numberingPlan.type('MOBILE').pattern()).to.equal('');
    meta.selectNumberingPlan('AG');
    (0, _chai.expect)(meta.numberingPlan.leadingDigits()).to.equal('268');
    // Should've been "268$1" but apparently there was a bug in metadata generator
    // and no national prefix transform rules were written.
    (0, _chai.expect)(meta.numberingPlan.nationalPrefixTransformRule()).to.equal(null);
    meta.selectNumberingPlan('AF');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixFormattingRule()).to.equal('0$1');
    meta.selectNumberingPlan('RU');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixIsOptionalWhenFormattingInNationalFormat()).to.equal(true);
  });
  (0, _mocha.it)('should work with metadata from version `1.0.0`', function () {
    var meta = new _metadata["default"](_metadataMin2["default"]);
    meta.selectNumberingPlan('US');
    (0, _chai.expect)(meta.numberingPlan.formats().length).to.equal(1);
    (0, _chai.expect)(meta.numberingPlan.nationalPrefix()).to.equal('1');
    (0, _chai.expect)(meta.numberingPlan.nationalPrefixForParsing()).to.equal('1');
    (0, _chai.expect)(type(meta.numberingPlan.type('MOBILE'))).to.equal('undefined');
    meta.selectNumberingPlan('AG');
    (0, _chai.expect)(meta.numberingPlan.leadingDigits()).to.equal('268');
    // Should've been "268$1" but apparently there was a bug in metadata generator
    // and no national prefix transform rules were written.
    (0, _chai.expect)(meta.numberingPlan.nationalPrefixTransformRule()).to.equal(null);
    meta.selectNumberingPlan('AF');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixFormattingRule()).to.equal('0$1');
    meta.selectNumberingPlan('RU');
    (0, _chai.expect)(meta.numberingPlan.formats()[0].nationalPrefixIsOptionalWhenFormattingInNationalFormat()).to.equal(true);
  });
  (0, _mocha.it)('should work around "ext" data not present in metadata from version `1.0.0`', function () {
    var meta = new _metadata["default"](_metadataMin2["default"]);
    meta.selectNumberingPlan('GB');
    (0, _chai.expect)(meta.ext()).to.equal(' ext. ');
    var metaNew = new _metadata["default"](_metadataMin["default"]);
    metaNew.selectNumberingPlan('GB');
    (0, _chai.expect)(metaNew.ext()).to.equal(' x');
  });
  (0, _mocha.it)('should work around "default IDD prefix" data not present in metadata from version `1.0.0`', function () {
    var meta = new _metadata["default"](_metadataMin2["default"]);
    meta.selectNumberingPlan('AU');
    (0, _chai.expect)(type(meta.defaultIDDPrefix())).to.equal('undefined');
    var metaNew = new _metadata["default"](_metadataMin["default"]);
    metaNew.selectNumberingPlan('AU');
    (0, _chai.expect)(metaNew.defaultIDDPrefix()).to.equal('0011');
  });
});
function type(something) {
  return _typeof(something);
}
//# sourceMappingURL=metadata.test.js.map