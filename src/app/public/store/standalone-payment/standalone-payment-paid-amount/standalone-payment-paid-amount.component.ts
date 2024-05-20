import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getCreatedStandaloneOrderData } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { StandalonePaymentOrder } from '../../types/StandalonePayment';

@Component({
  selector: 'app-standalone-payment-paid-amount',
  templateUrl: './standalone-payment-paid-amount.component.html',
  styleUrls: ['./standalone-payment-paid-amount.component.scss']
})
export class StandalonePaymentPaidAmountComponent implements OnInit, OnDestroy {
  unsubscribe$: Subject<void> = new Subject<void>();
  standalonePaymentOrders: StandalonePaymentOrder[] = [];
  formattedPaidAmount: string;
  formattedRemainingAmount: string;
  remainingAmount: number;
  constructor(
    private store: Store<any>
  ) { }

  ngOnInit(): void {
    this.store.select(getCreatedStandaloneOrderData).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state.status === 'ITEMSEARCHSUCCESS') {
          this.standalonePaymentOrders = state.standalonePaymentOrders;
          this.formattedPaidAmount = state.formattedTotalPaid;
          this.formattedRemainingAmount = state.formattedOpenBalance;
          this.remainingAmount = state.openBalance;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
