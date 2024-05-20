import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaymentsenseToken } from './payment.types';
import { Observable } from 'rxjs';
import { OrderUpdateRequest } from '../store/types/OrderUpdateRequest';
import { PaymentMethod } from '../store/types/PaymentMethod';
import {environment} from '../../../environments/environment';
import {CartStatusUpdate} from '../store/+state/stores.actions';
import {Store} from '@ngrx/store';
import {LocationService} from '../location.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsenseService {

  constructor(private http: HttpClient, private locationService: LocationService) { }

  createToken(storeId: number, orderUuid: string): Observable<PaymentsenseToken> {
    return this.http.post<PaymentsenseToken>(`api/v2/stores/${storeId}/orders/${orderUuid}/initiatePayment`, {
      paymentMethod: PaymentMethod.CREDIT_CARD_PAYMENTSENSE,
    });
  }

  completePayment(storeId: number, orderUuid: string, data: OrderUpdateRequest) {
    return this.http.put<string>(`api/v2/stores/${storeId}/orders/${orderUuid}`, data);
  }

  handlePaymentSenseFlow(store: Store<any>, data: any, isStandalonePayment: boolean) {
    const paymentsenseForm: HTMLFormElement = document.createElement('form');
    paymentsenseForm.className = 'paymentsenseForm';
    paymentsenseForm.action = data?.paymentFormParams?.callbackUrl;
    paymentsenseForm.method = 'POST';
    const paymentSenseScript = document.createElement('script');
    paymentSenseScript.type = 'text/javascript';
    paymentSenseScript.src = environment.name === 'production' ? 'https://web.e.connect.paymentsense.cloud/assets/js/client.js'
      : 'https://web.e.test.connect.paymentsense.cloud/assets/js/checkout.js';
    paymentSenseScript.setAttribute('data-access-token', '' + data?.paymentFormParams?.accessToken);
    paymentSenseScript.setAttribute('data-amount', '' + data?.paymentFormParams?.totalAmount);
    paymentSenseScript.setAttribute('data-currency-code', '' + data?.paymentFormParams?.currency);
    paymentSenseScript.className = 'connect-checkout-btn';
    paymentSenseScript.async = false;

    paymentSenseScript.onload = () => {
      setTimeout(() => {
        const paymentSenseButton: HTMLButtonElement = paymentsenseForm.querySelector('.connect-btn');
        paymentSenseButton.setAttribute('hidden', 'true');
        paymentSenseButton.click();
        store.dispatch(new CartStatusUpdate('LOADED'));
        setTimeout(() => {
          const paymentSenseCloseButton: HTMLButtonElement = document.querySelector('#connectClose');
          paymentSenseCloseButton.onmouseup = () => {
            document.location.reload();
          };
        });
      });
    };

    let styleSheet;
    if (isStandalonePayment) {
      styleSheet = 'iframe { width: 100%; } .connect-container { z-index: 1000}';
    } else {
      styleSheet = this.locationService.isOrderCapture()
        ? 'iframe { width: 100%; } .connect-container { margin-top: 80px; z-index: 1000; }'
        : 'iframe { width: 100%; } .connect-container { z-index: 1000; }';
    }
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = styleSheet;

    paymentsenseForm.appendChild(paymentSenseScript);
    paymentsenseForm.appendChild(style);
    document.body.appendChild(paymentsenseForm);
  }

}
