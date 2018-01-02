'use babel';

import Settings from './lib/settings';
import Package from './lib/package';

export default {
  config: Settings.config,
  activate: Package.activate
}
