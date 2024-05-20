import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SquareService {

  constructor(private httpClient: HttpClient) { }

  generateSquareSession(storeId: number, orderUuid: string, redirectUrl: string): Observable<any> {
    return this.httpClient.post<any>(`api/v2/stores/${storeId}/orders/${orderUuid}/generateSquareSession`, { redirectUrl });
  }

  verifyPayment(storeId: number, orderUuid: string) {
    return this.httpClient.post<string>(`api/v2/stores/${storeId}/orders/${orderUuid}/verifyPayment`, JSON.stringify({}));
  }

}
