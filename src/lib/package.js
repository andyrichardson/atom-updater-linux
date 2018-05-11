"use strict";
exports.__esModule = true;
var atom_1 = require("atom");
var updater_1 = require("./updater");
var Package = /** @class */ (function () {
    function Package() {
    }
    Package.prototype.activate = function () {
        this.updater = new updater_1.Updater();
        this.subscriptions = new atom_1.CompositeDisposable();
        this.updater.init();
        this.addSubscriptions();
    };
    Package.prototype.addSubscriptions = function () {
        var _this = this;
        if (this.updater === undefined || this.subscriptions === undefined) {
            throw Error('Add subscriptions called before activate');
        }
        this.subscriptions.add(
        // @ts-ignore: Invalid argument type
        atom.commands.add('atom-workspace', { 'atom-updater-linux:check': function () { return _this.updater.checkForUpdate(true); } }));
    };
    return Package;
}());
exports["default"] = Package;
