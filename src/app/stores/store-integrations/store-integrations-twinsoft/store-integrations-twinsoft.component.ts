import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { takeUntil } from "rxjs/operators";
import { getSelectedStore } from '../../+state/stores.selectors';
import { UpdateStoreSettings } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-integrations-twinsoft',
  templateUrl: './store-integrations-twinsoft.component.html',
  styleUrls: ['./store-integrations-twinsoft.component.scss']
})
export class StoreIntegrationsTwinComponent implements OnInit {

  helpUrl: string;
  twinSection = 'twin-dashboard';
  twinForm: FormGroup;
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'twinSoft';
    this.twinForm = this.fb.group({
      TWINSOFT_STORE_ID: ['', [Validators.required, Validators.maxLength(255), this.onlyNumbersValidator()]],
      TWINSOFT_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.TWINSOFT_STORE_ID != null) {
        this.twinSection = 'twinConnected';
      }
     this.twinForm.get('TWINSOFT_STORE_ID').setValue(s.settings.TWINSOFT_STORE_ID);
      this.twinForm.get('TWINSOFT_ENABLED').setValue(s.settings.TWINSOFT_ENABLED);
    });
  }

  onlyNumbersValidator() {
    return (control) => {
      const value = control.value;
      if (value && isNaN(value)) {
        return { onlyNumbers: true };
      }
      return null;
    };
  }

  getControl(name: string) {
    return this.twinForm.get(name);
  }

  connectToTwin() {
    const formObj = this.twinForm.getRawValue();
    formObj.TWINSOFT_ENABLED = !formObj.TWINSOFT_ENABLED;
    this.twinForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.twinForm.getRawValue()));
    this.twinSection = 'twin-connected';
  }

  disconnectToTwin() {
    const formObj = this.twinForm.getRawValue();
    formObj.TWINSOFT_STORE_ID = null;
    formObj.TWINSOFT_ENABLED = true;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.twinSection = 'twin-dashboard';
  }

  toggleTwin() {
    const formObj = this.twinForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.twinSection = 'twin-connected';
  }
}
