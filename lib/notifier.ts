import { Notification, NotificationOptions } from 'atom';
import Updater from './update';

export default class Notifier {
  private updater: Updater;

  constructor(updater: Updater) {
    this.updater = updater;
  }

  public downloadStarted(): void {
    const opts = {
      detail: 'Downloading the latest version of Atom.',
    };
    atom.notifications.addInfo('Downloading update', opts);
  }

  public downloadComplete(): void {
    let notification: Notification;

    const opts: NotificationOptions = {
      buttons: [
        {
          onDidClick: () => {
            notification.dismiss();
            this.updater.install();
          },
          text: 'Install update',
        },
      ],
      detail: 'A new version of Atom has been downloaded. Click below to install.',
      dismissable: true,
    };

    notification = atom.notifications.addSuccess('Download complete', opts);
  }

  public downloadFailed(err: string): void {
    const opts = {
      detail: 'Something went wrong when attempting to download the latest version of Atom.',
      dismissable: true,
      stack: err,
    };

    atom.notifications.addError('Download failed', opts);
  }

  public exceededApiLimit(): void {
    const opts = {
      detail: 'Unable to check for newer versions on Atom. Your API limit has been exceeded.',
      dismissable: true,
    };

    atom.notifications.addError('Download failed', opts);
  }

  public installComplete(): void {
    const opts = {
      buttons: [
        {
          onDidClick: () => atom.reload(),
          text: 'Restart Atom',
        },
      ],
      detail: 'Atom has successfully updated',
      dismissable: true,
    };
    atom.notifications.addSuccess('Update complete', opts);
  }

  public installFailed(err: string): void {
    const opts = {
      detail: 'Something went wrong while attempting to update atom',
      dismissable: true,
      stack: err,
    };

    atom.notifications.addError('Update failed', opts);
  }

  public updateNotAvailable(): void {
    const opts = {
      detail: 'You already have the latest version of Atom.',
    };

    atom.notifications.addSuccess('No updates', opts);
  }

  public updateAvailable(version: string): void {
    let notification: Notification;

    const opts: NotificationOptions = {
      buttons: [
        {
          onDidClick: () => {
            notification.dismiss();
            this.updater.download();
          },
          text: 'Download update',
        },
      ],
      detail: `A new version of Atom ${version} is available.`,
      dismissable: true,
    };

    notification = atom.notifications.addInfo('Update available', opts);
  }

  public updateCheckFailed(msg: string): void {
    atom.notifications.addError(msg);
  }
}
