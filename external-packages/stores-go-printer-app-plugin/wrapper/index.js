var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { AwesomeCordovaNativePlugin, cordova } from '@awesome-cordova-plugins/core';
import { Observable } from 'rxjs';
var BluetoothSerialOriginal = /** @class */ (function (_super) {
    __extends(BluetoothSerialOriginal, _super);
    function BluetoothSerialOriginal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BluetoothSerialOriginal.prototype.connect = function (macAddress_or_uuid, data) { return cordova(this, "connect", {}, arguments); };
    BluetoothSerialOriginal.prototype.connectInsecure = function (macAddress) { return cordova(this, "connectInsecure", {}, arguments); };
    BluetoothSerialOriginal.prototype.disconnect = function () { return cordova(this, "disconnect", {}, arguments); };
    BluetoothSerialOriginal.prototype.write = function (data) { return cordova(this, "write", {}, arguments); };
    BluetoothSerialOriginal.prototype.available = function () { return cordova(this, "available", {}, arguments); };
    BluetoothSerialOriginal.prototype.read = function () { return cordova(this, "read", {}, arguments); };
    BluetoothSerialOriginal.prototype.readUntil = function (delimiter) { return cordova(this, "readUntil", {}, arguments); };
    BluetoothSerialOriginal.prototype.subscribe = function (delimiter) { return cordova(this, "subscribe", {}, arguments); };
    BluetoothSerialOriginal.prototype.subscribeRawData = function () { return cordova(this, "subscribeRawData", {}, arguments); };
    BluetoothSerialOriginal.prototype.clear = function () { return cordova(this, "clear", {}, arguments); };
    BluetoothSerialOriginal.prototype.list = function () { return cordova(this, "list", {}, arguments); };
    BluetoothSerialOriginal.prototype.isEnabled = function () { return cordova(this, "isEnabled", {}, arguments); };
    BluetoothSerialOriginal.prototype.isConnected = function () { return cordova(this, "isConnected", {}, arguments); };
    BluetoothSerialOriginal.prototype.readRSSI = function () { return cordova(this, "readRSSI", {}, arguments); };
    BluetoothSerialOriginal.prototype.showBluetoothSettings = function () { return cordova(this, "showBluetoothSettings", {}, arguments); };
    BluetoothSerialOriginal.prototype.enable = function () { return cordova(this, "enable", {}, arguments); };
    BluetoothSerialOriginal.prototype.discoverUnpaired = function () { return cordova(this, "discoverUnpaired", {}, arguments); };
    BluetoothSerialOriginal.prototype.setDeviceDiscoveredListener = function () { return cordova(this, "setDeviceDiscoveredListener", {}, arguments); };
    BluetoothSerialOriginal.prototype.setName = function (newName) { return cordova(this, "setName", {}, arguments); };
    BluetoothSerialOriginal.prototype.setDiscoverable = function (discoverableDuration) { return cordova(this, "setDiscoverable", {}, arguments); };
    BluetoothSerialOriginal.pluginName = "BluetoothSerial";
    BluetoothSerialOriginal.plugin = "cordova-plugin-bluetooth-serial";
    BluetoothSerialOriginal.pluginRef = "bluetoothSerial";
    BluetoothSerialOriginal.repo = "https://github.com/rigasp/BluetoothSerial.git";
    BluetoothSerialOriginal.install = "";
    BluetoothSerialOriginal.installVariables = [];
    BluetoothSerialOriginal.platforms = ["Android", "iOS", "Windows Phone 8"];
    return BluetoothSerialOriginal;
}(AwesomeCordovaNativePlugin));
var BluetoothSerial = new BluetoothSerialOriginal();
export { BluetoothSerial };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvQGF3ZXNvbWUtY29yZG92YS1wbHVnaW5zL3BsdWdpbnMvYmx1ZXRvb3RoLXNlcmlhbC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQ0EsT0FBTyx1Q0FBbUcsTUFBTSwrQkFBK0IsQ0FBQztBQUNoSixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDOztJQXlDRyxtQ0FBMEI7Ozs7SUFRN0QsaUNBQU8sYUFBQyxrQkFBMEIsRUFBRSxJQUFTO0lBTzdDLHlDQUFlLGFBQUMsVUFBa0I7SUFNbEMsb0NBQVU7SUFPViwrQkFBSyxhQUFDLElBQVM7SUFNZixtQ0FBUztJQU1ULDhCQUFJO0lBT0osbUNBQVMsYUFBQyxTQUFpQjtJQU8zQixtQ0FBUyxhQUFDLFNBQWlCO0lBTTNCLDBDQUFnQjtJQU1oQiwrQkFBSztJQU1MLDhCQUFJO0lBTUosbUNBQVM7SUFNVCxxQ0FBVztJQU1YLGtDQUFRO0lBTVIsK0NBQXFCO0lBTXJCLGdDQUFNO0lBTU4sMENBQWdCO0lBTWhCLHFEQUEyQjtJQU0zQixpQ0FBTyxhQUFDLE9BQWU7SUFNdkIseUNBQWUsYUFBQyxvQkFBNEI7Ozs7Ozs7OzBCQXpLOUM7RUEyQ3FDLDBCQUEwQjtTQUFsRCxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBQbHVnaW4sIENvcmRvdmEsIENvcmRvdmFQcm9wZXJ0eSwgQ29yZG92YUluc3RhbmNlLCBJbnN0YW5jZVByb3BlcnR5LCBBd2Vzb21lQ29yZG92YU5hdGl2ZVBsdWdpbiB9IGZyb20gJ0Bhd2Vzb21lLWNvcmRvdmEtcGx1Z2lucy9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgKiBhcyDJtW5nY2MwIGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLyoqXHJcbiAqIEBuYW1lIEdPIEJsdWV0b290aCBTZXJpYWxcclxuICogQGRlc2NyaXB0aW9uIFRoaXMgcGx1Z2luIGVuYWJsZXMgc2VyaWFsIGNvbW11bmljYXRpb24gb3ZlciBCbHVldG9vdGguIEl0IHdhcyB3cml0dGVuIGZvciBjb21tdW5pY2F0aW5nIGJldHdlZW4gQW5kcm9pZCBvciBpT1MgYW5kIGFuIEFyZHVpbm8gKG5vdCBBbmRyb2lkIHRvIEFuZHJvaWQgb3IgaU9TIHRvIGlPUykuXHJcbiAqIEB1c2FnZVxyXG4gKiBgYGB0eXBlc2NyaXB0XHJcbiAqIGltcG9ydCB7IEJsdWV0b290aFNlcmlhbCB9IGZyb20gJ0Bhd2Vzb21lLWNvcmRvdmEtcGx1Z2lucy9ibHVldG9vdGgtc2VyaWFsL25neCc7XHJcbiAqXHJcbiAqIGNvbnN0cnVjdG9yKHByaXZhdGUgYmx1ZXRvb3RoU2VyaWFsOiBCbHVldG9vdGhTZXJpYWwpIHsgfVxyXG4gKlxyXG4gKlxyXG4gKiAvLyBXcml0ZSBhIHN0cmluZ1xyXG4gKiB0aGlzLmJsdWV0b290aFNlcmlhbC53cml0ZSgnaGVsbG8gd29ybGQnKS50aGVuKHN1Y2Nlc3MsIGZhaWx1cmUpO1xyXG4gKlxyXG4gKiAvLyBBcnJheSBvZiBpbnQgb3IgYnl0ZXNcclxuICogdGhpcy5ibHVldG9vdGhTZXJpYWwud3JpdGUoWzE4NiwgMjIwLCAyMjJdKS50aGVuKHN1Y2Nlc3MsIGZhaWx1cmUpO1xyXG4gKlxyXG4gKiAvLyBUeXBlZCBBcnJheVxyXG4gKiB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KDQpO1xyXG4gKiBkYXRhWzBdID0gMHg0MTtcclxuICogZGF0YVsxXSA9IDB4NDI7XHJcbiAqIGRhdGFbMl0gPSAweDQzO1xyXG4gKiBkYXRhWzNdID0gMHg0NDtcclxuICogdGhpcy5ibHVldG9vdGhTZXJpYWwud3JpdGUoZGF0YSkudGhlbihzdWNjZXNzLCBmYWlsdXJlKTtcclxuICpcclxuICogLy8gQXJyYXkgQnVmZmVyXHJcbiAqIHRoaXMuYmx1ZXRvb3RoU2VyaWFsLndyaXRlKGRhdGEuYnVmZmVyKS50aGVuKHN1Y2Nlc3MsIGZhaWx1cmUpO1xyXG4gKiBgYGBcclxuICovXHJcbkBQbHVnaW4oe1xyXG4gIHBsdWdpbk5hbWU6ICdCbHVldG9vdGhTZXJpYWwnLFxyXG4gIHBsdWdpbjogJ2NvcmRvdmEtcGx1Z2luLWJsdWV0b290aC1zZXJpYWwnLCAvLyBucG0gcGFja2FnZSBuYW1lLCBleGFtcGxlOiBjb3Jkb3ZhLXBsdWdpbi1jYW1lcmFcclxuICBwbHVnaW5SZWY6ICdibHVldG9vdGhTZXJpYWwnLCAvLyB0aGUgdmFyaWFibGUgcmVmZXJlbmNlIHRvIGNhbGwgdGhlIHBsdWdpbiwgZXhhbXBsZTogbmF2aWdhdG9yLmdlb2xvY2F0aW9uXHJcbiAgcmVwbzogJ2h0dHBzOi8vZ2l0aHViLmNvbS9yaWdhc3AvQmx1ZXRvb3RoU2VyaWFsLmdpdCcsIC8vIHRoZSBnaXRodWIgcmVwb3NpdG9yeSBVUkwgZm9yIHRoZSBwbHVnaW5cclxuICBpbnN0YWxsOiAnJywgLy8gT1BUSU9OQUwgaW5zdGFsbCBjb21tYW5kLCBpbiBjYXNlIHRoZSBwbHVnaW4gcmVxdWlyZXMgdmFyaWFibGVzXHJcbiAgaW5zdGFsbFZhcmlhYmxlczogW10sIC8vIE9QVElPTkFMIHRoZSBwbHVnaW4gcmVxdWlyZXMgdmFyaWFibGVzXHJcbiAgcGxhdGZvcm1zOiBbJ0FuZHJvaWQnLCdpT1MnLCdXaW5kb3dzIFBob25lIDgnXSAvLyBBcnJheSBvZiBwbGF0Zm9ybXMgc3VwcG9ydGVkLCBleGFtcGxlOiBbJ0FuZHJvaWQnLCAnaU9TJ11cclxufSlcclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgQmx1ZXRvb3RoU2VyaWFsIGV4dGVuZHMgQXdlc29tZUNvcmRvdmFOYXRpdmVQbHVnaW4ge1xyXG5cclxuICAvKipcclxuICAqIENvbm5lY3QgdG8gYSBCbHVldG9vdGggZGV2aWNlXHJcbiAgKiBAcGFyYW0ge3N0cmluZ30gbWFjQWRkcmVzc19vcl91dWlkIElkZW50aWZpZXIgb2YgdGhlIHJlbW90ZSBkZXZpY2VcclxuICAqIEByZXR1cm5zIHtPYnNlcnZhYmxlPGFueT59IFN1YnNjcmliZSB0byBjb25uZWN0LCB1bnN1YnNjcmliZSB0byBkaXNjb25uZWN0LlxyXG4gICovXHJcbiAgQENvcmRvdmEoKVxyXG4gIGNvbm5lY3QobWFjQWRkcmVzc19vcl91dWlkOiBzdHJpbmcsIGRhdGE6IGFueSk6IE9ic2VydmFibGU8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIENvbm5lY3QgaW5zZWN1cmVseSB0byBhIEJsdWV0b290aCBkZXZpY2VcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWFjQWRkcmVzcyBJZGVudGlmaWVyIG9mIHRoZSByZW1vdGUgZGV2aWNlXHJcbiAgICogQHJldHVybnMge09ic2VydmFibGU8YW55Pn0gU3Vic2NyaWJlIHRvIGNvbm5lY3QsIHVuc3Vic2NyaWJlIHRvIGRpc2Nvbm5lY3QuXHJcbiAgICovXHJcbiAgQENvcmRvdmEoKVxyXG4gIGNvbm5lY3RJbnNlY3VyZShtYWNBZGRyZXNzOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm47IH1cclxuICAvKipcclxuICAgKiBEaXNjb25uZWN0IGZyb20gdGhlIGNvbm5lY3RlZCBkZXZpY2VcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICBkaXNjb25uZWN0KCk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBkYXRhIHRvIHRoZSBzZXJpYWwgcG9ydFxyXG4gICAqIEBwYXJhbSB7YW55fSBkYXRhIEFycmF5QnVmZmVyIG9mIGRhdGFcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSByZXR1cm5zIGEgcHJvbWlzZSB3aGVuIGRhdGEgaGFzIGJlZW4gd3JpdHRlblxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICB3cml0ZShkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4geyByZXR1cm47IH1cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgYnl0ZXMgb2YgZGF0YSBhdmFpbGFibGVcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGNvbnRhaW5zIHRoZSBhdmFpbGFibGUgYnl0ZXNcclxuICAgKi9cclxuICBAQ29yZG92YSgpXHJcbiAgYXZhaWxhYmxlKCk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFJlYWRzIGRhdGEgZnJvbSB0aGUgYnVmZmVyXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gcmV0dXJucyBhIHByb21pc2Ugd2l0aCBkYXRhIGZyb20gdGhlIGJ1ZmZlclxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICByZWFkKCk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFJlYWRzIGRhdGEgZnJvbSB0aGUgYnVmZmVyIHVudGlsIGl0IHJlYWNoZXMgYSBkZWxpbWl0ZXJcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGVsaW1pdGVyIHN0cmluZyB0aGF0IHlvdSB3YW50IHRvIHNlYXJjaCB1bnRpbFxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IHJldHVybnMgYSBwcm9taXNlXHJcbiAgICovXHJcbiAgQENvcmRvdmEoKVxyXG4gIHJlYWRVbnRpbChkZWxpbWl0ZXI6IHN0cmluZyk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFN1YnNjcmliZSB0byBiZSBub3RpZmllZCB3aGVuIGRhdGEgaXMgcmVjZWl2ZWRcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gZGVsaW1pdGVyIHRoZSBzdHJpbmcgeW91IHdhbnQgdG8gd2F0Y2ggZm9yXHJcbiAgICogQHJldHVybnMge09ic2VydmFibGU8YW55Pn0gcmV0dXJucyBhbiBvYnNlcnZhYmxlLlxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICBzdWJzY3JpYmUoZGVsaW1pdGVyOiBzdHJpbmcpOiBPYnNlcnZhYmxlPGFueT4geyByZXR1cm47IH1cclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gYmUgbm90aWZpZWQgd2hlbiBkYXRhIGlzIHJlY2VpdmVkXHJcbiAgICogQHJldHVybnMge09ic2VydmFibGU8YW55Pn0gcmV0dXJucyBhbiBvYnNlcnZhYmxlXHJcbiAgICovXHJcbiAgQENvcmRvdmEoKVxyXG4gIHN1YnNjcmliZVJhd0RhdGEoKTogT2JzZXJ2YWJsZTxhbnk+IHsgcmV0dXJuOyB9XHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIGRhdGEgaW4gYnVmZmVyXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gcmV0dXJucyBhIHByb21pc2Ugd2hlbiBjb21wbGV0ZWRcclxuICAgKi9cclxuICBAQ29yZG92YSgpXHJcbiAgY2xlYXIoKTogUHJvbWlzZTxhbnk+IHsgcmV0dXJuOyB9XHJcbiAgLyoqXHJcbiAgICogTGlzdHMgYm9uZGVkIGRldmljZXNcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSByZXR1cm5zIGEgcHJvbWlzZVxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICBsaXN0KCk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFJlcG9ydHMgaWYgYmx1ZXRvb3RoIGlzIGVuYWJsZWRcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSByZXR1cm5zIGEgcHJvbWlzZVxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICBpc0VuYWJsZWQoKTogUHJvbWlzZTxhbnk+IHsgcmV0dXJuOyB9XHJcbiAgLyoqXHJcbiAgICogUmVwb3J0cyB0aGUgY29ubmVjdGlvbiBzdGF0dXNcclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fSByZXR1cm5zIGEgcHJvbWlzZVxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICBpc0Nvbm5lY3RlZCgpOiBQcm9taXNlPGFueT4geyByZXR1cm47IH1cclxuICAvKipcclxuICAgKiBSZWFkcyB0aGUgUlNTSSBmcm9tIHRoZSBjb25uZWN0ZWQgcGVyaXBoZXJhbFxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IHJldHVybnMgYSBwcm9taXNlXHJcbiAgICovXHJcbiAgQENvcmRvdmEoKVxyXG4gIHJlYWRSU1NJKCk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFNob3cgdGhlIEJsdWV0b290aCBzZXR0aW5ncyBvbiB0aGUgZGV2aWNlXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gcmV0dXJucyBhIHByb21pc2VcclxuICAgKi9cclxuICBAQ29yZG92YSgpXHJcbiAgc2hvd0JsdWV0b290aFNldHRpbmdzKCk6IFByb21pc2U8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIEVuYWJsZSBCbHVldG9vdGggb24gdGhlIGRldmljZVxyXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59IHJldHVybnMgYSBwcm9taXNlXHJcbiAgICovXHJcbiAgQENvcmRvdmEoKVxyXG4gIGVuYWJsZSgpOiBQcm9taXNlPGFueT4geyByZXR1cm47IH1cclxuICAvKipcclxuICAgKiBEaXNjb3ZlciB1bnBhaXJlZCBkZXZpY2VzXHJcbiAgICogQHJldHVybnMge1Byb21pc2U8YW55Pn0gcmV0dXJucyBhIHByb21pc2VcclxuICAgKi9cclxuICBAQ29yZG92YSgpXHJcbiAgZGlzY292ZXJVbnBhaXJlZCgpOiBQcm9taXNlPGFueT4geyByZXR1cm47IH1cclxuICAvKipcclxuICAgKiBTdWJzY3JpYmUgdG8gYmUgbm90aWZpZWQgb24gQmx1ZXRvb3RoIGRldmljZSBkaXNjb3ZlcnkuIERpc2NvdmVyeSBwcm9jZXNzIG11c3QgYmUgaW5pdGlhdGVkIHdpdGggdGhlIGBkaXNjb3ZlclVucGFpcmVkYCBmdW5jdGlvbi5cclxuICAgKiBAcmV0dXJucyB7T2JzZXJ2YWJsZTxhbnk+fSBSZXR1cm5zIGFuIG9ic2VydmFibGVcclxuICAgKi9cclxuICBAQ29yZG92YSgpXHJcbiAgc2V0RGV2aWNlRGlzY292ZXJlZExpc3RlbmVyKCk6IE9ic2VydmFibGU8YW55PiB7IHJldHVybjsgfVxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGh1bWFuIHJlYWRhYmxlIGRldmljZSBuYW1lIHRoYXQgaXMgYnJvYWRjYXN0ZWQgdG8gb3RoZXIgZGV2aWNlc1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuZXdOYW1lIERlc2lyZWQgbmFtZSBvZiBkZXZpY2VcclxuICAgKi9cclxuICBAQ29yZG92YSgpXHJcbiAgc2V0TmFtZShuZXdOYW1lOiBzdHJpbmcpOiB2b2lkIHsgcmV0dXJuOyB9XHJcbiAgLyoqXHJcbiAgICogTWFrZXMgdGhlIGRldmljZSBkaXNjb3ZlcmFibGUgYnkgb3RoZXIgZGV2aWNlc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXNjb3ZlcmFibGVEdXJhdGlvbiBEZXNpcmVkIG51bWJlciBvZiBzZWNvbmRzIGRldmljZSBzaG91bGQgYmUgZGlzY292ZXJhYmxlIGZvclxyXG4gICAqL1xyXG4gIEBDb3Jkb3ZhKClcclxuICBzZXREaXNjb3ZlcmFibGUoZGlzY292ZXJhYmxlRHVyYXRpb246IG51bWJlcik6IHZvaWQgeyByZXR1cm47IH1cclxuICBcclxuICBzdGF0aWMgybVmYWM6IMm1bmdjYzAuybXJtUZhY3RvcnlEZWY8Qmx1ZXRvb3RoU2VyaWFsLCBuZXZlcj47XHJcbiAgXHJcbiAgc3RhdGljIMm1cHJvdjogybVuZ2NjMC7Jtcm1SW5qZWN0YWJsZURlZjxCbHVldG9vdGhTZXJpYWw+O1xyXG59XHJcbiJdfQ==