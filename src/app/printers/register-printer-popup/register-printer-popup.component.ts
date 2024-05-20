import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Printers } from '../printers';
import { AddPrinter } from '../+state/printers.actions';

@Component({
  selector: 'app-register-printer-popup',
  templateUrl: './register-printer-popup.component.html',
  styleUrls: ['./register-printer-popup.component.scss']
})
export class RegisterPrinterPopupComponent implements OnInit {
  
  printerForm: FormGroup;

  constructor(
    private store: Store<Printers>,
    public dialogRef: MatDialogRef<RegisterPrinterPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.printerForm = this.fb.group({
      printerNameInput: ['', Validators.required]
    });
  }

  get printerNameInput() {
    return this.printerForm.get('printerNameInput');
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  registerToStore(pName: string) {
    this.store.dispatch(new AddPrinter({ 
      name: pName, 
      url: this.data.printerUrl,
      type: 'AIRPRINT',
      enabled: true
    }));

    this.dialogRef.close();
  }
}
