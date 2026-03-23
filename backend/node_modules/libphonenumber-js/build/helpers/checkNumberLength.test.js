"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _mocha = require("mocha");
var _chai = require("chai");
var _metadata2 = _interopRequireDefault(require("../metadata.js"));
var _metadataMax = _interopRequireDefault(require("../../metadata.max.json"));
var _metadataMin = _interopRequireDefault(require("../../test/metadata/1.0.0/metadata.min.json"));
var _checkNumberLength = _interopRequireWildcard(require("./checkNumberLength.js"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('checkNumberLength', function () {
  (0, _mocha.it)('should check phone number length', function () {
    // Too short.
    (0, _chai.expect)(checkNumberLengthWithCountry('800555353', 'RU', 'FIXED_LINE')).to.equal('TOO_SHORT');
    // Normal.
    (0, _chai.expect)(checkNumberLengthWithCountry('8005553535', 'RU', 'FIXED_LINE')).to.equal('IS_POSSIBLE');
    // Too long.
    (0, _chai.expect)(checkNumberLengthWithCountry('80055535355', 'RU', 'FIXED_LINE')).to.equal('TOO_LONG');

    // No such type.
    (0, _chai.expect)(checkNumberLengthWithCountry('169454850', 'AC', 'VOIP')).to.equal('INVALID_LENGTH');
    // No such possible length.
    (0, _chai.expect)(checkNumberLengthWithCountry('1694548', 'AD', undefined)).to.equal('INVALID_LENGTH');

    // FIXED_LINE_OR_MOBILE
    (0, _chai.expect)(checkNumberLengthWithCountry('1694548', 'AD', 'FIXED_LINE_OR_MOBILE')).to.equal('INVALID_LENGTH');
    // No mobile phones.
    (0, _chai.expect)(checkNumberLengthWithCountry('8123', 'TA', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE');
    // No "possible lengths" for "mobile".
    (0, _chai.expect)(checkNumberLengthWithCountry('81234567', 'SZ', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE');
  });
  (0, _mocha.it)('should check phone number length (no `country` specified)', function () {
    // Too short.
    (0, _chai.expect)(checkNumberLengthWithoutCountry('800555353', 'RU', 'FIXED_LINE')).to.equal('TOO_SHORT');
    // Normal.
    (0, _chai.expect)(checkNumberLengthWithoutCountry('8005553535', 'RU', 'FIXED_LINE')).to.equal('IS_POSSIBLE');
    // Too long.
    (0, _chai.expect)(checkNumberLengthWithoutCountry('80055535355', 'RU', 'FIXED_LINE')).to.equal('TOO_LONG');

    // No such type.
    (0, _chai.expect)(checkNumberLengthWithoutCountry('169454850', 'AC', 'VOIP')).to.equal('INVALID_LENGTH');
    // No such possible length.
    (0, _chai.expect)(checkNumberLengthWithoutCountry('1694548', 'AD', undefined)).to.equal('INVALID_LENGTH');

    // FIXED_LINE_OR_MOBILE
    (0, _chai.expect)(checkNumberLengthWithoutCountry('1694548', 'AD', 'FIXED_LINE_OR_MOBILE')).to.equal('INVALID_LENGTH');
    // No mobile phones.
    (0, _chai.expect)(checkNumberLengthWithoutCountry('8123', 'TA', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE');
    // No "possible lengths" for "mobile".
    (0, _chai.expect)(checkNumberLengthWithoutCountry('81234567', 'SZ', 'FIXED_LINE_OR_MOBILE')).to.equal('IS_POSSIBLE');
  });
  (0, _mocha.it)('should work for old metadata', function () {
    var _oldMetadata = new _metadata2["default"](_metadataMin["default"]);
    _oldMetadata.country('RU');
    (0, _chai.expect)((0, _checkNumberLength.checkNumberLengthForType)('8005553535', 'RU', 'FIXED_LINE', _oldMetadata)).to.equal('IS_POSSIBLE');
  });
  (0, _mocha.it)('should work for old metadata (no `country` specified)', function () {
    var _oldMetadata = new _metadata2["default"](_metadataMin["default"]);
    _oldMetadata.country('RU');
    (0, _chai.expect)((0, _checkNumberLength.checkNumberLengthForType)('8005553535', undefined, 'FIXED_LINE', _oldMetadata)).to.equal('IS_POSSIBLE');
  });
  (0, _mocha.it)('should handle the cases when multiple countries share the same country calling code and a phone number is possible in non-"main" country and is not possible in the "main" country', function () {
    var _metadata = new _metadata2["default"](_metadataMax["default"]);
    _metadata.country('US');
    (0, _chai.expect)((0, _checkNumberLength["default"])('3100000', undefined, _metadata)).to.equal('TOO_SHORT');
    (0, _chai.expect)((0, _checkNumberLength["default"])('3100000', 'US', _metadata)).to.equal('TOO_SHORT');
    (0, _chai.expect)((0, _checkNumberLength["default"])('3100000', 'CA', _metadata)).to.equal('IS_POSSIBLE');
  });
});
function checkNumberLengthWithCountry(number, country, type) {
  var _metadata = new _metadata2["default"](_metadataMax["default"]);
  _metadata.country(country);
  return (0, _checkNumberLength.checkNumberLengthForType)(number, country, type, _metadata);
}
function checkNumberLengthWithoutCountry(number, country, type) {
  var _metadata = new _metadata2["default"](_metadataMax["default"]);
  _metadata.country(country);
  return (0, _checkNumberLength.checkNumberLengthForType)(number, undefined, type, _metadata);
}
//# sourceMappingURL=checkNumberLength.test.js.map