import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private httpClient: HttpClient) { }

  getStripeSessionId(storeId: number, orderUuid: number, successUrl: string, cancelUrl: string): Observable<any> {
    return this.httpClient.post<any>(`api/v2/stores/${storeId}/orders/${orderUuid}/generateStripeSession`, {
      successUrl, cancelUrl
    });
  }

  cancelStripeSession(storeId: number, orderUuid: number): Observable<any> {
    return this.httpClient.delete<void>(`api/v2/stores/${storeId}/orders/${orderUuid}/cancelStripeSession`);
  }

  verifyPayment(storeId: number, orderUuid: string) {
    return this.httpClient.post<string>(`api/v2/stores/${storeId}/orders/${orderUuid}/verifyPayment`, JSON.stringify({}));
  }
}
