import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {select, Store} from "@ngrx/store";
import {StoresState} from "../../+state/stores.reducer";
import {getSelectedStore} from "../../+state/stores.selectors";
import {map} from "rxjs/operators";
import {
  ConnectMollie,
  ConnectStripe, DisConnectMollie,
  DisconnectStripe,
  ToggleStripe
} from "../+state/payment.actions";

@Component({
  selector: 'app-store-payment-mollie',
  templateUrl: './store-payment-mollie.component.html',
  styleUrls: ['./store-payment-mollie.component.scss']
})
export class StorePaymentMollieComponent implements OnInit {
  creditcardPaymentFlag$: Observable<string>;
  mollieOrganizationId$: Observable<string>;
  mollieProfileId$: Observable<string>;
  helpUrl: string;
  mollieConnected: boolean;

  constructor(private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.helpUrl = 'mollie';
    const settings$ = this.store.pipe(
      select(getSelectedStore),
      map(s => s.settings)
    );

    this.creditcardPaymentFlag$ = settings$.pipe(
      map(s => s.PAYMENT_MOLLIE_CREDIT_CARD_ENABLED)
    );

    this.mollieOrganizationId$ = settings$.pipe(
      map(s => s.MOLLIE_ORGANIZATION_ID)
    );

    this.mollieProfileId$ = settings$.pipe(
      map(s => s.MOLLIE_PROFILE_ID)
    );

  }

  connect() {
    this.store.dispatch(new ConnectMollie());
  }

  disconnect() {
    this.store.dispatch(new DisConnectMollie());
  }

  toggleMolliePayments(paymentSettingKey: string, e) {
    this.store.dispatch(new ToggleStripe(paymentSettingKey, e.target.checked as boolean));
  }
}

