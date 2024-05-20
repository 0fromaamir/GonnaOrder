import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateStandalonePayment } from '../../+state/stores.actions';
import { StandalonePaymentOrder } from '../../types/StandalonePayment';
import { createNumberMask } from 'text-mask-addons';

@Component({
  selector: 'app-standalone-payment-tip',
  templateUrl: './standalone-payment-tip.component.html',
  styleUrls: ['./standalone-payment-tip.component.scss']
})
export class StandalonePaymentTipComponent implements OnInit, OnChanges {
  @Input() paymentData: StandalonePaymentOrder;
  @Input() currencySymbol;
  tipAmountForm: FormGroup;
  showCustomAmount = false;
  amountMask;
  priceSeparator: string;
  typingTimeout;
  constructor(private store: Store<any>, private fb: FormBuilder) { }

  ngOnInit(): void {
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
    this.tipAmountForm = this.fb.group({
      specificAmount: ['', Validators.compose([Validators.maxLength(128), Validators.pattern('^[0-9].*$')])],
    });
  }

  ngOnChanges(changes: any) {
    if (changes?.paymentData?.currentValue?.amountSelected !== changes?.paymentData?.previousValue?.amountSelected) {
      const payload = {
        tipPercentage: changes.paymentData.currentValue.tipPercentage
      };
      this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
    }
    if ((changes?.paymentData?.currentValue?.tipPercentage === 0 ||
      changes?.paymentData?.currentValue?.tipPercentage === undefined) &&
      changes?.paymentData?.currentValue?.amountTip !== 0) {
      this.showCustomAmount = true;
      this.getControl('specificAmount')?.setValue(this.formatAmount(changes.paymentData.currentValue.amountTip).toString());
    } else if (changes?.paymentData?.currentValue?.tipPercentage !== 0 || changes?.paymentData?.currentValue?.tipPercentage !== undefined) {
      this.getControl('specificAmount')?.setValue('');
    }
    this.getControl('specificAmount')?.updateValueAndValidity();
  }

  ontipBtnClick(tipPercentage: number): void {
    this.showCustomAmount = false;
    const payload = {
      tipPercentage
    };
    this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
  }

  onCustomBtnClick(e): void {
    this.showCustomAmount = true;
  }

  getControl(name: string) {
    return this.tipAmountForm?.get(name);
  }

  onCustomAmountChange() {
    if (this.tipAmountForm.valid) {
      clearTimeout(this.typingTimeout);
      const payload = {
        amountTip: Number(this.tipAmountForm.getRawValue().specificAmount.replace(',', '.')),
        tipPercentage: null
      };
      this.typingTimeout = setTimeout(() => {
        this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
        if (Number(this.tipAmountForm.getRawValue().specificAmount.replace(',', '.')) === 0) {
          this.showCustomAmount = false;
          this.getControl('specificAmount')?.setValue('');
          this.getControl('specificAmount')?.updateValueAndValidity();
        }
      }, 1500);
    }
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
}
