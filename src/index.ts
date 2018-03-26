import Settings from './config/settings';
import Package from './lib/package';

const pkg = new Package();

export const activate = () => pkg.activate();
export const config = Settings.config;
