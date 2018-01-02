'use babel';

const Config = {
  downloadBase: 'https://api.github.com/repos/atom/atom/releases',
  downloadFile: '/tmp/atom-updater-linux.installer',
  installCmd: {
    deb: 'dpkg -i',
    rpm: 'rpm -U',
  }
};

export default Config;
