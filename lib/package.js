'use babel';

import Updater from './update';
import { CompositeDisposable } from 'atom';

export default class Package {
  constructor() {

  }

  activate() {
    this.updater = new Updater()
    this.subscriptions = new CompositeDisposable();

    this.updater.init();
    this.addSubscriptions();
  }

  addSubscriptions() {
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-updater-linux:check': () => this.updater.checkForUpdate(),
    }));
  }
}
