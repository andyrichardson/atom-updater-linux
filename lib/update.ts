import { exec } from 'child_process';
import { Promise } from 'es6-promise';
import * as fs from 'fs';
import * as request from 'request';
import { PackageType, ReleaseType } from '../typings';
import Config from './config';
import Notifier from './notifier';

interface ReleaseVersions {
  beta: string;
  stable: string;
}

export default class Updater {
  public checkStartup: boolean;
  public notifier: Notifier;
  public packageType: string;
  public releaseChannel: ReleaseType;
  public versions: ReleaseVersions | null;

  constructor() {
    this.checkStartup = atom.config.get('atom-updater-linux.checkStartup');
    this.notifier = new Notifier(this);
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
          this.notifier.updateAvailable(this.versions[this.releaseChannel]);
          return true;
        }

        if (notifIfFalse) {
          this.notifier.updateNotAvailable();
        }

        return false;
      })
      .catch((err: string) => this.notifier.updateCheckFailed(err));
  }

  public download(): Promise<void> {
    return this.downloadUpdate()
      .then(() => this.notifier.downloadComplete())
      .catch((err: any) => this.notifier.downloadFailed(err));
  }

  public install(): void {
    const cmd = `SHELL=/bin/bash pkexec ${Config.installCmd[this.packageType]} ${Config.downloadFile}`;

    exec(cmd, (err) => {
      this.deletePackage();

      if (err) {
        return this.notifier.installFailed(err.toString());
      }

      return this.notifier.installComplete();
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
    this.notifier.downloadStarted();

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
          let message = 'Checking for updates failed.';

          if (response.message.indexOf('limit exceeded') !== -1) {
            message = `${message} You have exceeded the API limit for your IP.`;
          }

          return reject(err);
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

    const current = atom.getVersion();
    const latest = this.versions[this.releaseChannel].substring(1);
    return current < latest;
  }
}
