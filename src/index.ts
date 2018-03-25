import Settings from './config/settings';
import Package from './lib/package';

console.log('loaded');
const pkg = new Package();

export default {
  activate: () => pkg.activate(),
  config: Settings.config,
};
