'use babel';

import Settings from './lib/settings';
import Package from './lib/package';

const package = new Package();

export default {
  config: Settings.config,
  activate: () => package.activate()
}
