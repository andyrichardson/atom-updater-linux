"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var es6_promise_1 = require("es6-promise");
var fs = require("fs");
var request = require("request");
var config_1 = require("../config");
var typings_1 = require("../typings");
var Notifier = require("./notifier");
var Updater = /** @class */ (function () {
    function Updater() {
        this.checkStartup = atom.config.get('atom-updater-linux.checkStartup');
        this.packageType = atom.config.get('atom-updater-linux.packageType');
        this.releaseChannel = (atom.config.get('atom-updater-linux.useBeta')) ? typings_1.ReleaseType.Beta : typings_1.ReleaseType.Stable;
        this.versions = null;
        this.configWatcher();
    }
    Updater.prototype.init = function () {
        if (this.checkStartup) {
            this.checkForUpdate();
        }
        if (this.packageType === typings_1.PackageType.AutoDetect) {
            this.detectVersion();
        }
    };
    Updater.prototype.checkForUpdate = function (notifIfFalse) {
        var _this = this;
        if (notifIfFalse === void 0) { notifIfFalse = false; }
        return this.getLatestVersionNum()
            .then(function () {
            if (_this.requiresUpdate() && _this.versions !== null) {
                Notifier.updateAvailable(_this.versions[_this.releaseChannel], function () { return _this.download(); });
                return true;
            }
            if (notifIfFalse) {
                Notifier.updateNotAvailable();
            }
            return false;
        })["catch"](function (err) { return Notifier.updateCheckFailed(err.message, err.args); });
    };
    Updater.prototype.download = function () {
        var _this = this;
        return this.downloadUpdate()
            .then(function () { return Notifier.downloadComplete(function () { return _this.install(); }); })["catch"](function (err) { return Notifier.downloadFailed(err); });
    };
    Updater.prototype.install = function () {
        var _this = this;
        var cmd = "SHELL=/bin/bash pkexec " + config_1.Config.installCmd[this.packageType] + " " + config_1.Config.downloadFile;
        child_process_1.exec(cmd, function (err) {
            _this.deletePackage();
            if (err) {
                return Notifier.installFailed(err.toString());
            }
            return Notifier.installComplete();
        });
    };
    Updater.prototype.configWatcher = function () {
        var _this = this;
        atom.config.observe('atom-updater-linux.packageType', function (val) {
            _this.packageType = val;
            if (_this.packageType === typings_1.PackageType.AutoDetect) {
                _this.detectVersion();
            }
        });
        atom.config.observe('atom-updater-linux.useBeta', function (val) {
            _this.releaseChannel = (val) ? typings_1.ReleaseType.Beta : typings_1.ReleaseType.Stable;
        });
    };
    Updater.prototype.deletePackage = function () {
        child_process_1.exec("rm -f " + config_1.Config.downloadFile);
    };
    Updater.prototype.detectVersion = function () {
        var _this = this;
        child_process_1.exec('whereis rpm', function (err, stdout) {
            if (stdout.indexOf('bin') !== -1) {
                _this.packageType = typings_1.PackageType.RedHat;
            }
            else {
                _this.packageType = typings_1.PackageType.Debian;
            }
            return _this.packageType;
        });
    };
    Updater.prototype.downloadUpdate = function () {
        var _this = this;
        Notifier.downloadStarted();
        return new es6_promise_1.Promise(function (resolve, reject) {
            try {
                return request(_this.getDownloadUrl())
                    .pipe(fs.createWriteStream(config_1.Config.downloadFile))
                    .on('close', function () { return resolve(); })
                    .on('end', function () { return resolve(); })
                    .on('error', function () { return reject(); });
            }
            catch (err) {
                return reject(err);
            }
        });
    };
    Updater.prototype.getLatestVersionNum = function () {
        var _this = this;
        var opts = {
            headers: {
                'User-Agent': 'Atom Updater Linux v1'
            }
        };
        return new es6_promise_1.Promise(function (resolve, reject) {
            return request.get('https://api.github.com/repos/atom/atom/releases', opts, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                var response = JSON.parse(data.body);
                var result = {
                    beta: '',
                    stable: ''
                };
                try {
                    response.some(function (release) {
                        if (result.beta !== '' && result.stable !== '') {
                            return true;
                        }
                        if (result.stable === '' && !release.prerelease) {
                            result.stable = release.tag_name;
                        }
                        else if (result.beta === '' && release.prerelease) {
                            result.beta = release.tag_name;
                        }
                        return false;
                    });
                }
                catch (err) {
                    var message = 'Checking for updates failed.';
                    var args = {};
                    if (response.message.indexOf('limit exceeded') !== -1) {
                        args.detail = "You have exceeded the API limit for your IP.";
                    }
                    return reject({ message: message, args: args });
                }
                _this.versions = result;
                return resolve(result);
            });
        });
    };
    Updater.prototype.getDownloadUrl = function () {
        if (this.versions === null) {
            throw Error('Versions have not been fetched');
        }
        var base = config_1.Config.downloadBase;
        var version = this.versions[this.releaseChannel];
        var extension = (this.packageType === typings_1.PackageType.Debian) ? '-amd64.deb' : '.x86_64.rpm';
        return base + "/" + version + "/atom" + extension;
    };
    Updater.prototype.requiresUpdate = function () {
        if (this.versions === null) {
            throw Error('Versions have not been fetched');
        }
        var current = atom.getVersion().split('.');
        var latest = this.versions[this.releaseChannel].substring(1).split('.');
        var result = false;
        // compare versions from format xx.xx.xx
        latest.some(function (num, index) {
            var latestNum = parseInt(num);
            var currentNum = parseInt(current[index]);
            if (latestNum === currentNum) {
                return false;
            }
            if (parseInt(num) > parseInt(current[index])) {
                result = true;
            }
            return true;
        });
        return result;
    };
    return Updater;
}());
exports.Updater = Updater;
