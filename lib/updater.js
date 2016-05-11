'use babel';

import * as https from 'https';

export class Updater {

  extractVersion(version) {
    let exp = /([0-9]+)\.([0-9]+)\.([0-9])(-(alpha|beta)([0-9]+)|)/;
    let rst = exp.exec(version);

    return {
        major: rst[1],
        minor: rst[2],
        build: rst[3],
        stage: rst[5],
        stageNumber: rst[6]
    };
  }

  needUpdate(avaliable, current) {
    if(avaliable.stage !== '' && !atom.config.get('updater-notify.acceptTestVersion'))
      return false;

    if(avaliable.major > current.major)
      return true;
    else if(avaliable.major === current.major && avaliable.minor > current.minor)
      return true;
    else if(avaliable.major === current.major && avaliable.minor === current.minor && avaliable.build > current.build)
      return true;
    else
      return false;
  }

  checkUpdate() {
    var currentVersion = this.extractVersion(atom.getVersion());
    var updater = false;
    var p = new Promise(
      (resolve, reject) => {
        let req = https.request(
          {
              hostname: 'api.github.com',
              path: '/repos/atom/atom/releases',
              protocol: 'https:',
              port: 443,
              method: 'GET',
              headers: {
                  'User-Agent': 'Atom Updater Notify 0.1.2'
              }
          },
          (req) => {
            var data = '';
            if(req.statusCode == 200) {

              req.on('data', (chunk) => {
                data += chunk;
              });

              console.log('Restam: %s', req.headers['x-ratelimit-remaining']);

              let exp = /([0-9]+)\.([0-9]+)\.([0-9])(-(alpha|beta)([0-9]+)|)/;

              req.on('end', () => {
                data = JSON.parse(data);
                data.forEach((e) => {
                  if(this.needUpdate(this.extractVersion(e.name), currentVersion)) {
                    currentVersion = e.name;
                    updater = e;
                  }
                });

                resolve(updater);
              });
            }
            else {
              req.on('data', (chunk) => {
                data += chunk;
              });

              req.on('end', () => {
                let obj = JSON.parse(data);
                reject(obj.message);
              });
            }
          }
        );

        req.write('');
        req.end();
      }
    );

    return p;


  }

}
