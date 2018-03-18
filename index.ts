import Package from './lib/package';
import Settings from './lib/settings';

console.log('loaded');
const pkg = new Package();

export default {
  activate: () => pkg.activate(),
  config: Settings.config,
};
