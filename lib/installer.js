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
    this.downloadUpdate((err) => {
      if(err === undefined){
        atom.notifications.addSuccess("Download complete! Installing latest version of Atom.");
        // atom.notifications.onDidAddNotification(() => this.installUpdate());
        this.installUpdate();
      }
      else{
        atom.notifications.addError("Unable to download Atom. Please check your network connection.", options);
      }
    });
  }

  installUpdate(){
    const cmd1 = "export AUTH_PASS=$(zenity --password --title=Authentication)";
    const cmd2 = `echo $AUTH_PASS | sudo -S rpm -U ${this.outputDest}`;

    shell.exec(`${cmd1} && ${cmd2}`, function(code){
      if(code == 0){
        atom.notifications.addSuccess("Atom successfully installed.");
      }
      else{
        atom.notifications.addError("Something went wrong when trying to install atom", options)
      }
    });
  }

  downloadUpdate(callback){
    atom.notifications.addInfo("Downloading latest version of atom");

    this.outputDest = "/tmp/atom-installer.rpm";
    const file = fs.createWriteStream(this.outputDest);

    request.get(this.downloadUrl)
    .on('error', callback)
    .on('end', callback)
    .pipe(file);
  }
}
