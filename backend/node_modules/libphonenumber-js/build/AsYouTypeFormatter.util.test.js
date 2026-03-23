"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _AsYouTypeFormatterUtil = require("./AsYouTypeFormatter.util.js");
(0, _mocha.describe)('closeNonPairedParens', function () {
  (0, _mocha.it)('should close non-paired braces', function () {
    (0, _chai.expect)((0, _AsYouTypeFormatterUtil.closeNonPairedParens)('(000) 123-45 (9  )', 15)).to.equal('(000) 123-45 (9  )');
  });
});
(0, _mocha.describe)('stripNonPairedParens', function () {
  (0, _mocha.it)('should strip non-paired braces', function () {
    (0, _chai.expect)((0, _AsYouTypeFormatterUtil.stripNonPairedParens)('(000) 123-45 (9')).to.equal('(000) 123-45 9');
    (0, _chai.expect)((0, _AsYouTypeFormatterUtil.stripNonPairedParens)('(000) 123-45 (9)')).to.equal('(000) 123-45 (9)');
  });
});
(0, _mocha.describe)('repeat', function () {
  (0, _mocha.it)('should repeat string N times', function () {
    (0, _chai.expect)((0, _AsYouTypeFormatterUtil.repeat)('a', 0)).to.equal('');
    (0, _chai.expect)((0, _AsYouTypeFormatterUtil.repeat)('a', 3)).to.equal('aaa');
    (0, _chai.expect)((0, _AsYouTypeFormatterUtil.repeat)('a', 4)).to.equal('aaaa');
  });
});
//# sourceMappingURL=AsYouTypeFormatter.util.test.js.map