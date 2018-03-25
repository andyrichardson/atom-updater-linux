interface InstallCommands {
  deb: string;
  rpm: string;
}

interface PackageConfig {
  downloadBase: string;
  downloadFile: string;
  installCmd: InstallCommands;
}
