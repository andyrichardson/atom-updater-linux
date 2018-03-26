import { NotificationOptions } from 'atom';
import { exec } from 'child_process';
import { Promise } from 'es6-promise';
import * as fs from 'fs';
import * as request from 'request';
import { Config } from '../config';
import { PackageType, ReleaseType } from '../typings';
import * as Notifier from './notifier';

interface ReleaseVersions {
  beta: string;
  stable: string;
}

export class Updater {
  public checkStartup: boolean;
  public packageType: string;
  public releaseChannel: ReleaseType;
  public versions: ReleaseVersions | null;

  constructor() {
    this.checkStartup = atom.config.get('atom-updater-linux.checkStartup');
    this.packageType = atom.config.get('atom-updater-linux.packageType');
    this.releaseChannel = (atom.config.get('atom-updater-linux.useBeta')) ? ReleaseType.Beta : ReleaseType.Stable;
    this.versions = null;

    this.configWatcher();
  }

  public init(): void {
    if (this.checkStartup) {
      this.checkForUpdate();
    }

    if (this.packageType === PackageType.AutoDetect) {
      this.detectVersion();
    }
  }

  public checkForUpdate(notifIfFalse = false): Promise<boolean | void> {
    return this.getLatestVersionNum()
      .then(() => {
        if (this.requiresUpdate() && this.versions !== null) {
          Notifier.updateAvailable(this.versions[this.releaseChannel], () => this.download());
          return true;
        }

        if (notifIfFalse) {
          Notifier.updateNotAvailable();
        }

        return false;
      })
      .catch((err: any) => Notifier.updateCheckFailed(err.message, err.args));
  }

  public download(): Promise<void> {
    return this.downloadUpdate()
      .then(() => Notifier.downloadComplete(() => this.install()))
      .catch((err: any) => Notifier.downloadFailed(err));
  }

  public install(): void {
    const cmd = `SHELL=/bin/bash pkexec ${Config.installCmd[this.packageType]} ${Config.downloadFile}`;

    exec(cmd, (err) => {
      this.deletePackage();

      if (err) {
        return Notifier.installFailed(err.toString());
      }

      return Notifier.installComplete();
    });
  }

  public configWatcher(): void {
    atom.config.observe('atom-updater-linux.packageType', (val) => {
      this.packageType = val;

      if (this.packageType === PackageType.AutoDetect) {
        this.detectVersion();
      }
    });

    atom.config.observe('atom-updater-linux.useBeta', (val) => {
      this.releaseChannel = (val) ? ReleaseType.Beta : ReleaseType.Stable;
    });
  }

  public deletePackage(): void {
    exec(`rm -f ${Config.downloadFile}`);
  }

  public detectVersion(): void {
    exec('whereis rpm', (err, stdout) => {
      if (stdout.indexOf('bin') !== -1) {
        this.packageType = PackageType.RedHat;
      } else {
        this.packageType = PackageType.Debian;
      }

      return this.packageType;
    });
  }

  public downloadUpdate(): Promise<void> {
    Notifier.downloadStarted();

    return new Promise((resolve, reject) => {
      try {
        return request(this.getDownloadUrl())
          .pipe(fs.createWriteStream(Config.downloadFile))
          .on('close', () => resolve())
          .on('end', () => resolve())
          .on('error', () => reject());
      } catch (err) {
        return reject(err);
      }
    });
  }

  public getLatestVersionNum(): Promise<ReleaseVersions> {
    const opts = {
      headers: {
        'User-Agent': 'Atom Updater Linux v1',
      },
    };

    return new Promise((resolve: any, reject: any) =>
      request.get('https://api.github.com/repos/atom/atom/releases', opts, (err, data) => {
        if (err !== null) {
          return reject(err);
        }

        const response = JSON.parse(data.body);
        const result: ReleaseVersions = {
          beta: '',
          stable: '',
        };

        try {
          response.some((release: any) => {
            if (result.beta !== '' && result.stable !== '') {
              return true;
            }

            if (result.stable === '' && !release.prerelease) {
              result.stable = release.tag_name;
            } else if (result.beta === '' && release.prerelease) {
              result.beta = release.tag_name;
            }

            return false;
          });
        } catch (err) {
          const message = 'Checking for updates failed.';
          const args: NotificationOptions = {};

          if (response.message.indexOf('limit exceeded') !== -1) {
            args.detail = `You have exceeded the API limit for your IP.`;
          }

          return reject({ message, args });
        }

        this.versions = result;
        return resolve(result);
      }),
    );
  }

  public getDownloadUrl(): string {
    if (this.versions === null) {
      throw Error('Versions have not been fetched');
    }

    const base = Config.downloadBase;
    const version = this.versions[this.releaseChannel];
    const extension = (this.packageType === PackageType.Debian) ? '-amd64.deb' : '.x86_64.rpm';

    return `${base}/${version}/atom${extension}`;
  }

  public requiresUpdate(): boolean {
    if (this.versions === null) {
      throw Error('Versions have not been fetched');
    }

    const current = atom.getVersion().split('.');
    const latest = this.versions[this.releaseChannel].substring(1).split('.');

    let result = false;

    // compare versions from format xx.xx.xx
    latest.some(
      (num: string, index: number) => {
        const latestNum = parseInt(num);
        const currentNum = parseInt(current[index]);

        if (latestNum === currentNum) {
          return false;
        }

        if (parseInt(num) > parseInt(current[index])) {
          result = true;
        }

        return true;
      },
    );

    return result;
  }
}
