import { AtomEnvironment, CompositeDisposable } from 'atom';
import { Updater } from './updater';

declare const atom: AtomEnvironment;

export default class Package {
  private subscriptions: CompositeDisposable | undefined;
  private updater: Updater | undefined;

  public activate(): void {
    this.updater = new Updater();
    this.subscriptions = new CompositeDisposable();

    this.updater.init();
    this.addSubscriptions();
  }

  public addSubscriptions(): void {
    if (this.updater === undefined || this.subscriptions === undefined) {
      throw Error('Add subscriptions called before activate');
    }

    this.subscriptions.add(
      // @ts-ignore: Invalid argument type
      atom.commands.add('atom-workspace', { 'atom-updater-linux:check': () => this.updater.checkForUpdate(true) }),
    );
  }
}
