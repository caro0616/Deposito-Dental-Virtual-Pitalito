"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _AsYouTypeFormatterPatternMatcher = _interopRequireDefault(require("./AsYouTypeFormatter.PatternMatcher.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
(0, _mocha.describe)('AsYouTypeFormatter.PatternMatcher', function () {
  (0, _mocha.it)('should throw when no pattern is passed', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]();
    }).to["throw"]('Pattern is required');
  });
  (0, _mocha.it)('should throw when no string is passed', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('1');
    (0, _chai.expect)(function () {
      return matcher.match();
    }).to["throw"]('String is required');
  });
  (0, _mocha.it)('should throw on illegal characters', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('4(5|6)7');
    }).to["throw"]('Illegal characters');
  });
  (0, _mocha.it)('should throw on an illegal ] operator', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('4]7');
    }).to["throw"]('"]" operator must be preceded by "[" operator');
  });
  (0, _mocha.it)('should throw on an illegal - operator in a one-of set', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('[-5]');
    }).to["throw"]('Couldn\'t parse a one-of set pattern: -5');
  });
  (0, _mocha.it)('should throw on a non-finalized context', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('4(?:5|7');
    }).to["throw"]('Non-finalized contexts left when pattern parse ended');
  });
  (0, _mocha.it)('should throw on an illegal (|) operator', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('4(?:5|)7');
    }).to["throw"]('No instructions found after "|" operator in an "or" group');
  });
  (0, _mocha.it)('should throw on an illegal ) operator', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('4[56)]7');
    }).to["throw"]('")" operator must be preceded by "(?:" operator');
  });
  (0, _mocha.it)('should throw on an illegal | operator', function () {
    (0, _chai.expect)(function () {
      return new _AsYouTypeFormatterPatternMatcher["default"]('4[5|6]7');
    }).to["throw"]('operator can only be used inside "or" groups');
  });
  (0, _mocha.it)('should match a one-digit pattern', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('4');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('44')).to.be.undefined;
    (0, _chai.expect)(matcher.match('44', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a two-digit pattern', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('44');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('44')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('444')).to.be.undefined;
    (0, _chai.expect)(matcher.match('444', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
    (0, _chai.expect)(matcher.match('55')).to.be.undefined;
  });
  (0, _mocha.it)('should match a one-digit one-of set (single digit)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[4]');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('44')).to.be.undefined;
    (0, _chai.expect)(matcher.match('44', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a one-digit one-of set (multiple digits)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[479]');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('44')).to.be.undefined;
    (0, _chai.expect)(matcher.match('44', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a one-digit one-of set using a dash notation (not inclusive)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[2-5]');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('44')).to.be.undefined;
    (0, _chai.expect)(matcher.match('44', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a one-digit one-of set using a dash notation (inclusive)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[3-4]');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('44')).to.be.undefined;
    (0, _chai.expect)(matcher.match('44', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a one-digit one-of set including a dash notation', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[124-68]');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('2')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('3')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('5')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('6')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('7')).to.be.undefined;
    (0, _chai.expect)(matcher.match('8')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('9')).to.be.undefined;
    (0, _chai.expect)(matcher.match('88')).to.be.undefined;
    (0, _chai.expect)(matcher.match('88', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a two-digit one-of set', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[479][45]');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('5')).to.be.undefined;
    (0, _chai.expect)(matcher.match('55')).to.be.undefined;
    (0, _chai.expect)(matcher.match('44')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('444')).to.be.undefined;
    (0, _chai.expect)(matcher.match('444', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match a two-digit one-of set (regular digit and a one-of set)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('1[45]');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('15')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('16')).to.be.undefined;
  });
  (0, _mocha.it)('should match a pattern with an or group', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('7(?:1[0-68]|2[1-9])');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('7')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('71')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('73')).to.be.undefined;
    (0, _chai.expect)(matcher.match('711')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('717')).to.be.undefined;
    (0, _chai.expect)(matcher.match('720')).to.be.undefined;
    (0, _chai.expect)(matcher.match('722')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('7222')).to.be.undefined;
    (0, _chai.expect)(matcher.match('7222', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match an or pattern containing or groups', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9])');
    (0, _chai.expect)(matcher.match('1')).to.be.undefined;
    (0, _chai.expect)(matcher.match('2')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('3')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('4')).to.be.undefined;
    (0, _chai.expect)(matcher.match('21')).to.be.undefined;
    (0, _chai.expect)(matcher.match('22')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('221')).to.be.undefined;
    (0, _chai.expect)(matcher.match('222')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('2222')).to.be.undefined;
    (0, _chai.expect)(matcher.match('2222', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
    (0, _chai.expect)(matcher.match('3')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('33')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('332')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('333')).to.be.undefined;
  });
  (0, _mocha.it)('should match an or pattern', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('6|8');
    (0, _chai.expect)(matcher.match('5')).to.be.undefined;
    (0, _chai.expect)(matcher.match('6')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('7')).to.be.undefined;
    (0, _chai.expect)(matcher.match('8')).to.deep.equal({
      match: true
    });
  });
  (0, _mocha.it)('should match an or pattern (one-of sets)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[123]|[5-8]');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('2')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('3')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('4')).to.be.undefined;
    (0, _chai.expect)(matcher.match('5')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('6')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('7')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('8')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('9')).to.be.undefined;
    (0, _chai.expect)(matcher.match('18')).to.be.undefined;
    (0, _chai.expect)(matcher.match('18', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
  });
  (0, _mocha.it)('should match an or pattern (different lengths)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('60|8');
    (0, _chai.expect)(matcher.match('5')).to.be.undefined;
    (0, _chai.expect)(matcher.match('6')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('60')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('61')).to.be.undefined;
    (0, _chai.expect)(matcher.match('7')).to.be.undefined;
    (0, _chai.expect)(matcher.match('8')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('68')).to.be.undefined;
  });
  (0, _mocha.it)('should match an or pattern (one-of sets) (different lengths)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[123]|[5-8][2-8]');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
  });
  (0, _mocha.it)('should match an or pattern (one-of sets and regular digits) (different lengths)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[2358][2-5]|4');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
    (0, _chai.expect)(matcher.match('2')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('21')).to.be.undefined;
    (0, _chai.expect)(matcher.match('22')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('25')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('26')).to.be.undefined;
    (0, _chai.expect)(matcher.match('222')).to.be.undefined;
    (0, _chai.expect)(matcher.match('222', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
    (0, _chai.expect)(matcher.match('3')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('6')).to.be.undefined;
  });
  (0, _mocha.it)('should match an or pattern (one-of sets and regular digits mixed) (different lengths)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('[2358]2|4');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
    (0, _chai.expect)(matcher.match('2')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('21')).to.be.undefined;
    (0, _chai.expect)(matcher.match('22')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('222')).to.be.undefined;
    (0, _chai.expect)(matcher.match('222', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
    (0, _chai.expect)(matcher.match('3')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('6')).to.be.undefined;
  });
  (0, _mocha.it)('should match an or pattern (one-of sets groups and regular digits mixed) (different lengths)', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('1(?:11|[2-9])');
    (0, _chai.expect)(matcher.match('1')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('10')).to.be.undefined;
    (0, _chai.expect)(matcher.match('11')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('111')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('1111')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1111', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
    (0, _chai.expect)(matcher.match('12')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('122')).to.be.undefined;
    (0, _chai.expect)(matcher.match('19')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('5')).to.be.undefined;
  });
  (0, _mocha.it)('should match nested or groups', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('1(?:2(?:3(?:4|5)|6)|7(?:8|9))0');
    (0, _chai.expect)(matcher.match('1')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('2')).to.be.undefined;
    (0, _chai.expect)(matcher.match('11')).to.be.undefined;
    (0, _chai.expect)(matcher.match('12')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('121')).to.be.undefined;
    (0, _chai.expect)(matcher.match('123')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('1231')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1234')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('12340')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('123401')).to.be.undefined;
    (0, _chai.expect)(matcher.match('123401', {
      allowOverflow: true
    })).to.deep.equal({
      overflow: true
    });
    (0, _chai.expect)(matcher.match('12350')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('12360')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1260')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('1270')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1770')).to.be.undefined;
    (0, _chai.expect)(matcher.match('1780')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('1790')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('18')).to.be.undefined;
  });
  (0, _mocha.it)('should match complex patterns', function () {
    var matcher = new _AsYouTypeFormatterPatternMatcher["default"]('(?:31|4)6|51|6(?:5[0-3579]|[6-9])|7(?:20|32|8)|[89]');
    (0, _chai.expect)(matcher.match('0')).to.be.undefined;
    (0, _chai.expect)(matcher.match('3')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('31')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('32')).to.be.undefined;
    (0, _chai.expect)(matcher.match('316')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('315')).to.be.undefined;
    (0, _chai.expect)(matcher.match('4')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('46')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('47')).to.be.undefined;
    (0, _chai.expect)(matcher.match('5')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('50')).to.be.undefined;
    (0, _chai.expect)(matcher.match('51')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('6')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('64')).to.be.undefined;
    (0, _chai.expect)(matcher.match('65')).to.deep.equal({
      partialMatch: true
    });
    (0, _chai.expect)(matcher.match('650')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('654')).to.be.undefined;
    (0, _chai.expect)(matcher.match('69')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('8')).to.deep.equal({
      match: true
    });
    (0, _chai.expect)(matcher.match('9')).to.deep.equal({
      match: true
    });
  });
  (0, _mocha.it)('shouldn\'t match things that shouldn\'t match', function () {
    // There was a bug: "leading digits" `"2"` matched "leading digits pattern" `"90"`.
    // The incorrect `.match()` function result was `{ oveflow: true }`
    // while it should've been `undefined`.
    // https://gitlab.com/catamphetamine/libphonenumber-js/-/issues/66
    (0, _chai.expect)(new _AsYouTypeFormatterPatternMatcher["default"]('2').match('90', {
      allowOverflow: true
    })).to.be.undefined;
  });
});
//# sourceMappingURL=AsYouTypeFormatter.PatternMatcher.test.js.map