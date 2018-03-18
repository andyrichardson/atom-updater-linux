import { expect } from 'chai';
import Updater from '../lib/update';

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
  getVersion: () => 1.0,
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
  expect(vers.stable).to.be.an('string');
});

it('Gets latest beta version', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  expect(vers.beta).to.be.an('string');
});

it('Stable version value consists of v followed by a number', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  expect(vers.stable.charAt(0)).to.equal('v');
  expect(parseInt(vers.stable.charAt(1))).to.be.an('number');
});

it('Beta version value consists of v followed by a number', async () => {
  const u = new Updater();
  const vers = await u.getLatestVersionNum();
  expect(vers.beta.charAt(0)).to.equal('v');
  expect(parseInt(vers.beta.charAt(1))).to.be.an('number');
});

it('Requires update when atom version = 0.1 and useBeta = false', async () => {
  atom.getVersion = () => 0.1;
  const u = new Updater();
  await u.getLatestVersionNum();
  expect(u.requiresUpdate()).to.equal(true);
})

it('Checks for updates', async () => {
  const u = new Updater();
  expect(await u.checkForUpdate()).to.equal(true);
});
