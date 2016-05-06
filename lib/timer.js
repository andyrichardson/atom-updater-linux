'use babel';

export class Timer {
  constructor(fn, initFn, stopFn, interval) {
    this.fn = fn;
    this.initFn = initFn;
    this.stopFn = stopFn;
    this.interval = interval;
  }

  _startThread() {
    this.threadId = setTimeout(
      () => {
        this.fn();
        this._startThread();
      },
      this.interval
    );
  }

  start() {
    if(this.initFn) this.initFn();
    this._startThread();
  }

  stop() {
    if(this.initFn) this.stopFn();
    clearTimeout(this.threadId);
  }
}
