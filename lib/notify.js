'use babel';

class _Notify extends HTMLElement {

  dispose() {
    console.info('destruction of notification');
    this.parentNode.removeChild(this);
  }

  createdCallback() {
    this.link.appendChild(this.iconEl);
    this.link.appendChild(this.displayEl);
    this.appendChild(this.link);

    this.classList.add('text-info', 'updater-notify', 'inline-block');
    this.classList.toggle('updater-notify-hidden');

    this.onclick = () => {
      this.classList.toggle('updater-notify-hidden');
    };
  }

  get link() {
    if(!this.__linkEl) {
      this.__linkEl = document.createElement('a');
      this.__linkEl.classList.add('inline-block');
      this.__linkEl.href = "#";
    }

    return this.__linkEl;
  }

  get iconEl() {
    if(!this.__iconEl) {
      this.__iconEl = document.createElement('span');
      this.__iconEl.classList.add('icon', 'icon-cloud-download', 'inline-block');
    }

    return this.__iconEl;
  }

  get displayEl() {
    if(!this.__displayEl) {
      this.__displayEl = document.createElement('span');
      this.__displayEl.classList.add('inline-block');
    }

    return this.__displayEl;
  }

  hide() {
    this.classList.add('updater-notify-hidden');
  }

  content(info) {
    var pkgType = '.zip';

    if(atom.config.get('updater-notify.pkgType') === 'Debian, Ubuntu')
      pkgType = '.deb';
    else if(atom.config.get('updater-notify.pkgType') === 'RedHat')
      pkgType = '.rpm';
    else if(atom.config.get('updater-notify.pkgType') === 'Mac OSX')
      pkgType = '.nupkg';

    this.displayEl.innerHTML = ' new version ' + info.name;
    this.classList.toggle('updater-notify-hidden');


    info.assets.forEach((asset) => {
      if(asset.name.indexOf(pkgType) >= 0)
        this.__linkEl.href = asset.browser_download_url;
    });
  }
}

export default {
  Notify: document.registerElement('updater-notify-statusbar', {
    extend: 'div',
    prototype: _Notify.prototype
  })
};
