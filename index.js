'use babel';

import Settings from './lib/settings';
import Package from './lib/package';

const pkg = new Package();

export default {
  config: Settings.config,
  activate: () => pkg.activate(),
};
