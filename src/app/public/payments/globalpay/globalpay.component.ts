import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {getGlobalPayStore} from '../+state/payment.selectors';
import {
  RedirectPaymentProviderPage,
  SetGlobalPayRequestJsonSuccess
} from '../+state/payment.actions';

@Component({
  selector: 'app-globalpay',
  templateUrl: './globalpay.component.html',
  styleUrls: ['./globalpay.component.scss']
})
export class GlobalpayComponent implements OnInit {

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this
    .store
    .select(getGlobalPayStore)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(globalPay => {
      switch (globalPay?.globalPayState?.status) {
        case 'SET_REQUEST_JSON':
          this.store.dispatch(new SetGlobalPayRequestJsonSuccess());
          break;
        case 'SET_REQUEST_JSON_SUCCESS':
          const requestJSON: any = globalPay.globalPayState.requestJSON;
          this.store.dispatch(
            new RedirectPaymentProviderPage(
              requestJSON?.checkoutUrl,
              requestJSON?.paymentFormParams?.callbackUrl,
              requestJSON?.paymentParams?.PAYMENT_REFERENCE
            )
          );
      }
    });
  }


}
