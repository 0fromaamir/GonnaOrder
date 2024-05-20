import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {Store} from '@ngrx/store';
import {RealexPayment, RealexPaymentState} from '../+state/payment.reducer';
import {getRealexPaymentStore} from '../+state/payment.selectors';
import {takeUntil} from 'rxjs/operators';

declare var RealexHpp;

@Component({
  selector: 'app-realexpayment',
  templateUrl: './realexpayment.component.html',
  styleUrls: ['./realexpayment.component.scss']
})
export class RealexpaymentComponent implements OnInit {

  constructor(private store: Store<RealexPayment>) {
  }

  @ViewChild('payNow') payNow: ElementRef<HTMLDivElement>;
  unsubscribe$: Subject<void> = new Subject<void>();

  ngOnInit(): void {
    this
    .store
    .select(getRealexPaymentStore)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(realexPayment => {
      switch (realexPayment?.realexPaymentState.status) {
        case 'REDIRECT_PAYMENT_PROVIDER_PAGE':
          const realexPaymentState: RealexPaymentState = realexPayment.realexPaymentState;
          this.redirect(realexPaymentState.hppUrl, realexPaymentState.responseUrl, realexPaymentState.jsonFromRequestEndpoint);
      }
    });
  }

  redirect(hppUrl: string, responseUrl: string, jsonFromRequestEndpoint: any) {
    if (hppUrl && responseUrl && jsonFromRequestEndpoint) {
      RealexHpp.setHppUrl(hppUrl);
      RealexHpp.redirect.init('payNow', responseUrl, JSON.parse(jsonFromRequestEndpoint));
      this.payNow.nativeElement.click();
    }
  }
}
