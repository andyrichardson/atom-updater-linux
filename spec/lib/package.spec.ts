// jest.mock('atom', () => ({ AtomEnvironment: '', CompositeDisposable: ''}))
import { expect } from 'chai';
import Package from '../../src/lib/package';

it('should construct', () => {
  expect(new Package()).to.not.throw();
});

let pkg;

beforeEach(() => {
  pkg = new Package();
});

it('should have an activate method', () => {
  expect(pkg.activate).to.be.an('function');
});

it('should have an addSubscriptions method', () => {
  expect(pkg.addSubscriptions).to.be.an('function');
});
