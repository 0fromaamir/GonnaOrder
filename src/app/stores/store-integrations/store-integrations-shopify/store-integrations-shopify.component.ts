import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateStoreSettings } from '../../+state/stores.actions';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-store-integrations-shopify',
  templateUrl: './store-integrations-shopify.component.html',
  styleUrls: ['./store-integrations-shopify.component.scss'],
})
export class StoreIntegrationsShopifyComponent implements OnInit {

  shopifySection = 'shopify-dashboard';
  shopifyCredentialsForm: FormGroup;
  destroyed$ = new Subject<void>();
  invalidCredentials: boolean;
  shopifyData: any;
  helpUrlShopify: string;

  constructor(private fb: FormBuilder, private store: Store<any>) {}

  ngOnInit(): void {
    this.helpUrlShopify = 'shopify';

    this.shopifyCredentialsForm = this.fb.group({
      SHOPIFY_SECRET: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
      ],
      SHOPIFY_URL: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
      ],
      SHOPIFY_LOCATION_ID: [
        '',
        Validators.compose([Validators.required, Validators.maxLength(100)]),
      ],
      SHOPIFY_INTEGRATION_ENABLED: false,
    });

    this.store
      .pipe(select(getSelectedStore), takeUntil(this.destroyed$))
      .subscribe((s) => {
        if (
          s &&
          s.id !== -1 &&
          s.settings.SHOPIFY_SECRET &&
          s.settings.SHOPIFY_URL &&
          s.settings.SHOPIFY_LOCATION_ID
        ) {
          this.shopifyData = {
            SHOPIFY_SECRET: s.settings.SHOPIFY_SECRET,
            SHOPIFY_URL: s.settings.SHOPIFY_URL,
            SHOPIFY_LOCATION_ID: s.settings.SHOPIFY_LOCATION_ID,
            SHOPIFY_INTEGRATION_ENABLED: s.settings.SHOPIFY_INTEGRATION_ENABLED,
          };
          this.shopifySection = 'shopify-connect';
        } else {
          this.shopifySection = 'shopify-dashboard';
          this.shopifyData = {
            SHOPIFY_SECRET: undefined,
            SHOPIFY_URL: undefined,
            SHOPIFY_LOCATION_ID: undefined,
            SHOPIFY_INTEGRATION_ENABLED: false,
          };
          this.shopifyCredentialsForm.setValue({
            SHOPIFY_SECRET: '',
            SHOPIFY_URL: '',
            SHOPIFY_LOCATION_ID: '',
            SHOPIFY_INTEGRATION_ENABLED: false,
          });
        }
      });
  }

  onSubmit(): void {
    if (this.shopifyCredentialsForm.valid) {
      this.store.dispatch(new UpdateStoreSettings(this.shopifyCredentialsForm.value));
    }
  }

  getControl(name: string) {
    return this.shopifyCredentialsForm.get(name);
  }

  updateEnabled(event): void {
    this.shopifyData.SHOPIFY_INTEGRATION_ENABLED = event.target.checked;
    this.store.dispatch(new UpdateStoreSettings(this.shopifyData));
  }

  disconnectShopify(): void {
    this.store.dispatch(new UpdateStoreSettings({
      SHOPIFY_SECRET: undefined,
      SHOPIFY_URL: undefined,
      SHOPIFY_LOCATION_ID: undefined,
      SHOPIFY_INTEGRATION_ENABLED: false,
    }));
  }
}
