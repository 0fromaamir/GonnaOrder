import {Observable} from 'rxjs';
import {OrderUpdateRequest} from '../store/types/OrderUpdateRequest';
import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {InitiateOrderPaymentResponse} from '../store/types/OrderPayment';
import {ORIGIN_TYPE} from "../store/store-checkout/checkout.service";
import {HelperService} from "../helper.service";
import {WINDOW} from "../window-providers";
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient,
              private helperService: HelperService,
              @Inject(WINDOW) private window: Window,
              ) {
  }

  initiateOrderPayment(storeId: number, orderUuid: string, data: any): Observable<InitiateOrderPaymentResponse> {
    let headers = new HttpHeaders();
    // use for payment redirection flow strip flow backward compatible
    headers = headers.set('payment-flow-version', '3');
    return this.http.post<any>(`api/v2/stores/${storeId}/orders/${orderUuid}/initiatePayment`, data, { headers });
  }

  completeOrderPayment(storeId: number, orderUuid: string, data: OrderUpdateRequest) {
    return this.http.put<string>(`api/v2/stores/${storeId}/orders/${orderUuid}`, data);
  }

  verifyOrderPayment(storeId: number, orderUuid: string, data: any): Observable<any> {
    const requestBody = typeof data === 'string' ? data : JSON.stringify(data);
    return this.http.post<any>(`api/v2/stores/${storeId}/orders/${orderUuid}/verifyPayment`, requestBody);
  }


  getOriginType() {
    if (this.helperService.isGoApp() || this.helperService.isGoAdminApp() || this.helperService.isGoTemplateApp()) {
      return ORIGIN_TYPE.APP
    }
    return ORIGIN_TYPE.WEB
  }

  getOriginDomain() {
    if (this.helperService.isGoApp() || this.helperService.isGoAdminApp() || this.helperService.isGoTemplateApp()) {
      return environment.appId;
    }

    const parsedUrl = new URL(window.location.href);
    return parsedUrl.origin;
  }
}
