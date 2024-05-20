import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-store-integrations-instadelivery',
  templateUrl: './store-integrations-instadelivery.component.html',
  styleUrls: ['./store-integrations-instadelivery.component.scss']
})
export class StoreIntegrationsInstadeliveryComponent implements OnInit {

  helpUrl: string;
  wooDeliverySection = 'woo-delivery-dashboard';
  wooDeliveryCredentialsForm: FormGroup;
  destroyed$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store<any>) { }

  ngOnInit(): void {
    this.helpUrl = 'wooDelivery';
    this.wooDeliveryCredentialsForm = this.fb.group({
      WOO_DELIVERY_MERCHANT_ID: [''],
      WOO_DELIVERY_API_KEY: ['', [Validators.required, Validators.maxLength(64), this.noWhitespace]],
      WOO_DELIVERY_ENABLED: ['']
    });

    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      if (s.settings.WOO_DELIVERY_API_KEY != null) {
        this.wooDeliverySection = 'woo-delivery-connected';
      }
      this.wooDeliveryCredentialsForm.get('WOO_DELIVERY_MERCHANT_ID').setValue(s.settings.WOO_DELIVERY_MERCHANT_ID);
      this.wooDeliveryCredentialsForm.get('WOO_DELIVERY_API_KEY').setValue(s.settings.WOO_DELIVERY_API_KEY);
      this.wooDeliveryCredentialsForm.get('WOO_DELIVERY_ENABLED').setValue(s.settings.WOO_DELIVERY_ENABLED);
    });
  }

  getControl(name: string) {
    return this.wooDeliveryCredentialsForm.get(name);
  }

  noWhitespace(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  connectToWooDelivery() {
    const formObj = this.wooDeliveryCredentialsForm.getRawValue();
    if (!formObj.WOO_DELIVERY_MERCHANT_ID) {
      formObj.WOO_DELIVERY_MERCHANT_ID = '';
    }
    formObj.WOO_DELIVERY_ENABLED = !formObj.WOO_DELIVERY_ENABLED;
    this.wooDeliveryCredentialsForm.patchValue(formObj);
    this.store.dispatch(new UpdateStoreSettings(this.wooDeliveryCredentialsForm.getRawValue()));
    this.wooDeliverySection = 'woo-delivery-connected';
  }

  disconnectToWooDelivery() {
    const formObj = this.wooDeliveryCredentialsForm.getRawValue();
    formObj.WOO_DELIVERY_MERCHANT_ID = null;
    formObj.WOO_DELIVERY_API_KEY = null;
    formObj.WOO_DELIVERY_ENABLED = false;
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.wooDeliverySection = 'woo-delivery-dashboard';
  }

  toggleWedeliver() {
    const formObj = this.wooDeliveryCredentialsForm.getRawValue();
    this.store.dispatch(new UpdateStoreSettings(formObj));
    this.wooDeliverySection = 'woo-delivery-connected';
  }
}
