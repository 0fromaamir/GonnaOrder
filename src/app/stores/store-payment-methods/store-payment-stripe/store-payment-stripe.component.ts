import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { map } from 'rxjs/operators';
import { ConnectStripe, DisconnectStripe, ToggleStripe } from '../+state/payment.actions';

@Component({
  selector: 'app-store-payment-stripe',
  templateUrl: './store-payment-stripe.component.html',
  styleUrls: ['./store-payment-stripe.component.scss']
})
export class StorePaymentStripeComponent implements OnInit {

  creditcardPaymentFlag$: Observable<string>;
  stripeId$: Observable<string>;
  helpUrl: string;
  stripeConnected: boolean;

  constructor(private store: Store<StoresState>) { }

  ngOnInit() {
    this.helpUrl = 'stripe';
    const settings$ = this.store.pipe(
      select(getSelectedStore),
      map(s => s.settings)
    );

    this.creditcardPaymentFlag$ = settings$.pipe(
      map(s => s.PAYMENT_STRIPE_CREDIT_CARD_ENABLED)
    );

    this.stripeId$ = settings$.pipe(
      map(s => s.STRIPE_ACCOUNT_ID)
    );

  }

  connect() {
    this.store.dispatch(new ConnectStripe());
  }

  disconnect() {
    this.store.dispatch(new DisconnectStripe());
  }

  toggleStripePayments(paymentSettingKey: string, e) {
    this.store.dispatch(new ToggleStripe(paymentSettingKey, e.target.checked as boolean));
  }
}
