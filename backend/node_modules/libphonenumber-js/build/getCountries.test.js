"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));
var _getCountries = _interopRequireDefault(require("./getCountries.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('getCountries', function () {
  (0, _mocha.it)('should get countries list', function () {
    (0, _chai.expect)((0, _getCountries["default"])(_metadataMin["default"]).indexOf('RU') > 0).to.equal(true);
  });
});
//# sourceMappingURL=getCountries.test.js.map