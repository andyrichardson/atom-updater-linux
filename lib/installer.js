'use babel';

import { CompositeDisposable } from 'atom';

const DOMListener = require('dom-listener');
const fs = require('fs');
const shell = require('shelljs');
const request = require('request');

shell.config.execPath = "/usr/bin/node";

export class Installer {
  listen(){
    const listener = new DOMListener(document.querySelector('.message'));
    listener.add('.btn-install-update', 'click', (e) => this.execute(e));
  }

  execute(event){
    this.downloadUrl = event.target.getAttribute("data-target");
    this.pkgType = this.downloadUrl.slice(-3)

    this.downloadUpdate((err) => {
      if(err === undefined){
        let disposable = atom.notifications.onDidAddNotification((notification) => {
          setTimeout(() => this.installUpdate(), 2000);
          disposable.dispose();
        })
        atom.notifications.addSuccess("Download complete! Installing latest version of Atom.");
      }
      else{
        atom.notifications.addError("Unable to download Atom. Please check your network connection.", options);
      }
    });
  }

  installUpdate(){
    let install;
    if(this.pkgType == "rpm"){
      install = (cb) => this.installRpm(cb);
    }
    else{
      install = (cb) => this.installDeb(cb);
    }

    install((code) => {
      if(code == 0){
        atom.notifications.addSuccess("Atom has been successfully updated. Please restart Atom.");
      }
      else{
        atom.notifications.addError("Something went wrong while trying to update Atom");
      }

      fs.unlink(this.outputDest);
    });
  }

  installRpm(callback){
    const cmd1 = 'export AUTH_PASS=$(zenity --password --title="Atom Installer Authentication")';
    const cmd2 = `echo $AUTH_PASS | sudo -S rpm -U ${this.outputDest}`;

    shell.exec(`${cmd1} && ${cmd2}`, callback);
  }

  installDeb(callback){
    const cmd1 = 'export AUTH_PASS=$(zenity --password --title="Atom Installer Authentication")';
    const cmd2 = `echo $AUTH_PASS | sudo -S dpkg -i ${this.outputDest}`;

    shell.exec(`${cmd1} && ${cmd2}`, callback);
  }

  downloadUpdate(callback){
    atom.notifications.addInfo("Downloading latest version of atom");

    this.outputDest = `/tmp/atom-installer.${this.pkgType}`;
    const file = fs.createWriteStream(this.outputDest);

    request.get(this.downloadUrl)
    .on('error', callback)
    .on('end', callback)
    .pipe(file);
  }
}
