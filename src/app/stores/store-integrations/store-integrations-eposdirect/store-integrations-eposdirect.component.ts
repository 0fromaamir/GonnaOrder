import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { getMynextLogin, getSelectedStore } from "../../+state/stores.selectors";
import { takeUntil } from "rxjs/operators";
import { MynextLogin, UpdateStoreSettings } from "../../+state/stores.actions";

@Component({
  selector: 'app-store-integrations-eposdirect',
  templateUrl: './store-integrations-eposdirect.component.html',
  styleUrls: ['./store-integrations-eposdirect.component.scss']
})
export class StoreIntegrationsEposdirectComponent implements OnInit {

  helpUrl: string;
  eposDirectSection = 'epos-direct-dashboard';
  eposDirectCredentialsForm: FormGroup;
  destroyed$ = new Subject<void>();
  maskedPassword: string;

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'eposDirect';
    this.eposDirectCredentialsForm = this.fb.group({
      EPOS_DIRECT_URL: ['', [Validators.required, Validators.maxLength(255), this.noWhitespace, Validators.pattern('^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')]],
      EPOS_DIRECT_USERNAME: ['', [Validators.required, Validators.maxLength(64), this.noWhitespace]],
      EPOS_DIRECT_PASSWORD: ['', [Validators.required, Validators.maxLength(64), this.noWhitespace]],
      EPOS_DIRECT_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.EPOS_DIRECT_USERNAME != null) {
        this.eposDirectSection = 'epos-direct-connected';
        this.maskedPassword = '•'.repeat(s.settings.EPOS_DIRECT_PASSWORD.length);
      }
      this.eposDirectCredentialsForm.get('EPOS_DIRECT_URL').setValue(s.settings.EPOS_DIRECT_URL);
      this.eposDirectCredentialsForm.get('EPOS_DIRECT_USERNAME').setValue(s.settings.EPOS_DIRECT_USERNAME);
      this.eposDirectCredentialsForm.get('EPOS_DIRECT_PASSWORD').setValue(s.settings.EPOS_DIRECT_PASSWORD);
      this.eposDirectCredentialsForm.get('EPOS_DIRECT_ENABLED').setValue(s.settings.EPOS_DIRECT_ENABLED);
    });
  }

  getControl(name: string) {
    return this.eposDirectCredentialsForm.get(name);
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  connectToEposDirect() {
    const formObj = this.eposDirectCredentialsForm.getRawValue();
    formObj.EPOS_DIRECT_ENABLED = !formObj.EPOS_DIRECT_ENABLED;
    this.eposDirectCredentialsForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.eposDirectCredentialsForm.getRawValue()));
    this.eposDirectSection = 'epos-direct-connected';
  }

  disconnectToEposDirect() {
    const formObj = this.eposDirectCredentialsForm.getRawValue();
    formObj.EPOS_DIRECT_URL = null;
    formObj.EPOS_DIRECT_USERNAME = null;
    formObj.EPOS_DIRECT_PASSWORD = null;
    formObj.EPOS_DIRECT_ENABLED = false;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.eposDirectSection = 'epos-direct-dashboard';
  }

  toggleEposDirect() {
    const formObj = this.eposDirectCredentialsForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.eposDirectSection = 'epos-direct-connected';
  }
}
