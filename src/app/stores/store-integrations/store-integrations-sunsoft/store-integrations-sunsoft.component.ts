import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { getSelectedStore } from "../../+state/stores.selectors";
import { takeUntil } from "rxjs/operators";
import { UpdateStoreSettings } from "../../+state/stores.actions";
import { CustomValidators } from 'src/app/shared/custom.validators';

@Component({
  selector: 'app-store-integrations-sunsoft',
  templateUrl: './store-integrations-sunsoft.component.html',
  styleUrls: ['./store-integrations-sunsoft.component.scss']
})
export class StoreIntegrationsSunsoftComponent implements OnInit {
  helpUrl: string;
  sunSoftSection = 'sunsoft-dashboard';
  sunSoftForm: FormGroup;
  destroyed$ = new Subject<void>();
  maskedPassword: string;

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'sunSoft';
    this.sunSoftForm = this.fb.group({
      SUNSOFT_BASE_URL: ['', [
        Validators.required,
        Validators.maxLength(255),
        CustomValidators.noWhitespaceValidator,
        Validators.pattern('^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')
      ]],
      SUNSOFT_USERNAME: ['', [
        Validators.required,
        Validators.maxLength(64),
        CustomValidators.noWhitespaceValidator
      ]],
      SUNSOFT_PASSWORD: ['', [
        Validators.required,
        Validators.maxLength(64),
        CustomValidators.noWhitespaceValidator
      ]],
      SUNSOFT_DEVICE: ['', [
        Validators.required,
        Validators.maxLength(128),
        CustomValidators.noWhitespaceValidator
      ]],
      SUNSOFT_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.SUNSOFT_USERNAME != null) {
        this.sunSoftSection = 'sunsoft-connected';
        this.maskedPassword = '•'.repeat(s.settings.SUNSOFT_PASSWORD.length);
      }
      this.sunSoftForm.get('SUNSOFT_BASE_URL').setValue(s.settings.SUNSOFT_BASE_URL);
      this.sunSoftForm.get('SUNSOFT_USERNAME').setValue(s.settings.SUNSOFT_USERNAME);
      this.sunSoftForm.get('SUNSOFT_PASSWORD').setValue(s.settings.SUNSOFT_PASSWORD);
      this.sunSoftForm.get('SUNSOFT_DEVICE').setValue(s.settings.SUNSOFT_DEVICE);
      this.sunSoftForm.get('SUNSOFT_ENABLED').setValue(s.settings.SUNSOFT_ENABLED);
    });
  }

  getControl(name: string) {
    return this.sunSoftForm.get(name);
  }

  connectToSunsoft() {
    const formObj = this.sunSoftForm.getRawValue();
    formObj.SUNSOFT_ENABLED = !formObj.SUNSOFT_ENABLED;
    this.sunSoftForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.sunSoftForm.getRawValue()));
    this.sunSoftSection = 'sunsoft-connected';
  }

  disconnectToSunsoft() {
    const formObj = this.sunSoftForm.getRawValue();
    formObj.SUNSOFT_BASE_URL = null;
    formObj.SUNSOFT_USERNAME = null;
    formObj.SUNSOFT_PASSWORD = null;
    formObj.SUNSOFT_DEVICE = null;
    formObj.SUNSOFT_ENABLED = false;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.sunSoftSection = 'sunsoft-dashboard';
  }

  toggleSunsoft() {
    const formObj = this.sunSoftForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.sunSoftSection = 'sunsoft-connected';
  }
}
