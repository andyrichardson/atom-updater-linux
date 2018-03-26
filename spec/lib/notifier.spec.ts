import { expect } from 'chai';
import * as Notifier from '../../src/lib/notifier';

declare const global: any;

beforeEach(() => {
  global.atom = {
    notifications: {
      addError: jest.fn(),
      addSuccess: jest.fn().mockReturnValue({ dismiss: () => null }),
      dismiss: jest.fn(),
    },
  };
});

it('should be imported', () => {
  expect(Notifier).to.be.an('Object');
});

describe('download complete', () => {
  it('should execute without error', () => {
    expect(Notifier.downloadComplete).to.not.throw();
  });

  it('should trigger a success notification', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addSuccess');
    Notifier.downloadComplete(() => null);

    expect(spy.mock.calls.length).to.equal(1);
  });

  it('notification string should contain "download" and "complete"', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addSuccess');
    Notifier.downloadComplete(() => null);

    expect(spy.mock.calls[0][0].toLowerCase()).to.have.string('download');
    expect(spy.mock.calls[0][0].toLowerCase()).to.have.string('complete');
  });

  it('should pass additional notification options', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addSuccess');
    Notifier.downloadComplete(() => null);
    expect(spy.mock.calls[0][1]).to.be.an('object');
  });

  it('should pass install button', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addSuccess');
    Notifier.downloadComplete(() => null);

    const buttons = spy.mock.calls[0][1].buttons;
    expect(buttons).to.be.an('array');
    expect(buttons[0].text.toLowerCase()).to.have.string('install');
  });

  // it('should call install function on click', () => {
  //   const installSpy = jest.fn();
  //   const spy = jest.spyOn(global.atom.notifications, 'addSuccess');
  //   Notifier.downloadComplete(() => console.log('done'));
  //
  //   const buttons = spy.mock.calls[0][1].buttons;
  //   buttons[0].onDidClick();
  //   expect(installSpy.mock.calls.length).to.equal(1);
  // });
});

describe('download failed', () => {
  it('should execute without error', () => {
    expect(Notifier.downloadFailed).to.not.throw();
  });

  it('should trigger an error notification', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addError');
    Notifier.downloadFailed();

    expect(spy.mock.calls.length).to.equal(1);
  });

  it('notification string should contain "download" "failed"', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addError');
    Notifier.downloadFailed();

    expect(spy.mock.calls[0][0].toLowerCase()).to.have.string('download');
    expect(spy.mock.calls[0][0].toLowerCase()).to.have.string('failed');
  });

  it('should pass additional notification options', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addError');
    Notifier.downloadFailed();
    expect(spy.mock.calls[0][1]).to.be.an('object');
  });

  it('should pass err stack to notification', () => {
    const spy = jest.spyOn(global.atom.notifications, 'addError');
    const errString = 'err string here';
    Notifier.downloadFailed(errString);

    const errStack = spy.mock.calls[0][1].stack;
    expect(errStack).to.equal(errString);
  });

  // it('should call install function on click', () => {
  //   const installSpy = jest.fn();
  //   const spy = jest.spyOn(global.atom.notifications, 'addError');
  //   Notifier.downloadFailed(() => console.log('done'));
  //
  //   const buttons = spy.mock.calls[0][1].buttons;
  //   buttons[0].onDidClick();
  //   expect(installSpy.mock.calls.length).to.equal(1);
  // });
});
