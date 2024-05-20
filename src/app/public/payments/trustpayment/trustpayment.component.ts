import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CheckoutService, PAYMENT_METHOD} from "../../store/store-checkout/checkout.service";
import {ClientStore} from "../../../stores/stores";

@Component({
  selector: 'app-trustpayment',
  templateUrl: './trustpayment.component.html',
  styleUrls: ['./trustpayment.component.scss']
})
export class TrustpaymentComponent {

  @ViewChild('trustpaymentsForm') trustpaymentsForm: ElementRef;
  requestJSON: any;

  submitForm(requestJSON: any) {
    this.requestJSON = requestJSON;
    setTimeout(_ => this.trustpaymentsForm.nativeElement?.submit());
  }

}
