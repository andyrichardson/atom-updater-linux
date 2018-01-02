'use babel';

import fs from 'fs';
import request from 'request';
import { exec } from 'child_process';
import Config from './config';
import Notifier from './notifier';

export default class Updater {
  constructor() {
    this.versions = {};
    this.packageType = atom.config.get('atom-updater-linux.general.packageType');
    this.checkStartup = atom.config.get('atom-updater-linux.frequency.checkStartup');
    this.releaseChannel = (atom.config.get('atom-updater-linux.general.useBeta')) ? 'beta' : 'stable';
    this.notifier = new Notifier(this);
  }

  init() {
    if (this.checkStartup) {
      this.checkForUpdate();
    }
  }

  checkForUpdate() {
    return this._getLatestVersionNum()
    .then(() => {
      if(this._requiresUpdate()) {
        return this.notifier.updateAvailable(this.versions[this.releaseChannel]);
      }

      return;
    })
    .catch((err) => {
      return this.notifier.updateCheckFailed();
    })
  }

  download() {
    return this._downloadUpdate()
    .then(() => {
      return this.notifier.downloadComplete();
    })
    .catch((err) => {
      return this.notifier.downloadFailed(err);
    });
  }

  install() {
    const cmd1 = 'export AUTH_PASS=$(zenity --password --title="Atom Installer Authentication")';
    const cmd2 = `echo $AUTH_PASS | sudo -S ${Config.installCmd[this.packageType]} ${Config.downloadFile}`;

    exec(`${cmd1} && ${cmd2}`, (err, data) => {
      if (err) {
        return this.notifier.installFailed(err);
      }

      return this.notifier.installComplete();
    });
  }

  _configWatcher() {

  }

  _downloadUpdate() {
    this.notifier.downloadStarted();

    this.received = 0;

    return new Promise((resolve, reject) => {
      try {
        const req = request(this._getDownloadUrl())
        .pipe(fs.createWriteStream(Config.downloadFile))
        .on('close', () => {resolve()})
        req.on('error', reject);
        req.on('end', resolve);
      } catch (err) {
        return reject(err);
      }
    })
  }

  _getLatestVersionNum() {
    const opts = {
      headers: {
        'User-Agent': 'Atom Updater Linux v1'
      }
    };

    return new Promise((resolve, reject) => {
      const fetch = request.get('https://api.github.com/repos/atom/atom/releases', opts, (err, data) => {
        if (err !== null) {
          return reject(err);
        }

        const response = JSON.parse(data.body);
        let result = {};

        response.some((release) => {
          if (result.beta !== undefined && result.stable !== undefined) {
            return true;
          }

          if (result.stable == undefined && !release.prerelease) {
            result.stable = release.tag_name
          }
          else if (result.beta == undefined && release.prerelease) {
            result.beta = release.tag_name
          }
        });

        this.versions = result;
        return resolve(result);
      });
    });
  }

  _getDownloadUrl() {
    const base = Config.downloadBase;
    const version = this.versions[this.releaseChannel]
    const extension = (this.packageType === 'deb') ? '-amd64.deb' : '.x86_64.rpm';

    return `${base}/${version}/atom${extension}`;
  }

  _requiresUpdate() {
    const current = atom.appVersion;
    const latest = this.versions[this.releaseChannel].substring(1);

    return current < latest;
  }
}
