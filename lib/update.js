'use babel';

import fs from 'fs';
import request from 'request';
import Config from './config';
import Notifier from './notifier';

export class Updater {
  constructor() {
    this.versions = {};
    this.pkgType = atom.config.get('atom-updater-linux.pkgType');
    this.releaseChannel = (atom.config.get('atom-updater-linux.betaVersion')) ? 'beta' : 'stable';
  }

  checkForUpdate() {
    return this._getLatestVersionNum()
    .then(() => {
      if(this._requiresUpdate()) {
        return Notifier.updateAvailable();
      }

      return;
    })
    .catch((err) => {
      return Notifier.updateCheckFailed();
    })
  }

  download() {
    Notifier.downloadStarted();

    return this._downloadUpdate()
    .then(() => {
      Notifier.downloadComplete();
    })
    .catch(() => {
      Notifier.downloadFailed();
    });
  }

  _requiresUpdate() {
    const current = atom.appVersion;
    const latest = this.versions[this.releaseChannel];

    return current < latest;
  }

  _downloadUpdate() {
    Notifier.downloadStarted();

    this.received = 0;

    return new Promise((resolve, reject) => {
      try {
        const req = request.get(this._getDownloadUrl()).pipe(fs.createWriteStream(Config.downloadFile));

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
    const extension = (this.pkgType.indexOf('deb') !== -1) ? '-amd64.deb' : '.x86_64.rpm';

    return `${base}/${version}/atom${extension}`;
  }
}

const updater = new Updater();

updater.checkForUpdate();
