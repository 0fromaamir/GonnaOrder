import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { select, Store } from "@ngrx/store";
import { getMynextLogin, getSelectedStore } from "../../+state/stores.selectors";
import { takeUntil } from "rxjs/operators";
import { MynextLogin, UpdateStoreSettings } from "../../+state/stores.actions";

@Component({
  selector: 'app-store-integrations-hit',
  templateUrl: './store-integrations-hit.component.html',
  styleUrls: ['./store-integrations-hit.component.scss']
})
export class StoreIntegrationsHitComponent implements OnInit {

  helpUrl: string;
  hitSection = 'hit-dashboard';
  hitForm: FormGroup;
  destroyed$ = new Subject<void>();
  maskedPassword: string;

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'hit';
    this.hitForm = this.fb.group({
      HIT_URL: ['', [Validators.required, Validators.maxLength(255), Validators.pattern('^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$')]],
      HIT_USERNAME: ['', [Validators.required, Validators.maxLength(64)]],
      HIT_PASSWORD: ['', [Validators.required, Validators.maxLength(64)]],
      HIT_STORE_ID: ['', [Validators.required, Validators.maxLength(64)]],
      HIT_DEFAULTCUSTOMER_ID: ['', [Validators.required, Validators.maxLength(64)]],
      HIT_SHIPPINGADDRESS_ID: ['', [Validators.required, Validators.maxLength(64)]],
      HIT_PRICELIST_ID: ['', [Validators.required, Validators.maxLength(64)]],
      HIT_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.HIT_USERNAME != null) {
        this.hitSection = 'hit-connected';
        this.maskedPassword = '•'.repeat(s.settings.HIT_PASSWORD.length);
      }
      this.hitForm.get('HIT_URL').setValue(s.settings.HIT_URL);
      this.hitForm.get('HIT_USERNAME').setValue(s.settings.HIT_USERNAME);
      this.hitForm.get('HIT_PASSWORD').setValue(s.settings.HIT_PASSWORD);
      this.hitForm.get('HIT_STORE_ID').setValue(s.settings.HIT_STORE_ID);
      this.hitForm.get('HIT_DEFAULTCUSTOMER_ID').setValue(s.settings.HIT_DEFAULTCUSTOMER_ID);
      this.hitForm.get('HIT_SHIPPINGADDRESS_ID').setValue(s.settings.HIT_SHIPPINGADDRESS_ID);
      this.hitForm.get('HIT_PRICELIST_ID').setValue(s.settings.HIT_PRICELIST_ID);
      this.hitForm.get('HIT_ENABLED').setValue(s.settings.HIT_ENABLED);
    });
  }

  getControl(name: string) {
    return this.hitForm.get(name);
  }

  connectToHit() {
    const formObj = this.hitForm.getRawValue();
    formObj.HIT_ENABLED = !formObj.HIT_ENABLED;
    this.hitForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.hitForm.getRawValue()));
    this.hitSection = 'hit-connected';
  }

  disconnectToHit() {
    const formObj = this.hitForm.getRawValue();
    formObj.HIT_URL = null;
    formObj.HIT_USERNAME = null;
    formObj.HIT_PASSWORD = null;
    formObj.HIT_STORE_ID = null;
    formObj.HIT_DEFAULTCUSTOMER_ID = null;
    formObj.HIT_SHIPPINGADDRESS_ID = null;
    formObj.HIT_PRICELIST_ID = null;
    formObj.HIT_ENABLED = false;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.hitSection = 'hit-dashboard';
  }

  toggleHit() {
    const formObj = this.hitForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.hitSection = 'hit-connected';
  }
}
