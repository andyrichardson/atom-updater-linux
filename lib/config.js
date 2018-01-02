'use babel';

const Config = {
  downloadBase: 'https://github.com/atom/atom/releases/download/',
  downloadFile: '/tmp/atom-updater-linux.installer',
  installCmd: {
    deb: 'dpkg -i',
    rpm: 'rpm -U',
  }
};

export default Config;
