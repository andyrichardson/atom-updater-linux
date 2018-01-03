'use babel';

const settings = {
  config: {
    useBeta: {
      order: 1,
      title: 'Beta releases',
      description: 'Search for and update to the latest Beta version (default: false).',
      type: 'boolean',
      default: false
    },
    checkStartup: {
      order: 2,
      title: 'Check on startup',
      description: 'Check for updates when Atom starts.',
      type: 'boolean',
      default: false
    },
    packageType: {
      order: 3,
      title: 'Package type',
      description: 'Package type to install for this operating system.',
      type: 'string',
      default: 'auto',
      enum: [
        {
          value: 'auto',
          description: 'Auto detect'
        },
        {
          value: 'deb',
          description: 'deb (for Debian based distros)'
        },
        {
          value: 'rpm',
          description: 'rpm (for RHEL based distros)'
        }
      ]
    },
  }
};

export default Settings = settings;
