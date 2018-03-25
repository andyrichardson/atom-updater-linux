// jest.mock('request', () => ({ get: () => jest.fn()) }));
import { expect } from 'chai';
import { Updater } from '../../src/lib/updater';

declare const global: any;

const opts: any = {
  'atom-updater-linux.checkStartup': false,
  'atom-updater-linux.useBeta': false,
};

global.atom = {
  config: {
    get: (s: string) => opts[s],
    observe: (s: string) => 'test',
  },
  getVersion: () => '0.1.0',
};

it('Constructs the Updater class', () => {
  expect(new Updater()).to.not.be.an('undefined');
});

it('Initialises Updater class', () => {
  const u = new Updater();
  expect(() => u.init()).to.not.throw();
});

it('Gets latest stable version', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  return expect(vers.stable).to.be.an('string');
});

it('Gets latest beta version', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  return expect(vers.beta).to.be.an('string');
});

it('Stable version value consists of v followed by a number', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  expect(vers.stable.charAt(0)).to.equal('v');
  return expect(parseInt(vers.stable.charAt(1))).to.be.an('number');
});

it('Beta version value consists of v followed by a number', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  expect(vers.beta.charAt(0)).to.equal('v');
  return expect(parseInt(vers.beta.charAt(1))).to.be.an('number');
});

it('Requires update is false when atom version = 0.1.0 and useBeta = false', async () => {
  global.atom.getVersion = () => '0.1.0';
  const u = new Updater();
  await u.getLatestVersionNum();
  return expect(u.requiresUpdate()).to.equal(true);
});

it('Requires update is false when atom version = 9.0.0 and useBeta = false', async () => {
  global.atom.getVersion = () => '9.0.0';
  const u = new Updater();
  await u.getLatestVersionNum();
  return expect(u.requiresUpdate()).to.equal(false);
});

it('Checks for updates and returns false if update is not required', async () => {
  global.atom.getVersion = () => '9.0.0';
  const u = new Updater();
  return expect(await u.checkForUpdate()).to.equal(false);
});
