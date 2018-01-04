'use babel';

export default class Notifier {
  constructor(updater) {
    this.updater = updater;
  }

  downloadStarted() {
    const opts = {
      detail: 'Downloading the latest version of Atom.',
    };
    atom.notifications.addInfo('Downloading update', opts);
  }

  downloadComplete() {
    let notification;
    const opts = {
      dismissable: true,
      detail: 'A new version of Atom has been downloaded. Click below to install.',
      buttons: [
        {
          text: 'Install update',
          onDidClick: () => {
            notification.dismiss();
            this.updater.install();
          },
        },
      ],
    };

    notification = atom.notifications.addSuccess('Download complete', opts);
  }

  downloadFailed(err) {
    const opts = {
      dismissable: true,
      detail: 'Something went wrong when attempting to download the latest version of Atom.',
      stack: err,
    };
    atom.notifications.addError('Download failed', opts);
  }

  installComplete() {
    const opts = {
      dismissable: true,
      detail: 'Atom has successfully updated',
      buttons: [
        {
          text: 'Restart Atom',
          onDidClick: () => atom.reload(),
        },
      ],
    };
    atom.notifications.addSuccess('Update complete', opts);
  }

  installFailed(err) {
    const opts = {
      dismissable: true,
      detail: 'Something went wrong while attempting to update atom',
      stack: err,
    };
    atom.notifications.addError('Update failed', opts);
  }

  updateNotAvailable() {
    const opts = {
      detail: 'You already have the latest version of Atom.',
    };
    atom.notifications.addSuccess('No updates', opts);
  }

  updateAvailable(version) {
    let notification;
    const opts = {
      dismissable: true,
      detail: `A new version of Atom ${version} is available.`,
      buttons: [
        {
          text: 'Download update',
          onDidClick: () => {
            notification.dismiss();
            this.updater.download();
          },
        },
      ],
    };

    notification = atom.notifications.addInfo('Update available', opts);
  }

  updateCheckFailed() {
    atom.notifications.addError('Checking for updates failed');
  }
}
