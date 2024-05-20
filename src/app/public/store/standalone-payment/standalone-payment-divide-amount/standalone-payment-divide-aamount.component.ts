import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CustomerStandalonePaymentSearch, UpdateStandalonePayment } from '../../+state/stores.actions';
import { createNumberMask } from 'text-mask-addons';
import { getCreatedStandaloneOrderData } from '../../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-standalone-payment-divide-amount',
  templateUrl: './standalone-payment-divide-aamount.component.html',
  styleUrls: ['./standalone-payment-divide-aamount.component.scss']
})
export class StandalonePaymentDivideAamountComponent implements OnInit, OnChanges, OnDestroy {
  @Input() paymentData;
  @Input() currencySymbol;
  paymentTransactionCount = 0;
  divideAmountForm: FormGroup;
  divideBillBy = 2;
  amountMask;
  priceSeparator: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  openBalance: number;
  typingTimeout;
  constructor(private fb: FormBuilder, private store: Store<any>, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const queryParams = this.getParamsFromURL();
    if (this.paymentData) {
      if (queryParams.parameterName === 'orderToken') {
        this.store.dispatch(new CustomerStandalonePaymentSearch(this.paymentData.storeId, queryParams.parameterValue, null, null));
      } else if (queryParams.parameterName === 'l') {
        this.store.dispatch(
          new CustomerStandalonePaymentSearch(
            this.paymentData.storeId,
            null,
            queryParams.parameterValue,
            this.paymentData.tapId.toString())
        );
      }
    }
    this.store.select(getCreatedStandaloneOrderData).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state.status === 'ITEMSEARCHSUCCESS') {
          this.paymentTransactionCount = state.standalonePaymentOrders ? state.standalonePaymentOrders.length : 0;
          this.openBalance = state.openBalance;
          this.getControl('specificAmount')?.setValue(this.formatAmount(state.openBalance));
          this.getControl('specificAmount')?.updateValueAndValidity();
        }
      });

    const divideAmountMethod = '0';
    this.divideAmountForm = this.fb.group({
      divideAmountType: [divideAmountMethod, Validators.compose([Validators.required])],
      specificAmount: ['', Validators.compose([Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
    });
    if (this.paymentData) {
      this.amountMask = createNumberMask({
        prefix: '',
        allowDecimal: true,
        decimalLimit: 2,
        integerLimit: 5,
        requireDecimal: true,
        decimalSymbol: this.paymentData.formattedAmountReference.indexOf(',') > 0 ||
          this.paymentData.formattedAmountReference.indexOf('٫') > 0 ? ',' : '.',
        includeThousandsSeparator: false
      });
      this.priceSeparator = this.paymentData.formattedAmountReference.indexOf(',') > 0 || this.paymentData.formattedAmountReference.indexOf('٫') > 0 ? ',' : '.';
    }
    this.getControl('divideAmountType')?.setValue('0');
  }

  ngOnChanges(changes: any) {
    if (changes.paymentData) {
      if ((changes.paymentData.currentValue.divideBillBy === null ||
        changes.paymentData.currentValue.dividedBillBy === undefined ||
        changes.paymentData.currentValue.dividedBillBy === 0) &&
        (changes.paymentData.currentValue.amountSelected === changes.paymentData.currentValue.amountReference ||
          changes.paymentData.currentValue.amountSelected === this.openBalance)) {
        this.getControl('divideAmountType')?.setValue('0');
      } else if ((changes.paymentData.currentValue.divideBillBy === null ||
        changes.paymentData.currentValue.dividedBillBy === undefined) &&
        changes.paymentData.currentValue.amountSelected !== 0) {
        this.getControl('divideAmountType')?.setValue('2');
      }

      if (changes.paymentData.currentValue.divideBillBy !== 0 && changes.paymentData.currentValue.divideBillBy) {
        this.divideBillBy = changes.paymentData.currentValue.divideBillBy;
        this.getControl('divideAmountType')?.setValue('1');
      }
      this.getControl('specificAmount')?.setValue(this.formatAmount(changes.paymentData.currentValue.amountSelected));
      this.getControl('divideAmountType')?.updateValueAndValidity();
      this.getControl('specificAmount')?.updateValueAndValidity();
    }
  }

  getParamsFromURL() {
    let parameterName;
    let parameterValue;
    this.route.params.subscribe(val => {
      parameterName = Object.keys(val)[0];
      parameterValue = Object.values(val)[0];
    });
    return {
      parameterName,
      parameterValue
    };
  }

  onDecreaseItemQty(event, item): void {
    event.stopPropagation();
    if (item !== 2) {
      this.divideBillBy = item - 1;
    }
  }

  onIncreaseItemQty(event, item): void {
    event.stopPropagation();
    if (item < 10) {
      this.divideBillBy = item + 1;
    }
  }

  getControl(name: string) {
    return this.divideAmountForm?.get(name);
  }

  handleOptionClick($event, value: string) {
    $event.stopPropagation();
    if (value === '0') {
      this.divideBillBy = 2;
      const payload = {
        divideBillBy: 0
      };
      this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
    } else if (value === '1') {
      const payload = {
        divideBillBy: this.divideBillBy
      };
      this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
    } else if (value === '2') {
      clearTimeout(this.typingTimeout);
      if (this.divideAmountForm.valid && Number(this.divideAmountForm.getRawValue().specificAmount.replace(',', '.')) !== 0) {
        const payload = {
          amountSelected: Number(this.divideAmountForm.getRawValue().specificAmount.replace(',', '.')),
        };
        this.typingTimeout = setTimeout(() => {
          this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
        }, 2000);
      } else {
        const payload = {
          amountSelected: this.paymentTransactionCount === 0 ? this.paymentData.amountReference : this.openBalance,
        };
        this.typingTimeout = setTimeout(() => {
          this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
          this.getControl('specificAmount')?.setValue(this.formatAmount(this.paymentData.amountSelected));
          this.getControl('specificAmount')?.updateValueAndValidity();
        }, 2000);
      }
    }
  }

  focusInput(){
    this.getControl('divideAmountType')?.setValue('2');
    this.getControl('divideAmountType')?.updateValueAndValidity();
  }

  formatAmount(val) {
    let amount = '';
    const arr = val.toString().split(/[.,]+/);
    if (arr[1] === undefined || arr[1] === '') {
      amount = val + this.priceSeparator + '00';
    } else {
      amount = val.toString().replace('.', this.priceSeparator);
    }
    return amount;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
