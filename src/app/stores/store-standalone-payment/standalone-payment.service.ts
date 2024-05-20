import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import printJS from 'print-js';
import { Paging } from 'src/app/api/types/Pageable';

@Injectable({
  providedIn: 'root'
})
export class StandalonePaymentService {

  constructor(private http: HttpClient) { }

  adminStandalonePaymentSearch(storeId: number, payload: any, paging: Paging) {
    const url = `/api/v1/stores/${storeId}/standalone-payment/search?page=${paging.page}&size=${paging.size}`;
    return this.http.post<any>(url, payload);
  }

  printQrCode(imageUrl: string) {
    printJS({
      printable: imageUrl,
      type: 'image',
      honorMarginPadding: true,
      style: '@page { size: 80mm 80mm }'
    });
  }
}
