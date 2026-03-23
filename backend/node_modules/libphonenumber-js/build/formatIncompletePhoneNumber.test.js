"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _formatIncompletePhoneNumber = _interopRequireDefault(require("./formatIncompletePhoneNumber.js"));
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('formatIncompletePhoneNumber', function () {
  (0, _mocha.it)('should format parsed input value', function () {
    var result;

    // National input.
    (0, _chai.expect)((0, _formatIncompletePhoneNumber["default"])('880055535', 'RU', _metadataMin["default"])).to.equal('8 (800) 555-35');

    // International input, no country.
    (0, _chai.expect)((0, _formatIncompletePhoneNumber["default"])('+780055535', null, _metadataMin["default"])).to.equal('+7 800 555 35');

    // International input, no country argument.
    (0, _chai.expect)((0, _formatIncompletePhoneNumber["default"])('+780055535', _metadataMin["default"])).to.equal('+7 800 555 35');

    // International input, with country.
    (0, _chai.expect)((0, _formatIncompletePhoneNumber["default"])('+780055535', 'RU', _metadataMin["default"])).to.equal('+7 800 555 35');
  });
  (0, _mocha.it)('should support an object argument', function () {
    (0, _chai.expect)((0, _formatIncompletePhoneNumber["default"])('880055535', {
      defaultCountry: 'RU'
    }, _metadataMin["default"])).to.equal('8 (800) 555-35');
    (0, _chai.expect)((0, _formatIncompletePhoneNumber["default"])('880055535', {
      defaultCallingCode: '7'
    }, _metadataMin["default"])).to.equal('8 (800) 555-35');
  });
});
//# sourceMappingURL=formatIncompletePhoneNumber.test.js.map