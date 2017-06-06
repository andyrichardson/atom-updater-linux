'use babel';

import * as https from 'https';

export class Updater {

  extractVersion(version) {
    let exp = /([0-9]+)\.([0-9]+)\.([0-9])(-(alpha|beta)([0-9]+)|)/;
    let rst = exp.exec(version);

    return {
        major: Number.parseInt(rst[1]),
        minor: Number.parseInt(rst[2]),
        build: Number.parseInt(rst[3]),
        stage: rst[5],
        stageNumber: Number.parseInt(rst[6])
    };
  }

  needUpdate(avaliable, current) {
    if(!atom.config.get('atom-updater-linux.acceptTestVersion') && avaliable.stage)
      return false;

    if(avaliable.major > current.major)
      return true;
    else if(avaliable.major === current.major && avaliable.minor > current.minor)
      return true;
    else if(avaliable.major === current.major && avaliable.minor === current.minor && avaliable.build > current.build)
      return true;
    else if(avaliable.major === current.major && avaliable.minor === current.minor && avaliable.build == current.build)
      if(!current.stage && avaliable.stage)
        return true;
      else if(current.stage == 'alpha' && avaliable.stage == 'beta')
        return true;
      else if(current.stage == 'alpha' && avaliable.stage == 'alpha' && avaliable.stageNumber > current.stageNumber)
        return true;
      else if(current.stage == 'alpha' && avaliable.stage == 'beta')
        return true;
      else if(current.stage == 'beta' && avaliable.stage == 'beta' && avaliable.stageNumber > current.stageNumber)
        return true;
      else
        return false;
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
                    currentVersion = this.extractVersion(e.name);
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
