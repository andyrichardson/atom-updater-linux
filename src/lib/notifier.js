"use strict";
exports.__esModule = true;
exports.downloadStarted = function () {
    var opts = {
        detail: 'Downloading the latest version of Atom.'
    };
    atom.notifications.addInfo('Downloading update', opts);
};
exports.downloadComplete = function (installClick) {
    var notification;
    var opts = {
        buttons: [
            {
                onDidClick: function () {
                    notification.dismiss();
                    installClick();
                },
                text: 'Install update'
            },
        ],
        detail: 'A new version of Atom has been downloaded. Click below to install.',
        dismissable: true
    };
    notification = atom.notifications.addSuccess('Download complete', opts);
};
exports.downloadFailed = function (err) {
    var opts = {
        detail: 'Something went wrong when attempting to download the latest version of Atom.',
        dismissable: true,
        stack: err
    };
    atom.notifications.addError('Download failed', opts);
};
exports.exceededApiLimit = function () {
    var opts = {
        detail: 'Unable to check for newer versions on Atom. Your API limit has been exceeded.',
        dismissable: true
    };
    atom.notifications.addError('Download failed', opts);
};
exports.installComplete = function () {
    var opts = {
        buttons: [
            {
                onDidClick: function () { return atom.reload(); },
                text: 'Restart Atom'
            },
        ],
        detail: 'Atom has successfully updated',
        dismissable: true
    };
    atom.notifications.addSuccess('Update complete', opts);
};
exports.installFailed = function (err) {
    var opts = {
        detail: 'Something went wrong while attempting to update atom',
        dismissable: true,
        stack: err
    };
    atom.notifications.addError('Update failed', opts);
};
exports.updateNotAvailable = function () {
    var opts = {
        detail: 'You already have the latest version of Atom.'
    };
    atom.notifications.addSuccess('No updates', opts);
};
exports.updateAvailable = function (version, downloadClick) {
    var notification;
    var opts = {
        buttons: [
            {
                onDidClick: function () {
                    notification.dismiss();
                    downloadClick();
                },
                text: 'Download update'
            },
        ],
        detail: "A new version of Atom " + version + " is available.",
        dismissable: true
    };
    notification = atom.notifications.addInfo('Update available', opts);
};
exports.updateCheckFailed = function (msg, args) {
    atom.notifications.addError(msg, args);
};
