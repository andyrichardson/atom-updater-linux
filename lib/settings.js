'use babel';

const settings = {
  config: {
    general: {
      order: 1,
      title: 'General',
      type: 'object',
      properties: {
        useBeta: {
          order: 1,
          title: 'Beta releases',
          description: 'Search for and update to the latest Beta version (default: false).',
          type: 'boolean',
          default: false
        },
        packageType: {
          order: 2,
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
    },
    frequency: {
      order: 2,
      title: 'Automatic checking',
      type: 'object',
      properties: {
        checkStartup: {
          order: 1,
          title: 'Check on startup',
          description: 'Check for updates when Atom starts.',
          type: 'boolean',
          default: false
        },
        checkInterval: {
          order: 2,
          title: 'Check interval',
          description: 'Frequency to check for updates',
          type: 'string',
          default: 'hourly',
          enum: [
            {
              value: 'never',
              description: 'Never'
            },
            {
              value: 'hourly',
              description: 'Hourly'
            },
            {
              value: 'daily',
              description: 'Daily'
            },
            {
              value: 'weekly',
              description: 'Weekly'
            }
          ]
        }
      }
    }
  }
};

export default Settings = settings;
