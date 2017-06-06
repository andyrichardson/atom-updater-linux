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

    this.classList.add('text-info', 'atom-updater-linux', 'inline-block');
    this.classList.toggle('atom-updater-linux-hidden');

    this.onclick = () => {
      this.classList.toggle('atom-updater-linux-hidden');
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
    this.classList.add('atom-updater-linux-hidden');
  }

  content(info) {
    var pkgType = '.zip';

    if(atom.config.get('atom-updater-linux.pkgType') === 'Debian, Ubuntu')
      pkgType = '.deb';
    else if(atom.config.get('atom-updater-linux.pkgType') === 'RedHat')
      pkgType = '.rpm';

    this.displayEl.innerHTML = ' new version ' + info.name;
    this.classList.toggle('atom-updater-linux-hidden');


    info.assets.forEach((asset) => {
      if(asset.name.indexOf(pkgType) >= 0)
        this.__linkEl.href = asset.browser_download_url;
    });
  }
}

export default {
  Notify: document.registerElement('atom-updater-linux-statusbar', {
    extend: 'div',
    prototype: _Notify.prototype
  })
};
