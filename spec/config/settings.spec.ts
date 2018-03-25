import { expect } from 'chai';
import Settings from '../../src/config/settings';

it('should export an object', () => {
  expect(Settings).to.be.an('object');
});

it('should assign values to enumerations', () => {
  expect(Settings.config.packageType.enum[0].value).to.be.an('string');
});
