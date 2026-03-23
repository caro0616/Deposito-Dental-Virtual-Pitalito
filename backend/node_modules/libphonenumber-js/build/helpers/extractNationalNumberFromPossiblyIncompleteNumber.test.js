"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadata = _interopRequireDefault(require("../metadata.js"));
var _metadataMin = _interopRequireDefault(require("../../metadata.min.json"));
var _extractNationalNumberFromPossiblyIncompleteNumber = _interopRequireDefault(require("./extractNationalNumberFromPossiblyIncompleteNumber.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('extractNationalNumberFromPossiblyIncompleteNumber', function () {
  (0, _mocha.it)('should parse a carrier code when there is no national prefix transform rule', function () {
    var meta = new _metadata["default"](_metadataMin["default"]);
    meta.country('AU');
    (0, _chai.expect)((0, _extractNationalNumberFromPossiblyIncompleteNumber["default"])('18311800123', meta)).to.deep.equal({
      nationalPrefix: undefined,
      carrierCode: '1831',
      nationalNumber: '1800123'
    });
  });
});
//# sourceMappingURL=extractNationalNumberFromPossiblyIncompleteNumber.test.js.map