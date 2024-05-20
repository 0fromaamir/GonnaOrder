import { Observable, of } from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { ClientStore, StoreCatalog, Order, OrderItem, Offer, SaveOfferView, OrderMeta, LocationValid, EmailMessage, AssociatedZone } from './../../stores/stores';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CatalogLanguagesList } from './+state/stores.reducer';
import { AvailableSlotsResponse } from './types/AvailableSlotsResponse';
import { CustomerDetailsUpdateRequest, CustomerSocialLoginResponse, SocialAccountLoginDetails } from './types/CustomerSocialLogin';
import { OrderUpdateRequest } from './types/OrderUpdateRequest';
import { UpdateStandalonePaymentRequest } from './types/StandalonePayment';
import {AddReservationRequest} from '../../stores/stores-reservations/reservation-models/AddReservationRequest';
import {UpdateReservationRequest} from '../../stores/stores-reservations/reservation-models/UpdateReservationRequest';
import { UpdateOrderItemQuantityRequest } from './types/UpdateOrderItemQuantityRequest';
import { CustomerVoucher } from './types/VoucherValidationResponse';
import { HelperService } from '../helper.service';

@Injectable({
    providedIn: 'root'
})
export class StoreService {

    constructor(
      private http: HttpClient,
      private helperService: HelperService
    ) {
    }

    load(storeAlias: string): Observable<ClientStore> {
      return this.http.get<ClientStore>(`/api/v1/stores/${storeAlias}`);
    }

    getcatalog(storeId: number, selectedLang: string, referenceTime?: string): Observable<StoreCatalog> {
      const params: any = {};
      if (selectedLang) {
        params.languageId = selectedLang;
      }
      if (referenceTime) {
        params.referenceTime = referenceTime;
      }
      return this.http.get<StoreCatalog>(`/api/v1/stores/${storeId}/catalog`, {params});
    }

    getAvailableLanguages(storeId: number): Observable<CatalogLanguagesList> {
      return this.http.get<CatalogLanguagesList>(`/api/v1/stores/${storeId}/catalog/languages`);
    }

    retrieveOfferItem(storeId: number, catalogId: number, offerId: number, selectedLang: string = 'en'): Observable<Offer> {
      return this.http.get<Offer>(`api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}?languageId=${selectedLang}`);
    }

    initializeEmptyOrder(storeId: number, payload: Order): Observable<Order> {
      if (this.isOrderCapture()) {
        return this.http.post<Order>(`api/v2/user/stores/${storeId}/orders`, payload);
      }
      return this.http.post<Order>(`api/v1/stores/${storeId}/orders`, payload);
    }

    checkExistingOrder(storeId: number, orderUuid: string, locale: string = 'en'): Observable<Order> {
      return this.http.get<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}?locale=${locale}`);
    }

    addOrderItem(storeId: number, orderUuid: string, orderItem: OrderItem): Observable<Order> {
      return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems`, orderItem);
    }

    // for future use, expected to be able to bulk add offers to cart
    addOrderItems(storeId: number, orderUuid: string, orderItems: OrderItem[]): Observable<Order> {
      return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems`, orderItems);
    }

    updateOrderItem(storeId: number, orderUuid: string, itemUuid: string, orderItem: OrderItem): Observable<OrderItem> {
      return this.http.put<OrderItem>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems/${itemUuid}`, orderItem);
    }

    removeOrderItem(storeId: number, orderUuid: string, itemUuid: string): Observable<Order> {
      console.log('removing', storeId, orderUuid, itemUuid);
      return this.http.delete<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems/${itemUuid}`);
    }

    isAdminOrderUpdate(): boolean {
      return window.location.href.includes('/orders/');
    }

    isOrderCapture(): boolean {
      return window.location.href.includes('/capture/');
    }

    orderUpdate(storeId: number, orderUuid: string, payload: OrderUpdateRequest, v2Support: boolean): Observable<Order> {
      let headers = new HttpHeaders();
      
      if (this.helperService.isMobileApp()) {
        headers = headers.set('x-referer', window.location.href);
      }
      
      if (this.isAdminOrderUpdate()) {
        if (payload.validateOrder) {
          delete payload.validateOrder;
          delete payload.status;
        }
        payload.validateOrder = undefined;
        payload.status = undefined;
        return this.http.patch<Order>(`api/v2/user/stores/${storeId}/orders/${orderUuid}`, payload, {headers: headers});
      }
      if (v2Support) {
        return this.http.put<Order>(`api/v2/stores/${storeId}/orders/${orderUuid}`, payload, {headers: headers});
      } else {
        return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}`, payload);
      }
    }

    orderUpdateStatus(storeId: number, orderUuid: string, orderStatus: string): Observable<Order> {
      const httpHeaders = new HttpHeaders({
        'Content-Type' : 'application/json',
        'Cache-Control': 'no-cache'
      });
      return this.http.put<Order>(`api/v1/stores/${storeId}/orders/${orderUuid}/status`, JSON.stringify(orderStatus), {
        headers: httpHeaders
      });
    }

    orderUpdateQuantities(storeId: number, orderUuid: string, payload: UpdateOrderItemQuantityRequest[]): Observable<void> {
      return this.http.put<void>(`api/v1/stores/${storeId}/orders/${orderUuid}/orderItems/actions/updateQuantities`, payload);
    }

    validateStoreLocation(storeId: number, storeLocation: string): Observable<LocationValid> {
      return this.http.post<LocationValid>(`api/v1/stores/${storeId}/locations/validate`, {label: storeLocation});
    }

    sendOrderByEmail(orderUuid: string, email: string): Observable<EmailMessage> {
      return this.http.post<EmailMessage>(`api/v1/stores/order/${orderUuid}/email`, {email});
    }

    sendStandaloneOrderByEmail(storeId: string, standalonePaymentId: string, email: string){
      return this.http.post<EmailMessage>(`api/v1/stores/${storeId}/standalone-payment/${standalonePaymentId}/email`, {email});
    }

    getZonePerZipcode(storeId: number, zipCode: string): Observable<any> {
      return this.http.get<any>(`api/v1/stores/${storeId}/zones?postcode=${zipCode}`);
    }

    getStoreRules(storeId: number, langId: string): Observable<any> {
      return this.http.get<any>(`api/v1/stores/${storeId}/rules${(langId !== '') ? `?languageId=${langId}` : '' }`);
    }

    validateVoucher(storeId: number, voucherCode: string): Observable<CustomerVoucher> {
      return this.http.post<CustomerVoucher>(`api/v1/stores/${storeId}/customer-voucher/validate`, {code: voucherCode});
    }

    getSlots(storeId: number, deliveryMode: string, date?: string): Observable<AvailableSlotsResponse> {
      return this.http.post<AvailableSlotsResponse>(`api/v1/stores/${storeId}/slots`, {date, mode: deliveryMode});
    }

    customerRegistration(email: string): Observable<any> {
      return this.http.post<any>(`api/v1/auth/register/customer`, {email});
    }

    customerActivation(email: string, code: string): Observable<any> {
      return this.http.post<any>(`api/v1/auth/activate/customer`, {email, code});
    }

    customerPasswordUpdateByCode(code: string, newPassword: string): Observable<any> {
      return this.http.post<any>(`api/v1/auth/profile/password/update-by-code`, {code, newPassword});
    }

    customerResetByCode(email: string): Observable<any> {
      const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
      return this.http.post<any>(`api/v1/auth/password/reset-by-code`, email, {headers});
    }

    socialLogin(loginRequest: SocialAccountLoginDetails): Observable<CustomerSocialLoginResponse> {
      return this.http.post<CustomerSocialLoginResponse>(`/api/v1/auth/login/customer`, loginRequest);
    }

    customerDetailsUpdate(customerDetailsUpdateRequest: CustomerDetailsUpdateRequest): Observable<CustomerSocialLoginResponse> {
      return this.http.post<CustomerSocialLoginResponse>(`/api/v1/auth/update/customer`, customerDetailsUpdateRequest);
    }

    getCustomerLoyalty(storeId: number): Observable<any> {
      return this.http.get<any>(`api/v1/stores/${storeId}/loyalty`);
    }

    getLocationFromAddress(address: string, zipCode: string, countryCode: string): Observable<any> {
      return this.http.get<any>('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: environment.googleMapAPIKey,
          components: 'country:' + countryCode + (zipCode ? '|postal_code:' + zipCode : ''),
        }
      });
    }

    getAssociatedZone(storeId: number, orderUuid: string): Observable<AssociatedZone> {
      return this.http.get<AssociatedZone>(`api/v2/stores/${storeId}/orders/${orderUuid}/associatedZone`);
    }

    getSiblingUrl(selectedSiblingStoreId, selectedSiblingStoreAlias, domainUrl): string {
      if (this.isOrderCapture()) {
        return ''.concat(window.location.protocol, '//', window.location.host, '/manager/stores/',
                selectedSiblingStoreId, '/capture/', selectedSiblingStoreAlias);
      } else {
        return ''.concat(window.location.protocol, '//', selectedSiblingStoreAlias, '.',
                                domainUrl, (environment.name !== 'local') ? '' : (':'.concat(window.location.port)));
      }
    }

    getCombinedOrders(storeId: number, locationId: string): Observable<any>{
      return this.http.get<any>(`api/v1/stores/${storeId}/location/${locationId}/getCombinedOrders`);
    }

    createStandalonePayment(storeId: number, createRequest: any): Observable<any>{
      return this.http.post<any>(`/api/v1/stores/${storeId}/standalone-payment`, createRequest);
    }

    updateStandalonePayment(storeId: number, paymentId: string, createRequest: UpdateStandalonePaymentRequest): Observable<any>{
      return this.http.patch<any>(`/api/v1/stores/${storeId}/standalone-payment/${paymentId}`, createRequest);
    }

    customerStandalonePaymentSearch(storeId: number, action: any) {
    let url = '';
    if (action.orderToken){
      url = `/api/v1/stores/${storeId}/standalone-payment?orderToken=${action.orderToken}`;
    } else {
      url =  `/api/v1/stores/${storeId}/standalone-payment?l=${action.locationId}&tapId=${action.tapId}`;
    }
    return this.http.get<any>(url);
    }

  initiateStandalonePayment(storeId: number, paymentId: string, data: any): Observable<any> {
    let headers = new HttpHeaders();
    // use for payment redirection flow strip flow backward compatible
    headers = headers.set('payment-flow-version', '3');
    return this.http.put<any>(`/api/v1/stores/${storeId}/standalone-payment/${paymentId}/initiate`, data, { headers });
  }

    completeStandalonePayment(storeId: number, paymentId: string, paymentProviderResponse = {}): Observable<any>{
      return this.http.post<any>(`/api/v1/stores/${storeId}/standalone-payment/${paymentId}/complete`,
        JSON.stringify(paymentProviderResponse));
    }

  getStandaloneOrderPayment(storeId: number, standalonePaymentId: string) {
    const url = `/api/v1/stores/${storeId}/standalone-payment/${standalonePaymentId}`;
    return this.http.get<any>(url);
  }

  getStoreReservations(storeId: string , status?: string, location?: number,
                       name?: string, reservationNumber?: string, sortCreatedAt?: string,
                       sortArrivalTime?: string, arrivalDate?: string, offset?: number, limit?: number) {
    let params = new HttpParams();
    params = params.set('storeId' , storeId);
    if (status){
      params = params.set('status' , status);
    }
    if (location){
      params = params.set('location' , location);
    }
    if (name){
      params = params.set('name' , name);
    }
    if (reservationNumber){
      params = params.set('reservationNumber' , reservationNumber);
    }
    if (sortCreatedAt){
      params = params.set('sortCreatedAt' , sortCreatedAt);
    }
    if (sortArrivalTime){
      params = params.set('sortArrivalTime' , sortArrivalTime);
    }
    if (arrivalDate){
      params = params.set('arrivalDate' , arrivalDate);
    }
    if (offset){
      params = params.set('offset' , offset);
    }
    if (limit){
      params = params.set('limit' , limit);
    }
    const url = `/api/v1/reservation/getAll`;
    return this.http.get<any>(url , {params});
  }
  addNewReservation(addReservationBody: AddReservationRequest){
    let params = new HttpParams();
    params = params.set('storeId' , addReservationBody.storeId);
    const url = `/api/v1/reservation/add`;
    return this.http.post<any>(url, addReservationBody,{params});
  }

  updateReservation(addReservationBody: UpdateReservationRequest){
    let params = new HttpParams();
    params = params.set('storeId' , addReservationBody.storeId);
    const url = `/api/v1/reservation/update`;
    return this.http.put<any>(url, addReservationBody,{params});
  }
  deleteReservation(id: number, storeId: number)
  {
    let params = new HttpParams();
    params = params.set('id' , id);
    params = params.set('storeId' , storeId);
    const url = `/api/v1/reservation/delete`;
    return this.http.delete<any>(url, {params});
  }
}
