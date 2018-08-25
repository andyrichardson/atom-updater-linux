"use strict";
exports.__esModule = true;
var settings_1 = require("./config/settings");
var package_1 = require("./lib/package");
var pkg = new package_1["default"]();
exports.activate = function () { return pkg.activate(); };
exports.config = settings_1["default"].config;
