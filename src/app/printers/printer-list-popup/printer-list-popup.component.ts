import { Component, OnInit, Inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Printers } from '../printers';
import { AddPrinter } from '../+state/printers.actions';
import { StoresService } from 'src/app/stores/stores.service';
import { PrinterService } from '../printer.service';
import { catchError } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { BluetoothSerialService } from '../bluetoothSerial.service';

@Component({
  selector: 'app-printer-list-popup',
  templateUrl: './printer-list-popup.component.html',
  styleUrls: ['./printer-list-popup.component.scss']
})
export class PrinterListPopupComponent implements OnInit {
  
  printersForm: FormGroup;
  printerTestSuccess = false;
  btDevicesList = [];
  bluetoothSerial: any;

  constructor(
    private store: Store<Printers>,
    public dialogRef: MatDialogRef<PrinterListPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private storeService: StoresService,
    private printerService: PrinterService,
    private platform: Platform,
    private bluetoothSerialService: BluetoothSerialService
  ) { }

  ngOnInit() {
    this.printersForm = this.fb.group({
      printerTypeSelect: ['ESC/POS', Validators.required],
      starPrinterSelect: [''],
      printerModeSelect: [''],
      connectionParamsIpInput: [''],
      connectionParamsPortInput: ['9100'],
      connectionParamsBluetoothInput: [''],
      connectionParamsPaperWidthInput: ['78.5'],
      printerNameInput: ['', Validators.required]
    });

    this.platform.ready().then(() => {
      this.bluetoothSerial = this.bluetoothSerialService.loadBluetoothSerial().then(
        bluetoothSerial => this.bluetoothSerial = bluetoothSerial
      );
    });
  }

  get starPrinterSelect() {
    return this.printersForm.get('starPrinterSelect');
  }

  get printerNameInput() {
    return this.printersForm.get('printerNameInput');
  }

  get printerTypeSelect() {
    return this.printersForm.get('printerTypeSelect');
  }

  get printerModeSelect() {
    return this.printersForm.get('printerModeSelect');
  }

  get connectionParamsIpInput() {
    return this.printersForm.get('connectionParamsIpInput');
  }

  get connectionParamsPortInput() {
    return this.printersForm.get('connectionParamsPortInput');
  }

  get connectionParamsBluetoothInput() {
    return this.printersForm.get('connectionParamsBluetoothInput');
  }

  get connectionParamsPaperWidthInput() {
    return this.printersForm.get('connectionParamsPaperWidthInput');
  }

  onPrinterModeChange() {
    this.printerTestSuccess = false;
    this.cdRef.detectChanges();
    this.connectionParamsBluetoothInput.clearValidators();
    this.connectionParamsIpInput.clearValidators();
    this.connectionParamsPortInput.clearValidators();
    if (this.printerModeSelect.value === 'Bluetooth') {
      this.connectionParamsBluetoothInput.setValidators([Validators.required]);
      this.bluetoothSerial.enable().catch(err => console.log(err));
    } else if (this.printerModeSelect.value === 'WiFi/Ethernet') {
      this.connectionParamsIpInput.setValidators([Validators.required]);
      this.connectionParamsPortInput.setValidators([Validators.required]);
    }
    this.connectionParamsBluetoothInput.updateValueAndValidity();
    this.connectionParamsIpInput.updateValueAndValidity();
    this.connectionParamsPortInput.updateValueAndValidity();
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
  
  listDevices() {
    this.bluetoothSerial.isEnabled().then((data)=> {
      console.log(data);
      this.bluetoothSerial.list().then((allDevices) => {
        this.btDevicesList = allDevices;
      });
    }, catchError((err) => err));
  }

  testPrint() {
    this.printersForm.markAllAsTouched();
    if (this.printersForm.valid) {
      this.printerTestSuccess = false; 
      this.printerService.testPrint(this.printerModeSelect.value,
                                    this.printerNameInput.value,
                                    this.connectionParamsIpInput.value,
                                    this.connectionParamsPortInput.value,
                                    this.connectionParamsBluetoothInput.value,
                                    this.connectionParamsPaperWidthInput.value)
          .then(testPrinttatus => this.printerTestSuccess = testPrinttatus);
    }
  }

  registerToStore() {
    this.printersForm.markAllAsTouched();
    if (this.printersForm.valid) {
      const printerInfo = {
        type: this.printerTypeSelect.value,
        name: this.printerNameInput.value,
        mode: this.printerModeSelect.value,
        ip: this.connectionParamsIpInput.value,
        port: this.connectionParamsPortInput.value,
        macAddr: this.connectionParamsBluetoothInput.value,
        url: (this.printerTypeSelect.value === 'STAR') ? this.starPrinterSelect.value : this.printerNameInput.value,
        paperWidth: this.connectionParamsPaperWidthInput.value,
        enabled: true
      };
      this.store.dispatch(new AddPrinter(printerInfo));
      this.storeService.setStorageForPrinters('enabledPrinters', printerInfo);

      this.ngZone.run(() => {
        this.dialogRef.close();
      });
    }
  }
}
