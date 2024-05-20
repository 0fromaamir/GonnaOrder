import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { PrinterInfo, PrintersList } from '../printers';
import { getPrintersList } from '../+state/printers.selectors';
import { DownloadOrderPdfAndPrint } from '../+state/printers.actions';

@Component({
  selector: 'app-select-printer-popup',
  templateUrl: './select-printer-popup.component.html',
  styleUrls: ['./select-printer-popup.component.scss']
})
export class SelectPrinterPopupComponent implements OnInit {
  
  printers$: Observable<any>;
  printers: PrintersList;
  
  printerSelectForm: FormGroup;

  selectedPrinterUrl: string;

  constructor(
    private store: Store<any>,
    public dialogRef: MatDialogRef<SelectPrinterPopupComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.printers$ = this.store.select(getPrintersList);
    
    this.printerSelectForm = this.fb.group({
      printerSelect: ['', Validators.required]
    });

    this.printers$.subscribe(list => {
      this.printers = { ...list };
      if (this.printers.data.length == 1) {
        this.printerSelect.setValue(this.printers.data[0].url);
        this.selectedPrinterUrl = this.printers.data[0].url;
        this.printOrder();
      }
    })

  }

  get printerSelect() {
    return this.printerSelectForm.get('printerSelect');
  }
  
  onPrinterChanged(e) {
    if (!e) {
      return;
    }
    if (e.value) {
      this.selectedPrinterUrl = e.value;
    } 
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  printOrder() {
    if (this.selectedPrinterUrl) {
      const selectedPrinter: PrinterInfo = this.printers.data.find(el => el.url == this.selectedPrinterUrl)
      selectedPrinter.url = this.selectedPrinterUrl;
      this.store.dispatch(new DownloadOrderPdfAndPrint(this.data.storeId, 
        this.data.order.uuid,
        this.data.order.uiLanguageLocale,
        this.data.order.catalogLanguageLocale,
        selectedPrinter,
      ));
      this.dialogRef.close();
    }
  }

}
