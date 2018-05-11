"use strict";
exports.__esModule = true;
exports.Config = {
    downloadBase: 'https://github.com/atom/atom/releases/download/',
    downloadFile: '/tmp/atom-updater-linux.installer',
    installCmd: {
        deb: 'dpkg -i',
        rpm: 'rpm -U'
    }
};
