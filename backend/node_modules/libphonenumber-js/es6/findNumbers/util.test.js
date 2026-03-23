import { describe, it } from 'mocha';
import { expect } from 'chai';
import { limit, trimAfterFirstMatch, startsWith, endsWith } from './util.js';
describe('findNumbers/util', function () {
  it('should generate regexp limit', function () {
    var thrower = function thrower() {
      return limit(1, 0);
    };
    expect(thrower).to["throw"]();
    thrower = function thrower() {
      return limit(-1, 1);
    };
    expect(thrower).to["throw"]();
    thrower = function thrower() {
      return limit(0, 0);
    };
    expect(thrower).to["throw"]();
  });
  it('should trimAfterFirstMatch', function () {
    expect(trimAfterFirstMatch(/\d/, 'abc123')).to.equal('abc');
    expect(trimAfterFirstMatch(/\d/, 'abc')).to.equal('abc');
  });
  it('should determine if a string starts with a substring', function () {
    expect(startsWith('𐍈123', '𐍈')).to.equal(true);
    expect(startsWith('1𐍈', '𐍈')).to.equal(false);
  });
  it('should determine if a string ends with a substring', function () {
    expect(endsWith('123𐍈', '𐍈')).to.equal(true);
    expect(endsWith('𐍈1', '𐍈')).to.equal(false);
  });
});
//# sourceMappingURL=util.test.js.map