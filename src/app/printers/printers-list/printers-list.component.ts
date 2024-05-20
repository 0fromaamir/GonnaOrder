import { Observable, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Paging } from 'src/app/api/types/Pageable';
import { Store } from '@ngrx/store';
import { Printers, PrinterInfo } from '../printers';
import { getPrintersList } from '../+state/printers.selectors';
import { PrinterService } from '../printer.service';
import { RemovePrinter, TogglePrinterAutoStatus } from '../+state/printers.actions';
import { RegisterPrinterPopupComponent } from '../register-printer-popup/register-printer-popup.component';
import { PrinterListPopupComponent } from '../printer-list-popup/printer-list-popup.component';
import { Platform } from '@ionic/angular';
import { LogService } from 'src/app/shared/logging/LogService';
import { ToastrService } from 'ngx-toastr';
import { StoresService } from 'src/app/stores/stores.service';

@Component({
  selector: 'app-printers-list',
  templateUrl: './printers-list.component.html',
  styleUrls: ['./printers-list.component.scss']
})
export class PrintersListComponent implements OnInit, OnDestroy {

  printers$: Observable<any>;

  printerName: any;
  printerUrl: any;

  selectedPrinterInfo: PrinterInfo;
  
  @ViewChild('unregisterPrinter', {static: false}) unregisterPrinter: TemplateRef<any>;
  
  private destroy$ = new Subject();

  constructor(private store: Store<Printers>, 
    private printerService: PrinterService,
    private platform: Platform,
    public dialog: MatDialog,
    private logger: LogService,
    private toastService: ToastrService,
    private storeService: StoresService
    ) { }

  ngOnInit() {
    this.printers$ = this.store.select(getPrintersList);
  }

  ngOnDestroy() {

  }

  testPrint(printerInfo: PrinterInfo) {
    this.printerService.testPrint(printerInfo.mode, printerInfo.name, printerInfo.ip,
                                  printerInfo.port, printerInfo.macAddr, printerInfo.paperWidth);
  }

  registerPrinter() {
    if (this.printerService.isIOS()) {
      this.printerService.airPrinter.pick()
      .then((url) => {
        if (!!url) {
          this.printerUrl = url;
          const dialogRef = this.dialog.open(RegisterPrinterPopupComponent, 
            { 
              width: '70%',
              data: { printerUrl: url }
            }
          );
        } else {
          this.logger.error('Invalid airprint printer url!');
        }
      })
    } else if (this.printerService.isAndroid()) {
      // const mockup = [ { modelName: "TSP700II", macAddress: "00:00:00:00", portName: "TCP:192.168.1.1" } ]
      const dialogRef = this.dialog.open(PrinterListPopupComponent, 
        { 
          width: '70%',
          data: {
            // printerTypes: ['STAR', 'ESC/POS'],
            printerTypes: ['ESC/POS'],
            // starPrinterList: mockup,
            printerModes: ['Bluetooth', 'WiFi/Ethernet'],
          }
        }
      );
    }
  }

  onPrinterRemoveClick(printerInfo: PrinterInfo) {
    this.selectedPrinterInfo = printerInfo;
    const dialogRef = this.dialog.open(this.unregisterPrinter, { width: '70%' });
  }

  onPrinterRemove() {
    this.store.dispatch(new RemovePrinter(this.selectedPrinterInfo.url));
    this.storeService.removeStorageForPrinters('enabledPrinters', this.selectedPrinterInfo.name);
    this.dialog.closeAll();
  }

  onCancelClick(){
    this.dialog.closeAll();
  }
  
  togglePrinterAuto($event: any, printerInfo: PrinterInfo) {
    if ($event.target.checked === true) {
      this.store.dispatch(new TogglePrinterAutoStatus(printerInfo.url, true));
      this.storeService.setStorageForPrinters('enabledPrinters', printerInfo);
    } else {
      this.store.dispatch(new TogglePrinterAutoStatus(printerInfo.url, false));
      this.storeService.removeStorageForPrinters('enabledPrinters', printerInfo.name);
    }
  }

  paginate(paging: Paging) {
    // this.store.dispatch(new LoadStoresPage(paging, !!this.aliasName ? this.aliasName : ""));
  }

  isAndroid() {
    return this.platform.is('android');
  }

  isIOS() {
    return this.platform.is('ios');
  }
}
