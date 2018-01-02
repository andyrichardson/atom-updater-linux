'use babel';

import Updater from './update';
let updater;

export default class Package {
  static activate() {
    updater = new Updater();
    updater.init();
  }
}
