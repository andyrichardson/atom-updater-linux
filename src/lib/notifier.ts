import { Notification, NotificationOptions } from 'atom';

export const downloadStarted = () => {
  const opts = {
    detail: 'Downloading the latest version of Atom.',
  };
  atom.notifications.addInfo('Downloading update', opts);
};

export const downloadComplete = (installClick: () => any) => {
  let notification: Notification;

  const opts: NotificationOptions = {
    buttons: [
      {
        onDidClick: () => {
          notification.dismiss();
          installClick();
        },
        text: 'Install update',
      },
    ],
    detail: 'A new version of Atom has been downloaded. Click below to install.',
    dismissable: true,
  };

  notification = atom.notifications.addSuccess('Download complete', opts);
};

export const downloadFailed = (err?: string) => {
  const opts = {
    detail: 'Something went wrong when attempting to download the latest version of Atom.',
    dismissable: true,
    stack: err,
  };

  atom.notifications.addError('Download failed', opts);
};

export const exceededApiLimit = () => {
  const opts = {
    detail: 'Unable to check for newer versions on Atom. Your API limit has been exceeded.',
    dismissable: true,
  };

  atom.notifications.addError('Download failed', opts);
};

export const installComplete = () => {
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
};

export const installFailed = (err: string) => {
  const opts = {
    detail: 'Something went wrong while attempting to update atom',
    dismissable: true,
    stack: err,
  };

  atom.notifications.addError('Update failed', opts);
};

export const updateNotAvailable = () => {
  const opts = {
    detail: 'You already have the latest version of Atom.',
  };

  atom.notifications.addSuccess('No updates', opts);
};

export const updateAvailable = (version: string, downloadClick: () => any) => {
  let notification: Notification;

  const opts: NotificationOptions = {
    buttons: [
      {
        onDidClick: () => {
          notification.dismiss();
          downloadClick();
        },
        text: 'Download update',
      },
    ],
    detail: `A new version of Atom ${version} is available.`,
    dismissable: true,
  };

  notification = atom.notifications.addInfo('Update available', opts);
};

export const updateCheckFailed = (msg: string, args?: NotificationOptions) => {
  atom.notifications.addError(msg, args);
};
