'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var core$1 = require('@angular/core');
var core = require('@awesome-cordova-plugins/core');
require('rxjs');

var BluetoothSerial = /** @class */ (function (_super) {
    tslib.__extends(BluetoothSerial, _super);
    function BluetoothSerial() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BluetoothSerial.prototype.connect = function (macAddress_or_uuid, data) { return core.cordova(this, "connect", {}, arguments); };
    BluetoothSerial.prototype.connectInsecure = function (macAddress) { return core.cordova(this, "connectInsecure", {}, arguments); };
    BluetoothSerial.prototype.disconnect = function () { return core.cordova(this, "disconnect", {}, arguments); };
    BluetoothSerial.prototype.write = function (data) { return core.cordova(this, "write", {}, arguments); };
    BluetoothSerial.prototype.available = function () { return core.cordova(this, "available", {}, arguments); };
    BluetoothSerial.prototype.read = function () { return core.cordova(this, "read", {}, arguments); };
    BluetoothSerial.prototype.readUntil = function (delimiter) { return core.cordova(this, "readUntil", {}, arguments); };
    BluetoothSerial.prototype.subscribe = function (delimiter) { return core.cordova(this, "subscribe", {}, arguments); };
    BluetoothSerial.prototype.subscribeRawData = function () { return core.cordova(this, "subscribeRawData", {}, arguments); };
    BluetoothSerial.prototype.clear = function () { return core.cordova(this, "clear", {}, arguments); };
    BluetoothSerial.prototype.list = function () { return core.cordova(this, "list", {}, arguments); };
    BluetoothSerial.prototype.isEnabled = function () { return core.cordova(this, "isEnabled", {}, arguments); };
    BluetoothSerial.prototype.isConnected = function () { return core.cordova(this, "isConnected", {}, arguments); };
    BluetoothSerial.prototype.readRSSI = function () { return core.cordova(this, "readRSSI", {}, arguments); };
    BluetoothSerial.prototype.showBluetoothSettings = function () { return core.cordova(this, "showBluetoothSettings", {}, arguments); };
    BluetoothSerial.prototype.enable = function () { return core.cordova(this, "enable", {}, arguments); };
    BluetoothSerial.prototype.discoverUnpaired = function () { return core.cordova(this, "discoverUnpaired", {}, arguments); };
    BluetoothSerial.prototype.setDeviceDiscoveredListener = function () { return core.cordova(this, "setDeviceDiscoveredListener", {}, arguments); };
    BluetoothSerial.prototype.setName = function (newName) { return core.cordova(this, "setName", {}, arguments); };
    BluetoothSerial.prototype.setDiscoverable = function (discoverableDuration) { return core.cordova(this, "setDiscoverable", {}, arguments); };
    BluetoothSerial.pluginName = "BluetoothSerial";
    BluetoothSerial.plugin = "cordova-plugin-bluetooth-serial";
    BluetoothSerial.pluginRef = "bluetoothSerial";
    BluetoothSerial.repo = "https://github.com/rigasp/BluetoothSerial.git";
    BluetoothSerial.install = "";
    BluetoothSerial.installVariables = [];
    BluetoothSerial.platforms = ["Android", "iOS", "Windows Phone 8"];
    BluetoothSerial.decorators = [
        { type: core$1.Injectable }
    ];
    return BluetoothSerial;
}(core.AwesomeCordovaNativePlugin));

exports.BluetoothSerial = BluetoothSerial;
