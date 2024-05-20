import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VivaToken } from './payment.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VivaService {

  constructor(private http: HttpClient) { }

  createToken(storeId: number, orderUuid: string): Observable<VivaToken> {
    return this.http.post<VivaToken>(`api/v1/stores/${storeId}/orders/${orderUuid}/viva/token`, {});
  }

  doPayment(storeId: number, orderUuid: string) {
    return this.http.post<{orderCode: number}>(`api/v1/stores/${storeId}/orders/${orderUuid}/viva/checkout`,
    {}
    );
  }

  verifyPayment(storeId: number, orderUuid: string, payload: {
    orderCode: number, eventId: number, eci: number, transId?: string}){
    return this.http.post(`api/v1/stores/${storeId}/orders/${orderUuid}/viva/verify`, payload);
  }
}
