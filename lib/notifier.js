'use babel';

export default class Notifier {
  static downloadStarted() {
    atom.notifications.addInfo("Downloading latest version of atom");
  }

  static downloadComplete() {
    atom.notifications.addSuccess("Download complete");
  }

  static downloadError() {
    atom.notifications.addError("Download failed");
  }

  static updateAvailable() {
    atom.notifications.addInfo("New update available");
  }

  static updateCheckFailed() {
    atom.notifications.addError("Checking for updates failed");
  }
}
