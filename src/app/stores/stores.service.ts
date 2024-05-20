import { Observable, from } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  ClientStore,
  ClientStoreRequest,
  QRCodeResponse,
  StoreCatalog,
  SaveOfferPositionView,
  SaveOfferView,
  SaveCategoryView,
  CategoriesListResponse,
  User,
  StoreSettingUpdateRequest,
  StoreStatistics,
  Lang,
  StoreZone,
  StoreZoneStatus,
  OrderItemXlsResponse,
  KeyValuePair,
  MynextLoginResponse,
  StoreOrderItemsStatistics,
  Customer,
  CustomersListDownloadResponse,
  PowersoftLoginResponse,
  PowersoftLoginRequest, StoreRelationRequest, Relation, CustomEndPointValidationRequest
} from './stores';
import { Injectable } from '@angular/core';
import { PageableResults, Paging, defaultPaging } from '../api/types/Pageable';
import { tap, map, take } from 'rxjs/operators';
import { AliasAvailabilityStatus } from './+state/stores.reducer';
import { environment } from 'src/environments/environment';
import { HelperService } from '../public/helper.service';
import { PrinterService } from '../printers/printer.service';
import { MobilePushNotificationService } from '../shared/mobile-push-notification.service';
import { LogService } from '../shared/logging/LogService';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StoresService {

  private _storage: Storage | null = null;
  storage: Storage;

  constructor(
    private http: HttpClient,
    private helperService: HelperService,
    private printerService: PrinterService,
    private mobilePushNotificationService: MobilePushNotificationService,
    private logger: LogService
  ) { 
    this.init();
  }

  async init() {
    if (this.helperService.isGoAdminApp()) {

      this.storage = new Storage();

      const storage = await this.storage.create();
      this._storage = storage;

      setTimeout(() => {
        from(this._storage.get('autoprintSubscriptions')).pipe(take(1)).subscribe(subscriptions => {
          this.printerService.init(subscriptions);
        });
        from(this._storage.get('notificationSubscriptions')).pipe(take(1)).subscribe(subscriptions => {
          this.mobilePushNotificationService.init(subscriptions);
        });
      }, 1000);
    }
  }

  list(paging = defaultPaging, aliasName: string): Observable<PageableResults<ClientStore>> {
    return this.http.get<PageableResults<ClientStore>>(`/api/v1/stores/search?aliasName=${!aliasName ? '' : aliasName}&page=${paging.page}&size=${paging.size}`);
  }

  load(id: number): Observable<ClientStore> {
    return this.http.get<ClientStore>(`/api/v1/stores/${id}`);
  }

  create(store: ClientStoreRequest): Observable<ClientStore> {
    return this.http.post<ClientStore>('/api/v1/stores/', store);
  }

  update(id: number, store: ClientStoreRequest): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v1/stores/${id}`, store);
  }

  partialUpdate(id: number, store: ClientStoreRequest): Observable<ClientStore> {
    return this.http.patch<ClientStore>(`/api/v1/stores/${id}`, store);
  }
  deleteStore(storeId): Observable<any> {
    return this.http.delete<any>(`/api/v1/stores/${storeId}/delete`);
  }
  deleteStoreParent(storeId): Observable<any> {
    return this.http.delete<any>(`/api/v1/stores/${storeId}/relation`);
  }
  updateStoreVatPercentage(id: number, vatPercentage: number): Observable<ClientStore> {
    return this.http.patch<ClientStore>(`/api/v1/stores/${id}`, { vatPercentage });
  }

  updateSettings(id: number, settings: StoreSettingUpdateRequest[]): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v1/stores/${id}/settings`, settings);
  }

  downloadQRImage(id: number, url: string): Observable<QRCodeResponse> {
    return this.http.post(`/api/v1/stores/${id}/qr-generate-url`, { url }, {
      observe: 'response',
      responseType: 'blob',
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }

  downloadOrRenderFlyerImage(id: number, voucherCode: string, toImage: boolean = false): Observable<QRCodeResponse> {
    const host = window.location.protocol + '//' + window.location.host;
    const url = new URL(host + '/api/v2/stores/' + id + '/flyer');
    if (voucherCode.length > 0) {
      url.searchParams.append('voucherCode', voucherCode);
    }
    if (toImage) {
      url.searchParams.append('toImage', String(toImage));
    }
    return this.http.get(url.toString(), {
      observe: 'response',
      responseType: 'blob',
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }

  downloadQRImageFull(id: number): Observable<QRCodeResponse> {
    return this.http.get(`/api/v1/stores/${id}/qr-image?full-version=true`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }

  downloadQRPdf(id: number): Observable<QRCodeResponse> {
    return this.http.get(`/api/v1/stores/${id}/qr-pdf`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }

  downloadQRImages(id: number): Observable<QRCodeResponse> {
    return this.http.get(`/api/v1/stores/${id}/qr-images`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }

  downloadQRFullPdf(id: number): Observable<QRCodeResponse> {
    return this.http.get(`/api/v1/stores/${id}/qr-pdf-all`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }


  downloadOrderItemXls(storeId: number, orderItemReportType: string, fromDate: string, toDate: string): Observable<OrderItemXlsResponse> {
    return this.http.get(`/api/v1/stores/${storeId}/orders/items`, {
      observe: 'response',
      responseType: 'blob',
      params: {
        orderItemReportType,
        orderItemDateType: 'ORDER_DATE',
        startDate: fromDate,
        endDate: toDate,
        storeId: storeId.toString()
      }
    }).pipe(
      map(r => this.toOrderItemXls(r))
    );
  }

  private toQRCodeResponse(response: HttpResponse<Blob>): QRCodeResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }

  private toOrderItemXls(response: HttpResponse<Blob>): OrderItemXlsResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }

  getcatalog(id: string): Observable<StoreCatalog> {
    return this.http.get<StoreCatalog>(`/api/v1/stores/${id}/catalog`);
  }

  saveOffer(offer: SaveOfferView, offerId: any): Observable<SaveOfferView> {
    if (offerId === 'CREATE_OFFER') {
      return this.http.post<SaveOfferView>('/api/v1/stores/catalog/offer', offer);
    } else {
      return this.http.post<SaveOfferView>(`/api/v1/stores/catalog/offer/${offerId}`, offer);
    }
  }

  saveOfferPosition(offers: SaveOfferPositionView): Observable<SaveOfferPositionView> {
    return this.http.post<SaveOfferPositionView>('/api/v1/stores/catalog/offer/position', offers);
  }

  loadOffer(id: string): Observable<SaveOfferView> {
    return this.http.get<SaveOfferView>(`/api/v1/stores/catalog/offer/${id}`);
  }

  saveCategory(category: SaveCategoryView, categoryId: any): Observable<SaveCategoryView> {
    if (categoryId === 'CREATE_CATEGORY') {
      return this.http.post<SaveCategoryView>('/api/v1/stores/catalog/category', category);
    } else {
      return this.http.post<SaveCategoryView>(`/api/v1/stores/catalog/category/${categoryId}`, category);
    }
  }

  loadCategory(id: string): Observable<SaveCategoryView> {
    return this.http.get<SaveCategoryView>(`/api/v1/stores/catalog/category/${id}`);
  }

  listCatalogCategories(catalogId: number): Observable<CategoriesListResponse> {
    return this.http.get<CategoriesListResponse>(`/api/v1/stores/catalog/${catalogId}/categories/name`);
  }

  userList(id: number, paging = defaultPaging): Observable<PageableResults<User>> {
    return this.http.get<PageableResults<User>>(`/api/v1/users/${id}?page=${paging.page}&size=${paging.size}`);
  }

  inviteUser(email: string, role: string, storeId: any): Observable<{}> {
    const request = {
      email,
      role,
      storeId
    };
    return this.http.post<{}>('/api/v1/users/invite', request);
  }

  removeUserStoreAccess(userId, storeId): Observable<void> {
    return this.http.delete<void>(`/api/v1/users/${userId}/store/${storeId}`);
  }

  removeStoreLogo(storeId): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/delete-logo`);
  }

  removeStoreImage(storeId, isBackgroundImage = false): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/${isBackgroundImage ? 'delete-background' : 'delete-image'}`);
  }

  uploadStoreImage(storeId: number, file: File, isBackgroundImage = false): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`/api/v1/stores/${storeId}/${isBackgroundImage ? 'upload-background' : 'upload-image'}`, formData, { responseType: 'text' });
  }

  uploadStoreLogo(storeId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`/api/v1/stores/${storeId}/upload-logo`, formData, { responseType: 'text' });
  }

  searchStores(alias: string): Observable<PageableResults<ClientStore>> {
    return this.http.get<PageableResults<ClientStore>>(`/api/v1/stores/search?aliasName=${alias}`);
  }

  loadStoreStatistics(id: number, duration: number, from: string, to: string, periodicTerm: string): Observable<StoreStatistics[]> {
    return this.http.get<StoreStatistics[]>(`/api/v1/stores/${id}/order/stats?from=${from}&to=${to}&duration=${duration}&periodicTerm=${periodicTerm}`);
  }

  loadMenuViewingStatistics(id: number, duration: number, from: string, to: string, periodicTerm: string): Observable<StoreStatistics[]> {
    return this.http.get<StoreStatistics[]>(`/api/v1/stores/${id}/order/statsmenuview?from=${from}&to=${to}&duration=${duration}&periodicTerm=${periodicTerm}`);
  }

  downloadOrderPdf(id: number, orderId: string): Observable<QRCodeResponse> {
    return this.http.get(`/api/v1/stores/${id}/orders/${orderId}/invoice`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toQRCodeResponse(r))
    );
  }
  orderItemsStatisticsList(
    storeId: number,
    startDate: string,
    endDate: string,
    orderItemDateType: string,
    paging = defaultPaging,
    sort: string,
  ): Observable<PageableResults<StoreOrderItemsStatistics>> {
    return this.http.get<PageableResults<StoreOrderItemsStatistics>>(`/api/v1/stores/${storeId}/orders/statistics/items?startDate=${startDate}&endDate=${endDate}&orderItemDateType=${orderItemDateType}&page=${paging.page}&size=${paging.size}&sort=${sort}`);
  }
  getUserInterfaceLanguages() {
    return this.http.get<Lang[]>(`/assets/user-interface-languages/user-interface-languages.json`);
  }

  validateAliasAvailability(storeId: number, alias: string): Observable<AliasAvailabilityStatus> {
    const request = {
      storeId,
      alias
    };
    return this.http.post<AliasAvailabilityStatus>(`/api/v1/stores/alias/available`, request);
  }

  loadNotificationSubscriptionStatus(storeId: number, subscription: PushSubscription): Observable<boolean> {
    console.log('load notification status call to backend');
    return this.http.get<boolean>(`/api/v1/stores/${storeId}/notifications/${subscription.toJSON().keys.p256dh}`);
  }

  subscribeNotification(storeId: number, subscription: PushSubscription): Observable<void> {
    console.log('subscribe call to backend');
    return this.http.post<void>(`/api/v1/stores/${storeId}/notifications`, subscription.toJSON());
  }

  unsubscribeNotification(storeId: number, subscription: PushSubscription): Observable<void> {
    console.log('unsubscribe call to backend');
    return this.http.delete<void>(`/api/v1/stores/${storeId}/notifications/${subscription.toJSON().keys.p256dh}`);
  }

  createOrUpdateZone(storeId: number, zone: StoreZone, id: number = 0): Observable<StoreZone> {
    if (id === 0) {
      return this.http.post<StoreZone>(`/api/v2/stores/${storeId}/zones`, zone);
    } else {
      return this.http.put<StoreZone>(`/api/v2/stores/${storeId}/zones/${id}`, zone);
    }
  }


  getZone(id: number): Observable<StoreZone> {
    return this.http.get<StoreZone>(`/api/v1/stores/${id}/zones/${id}`);
  }


  getStatusOfZone(id: number): Observable<StoreZoneStatus> {
    return this.http.get<StoreZoneStatus>(`/api/v1/stores/${id}/zones/status`);
  }

  loadZones(id: number): Observable<StoreZone[]> {
    return this.http.get<StoreZone[]>(`/api/v2/stores/${id}/zones`);
  }

  loadZone(storeId: number, id: number): Observable<StoreZone> {
    return this.http.get<StoreZone>(`/api/v2/stores/${storeId}/zones/${id}`);
  }

  removeZone(zoneId, storeId): Observable<void> {
    return this.http.delete<void>(`/api/v2/stores/${storeId}/zones/${zoneId}`);
  }

  updateZoneSettings(zoneId, storeId, settings: KeyValuePair[]): Observable<StoreZone> {
    return this.http.put<StoreZone>(`/api/v1/stores/${storeId}/zones/${zoneId}/settings`, settings);
  }

  setAllowOrdering(lang, allowOrderingStatus): Observable<any> {
    return this.http.get<any>(`/api/v1/stores/?ulang=${lang}&basket=${allowOrderingStatus}`);
  }

  mynextLogin(username: string, password: string): Observable<MynextLoginResponse> {
    return this.http.post<MynextLoginResponse>(environment.myNextEndpointUrl + 'Auth/Connect', { username, password });
  }

  powersoftLogin(storeId: number, reqObj: PowersoftLoginRequest): Observable<PowersoftLoginResponse> {
    return this.http.post<PowersoftLoginResponse>(`/api/v2/stores/${storeId}/powersoft/connect`, { ...reqObj });
  }

  disconnectPowersoft(storeId: number): Observable<any> {
    return this.http.post<any>(`/api/v2/stores/${storeId}/powersoft/disconnect`, {});
  }

  synchronizePowersoftCatalog(storeId: number): Observable<any> {
    return this.http.post<any>(`/api/v2/stores/${storeId}/powersoft/catalog/import`, {});
  }

  hubriseLogin(storeId: number, authCode: string): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/hubrise/connect`, { authCode });
  }

  hubriseLogout(storeId: number): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/hubrise/disconnect`, {});
  }

  customersList(storeId: number, email: string, name: string, phoneNumber: string, sortingColumn: string, paging = defaultPaging)
    : Observable<PageableResults<Customer>> {
    return this.http.post<PageableResults<Customer>>(
      `/api/v1/stores/${storeId}/customers/search?sort=${sortingColumn}&page=${paging.page}&size=${paging.size}`,
      { email, name, phoneNumber }
    );
  }

  downloadCustomersList(storeId: number, email: string, name: string, phoneNumber: string): Observable<CustomersListDownloadResponse> {
    const request = {
      email,
      name,
      phoneNumber,
    };

    return this.http.post(
        `/api/v1/stores/${storeId}/customers/download`, email.length === 0 && name.length === 0 && phoneNumber.length === 0 ? {} : request,
        { observe: 'response', responseType: 'blob' }
      ).pipe(
      map(r => this.toCustomerSearch(r))
    );
  }
  private toCustomerSearch(response: HttpResponse<Blob>): CustomersListDownloadResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }
  connectPaymentsense(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/paymentsense/connect`, settings);
  }
  connectJcc(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/jcc/connect`, settings);
  }
  disConnectJcc(storeId: number): Observable<any> {
    return this.http.put<any>(`/api/v2/stores/${storeId}/jcc/disconnect`, {});
  }
  connectTrustPayments(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/trustpayments/connect`, settings);
  }
  disConnectTrustPayments(storeId: number): Observable<any> {
    return this.http.put<any>(`/api/v2/stores/${storeId}/trustpayments/disconnect`, {});
  }

  connectVivaPayments(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/viva/connect`, settings);
  }
  disConnectVivaPayments(storeId: number): Observable<any> {
    return this.http.put<any>(`/api/v2/stores/${storeId}/viva/disconnect`, {});
  }

  connectPayabl(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/payabl/connect`, settings);
  }
  disConnectPayabl(storeId: number): Observable<any> {
    return this.http.put<any>(`/api/v2/stores/${storeId}/payabl/disconnect`, {});
  }
  connectGlobalPay(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/globalpay/connect`, settings);
  }
  disConnectGlobalPay(storeId: number): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v2/stores/${storeId}/globalpay/disconnect`, {});
  }
  connectMollie(storeId: number): Observable<string> {
    return this.http.get(`/api/v2/stores/${storeId}/mollie/connect`, { responseType: 'text' });
  }
  disConnectMollie(storeId: number): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v2/stores/${storeId}/mollie/disconnect`, {});
  }
  connectFygaro(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/fygaro/connect`, settings);
  }
  disConnectFygaro(storeId: number): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v2/stores/${storeId}/fygaro/disconnect`, {});
  }
  connectEpay(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/epay/connect`, settings);
  }
  disConnectEpay(storeId: number): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v2/stores/${storeId}/epay/disconnect`, {});
  }
  connectApcopay(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/apcopay/connect`, settings);
  }
  disConnectApcopay(storeId: number): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v2/stores/${storeId}/apcopay/disconnect`, {});
  }

  connectHobex(storeId: number, settings: { [key: string]: any; }): Observable<ClientStore> {
    return this.http.post<ClientStore>(`/api/v2/stores/${storeId}/hobex/connect`, settings);
  }

  disconnectHobex(storeId: number): Observable<ClientStore> {
    return this.http.put<ClientStore>(`/api/v2/stores/${storeId}/hobex/disconnect`, {});
  }

  updateStoreRelation(storeId: number, storeRelationRequest: StoreRelationRequest, isUpdate= false): Observable<any> {
    const url = `/api/v1/stores/${storeId}/relation`;
    return !!isUpdate ? this.http.patch<any>(url, storeRelationRequest) : this.http.post<any>(url, storeRelationRequest);
  }

  validateCustomEndPoint(
    storeId: number, method: string,
    customEndPointValidationRequest: CustomEndPointValidationRequest
    ): Observable<any> {
    if (method === 'get') {
      return this.http.get<any>(`/api/v1/stores/${storeId}/orders/events/configs`);
    } else if (method === 'post') {
      return this.http.post<any>(`/api/v1/stores/${storeId}/orders/events/configs`, customEndPointValidationRequest);
    }
    return this.http.delete<any>(`/api/v1/stores/${storeId}/orders/events/configs`);
  }

  changeAccountManager(storeId: number, userId: number): Observable<any> {
    return this.http.post<any>(`api/v1/users/${storeId}/changeAccountManager/${userId}`, {});
  }

  //START Printer methods ----------------------------------------------------------------------------------------------------------------------------------//
  setStorage(key: string, value: any) {
    this._storage?.set(key, value);
  }

  setStorageForPrinters(key: string, value: any) {
    this.getStorage(key).then(existingPrinters => {
      if (!!existingPrinters && Array.isArray(existingPrinters) && !existingPrinters.includes(value)) {
        existingPrinters.push(value);
        this._storage?.set(key, existingPrinters);
      } else {
        this._storage?.set(key, [ value ]);
      }
    })
    .catch(err => {
      this._storage?.set(key, [ value ]);
      console.error(err);
    });
  }

  removeStorageForPrinters(key: string, printerName: string) {
    this.getStorage(key).then(existingPrinters => {
      if (!!existingPrinters && Array.isArray(existingPrinters)) {
        const newPrinterList = existingPrinters.filter(printer => printer.name !== printerName);
        this._storage?.set(key, newPrinterList);
      } else {
        this._storage?.set(key, []);
        console.error("No Printers are enabled !!");
      }
    })
    .catch(err => {
      this._storage?.set(key, []);
      console.error("No Printers are enabled !!");
      console.error(err);
    });
  }

  async getStorage(key: string) {
    return await this._storage.get(key);
  }

  async getStorageForStoreId(key: string, storeId: number): Promise<boolean> {
    return await this.getStorage(key)
    .then(subscriptions => {
      if (!!storeId && !!subscriptions)
        return subscriptions[`${storeId}`] || false;
      else return false;
    });
  }
  //END Printer methods ----------------------------------------------------------------------------------------------------------------------------------//
  

  //START Mobile notifications ----------------------------------------------------------------------------------------------------------------------------------//
  
  loadMobileNotificationSubscriptionStatus(storeId: number): Observable<boolean> {
    this.logger.debug('load mobile notification status...');
    return from(this.getStorageForStoreId('notificationSubscriptions', storeId));
  }

  subscribeMobileNotification(storeId: number, storeAlias: string): Observable<void> {
    if (storeId <= 0 || !storeAlias) {
      return;
    }
    this.logger.debug('subscribe mobile notification');
    from(this._storage.get('notificationSubscriptions')).pipe(take(1)).subscribe(subscriptions => {
      this.setStorage('notificationSubscriptions', this.mobilePushNotificationService.addSubscription(storeId, storeAlias, subscriptions));
    });
    return new Observable<void>(observer => observer.complete());
  }

  unsubscribeMobileNotification(storeId: number): Observable<void> {
    this.logger.debug('unsubscribe mobile notification');
    from(this._storage.get('notificationSubscriptions')).pipe(take(1)).subscribe(subscriptions => {
      this.setStorage('notificationSubscriptions', this.mobilePushNotificationService.removeSubscription(storeId, subscriptions));
    });
    this.unsubscribeAutoprint(storeId);
    return new Observable<void>(observer => observer.complete());
  }  
  //END Mobile notifications----------------------------------------------------------------------------------------------------------------------------------//


  //START Auto print----------------------------------------------------------------------------------------------------------------------------------//
  loadAutoprintSubscriptionStatus(storeId: number): Observable<boolean> {
    this.logger.debug('load autoprint status...');
    return from(this.getStorageForStoreId('autoprintSubscriptions', storeId)).pipe(
      tap(data => this.logger.debug('loadAutoprintSubscriptionStatus', data))
    );
  }

  subscribeAutoprint(storeId: number): Observable<void> {
    if (storeId <= 0) {
      return;
    }
    this.logger.debug('subscribe autoprint');
    from(this._storage.get('autoprintSubscriptions')).pipe(take(1)).subscribe(subscriptions => {
      this.setStorage('autoprintSubscriptions', this.printerService.addSubscription(storeId, subscriptions));
    });
    return new Observable<void>(observer => observer.complete());
  }

  unsubscribeAutoprint(storeId: number): Observable<void> {
    this.logger.debug('unsubscribe autoprint');
    from(this._storage.get('autoprintSubscriptions')).pipe(take(1)).subscribe(subscriptions => {
      this.setStorage('autoprintSubscriptions', this.printerService.removeSubscription(storeId, subscriptions));
    });
    return new Observable<void>(observer => observer.complete());
  }
  //END Auto print----------------------------------------------------------------------------------------------------------------------------------//

}
