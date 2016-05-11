'use babel';

import { CompositeDisposable } from 'atom';
import * as https from 'https';
import {Updater} from './updater';
import {Timer} from './timer';

let main = {

  config: {
    acceptTestVersion: {
      'type': 'boolean',
      'default': false,
      'title': 'Accept test versions of atom.',
      'description': 'You can accept test versions of atom.'
    },
    checkInterval: {
      'type': 'integer',
      'default': 1,
      'title': 'Check interval',
      'description': 'Interval to check new versions of atom in repository, in hours.'
    },
    pkgType: {
      'type': 'string',
      'default': 'Debian, Ubuntu',
      'title': 'Package type',
      'enum': [
        'Debian, Ubuntu',
        'RedHat',
        'Mac OSX'
      ],
      'description': 'The type of package for download.'
    }
  },

  updaterNotifyView: null,
  modalPanel: null,
  subscriptions: null,
  timer: null,

  checkInterval() {
    var period = atom.config.get('updater-notify.checkInterval', 1);

    if(period < 1) period = 1;

    return (period * 60 * 60) * 1000;
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'updater-notify:toggle': () => this.manualCheck(),
      'updater-notify:manualCheck': () => this.manualCheck()
    }));

    if(!this.timer) {
      var me = this;

      this.timer = new Timer(
        () => {
          me.automaticChecker();
        },
        false,
        false,
        this.checkInterval()
      );
    }

    this.timer.start();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.timer.stop();
  },

  serialize() {
    return {
    };
  },

  automaticChecker() {
    let up = new Updater();
    var pkgType = '.zip';

    if(atom.config.get('updater-notify.pkgType') === 'Debian, Ubuntu')
      pkgType = '.deb';
    else if(atom.config.get('updater-notify.pkgType') === 'RedHat')
      pkgType = '.rpm';
    else if(atom.config.get('updater-notify.pkgType') === 'Mac OSX')
      pkgType = '.nupkg';

    up.checkUpdate().then(
      (info) => {
        if(info) {
          atom.notifications.addInfo(
            [
              '<h2>Existe uma atualização do atom.</h2>',
              '<p>Ultima versão disponivel: <a href="' + info.html_url + '">' + info.name + '</a></p>',
              '<div>',
                '<ul>',
                info.assets.map((asset) => {
                  if(asset.name.indexOf(pkgType) >= 0)
                    return '<li><a href="' + asset.browser_download_url+ '">' + asset.name + '</a></li>';
                  else
                    return '';
                }).join(''),
                '</ul>',
              '</div>',
              '<p>Use um dos links acima para fazer o download do atom.</p>',
            ].join('')
          );
        }
      },
      (message) => {
        atom.notifications.addError(message);
      }
    );
  },

  manualCheck() {
    let up = new Updater();

    up.checkUpdate().then(
      (info) => {
        if(info) {
          atom.notifications.addInfo(
            [
              '<p>Existe uma atualização do atom.</p>',
              '<p>Versão disponivel: <a href="' + info.html_url + '">' + info.name + '</a></p>'
            ].join('')
          );
        }
        else
          atom.notifications.addInfo('Nenhuma atualização disponivel até o momento.');
      },
      (message) => {
        atom.notifications.addError(message);
      }
    );
  }
};

export default main;
