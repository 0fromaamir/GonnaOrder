import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { getSelectedStore } from "../../+state/stores.selectors";
import { takeUntil } from "rxjs/operators";
import { UpdateStoreSettings } from "../../+state/stores.actions";
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-integrations-eposnow',
  templateUrl: './store-integrations-eposnow.component.html',
  styleUrls: ['./store-integrations-eposnow.component.scss']
})
export class StoreIntegrationsEposnowComponent implements OnInit {

  helpUrl: string;
  eposNowSection = 'epos-now-dashboard';
  eposNowForm: FormGroup;
  destroyed$ = new Subject<void>();
  environment = environment;

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'eposNow';
    this.eposNowForm = this.fb.group({
      EPOS_NOW_LOCATIONID: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      EPOS_NOW_TOKEN: ['', [Validators.pattern('^[0-9]+$')]],
      EPOS_NOW_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.EPOS_NOW_LOCATIONID != null) {
        this.eposNowSection = 'epos-now-connected';
      }
      this.eposNowForm.get('EPOS_NOW_LOCATIONID').setValue(s.settings.EPOS_NOW_LOCATIONID);
      this.eposNowForm.get('EPOS_NOW_TOKEN').setValue(s.settings.EPOS_NOW_TOKEN);
      this.eposNowForm.get('EPOS_NOW_ENABLED').setValue(s.settings.EPOS_NOW_ENABLED);
    });
  }

  getControl(name: string) {
    return this.eposNowForm.get(name);
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  connectToEposNow() {
    const formObj = this.eposNowForm.getRawValue();
    formObj.EPOS_NOW_ENABLED = !formObj.EPOS_NOW_ENABLED;
    formObj.EPOS_NOW_TOKEN = null;
    this.eposNowForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.eposNowForm.getRawValue()));
    this.eposNowSection = 'epos-now-connected';
  }

  disconnectToEposNow() {
    const formObj = this.eposNowForm.getRawValue();
    formObj.EPOS_NOW_LOCATIONID = null;
    formObj.EPOS_NOW_ENABLED = false;
    formObj.EPOS_NOW_TOKEN = null;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.eposNowSection = 'epos-now-dashboard';
  }

  toggleEposDirect() {
    const formObj = this.eposNowForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.eposNowSection = 'epos-now-connected';
  }
}

