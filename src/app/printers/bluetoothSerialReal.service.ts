import { Injectable } from "@angular/core";
import { BluetoothSerial } from "bluetooth-serial/ngx";

@Injectable({
    providedIn: 'root'
})
export class BluetoothSerialService {

    constructor() {}

    async loadBluetoothSerial() {
        try {
            return new BluetoothSerial();
        } catch (error) {
            console.error('"bluetoothSerial".', error);
        }
    }
}