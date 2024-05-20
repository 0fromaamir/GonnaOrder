import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {Store} from '@ngrx/store';
import {getRmsStore} from '../+state/payment.selectors';
import {takeUntil} from 'rxjs/operators';
import {RedirectPaymentProviderPage, SetRmsRequestJsonSuccess} from '../+state/payment.actions';

@Component({
  selector: 'app-rms',
  templateUrl: './rms.component.html',
  styleUrls: ['./rms.component.scss']
})
export class RmsComponent implements OnInit {

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this
    .store
    .select(getRmsStore)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(rms => {
      switch (rms?.rmsState?.status) {
        case 'SET_REQUEST_JSON':
          this.store.dispatch(new SetRmsRequestJsonSuccess());
          break;
        case 'SET_REQUEST_JSON_SUCCESS':
          const requestJSON: any = rms.rmsState.requestJSON;
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
