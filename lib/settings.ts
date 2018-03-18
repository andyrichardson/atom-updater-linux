import { PackageType } from '../typings';

const Settings = {
  config: {
    checkStartup: {
      default: true,
      description: 'Check for updates when Atom starts.',
      order: 2,
      title: 'Check on startup',
      type: 'boolean',
    },
    packageType: {
      default: 'auto',
      description: 'Package type to install for this operating system.',
      enum: [
        {
          description: 'Auto detect',
          value: PackageType.AutoDetect,
        },
        {
          description: 'deb (for Debian based distros)',
          value: PackageType.Debian,
        },
        {
          description: 'rpm (for RHEL based distros)',
          value: PackageType.RedHat,
        },
      ],
      order: 3,
      title: 'Package type',
      type: 'string',
    },
    useBeta: {
      default: false,
      description: 'Search for and update to the latest Beta version (default: false).',
      order: 1,
      title: 'Beta releases',
      type: 'boolean',
    },
  },
};

export default Settings;
