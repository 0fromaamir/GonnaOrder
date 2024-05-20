import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { UpdateStandalonePayment } from '../../+state/stores.actions';
import { CheckoutService } from '../../store-checkout/checkout.service';

@Component({
  selector: 'app-standalone-payment-information',
  templateUrl: './standalone-payment-information.component.html',
  styleUrls: ['./standalone-payment-information.component.scss']
})
export class StandalonePaymentInformationComponent implements OnInit, OnChanges {
  @Input() paymentData;
  personalInfoForm: FormGroup;
  typingTimeout;
  constructor(
    private fb: FormBuilder,
    public checkoutService: CheckoutService,
    private store: Store<any>
  ) { }

  ngOnInit(): void {
    this.personalInfoForm = this.fb.group({
      name: ['', Validators.maxLength(200)],
    });
  }

  ngOnChanges(changes: any) {
    if (changes?.paymentData?.currentValue?.customerName !== '') {
      const name = changes?.paymentData?.currentValue?.customerName;
      this.getControl('name')?.setValue(name);
      this.getControl('name')?.updateValueAndValidity();
    }
  }

  getControl(name: string, form: string = 'personalInfoForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  onNameChange() {
    if (this.personalInfoForm.valid){
      clearTimeout(this.typingTimeout);
      const payload = {
        customerName: this.personalInfoForm.getRawValue().name !== '' ? this.personalInfoForm.getRawValue().name : 'null',
      };
      this.typingTimeout = setTimeout(() => {
        this.store.dispatch(new UpdateStandalonePayment(Number(this.paymentData.storeId), this.paymentData.id, payload));
      }, 1500);
    }
  }
}
