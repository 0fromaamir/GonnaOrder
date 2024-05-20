import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CustomerAuthService } from 'src/app/public/customer-auth.service';
import { getCustomerLoyaltyState, getSelectedStore } from 'src/app/public/store/+state/stores.selectors';
import { CustomerLoyalty } from 'src/app/stores/stores';
import { LoadCustomerLoyalty } from '../../+state/stores.actions';

@Component({
  selector: 'app-store-checkout-loyalty',
  templateUrl: './store-checkout-loyalty.component.html',
  styleUrls: ['./store-checkout-loyalty.component.scss'],
})
export class StoreCheckoutLoyaltyComponent implements OnInit, OnDestroy {
  unsubscribe$: Subject<void> = new Subject<void>();

  loyaltyEnabled = false;
  loyaltyAmountSpent: number;
  loyaltyAmountReward: number;
  customerLoyalty: CustomerLoyalty;
  cusomerLoyaltyStatus: string;
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;
  datePlaceholder = new Date();

  constructor(private store: Store<any>, public auth: CustomerAuthService) {}

  ngOnInit() {
    this.store
      .select(getSelectedStore)
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((selectedStore) => !!selectedStore)
      )
      .subscribe((selectedStore) => {
        this.loyaltyEnabled = !!selectedStore.settings.LOYALTY_SCHEME;
        this.loyaltyAmountSpent = selectedStore.settings.LOYALTY_AMOUNT_SPENT;
        this.loyaltyAmountReward = selectedStore.settings.LOYALTY_AMOUNT_REWARD;
        this.selectedStoreCurrencySymbol = selectedStore.currency.symbol;

        if (selectedStore?.address && selectedStore?.currency) {
          this.selectedStoreLocale = `${selectedStore.address.country.defaultLocale}-${selectedStore.address.country.code}`;
          this.selectedStoreCurrency = selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = selectedStore.currency.symbol;
        }
      });

    this.store
      .select(getCustomerLoyaltyState)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((customerLoyaltyState) => {
        this.customerLoyalty = customerLoyaltyState.data;
        this.cusomerLoyaltyStatus = customerLoyaltyState.status;
      });

      if (this.auth.isUserLoggedIn()) {
        this.store.dispatch(new LoadCustomerLoyalty({
          src: 'StoreCheckoutLoyaltyComponent',
          description: 'Must refetch customer loyalty',
        }));
      }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
