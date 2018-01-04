'use babel';

import fs from 'fs';
import { exec } from 'child_process';
import request from 'request';
import Config from './config';
import Notifier from './notifier';

export default class Updater {
  constructor() {
    this.versions = {};
    this.checkStartup = atom.config.get('atom-updater-linux.checkStartup');
    this.packageType = atom.config.get('atom-updater-linux.packageType');
    this.releaseChannel = (atom.config.get('atom-updater-linux.useBeta')) ? 'beta' : 'stable';
    this.notifier = new Notifier(this);

    this._configWatcher();
  }

  init() {
    if (this.checkStartup) {
      this.checkForUpdate();
    }

    if (this.packageType === 'auto') {
      this._detectVersion();
    }
  }

  checkForUpdate(notifIfFalse) {
    return this._getLatestVersionNum()
      .then(() => {
        if (this._requiresUpdate()) {
          this.notifier.updateAvailable(this.versions[this.releaseChannel]);
          return true;
        }

        if (notifIfFalse) {
          this.notifier.updateNotAvailable();
        }

        return false;
      })
      .catch(err => this.notifier.updateCheckFailed(err));
  }

  download() {
    return this._downloadUpdate()
      .then(() => this.notifier.downloadComplete())
      .catch(err => this.notifier.downloadFailed(err));
  }

  install() {
    const cmd = `SHELL=/bin/bash pkexec ${Config.installCmd[this.packageType]} ${Config.downloadFile}`;

    exec(cmd, (err) => {
      this._deletePackage();

      if (err) {
        return this.notifier.installFailed(err);
      }

      return this.notifier.installComplete();
    });
  }

  _configWatcher() {
    atom.config.observe('atom-updater-linux.packageType', (val) => {
      this.packageType = val;

      if (this.packageType === 'auto') {
        this._detectVersion();
      }
    });

    atom.config.observe('atom-updater-linux.useBeta', (val) => {
      this.releaseChannel = (val) ? 'beta' : 'stable';
    });
  }

  _deletePackage() {
    exec(`rm -f ${Config.downloadFile}`);
  }

  _detectVersion() {
    exec('whereis rpm', (err, stdout) => {
      if (stdout.indexOf('bin') !== -1) {
        this.packageType = 'rpm';
      } else {
        this.packageType = 'deb';
      }

      return this.packageType;
    });
  }

  _downloadUpdate() {
    this.notifier.downloadStarted();

    return new Promise((resolve, reject) => {
      try {
        return request(this._getDownloadUrl())
          .pipe(fs.createWriteStream(Config.downloadFile))
          .on('close', () => resolve())
          .on('end', () => resolve())
          .on('error', () => reject());
      } catch (err) {
        return reject(err);
      }
    });
  }

  _getLatestVersionNum() {
    const opts = {
      headers: {
        'User-Agent': 'Atom Updater Linux v1',
      },
    };

    return new Promise((resolve, reject) =>
      request.get('https://api.github.com/repos/atom/atom/releases', opts, (err, data) => {
        if (err !== null) {
          return reject(err);
        }

        const response = JSON.parse(data.body);
        const result = {};

        response.some((release) => {
          if (result.beta !== undefined && result.stable !== undefined) {
            return true;
          }

          if (result.stable === undefined && !release.prerelease) {
            result.stable = release.tag_name;
          } else if (result.beta === undefined && release.prerelease) {
            result.beta = release.tag_name;
          }

          return false;
        });

        this.versions = result;
        return resolve(result);
      }),
    );
  }

  _getDownloadUrl() {
    const base = Config.downloadBase;
    const version = this.versions[this.releaseChannel];
    const extension = (this.packageType === 'deb') ? '-amd64.deb' : '.x86_64.rpm';

    return `${base}/${version}/atom${extension}`;
  }

  _requiresUpdate() {
    const current = atom.appVersion;
    const latest = this.versions[this.releaseChannel].substring(1);

    return current < latest;
  }
}
