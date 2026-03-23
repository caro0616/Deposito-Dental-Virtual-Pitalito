"use strict";

var _mocha = require("mocha");
var _chai = require("chai");
var _RFC = require("./RFC3966.js");
(0, _mocha.describe)('RFC3966', function () {
  (0, _mocha.it)('should format', function () {
    (0, _chai.expect)(function () {
      return (0, _RFC.formatRFC3966)({
        number: '123'
      });
    }).to["throw"]('expects "number" to be in E.164 format');
    (0, _chai.expect)((0, _RFC.formatRFC3966)({})).to.equal('');
    (0, _chai.expect)((0, _RFC.formatRFC3966)({
      number: '+78005553535'
    })).to.equal('tel:+78005553535');
    (0, _chai.expect)((0, _RFC.formatRFC3966)({
      number: '+78005553535',
      ext: '123'
    })).to.equal('tel:+78005553535;ext=123');
  });
  (0, _mocha.it)('should parse', function () {
    (0, _chai.expect)((0, _RFC.parseRFC3966)('tel:+78005553535')).to.deep.equal({
      number: '+78005553535'
    });
    (0, _chai.expect)((0, _RFC.parseRFC3966)('tel:+78005553535;ext=123')).to.deep.equal({
      number: '+78005553535',
      ext: '123'
    });

    // With `phone-context`
    (0, _chai.expect)((0, _RFC.parseRFC3966)('tel:8005553535;ext=123;phone-context=+7')).to.deep.equal({
      number: '+78005553535',
      ext: '123'
    });

    // "Domain contexts" are ignored
    (0, _chai.expect)((0, _RFC.parseRFC3966)('tel:8005553535;ext=123;phone-context=www.leningrad.spb.ru')).to.deep.equal({
      number: '8005553535',
      ext: '123'
    });

    // Not a viable phone number.
    (0, _chai.expect)((0, _RFC.parseRFC3966)('tel:3')).to.deep.equal({});
  });
});
//# sourceMappingURL=RFC3966.test.js.map