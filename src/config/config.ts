interface InstallCommands {
  [key: string]: string | undefined;
  deb: string;
  rpm: string;
}

interface PackageConfig {
  downloadBase: string;
  downloadFile: string;
  installCmd: InstallCommands;
}

export const Config: PackageConfig = {
  downloadBase: 'https://github.com/atom/atom/releases/download/',
  downloadFile: '/tmp/atom-updater-linux.installer',
  installCmd: {
    deb: 'dpkg -i',
    rpm: 'rpm -U',
  },
};
