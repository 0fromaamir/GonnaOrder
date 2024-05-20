import { switchMap, map, catchError, withLatestFrom, mergeMap, filter, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { StoreService } from '../store.service';
import {
  StoreActionType,
  LoadStore,
  LoadStoreSuccess,
  LoadStoreFailed,
  LoadCatalog,
  LoadCatalogSuccess,
  LoadCatalogFailed,
  InitializeOrder,
  InitializeOrderSuccess,
  CheckExistingOrder,
  CheckExistingOrderSuccess,
  AddOrderItem,
  AddRuleOrderItem,
  ViewOrderItem,
  ViewOrderItemSuccess,
  AddOrderItemSuccess,
  AddRuleOrderItemSuccess,
  RemoveOrderItem,
  RemoveOrderItemSuccess,
  OrderUpdateStatus,
  OrderUpdateStatusSuccess,
  OrderUpdate,
  OrderUpdateSuccess,
  OrderUpdateStatusFailed,
  LoadCatalogLanguages,
  LoadCatalogLanguagesSuccess,
  LoadCatalogLanguagesFailed,
  ErrorMessage,
  UpdateOrderItemSuccess,
  UpdateOrderItem,
  ViewOrderStatusSuccess,
  ViewOrderStatusFailed,
  ValidateStoreLocations,
  ValidateStoreLocationsFail,
  ValidateStoreLocationsSuccess,
  SendOrderByEmail,
  SendOrderByEmailFail,
  SendOrderByEmailSuccess,
  SubmitOrderSuccess,
  GetZonePerZipcode,
  GetZonePerZipcodeFail,
  GetZonePerZipcodeSuccess,
  GetStoreRules,
  GetStoreRulesFail,
  GetStoreRulesSuccess,
  SubmitOrder,
  ToggleOffersUnavailable,
  UpdateOrderItemQuantities,
  UpdateOrderItemQuantitiesFailed,
  UpdateOrderItemQuantitiesSuccess,
  ToggleOffersOutOfStock,
  ValidateVoucher,
  ValidateVoucherSuccess,
  ValidateVoucherFailed,
  UpdateVoucher,
  RemoveVoucher,
  SubmitOrderFailed,
  FetchSlots,
  FetchSlotsFailed,
  FetchSlotsSuccess,
  ToggleUnavailableDeliveryTimeError,
  UpdateOrderWishTime,
  UpdateOrderWishTimeSuccess,
  UpdateOrderWishTimeFailed,
  ToggleSameDayOrderingDisabled,
  RemoveRuleOrderItemSuccess,
  RemoveRuleOrderItem,
  UpdateDeliveryMethod,
  UpdateZipCode,
  ToggleOrderSubmitError,
  SelectCatalogLanguage,
  SocialLogin,
  SocialLoginFailed,
  SocialLoginSuccess,
  CustomerDetailsUpdate,
  CustomerDetailsUpdateSuccess,
  CustomerDetailsUpdateFailed,
  GeocodeAddress,
  GeocodeAddressSuccess,
  GeocodeAddressFailed,
  GetAssociatedZone,
  GetAssociatedZoneSuccess,
  AddOrderMeta,
  AddCheckoutState,
  ClearOrderMeta,
  GetCombinedOrderSuccess,
  GetCombinedOrderFailed,
  GetCombinedOrder,
  CreateStandalonePayment,
  CreateStandalonePaymentSuccess,
  CreateStandalonePaymentFailed,
  UpdateStandalonePayment,
  UpdateStandalonePaymentSuccess,
  UpdateStandalonePaymentFailed,
  CustomerStandalonePaymentSearchSuccess,
  CustomerStandalonePaymentSearchFailed,
  CustomerStandalonePaymentSearch,
  InitiateStandalonePayment,
  InitiateStandalonePaymentFailed,
  InitiateStandalonePaymentSuccess,
  UpdateLocation,
  SendStandaloneOrderByEmailSuccess,
  SendStandaloneOrderByEmailFail,
  SendStandaloneOrderByEmail,
  CompleteStandalonePayment,
  LoadLinkCode,
  LoadLinkCodeFail,
  LoadLinkCodeSuccess,
  LinkCodeSet,
  ApplyLinkCode,
  LoadStoredCustomerData,
  LoadStoredCustomerDataSuccess,
  ApplyStoredCustomerData,
  StoredCustomerDataSet,
  StoredCustomerDataChanged,
  TrackingEvent,
  ProceedToCheckout,
  SlotSelected,
  SaveStoreByAlias,
  SaveStoreByAliasSuccess,
  SaveStoreByAliasFailed,
  LoadCustomerLoyalty,
  LoadCustomerLoyaltySuccess,
  LoadCustomerLoyaltyFailed
} from './stores.actions';
import {  of } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  getCombinedOrdersData,
  getCurrentCartStatus,
  getCurrentCartUuid,
  getCurrentOrderDeliveryMethod,
  getCurrentOrderMetaState,
  getCurrentOrderWishTime,
  getLinkCode,
  getLinkCodeStatus,
  getSelectedLang,
  getSelectedStore,
  getStoreLocationsState,
  getStoreOpeningInfo,
  getCurrentCartState,
  getStoredCustomerDataStatus,
  getStoredCustomerData,
  getCookieStatus,
  getSelectedStoreCatalog,
  getZoneState,
  getSocialAuth,
  getCustomerLoyaltyState
} from './stores.selectors';
import { UnavailableOffer } from '../types/UnavailableOffer';
import { OutOfStockOffer } from '../types/OutOfStockOffer';
import { SameDayOrderingError } from '../types/SameDayOrderingError';
import OrderUtils from '../utils/OrderUtils';
import { DELIVERY_METHODS, DELIVERY_METHOD_VALUES } from '../types/DeliveryMethod';
import dayjs from 'dayjs';
import { LogService } from '../../../shared/logging/LogService';
import {
  CheckoutService,
  ORIGIN_TYPE
} from '../store-checkout/checkout.service';
import { CreateStandalonePaymentRequest } from '../types/StandalonePayment';
import { CookieService } from 'ngx-cookie-service';
import {LocalStorageService} from '../../../local-storage.service';
import { LocationService } from '../../location.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from '../../helper.service';
import { PresetOrderData } from 'src/app/stores/stores';
import { TrackingService } from '../../tracking.service';
import { ThemeUtils } from '../utils/ThemeUtils';
import { TranslateService } from '@ngx-translate/core';
import { Event } from 'src/app/stores/event';
import { EventHelper } from 'src/app/shared/event.helper';

@Injectable()
export class SelectedStoresEffects {

  eventHelper = new EventHelper('SelectedStoresEffects');

  constructor(
    private actions$: Actions,
    private storeService: StoreService,
    private store: Store<any>,
    public checkoutService: CheckoutService,
    private logger: LogService,
    private cookieService: CookieService,
    private storageService: LocalStorageService,
    private locationService: LocationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private helper: HelperService,
    private trackingService: TrackingService,
    private translate: TranslateService
  ) { }


  socialLogin = createEffect(() => this.actions$.pipe(
    ofType<SocialLogin>(StoreActionType.SocialLogin),
    switchMap(action => this.storeService.socialLogin(action.login).pipe(
      map((res) => new SocialLoginSuccess(res, this.eventHelper.getEvent(action, 'StoreService Social Login Success'))),
      catchError(() => of(new SocialLoginFailed()))
    ))
  ));

  socialLoginSuccess = createEffect(() => this.actions$.pipe(
    ofType<SocialLoginSuccess>(StoreActionType.SocialLoginSuccess),
    withLatestFrom(
      this.store.select(getSelectedStore)
    ),
    filter(([action, store]) => !!store.settings.LOYALTY_SCHEME),
    map(([action, store]) => new LoadCustomerLoyalty(this.eventHelper.getEvent(action, 'Social Login Successful')))
  ));

  loadCustomerLoyalty = createEffect(() => this.actions$.pipe(
    ofType<LoadCustomerLoyalty>(StoreActionType.LoadCustomerLoyalty),
    withLatestFrom(
      this.store.select(getSelectedStore)
    ),
    switchMap(([action, store]) => this.storeService.getCustomerLoyalty(store.id).pipe(
      map((res) => new LoadCustomerLoyaltySuccess(res, this.eventHelper.getEvent(action, 'Load Customer Loyalty Success'))),
      catchError(() => of(new LoadCustomerLoyaltyFailed(this.eventHelper.getEvent(action, 'Load Customer Loyalty Failed'))))
    ))
  ));

  customerDetailsUpdate = createEffect(() => this.actions$.pipe(
    ofType<CustomerDetailsUpdate>(StoreActionType.CustomerDetailsUpdate),
    switchMap(action => this.storeService.customerDetailsUpdate(action.customerDetails).pipe(
      map((res) => new CustomerDetailsUpdateSuccess(res)),
      catchError(() => of(new CustomerDetailsUpdateFailed()))
    ))
  ));


  onLoadStore = createEffect(() => this.actions$.pipe(
    ofType<LoadStore>(StoreActionType.LoadStore),
    switchMap(action => this.storeService.load(action.storeAlias).pipe(
      mergeMap((s) => {
        this.setUiStyles(s.settings);
        return [
          new LoadStoreSuccess(s),
          new ClearOrderMeta({}),
          new LoadLinkCode(),
          new LoadStoredCustomerData()
        ];
      }),
      catchError((err) => of(new LoadStoreFailed(), new ErrorMessage('public.global.errorExpected', '100', [], err)))
    ))
  ));


  onLoadLinkCode = createEffect(() => this.actions$.pipe(
    ofType<LoadLinkCode>(StoreActionType.LoadLinkCode),
    withLatestFrom(this.activatedRoute.queryParams, this.activatedRoute.fragment),
    filter(([action, params]) =>
    [
      params.customerName,
      params.customerPhoneNumber,
      params.comment,
      params.deliveryStreetAddress,
      params.deliveryPostCode,
      params.deliveryCity,
      params.deliveryComment,
      params.floorNumber,
      params.latitude,
      params.longitude,
      params.customerEmail,
      params.externalOrderId
    ].some(p => p != null)
    ),
    map(([action, params, fragment]) => {
      const {
        customerName,
        customerPhoneNumber,
        comment,
        deliveryStreetAddress,
        deliveryPostCode,
        deliveryCity,
        deliveryComment,
        floorNumber,
        latitude,
        longitude,
        customerEmail,
        externalOrderId,
        ...other
      } = params;

      this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: other,
      fragment
    });

      try{
        const linkCodeData: PresetOrderData = {
          customerName,
          customerPhoneNumber,
          comment,
          deliveryStreetAddress,
          deliveryPostCode,
          deliveryCity,
          deliveryComment,
          floorNumber,
          latitude: isNaN(latitude) ? undefined : parseFloat(latitude),
          longitude: isNaN(longitude) ? undefined : parseFloat(longitude),
          customerEmail,
          externalOrderId
        };
        return new LoadLinkCodeSuccess(linkCodeData);
      } catch (error){
        console.log(error);
        return new LoadLinkCodeFail();
      }
    })
  ));


  onLoadStoredCustomerData = createEffect(() => this.actions$.pipe(
    ofType<LoadStoredCustomerData>(StoreActionType.LoadStoredCustomerData),
    filter(() => {
     const keys = [
        'customerName',
        'customerPhoneNumber',
        'customerEmail',
        'deliveryStreetAddress',
        'deliveryPostCode',
        'deliveryCity',
        'deliveryComment',
        'floorNumber',
        'latitude',
        'longitude'
      ];
     return !this.locationService.isAdminOrderUpdate()
        && keys.map(key => this.cookieService.get(key)).some(val => !!val );
    }),
    map(() => {
      const latitude = this.cookieService.get('latitude');
      const longitude = this.cookieService.get('longitude');

      return new LoadStoredCustomerDataSuccess({
        customerName: this.cookieService.get('customerName'),
        customerPhoneNumber: this.cookieService.get('customerPhoneNumber'),
        customerEmail: this.cookieService.get('customerEmail'),
        deliveryStreetAddress: this.cookieService.get('deliveryStreetAddress'),
        deliveryPostCode: this.cookieService.get('deliveryPostCode'),
        deliveryCity: this.cookieService.get('deliveryCity'),
        deliveryComment: this.cookieService.get('deliveryComment'),
        floorNumber: this.cookieService.get('floorNumber'),
        latitude: isNaN(latitude as any) ? undefined : parseFloat(latitude),
        longitude: isNaN(longitude as any) ? undefined : parseFloat(longitude),
      });
    })
  ));


  onAddOrderMeta = createEffect(() => this.actions$.pipe(
    ofType<AddOrderMeta>(StoreActionType.AddOrderMeta),
    withLatestFrom(
      this.store.select(getCookieStatus)
    ),
    filter(([action, cookieStatus]) => {
      const keys = [
        'customerName',
        'customerPhoneNumber',
        'customerEmail',
        'deliveryStreetAddress',
        'customerZip',
        'customerStreet',
        'customerTown',
        'latitude',
        'longitude',
        'customerFloor'
      ];
      return cookieStatus === 'ACCEPT'
        && !this.locationService.isAdminOrderUpdate()
        && keys.includes(action.key);
    }),
    map(([action]) => {
      let cookieKey: string;
      switch (action.key) {
        case 'customerZip':
          cookieKey = 'deliveryPostCode';
          break;
        case 'customerStreet':
          cookieKey = 'deliveryStreetAddress';
          break;
        case 'customerTown':
          cookieKey = 'deliveryCity';
          break;
        case 'customerFloor':
          cookieKey = 'floorNumber';
          break;
        default:
          cookieKey = action.key;
          break;
      }
      this.cookieService.set(cookieKey, `${action.value}`, dayjs().add(7, 'day').toDate());
      return new StoredCustomerDataChanged(cookieKey, action.value, this.eventHelper.getEvent(action, `${cookieKey} set to ${action.value}`));
    })
  ));

  onUpdateCustomerUserId = createEffect(() => this.actions$.pipe(
    ofType<AddOrderMeta>(StoreActionType.AddOrderMeta),
    withLatestFrom(
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang),
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartStatus),
    ),
    filter((s) => s[0].key === 'customerUserId' && s[6] !== 'ORDERUPDATING'),
    map(([action, orderUuid, orderMeta, validLocations, selectedLang, clientStore]) => {
      orderMeta.data.customerUserId = action.value;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, null,
      this.eventHelper.getEvent(action, 'CustomerUserId updated'));
    })
  ));

  onUpdateWishTime = createEffect(() => this.actions$.pipe(
    ofType<AddOrderMeta>(StoreActionType.AddOrderMeta),
    withLatestFrom(
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getCurrentCartUuid),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang),
      this.store.select(getSelectedStore),
    ),
    filter(([action]) => action.key === 'wishTime'),
    map(([action, orderMeta, orderUuid, validLocations, selectedLang, clientStore]) => {
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, null,
      this.eventHelper.getEvent(action, 'WishTime updated'));
    })
  ));

  onLoadCatalog = createEffect(() => this.actions$.pipe(
    ofType<LoadCatalog>(StoreActionType.LoadCatalog),
    switchMap(action => this.storeService.getcatalog(action.id, action.selectedLang, action.referenceTime).pipe(
      map(s => new LoadCatalogSuccess(s, action.selectedLang, this.eventHelper.getEvent(action, 'Fetched catalog'))),
      catchError(() => of(new LoadCatalogFailed()))
    ))
  ));


  onLoadCatalogLanguages = createEffect(() => this.actions$.pipe(
    ofType<LoadCatalogLanguages>(StoreActionType.LoadCatalogLanguages),
    switchMap(action => this.storeService.getAvailableLanguages(action.storeId).pipe(
      map(s => new LoadCatalogLanguagesSuccess(s, action.storeId, this.eventHelper.getEvent(action, 'Fetched catalog languages'))),
      catchError(() => of(new LoadCatalogLanguagesFailed()))
    ))
  ));

  // offer item effects

  onViewOrderItem = createEffect(() => this.actions$.pipe(
    ofType<ViewOrderItem>(StoreActionType.ViewOrderItem),
    switchMap(action => this.storeService.retrieveOfferItem(action.storeId, action.catalogId, action.offerId, action.locale).pipe(
      map(s => new ViewOrderItemSuccess(s)),
      // catchError(a => of(new ViewOrderItemFailed()))
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '200', [], err)))
    ))
  ));

  // order effects

  onInitializeOrder = createEffect(() => this.actions$.pipe(
    ofType<InitializeOrder>(StoreActionType.InitializeOrder),
    tap(() => this.store.dispatch(new LoadStoredCustomerData())),
    switchMap(action => this.storeService.initializeEmptyOrder(action.storeId, action.payload).pipe(
      mergeMap(s => [
        new InitializeOrderSuccess(s)
      ]),
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '201', [], err)))
    ))
  ));

  onInitializeOrderLoadUserId = createEffect(() => this.actions$.pipe(
    ofType<InitializeOrder>(StoreActionType.InitializeOrder),
    withLatestFrom(
      this.store.select(getSocialAuth)
    ),
    filter(([action, loginState]) => loginState?.socialLoginState?.userId > 0),
    map(([action, loginState]) => {
      return new AddOrderMeta('customerUserId', loginState.socialLoginState.userId, this.eventHelper.getEvent(action, 'InitializeOrder called'));
    })
  ));

  onInitializeOrderSuccess = createEffect(() => this.actions$.pipe(
    ofType<InitializeOrderSuccess>(StoreActionType.InitializeOrderSuccess),
    mergeMap(s => [
      new ApplyLinkCode(s.order, this.eventHelper.getEvent(s, 'Order initialized')),
      new ApplyStoredCustomerData(s.order, this.eventHelper.getEvent(s, 'Order initialized'))
    ])
  ));

  onSelectCatalogLanguage = createEffect(() => this.actions$.pipe(
    ofType<SelectCatalogLanguage>(StoreActionType.SelectCatalogLanguage),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState)
    ),
    filter(([action, clientStore, orderUuid, orderMeta, validLocations]) => !!orderUuid),
    map(([action, clientStore, orderUuid, orderMeta, validLocations]) => {
      const orderUpdateRequest =
        OrderUtils.mapOrderMetadataToOrderUpdateRequest(
          orderMeta.data,
          this.translate.getDefaultLang(),
          validLocations,
          action.selectedLanguage
        );
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, null, this.eventHelper.getEvent(action, 'SelectCatalogLanguage called'));
    })
  ));


  onCheckExistingOrder = createEffect(() => this.actions$.pipe(
    ofType<CheckExistingOrder>(StoreActionType.CheckExistingOrder),
    withLatestFrom(
      this.store.select(getLinkCode),
      this.store.select(getStoredCustomerDataStatus)
      ),
    switchMap(([action, linkCode, storedCustomerDataStatus]) => this.storeService.checkExistingOrder(action.storeId, action.orderUuid, action.locale).pipe(
      mergeMap(s => {
        if (!this.helper.isMobileApp() && s.originType === ORIGIN_TYPE.APP && window.location.href.includes('#cart')) {
          let basePath = this.helper.generateBasePath(
            '',
            s.storeId,
            s.originType,
            s.originDomain,
            s.storeAliasName
          );
          const urlRedirect = `${s.originDomain}://${window.location.hostname}${basePath}#cart`;
          console.log('Navigate to', urlRedirect);
          window.location.href = urlRedirect;
        }

        const isThankYouPage = window.location.hash.includes('#thankyou');
        if (!isThankYouPage && s.orderToken && action.failbackPayload && !this.locationService.isAdminOrderUpdate()
          && !(s.status === 'DRAFT' && s.paymentStatus !== 'SUCCESSFULLY_COMPLETED') ){
          return [new InitializeOrder(action.storeId, action.failbackPayload)];
        } else {
          return s.status === 'DRAFT' && (linkCode.linkCodeState.status === 'LOADED' || storedCustomerDataStatus === 'LOADED')
            ? [
              new CheckExistingOrderSuccess(s, this.eventHelper.getEvent(action, "After check existing order")),
              new ApplyLinkCode(s, this.eventHelper.getEvent(action, "After check existing order")),
              new ApplyStoredCustomerData(s, this.eventHelper.getEvent(action, "After check existing order"))
            ]
            : [new CheckExistingOrderSuccess(s, this.eventHelper.getEvent(action, "After check existing order"))];
        }
      }),
      catchError((err) => {
        if (err?.error?.status === 'NOT_FOUND'){
          const all = this.cookieService.getAll();
          Object.entries(all)
            .filter(entry => entry[0].startsWith('orderUuid') && entry[1] === action.orderUuid)
            .forEach(entry => this.cookieService.delete(entry[0]));
        }

        if (action.failbackPayload) {
          return of(new InitializeOrder(action.storeId, action.failbackPayload));
        } else {
          return of(new ErrorMessage('public.global.errorExpected', '202', [], err));
        }
      })
    ))
  ));


  onCheckExistingOrderSuccess = createEffect(() => this.actions$.pipe(
    ofType<CheckExistingOrderSuccess>(StoreActionType.CheckExistingOrderSuccess),
    filter(action => !!action.order.location),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) => this.storeService.validateStoreLocation(selectedStore.id, action.order.location.toString()).pipe(
      map(s => new ValidateStoreLocationsSuccess(s)),
      catchError(() => of(new ValidateStoreLocationsFail()))
    ))
  ));


  onValidateStoreLocationsSuccess = createEffect(() => this.actions$.pipe(
    ofType<ValidateStoreLocationsSuccess>(StoreActionType.ValidateStoreLocationsSuccess),
    withLatestFrom(this.store.select(getCurrentCartState)),
    filter(([action, cart]) => action.locations.isValid
        && cart.deliveryMethod === 'IN_STORE_LOCATION'
        && action.locations.label !== cart.location),
    map(([action]) => new UpdateLocation(action.locations.id, this.helper.getDeviceID()))
  ));


  onValidateStoreDeliverableLocationsSuccess = createEffect(() => this.actions$.pipe(
    ofType<ValidateStoreLocationsSuccess>(StoreActionType.ValidateStoreLocationsSuccess),
    withLatestFrom(this.store.select(getCurrentCartState)),
    filter(([action, cart]) => action.locations.deliveryFeeApply
        && cart.deliveryMethod === 'IN_STORE_LOCATION'
        && action.locations.label === cart.location),
    map(([action, cart]) => new GetAssociatedZone(cart.storeId, cart.uuid, cart.deliveryPostCode,
      this.eventHelper.getEvent(action, 'GetAssociatedZone called from ValidateStoreLocationsSuccess')
    ))
  ));


  onApplyStoredCustomerData = createEffect(() => this.actions$.pipe(
    ofType<ApplyStoredCustomerData>(StoreActionType.ApplyStoredCustomerData),
    withLatestFrom(
      this.store.select(getStoredCustomerData),
      this.store.select(getSelectedStore)
      ),
    filter(([action, storedCustomerData]) => storedCustomerData.storedCustomerState.status === 'LOADED'),
    mergeMap(([action, storedCustomerData, clientStore]) => {
      const {order} = action;
      const orderUpdateRequest = OrderUtils.mapToOrderUpdateRequest(order, storedCustomerData.storedCustomerState.data);
      return [
        new StoredCustomerDataSet(this.eventHelper.getEvent(action, 'ApplyStoredCustomerData called')),
        new OrderUpdate(clientStore.id, order.uuid, orderUpdateRequest, null, this.eventHelper.getEvent(action, 'ApplyStoredCustomerData called'))
      ];
    })
  ));


  onApplyLinkCode = createEffect(() => this.actions$.pipe(
    ofType<ApplyLinkCode>(StoreActionType.ApplyLinkCode),
    withLatestFrom(
      this.store.select(getLinkCode),
      this.store.select(getSelectedStore),
      this.store.select(getStoredCustomerDataStatus)
      ),
    filter(([action, linkcode, clientStore, storedCustomerDataStatus]) =>
      linkcode.linkCodeState.status === 'LOADED' &&
      storedCustomerDataStatus !== 'LOADED'
      ),
    mergeMap(([action, linkcode, clientStore]) => {
      const {order} = action;
      const orderUpdateRequest = OrderUtils.mapToOrderUpdateRequest(order, linkcode.linkCodeState.data);
      return [
        new LinkCodeSet(),
        new OrderUpdate(clientStore.id, order.uuid, orderUpdateRequest, null, this.eventHelper.getEvent(action, 'ApplyLinkCode called'))
      ];
    })
  ));


  onAddOrderItem = createEffect(() => this.actions$.pipe(
    ofType<AddOrderItem>(StoreActionType.AddOrderItem),
    switchMap(action => this.storeService.addOrderItem(action.storeId, action.uuid, action.orderItem).pipe(
        withLatestFrom(
          this.store.select(getCurrentCartState),
          this.store.select(getSelectedStoreCatalog)
          ),
        tap(([s, cart, catalog]) => {
          const {offers, categories} = catalog.data;
          let list = offers ? [...offers] : [];
          if (categories){
            list = categories.reduce((acc, val) => acc.concat(val.offers), list);
          }
          const offer = list.find(o => o.offerId === action.orderItem.offerId);
          let orderItem = action.orderItem;
          if (offer) {
            orderItem = {
              ...orderItem,
              name: offer.name,
              itemName: offer.name,
              price: offer.price,
              discountedOfferPrice: offer.price
            };
          }
          this.trackingService.registerAddToCart(cart, orderItem);
        }),
        map(([s]) => new AddOrderItemSuccess(s)),
        // catchError(a => of(new AddOrderItemFailed()))
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '203', [], err)))
      )
    )
  ));


  AddRuleOrderItem = createEffect(() => this.actions$.pipe(
    ofType<AddRuleOrderItem>(StoreActionType.AddRuleOrderItem),
    switchMap(action => this.storeService.addOrderItem(action.storeId, action.uuid, action.orderItem).pipe(
        map(s => new AddRuleOrderItemSuccess(s)),
        // catchError(a => of(new AddRuleOrderItemFailed()))
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '209', [], err)))
      )
    )
  ));

  // for future use: bulk add offers to cart
  // @Effect()
  // onAddOrderItems = this.actions$.pipe(
  //   ofType<AddOrderItems>(StoreActionType.AddOrderItems),
  //   switchMap(action => this.storeService.addOrderItems(action.storeId, action.uuid, action.orderItems).pipe(
  //     map(s => new AddOrderItemSuccess(s)),
  //     catchError(a => of(new ErrorMessage('public.global.errorExpected', '203')))
  //   )
  // )
  // );


  onUpdateOrderItem = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderItem>(StoreActionType.UpdateOrderItem),
    switchMap(action => this.storeService.updateOrderItem(action.storeId, action.cartUuid, action.itemUuid, action.orderItem).pipe(
        map(s => new UpdateOrderItemSuccess(s)),
        // catchError(a => of(new UpdateOrderItemFailed()))
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '204', [], err)))
      )
    )
  ));


  onRemoveOrderItem = createEffect(() => this.actions$.pipe(
    ofType<RemoveOrderItem>(StoreActionType.RemoveOrderItem),
    switchMap(action => this.storeService.removeOrderItem(action.storeId, action.orderUuid, action.itemUuid).pipe(
      map(s => new RemoveOrderItemSuccess(s)),
      // catchError(a => of(new RemoveOrderItemFailed()))
      catchError((err) => of(new ErrorMessage('public.global.errorExpected', '205', [], err)))
    )),
  ));


  onRemoveRuleOrderItem = createEffect(() => this.actions$.pipe(
    ofType<RemoveRuleOrderItem>(StoreActionType.RemoveRuleOrderItem),
    switchMap(action => this.storeService.removeOrderItem(action.storeId, action.uuid, action.itemUuid).pipe(
        map(s => new RemoveRuleOrderItemSuccess(s)),
        catchError((err) => of(new ErrorMessage('public.global.errorExpected', '211', [], err)))
      )
    )
  ));


  onOrderUpdate = createEffect(() => this.actions$.pipe(
    ofType<OrderUpdate>(StoreActionType.OrderUpdate),
    switchMap(action => this.storeService.orderUpdate(action.storeId, action.orderUuid, action.payload, false).pipe(
        tap(_ => {
          if (action.orderUpdateType === 'UpdateZipCode' || action.orderUpdateType === 'UpdateZoneLocation') {
            this.store.dispatch(new GetAssociatedZone(action.storeId, action.orderUuid, action.payload.deliveryPostCode,
              this.eventHelper.getEvent(action, 'UpdateZipCode or UpdateZoneLocation updated')));
          }
        }),
        map(s => new OrderUpdateSuccess(s, this.eventHelper.getEvent(action, 'Request order update success'))),
        catchError((err) => {
          if (err.error.errors[0] && err.error.errors[0].code !== 'INVALID_CUSTOMER_VOUCHER'){
            return of(new ErrorMessage('public.global.errorExpected', '206', [], err, this.eventHelper.getEvent(action, 'Request order update failed')));
          }
        })
    )),
  ));


  onOrderUpdateSuccess = createEffect(() => this.actions$.pipe(
    ofType<OrderUpdateSuccess>(StoreActionType.OrderUpdateSuccess),
    withLatestFrom(this.store.select(getCurrentCartUuid), this.store.select(getSelectedStore), this.store.select(getSelectedLang)),
    switchMap(([action, orderUuid, selectedStore, lang]) => {
      return [new CheckExistingOrder(
        selectedStore.id,
        orderUuid,
        'CHECKEXISTING',
        lang,
        null,
        this.eventHelper.getEvent(action, 'After OrderUpdateSuccess'))];
    })
  ));


  onGetAssociatedZone = createEffect(() => this.actions$.pipe(
    ofType<GetAssociatedZone>(StoreActionType.GetAssociatedZone),
    withLatestFrom(this.store.select(getZoneState)),
    filter(([action, zone]) => zone.zoneState.status !== 'FETCHING_GEOCODE'),
    switchMap(([action])=> this.storeService.getAssociatedZone(action.storeId, action.orderUuid).pipe(
        map(s => new GetAssociatedZoneSuccess(s, action.orderPostCode, this.eventHelper.getEvent(action, 'Fetched associated zone'))),
        catchError((err) =>
          of(new ErrorMessage('public.global.errorExpected', '206', [], err, this.eventHelper.getEvent(action, 'GetAssociatedZone failed')))
        )
    )),
  ));

  onSubmitOrderSuccess = createEffect(() => this.actions$.pipe(
    ofType<SubmitOrderSuccess>(StoreActionType.SubmitOrderSuccess),
    withLatestFrom(this.store.select(getCurrentCartState)),
    map(([action, cart] ) => {
      this.trackingService.registerPurchase(cart);
      return new TrackingEvent('registerPurchase');
    })
  ));


  onProceedToCheckout = createEffect(() => this.actions$.pipe(
    ofType<ProceedToCheckout>(StoreActionType.ProceedToCheckout),
    withLatestFrom(this.store.select(getCurrentCartState)),
    map(([action, cart] ) => {
      this.trackingService.registerInitiateCheckout(cart);
      return new TrackingEvent('registerInitiateCheckout');
    })
  ));


  onSubmitOrder = createEffect(() => this.actions$.pipe(
    ofType<SubmitOrder>(StoreActionType.SubmitOrder),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) =>
      this.storeService.orderUpdate(action.storeId, action.orderUuid, action.payload, action.v2Support).pipe(
        switchMap((s) => [new SubmitOrderSuccess(s)]
        ),
        catchError(a => {
          if (a.error && a.error.errors) {
            let consumedError;

            // Handle wish time error
            // Handle slot selection error
            consumedError = a.error.errors.find(e => e.code === 'ORDER_WISH_TIME_INVALID' || e.code === 'ORDER_PER_SLOT_LIMIT_REACHED');
            if (consumedError !== undefined) {
              return of(
                new SubmitOrderFailed(),
                new ToggleUnavailableDeliveryTimeError(
                  true,
                  consumedError.additionalInfo ? consumedError.additionalInfo.after : undefined,
                )
              );
            }

            // Handle offer availability errors
            consumedError = a.error.errors.find(e => e.code === 'OFFER_AVAILABILITY_SCHEDULE_ERROR');
            if (consumedError !== undefined) {

              let offers: UnavailableOffer;
              if (consumedError.additionalInfo) {
                offers = consumedError.additionalInfo;
              }

              return of(new SubmitOrderFailed(), new ToggleOffersUnavailable(true, offers));
            }

            // Handle out of stock errors
            consumedError = a.error.errors.find(e => e.code === 'OUT_OF_STOCK');
            if (consumedError !== undefined) {
              const offers: OutOfStockOffer[] = [];
              if (consumedError.additionalInfo && consumedError.additionalInfo.offers) {
                consumedError.additionalInfo.offers.forEach(t =>
                  offers.push({
                    offerId: t.id,
                    orderItemUuid: t.orderItemUuid,
                    parentOrderItemUuid: t.parentOrderItemUuid,
                    stockQuantity: t.currentStock,
                    orderQuantity: t.currentStock + t.deficit, deficit: t.deficit,
                    offerName: t.offerName,
                    parentOfferName: t.parentOfferName,
                    variantDescription: t.variantDescription
                  })
                );
              }
              return of(new SubmitOrderFailed(), new ToggleOffersOutOfStock(true, offers));
            }

            // Handle same day ordering errors
            const consumedErrors = a.error.errors.filter(e => e.code === 'ORDER_STORE_SAME_DAY_ORDERING_DISABLED'
                                                  || e.code === 'ORDER_STORE_ZONE_SAME_DAY_ORDERING_DISABLED'
                                                  || e.code === 'ORDER_STORE_CATALOG_CATEGORY_OFFER_SAME_DAY_ORDERING_DISABLED');
            if (consumedErrors.length > 0) {
              const sameDayOrderingErrors: SameDayOrderingError[] = consumedErrors.map(err => ({
                code: err.code,
                additionalInfo: err.additionalInfo && err.additionalInfo.offers ? [...err.additionalInfo.offers] : [],
              }));
              return of(new SubmitOrderFailed(), new ToggleSameDayOrderingDisabled(true, sameDayOrderingErrors));
            }

            // Handle order minimum amount not met errors
            consumedError = a.error.errors.find(e => e.code === 'ORDER_MINIMUM_AMOUNT_NOT_MET');
            if (consumedError !== undefined) {
              return of(
                new SubmitOrderFailed(),
                new ErrorMessage('public.checkout.errors.' + consumedError.code, null, null, consumedError.additionalInfo)
              );
            }

            // Handle any other errors
            const errors = [];
            a.error.errors.forEach(e => {
              if (e.code) {
                errors.push({code: e.code});
              }
            });
            const storeDetails = `Store id: ${selectedStore.id}, Store alias: ${selectedStore.aliasName}`;
            this.logger.error('onSubmitOrder errors during submission', storeDetails , errors);
            if (errors.length) {
              return of(new SubmitOrderFailed(), new ToggleOrderSubmitError(true, errors));
            }

          }
          return of(new SubmitOrderFailed(), new ErrorMessage('public.global.errorExpected', '207', [], a));
        }
       )
    )),
  ));


  onUpdateOrderQuantities = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderItemQuantities>(StoreActionType.UpdateOrderItemQuantities),
    withLatestFrom(this.store.select(getCurrentCartUuid), this.store.select(getSelectedStore)),
    switchMap(([action, orderUuid, store]) =>
      this.storeService.orderUpdateQuantities(store.id, orderUuid, action.offers).pipe(
        map( () => new UpdateOrderItemQuantitiesSuccess()),
        catchError(() => of(new UpdateOrderItemQuantitiesFailed()))
      ))
  ));


  onUpdateOrderQuantitiesSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderItemQuantitiesSuccess>(StoreActionType.UpdateOrderItemQuantitiesSuccess),
    withLatestFrom(
      this.store.select(getCurrentCartUuid),
      this.store.select(getSelectedStore),
      this.store.select(getSelectedLang),
      this.store.select(getCurrentOrderMetaState)
    ),
    switchMap(([action, orderUuid, store, lang, orderMetaState]) => [
      new CheckExistingOrder(store.id, orderUuid, 'CHECKEXISTING', lang, null,
        this.eventHelper.getEvent(action, 'Order Item Quantities Updated')),
      new LoadCatalog(store.id, lang, orderMetaState.data.wishTime, this.eventHelper.getEvent(action, 'Order Item Quantities Updated')),
      new ToggleOffersUnavailable(false),
      new ToggleOffersOutOfStock(false)
    ])
  ));



  onOrderUpdateStatus = createEffect(() => this.actions$.pipe(
    ofType<OrderUpdateStatus>(StoreActionType.OrderUpdateStatus),
    switchMap(action =>
      this.storeService.orderUpdateStatus(action.storeId, action.orderUuid, action.orderStatus).pipe(
        map( res => new OrderUpdateStatusSuccess(res)),
        catchError(a =>
          (a.error && a.error.errors && a.error.errors[0].code === 'OUT_OF_STOCK')
          ? of(new OrderUpdateStatusFailed(), new ErrorMessage('public.checkout.itemsOutOfStock', '210'))
         : of(new OrderUpdateStatusFailed(), new ErrorMessage('public.global.errorExpected', '208', [], a))
       )
      ))
  ));


  onViewOrderStatus = createEffect(() => this.actions$.pipe(
    ofType<CheckExistingOrder>(StoreActionType.ViewOrderStatus),
    switchMap(action => this.storeService.checkExistingOrder(action.storeId, action.orderUuid, action.locale).pipe(
      map(s => new ViewOrderStatusSuccess(s)),
      catchError(() => of(new ViewOrderStatusFailed()))
    ))
  ));


  onGetCombinedOrder = createEffect(() => this.actions$.pipe(
    ofType<GetCombinedOrder>(StoreActionType.GetCombinedOrder),
    switchMap(action => this.storeService.getCombinedOrders(action.storeId, action.locationId).pipe(
      map(s => new GetCombinedOrderSuccess(s)),
      catchError((e) => {
        if (e && e.error && e.error.errors[0] && e.error.errors[0].code) {
          return of(new GetCombinedOrderFailed(e.error.errors[0].code));
        } else {
          return of(new GetCombinedOrderFailed(''));
        }
      })
    ))
  ));


  onLoadLocation = createEffect(() => this.actions$.pipe(
    ofType<ValidateStoreLocations>(StoreActionType.ValidateStoreLocations),
    switchMap(action => this.storeService.validateStoreLocation(action.storeId, action.storeLocation).pipe(
      map(s => new ValidateStoreLocationsSuccess(s)),
      catchError(() => of(new ValidateStoreLocationsFail()))
    ))
  ));


  onSendOrderByEmail = createEffect(() => this.actions$.pipe(
    ofType<SendOrderByEmail>(StoreActionType.SendOrderByEmail),
    switchMap(action => this.storeService.sendOrderByEmail(action.orderUuid, action.email).pipe(
      map(s => new SendOrderByEmailSuccess(s)),
      catchError(() => of(new SendOrderByEmailFail()))
    ))
  ));


  onSendStandaloneOrderByEmail = createEffect(() => this.actions$.pipe(
    ofType<SendStandaloneOrderByEmail>(StoreActionType.SendStandaloneOrderByEmail),
    switchMap(action => this.storeService.sendStandaloneOrderByEmail(action.storeId, action.standalonePaymentId, action.email).pipe(
      map(s => new SendStandaloneOrderByEmailSuccess(s)),
      catchError(() => of(new SendStandaloneOrderByEmailFail()))
    ))
  ));

  // zone

  onGetZonePerZipcode = createEffect(() => this.actions$.pipe(
    ofType<GetZonePerZipcode>(StoreActionType.GetZonePerZipcode),
    switchMap(action => this.storeService.getZonePerZipcode(action.storeId, action.zipCode).pipe(
      switchMap(s => [new GetZonePerZipcodeSuccess(s)]),
      catchError(() => of(new GetZonePerZipcodeFail()))
    ))
  ));


  onUpdateZipCode = createEffect(() => this.actions$.pipe(
    ofType<UpdateZipCode>(StoreActionType.UpdateZipCode),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    filter(([action, clientStore, orderUuid]) => !!orderUuid),
    map(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) => {
      orderMeta.data.customerZip = action.zipCode;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, 'UpdateZipCode',
      this.eventHelper.getEvent(action, 'Zip code updated'));
    })
  ));


  onUpdateLocation = createEffect(() => this.actions$.pipe(
    ofType<UpdateLocation>(StoreActionType.UpdateLocation),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang),
      this.store.select(getLinkCodeStatus),
      this.store.select(getStoredCustomerDataStatus)
    ),
    filter(s => s[6] !== 'LOADED' && s[7] !== 'LOADED'),
    map(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) => {
      if (!orderMeta.data.deliveryMethod && clientStore.settings.DEFAULT_DELIVERY_MODE &&
      this.checkoutService.ifDeliveryMethodEnabled(clientStore.settings.DEFAULT_DELIVERY_MODE)) {
        orderMeta.data.deliveryMethod = DELIVERY_METHOD_VALUES[clientStore.settings.DEFAULT_DELIVERY_MODE];
      }
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        this.translate.getDefaultLang(),
        validLocations,
        selectedLang);
      orderUpdateRequest.location = action.locationId;
      orderUpdateRequest.deviceIdentifier = action.deviceIdentifier;
      const orderUpdateType = validLocations?.deliveryFeeApply ? 'UpdateZipCode' : undefined;
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, orderUpdateType, this.eventHelper.getEvent(action, 'Location updated'));
    })
  ));

  // store rules

  onGetStoreRules = createEffect(() => this.actions$.pipe(
    ofType<GetStoreRules>(StoreActionType.GetStoreRules),
    switchMap(action => this.storeService.getStoreRules(action.storeId, action.langId).pipe(
      map(s => new GetStoreRulesSuccess(s, this.eventHelper.getEvent(action, 'Fetched store rules'))),
      catchError(() => of(new GetStoreRulesFail(), new ErrorMessage('public.global.errorExpected', '603')))
    ))
  ));


  onUpdateDeliveryMethod = createEffect(() => this.actions$.pipe(
    ofType<UpdateDeliveryMethod>(StoreActionType.UpdateDeliveryMethod),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang),
      this.store.select(getCurrentCartStatus)),
    filter(
      ([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang, cartStatus]) => cartStatus !== 'LOADING' && orderUuid
    ),
    map(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang, cartStatus]) => {
      orderMeta.data.deliveryMethod = action.deliveryMethod;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, clientStore, validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, null, this.eventHelper.getEvent(action, 'Delivery method updated'));
    })
  ));


  onUpdateVoucher = createEffect(() => this.actions$.pipe(
    ofType<UpdateVoucher>(StoreActionType.UpdateVoucher),
    withLatestFrom(
      this.store.select(getCustomerLoyaltyState),
      this.store.select(getCurrentOrderMetaState)),
    filter(([action, loyaltyState, orderMeta]) => !(loyaltyState?.data?.voucherValue > 0 && !action.voucherCode && !orderMeta?.data?.voucherCode)),
    map(([action]) => {
      if (!!action.voucherCode) {
        return new ValidateVoucher(action.voucherCode, action.orderUuid);
      } else {
        return new RemoveVoucher();
      }
    })
  ));


  onRemoveVoucher = createEffect(() => this.actions$.pipe(
    ofType<RemoveVoucher>(StoreActionType.RemoveVoucher),
    withLatestFrom(
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
      orderUpdateRequest.voucherCode = '';
      return [
        new AddCheckoutState('voucherFormValid', true),
        new AddOrderMeta('voucherCode', orderUpdateRequest.voucherCode)];
    })
  ));


  onValidateVoucher = createEffect(() => this.actions$.pipe(
    ofType<ValidateVoucher>(StoreActionType.ValidateVoucher),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) =>
      this.storeService.validateVoucher(clientStore.id, action.voucherCode).pipe(
        mergeMap(s => {
          if (s.isActive) {
            const orderUpdateRequest =
              OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
            if (!('errorMessage' in  orderUpdateRequest)) {
              orderUpdateRequest.voucherCode = action.voucherCode;
              return [
                new AddCheckoutState('voucherFormValid', true),
                new OrderUpdate(clientStore.id, orderUuid ?? action.orderUuid, orderUpdateRequest, null, this.eventHelper.getEvent(action, 'Voucher validated')),
                new ValidateVoucherSuccess(s.discount, s.discountType, s.type, s.orderMinAmount, s.formattedOrderMinAmount)];
            }
          }
          return [new ValidateVoucherFailed()];
        }),
        catchError(() => of(new ValidateVoucherFailed()))
      )
    )
  ));


  onValidateVoucherFailed = createEffect(() => this.actions$.pipe(
    ofType<ValidateVoucherFailed>(StoreActionType.ValidateVoucherFailed),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([, clientStore, orderUuid, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
      orderUpdateRequest.voucherCode = '';
      return [
        new AddCheckoutState('voucherFormValid', false),
        new AddOrderMeta('voucherCode', orderUpdateRequest.voucherCode)];
    })
  ));


  onCreateStandalonePayment = createEffect(() => this.actions$.pipe(
    ofType<CreateStandalonePayment>(StoreActionType.CreateStandalonePayment),
    withLatestFrom(this.store.select(getCombinedOrdersData)),
    switchMap(([action, combinedOrderData]) => {
      const standaloneRequest: CreateStandalonePaymentRequest = {
        amountReference: action.amountReference,
        deviceIdentifier: action.deviceIdentifier,
        referenceType: 'STANDALONE_PAYMENT'
      };
      if (action.orderToken){
        standaloneRequest.orderReference = action.orderToken;
      } else if (action.locationId){
        standaloneRequest.locationReference = Number(action.locationId);
        standaloneRequest.tapId = combinedOrderData.data.tapId.toString();
      }

      return this.storeService.createStandalonePayment(action.storeId, standaloneRequest).pipe(
        map(s => new CreateStandalonePaymentSuccess(s)),
        catchError((err) => of(new CreateStandalonePaymentFailed()))
      );
    })
  ));


  onUpdateStandalonePayment = createEffect(() => this.actions$.pipe(
    ofType<UpdateStandalonePayment>(StoreActionType.UpdateStandalonePayment),
    withLatestFrom(this.store.select(getCombinedOrdersData)),
    switchMap(([action, combinedOrderData]) => {
      return this.storeService.updateStandalonePayment(action.storeId, action.paymentId, action.payload).pipe(
        map(s => new UpdateStandalonePaymentSuccess(s)),
        catchError((err) => of(new UpdateStandalonePaymentFailed()))
      );
    })
  ));


  onCustomerStandalonePaymentSearch = createEffect(() => this.actions$.pipe(
    ofType<CustomerStandalonePaymentSearch>(StoreActionType.CustomerStandalonePaymentSearch),
    switchMap((action) => {
      return this.storeService.customerStandalonePaymentSearch(action.storeId, action).pipe(
        map(s => new CustomerStandalonePaymentSearchSuccess(s)),
        catchError((err) => of(new CustomerStandalonePaymentSearchFailed()))
      );
    })
  ));


  onInitiateStandalonePayment = createEffect(() => this.actions$.pipe(
    ofType<InitiateStandalonePayment>(StoreActionType.InitiateStandalonePayment),
    switchMap((action) => {
      return this.storeService.initiateStandalonePayment(action.storeId, action.paymentId, { originType: action.originType, originDomain: action.originDomain}).pipe(
        map(s => new InitiateStandalonePaymentSuccess(s)),
        catchError((err) => of(new InitiateStandalonePaymentFailed()))
      );
    })
  ));


  onCompleteStandalonePayment = createEffect(() => this.actions$.pipe(
    ofType<CompleteStandalonePayment>(StoreActionType.CompleteStandalonePayment),
    switchMap((action) => {
      return this.storeService.completeStandalonePayment(action.storeId, action.paymentId, action.paymentResponse).pipe(
        tap((s: any) =>  {
          // to avoid other complete payment call to back end in StandaloneThankyouGuard
          this.storageService.setSavedState(true, 'standalone-payment-completed');
          window.location.href = window.location.origin + `/payment-redirect/sp/${action.paymentMethod}/${action.storeId}/${action.paymentId}`;
        }),
        catchError((err) => {
          this.storageService.setSavedState(true, 'standalone-payment-completed');
          window.location.href = window.location.origin + '/standalone-payment/standalone-payment-error';
          return of(new ErrorMessage('public.checkout.errors.paymentFailed'));
        })
      );
    })
  ));


  onFetchSlots = createEffect(() => this.actions$.pipe(
    ofType<FetchSlots>(StoreActionType.FetchSlots),
    withLatestFrom(this.store.select(getCurrentOrderWishTime), this.store.select(getStoreOpeningInfo)),
    switchMap(([action, currentOrderWishTime, storeOpeningInfo]) => {
      let wishDate = new Date(currentOrderWishTime ? currentOrderWishTime : '');
      if (isNaN(wishDate.valueOf())) {
        wishDate = new Date();
      }
      return this.storeService.getSlots(
          action.storeId,
          action.deliveryMode,
          action.date && storeOpeningInfo.date ? action.date : (currentOrderWishTime ? dayjs(wishDate).format('YYYY-MM-DD') : null)
        ).pipe(
          map(s => new FetchSlotsSuccess(action.deliveryMode, s, action.date, this.eventHelper.getEvent(action, 'Fetch slots success'))),
          catchError((err) => of(new FetchSlotsFailed(), new ErrorMessage('public.global.errorExpected', '220', [], err)))
        );
    })
  ));


  onFetchSlotsSuccess = createEffect(() => this.actions$.pipe(
    ofType<FetchSlotsSuccess>(StoreActionType.FetchSlotsSuccess),
    withLatestFrom(this.store.select(getSelectedStore), this.store.select(getSelectedLang)),
    filter(([action, store, language]) => !!store && !!store.id),
    map(([action, store, language]) => {
      if ((!!action.response.inStoreLocation && !!action.response.inStoreLocation.selectedSlot) ||
      (!!action.response.noLocation && !!action.response.noLocation.selectedSlot) ||
      (!!action.response.address && !!action.response.address.selectedSlot)) {
        const evt = this.eventHelper.getEvent(action, `Fetch slots success | ${action.deliveryMode}`);
        switch (action.deliveryMode) {
          case 'IN_STORE_LOCATION':
            return new LoadCatalog(store.id, language, action.response.inStoreLocation.selectedSlot.startTime, evt);
          case 'NO_LOCATION':
            return new LoadCatalog(store.id, language, action.response.noLocation.selectedSlot.startTime, evt);
          case 'ADDRESS':
            return new LoadCatalog(store.id, language, action.response.address.selectedSlot.startTime, evt);
        }
      }
      // If there is no selected slot in the response as no slot is available, the date selected by the user is used to get catalog...
      if (action.requestDate) {
        const requestDate = new Date(action.requestDate);
        return new LoadCatalog(store.id, language, requestDate.toISOString(), this.eventHelper.getEvent(action, 'No slot selected | Has request date'));
      } else {
        return new LoadCatalog(store.id, language, null, this.eventHelper.getEvent(action, 'No slot selected'));
      }
    })
  ));


  onSlotSelected = createEffect(() => this.actions$.pipe(
    ofType<SlotSelected>(StoreActionType.SlotSelected),
    withLatestFrom(this.store.select(getSelectedStore), this.store.select(getSelectedLang)),
    filter(([action, store, language]) => !!store && !!store.id),
    map(([action, store, language]) => {
      return new LoadCatalog(store.id, language, action.selectedSlot.startTime, this.eventHelper.getEvent(action, 'Slot selected'));
    })
  ));

  onUpdateOrderWishTime = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderWishTime>(StoreActionType.UpdateOrderWishTime),
    withLatestFrom(this.store.select(getSelectedStore), this.store.select(getCurrentOrderDeliveryMethod)),
    switchMap(([action, store, deliveryMethod]) =>
      this.storeService.getSlots(
        store.id,
        DELIVERY_METHODS[deliveryMethod],
        dayjs(action.suggestedSlot.startTime).format('YYYY-MM-DD')
      ).pipe(
        map(res => new UpdateOrderWishTimeSuccess(action.suggestedSlot, DELIVERY_METHODS[deliveryMethod], res)),
        catchError(() => of(new UpdateOrderWishTimeFailed()))
      ))
  ));


  onUpdateOrderWishTimeSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderWishTimeSuccess>(StoreActionType.UpdateOrderWishTimeSuccess),
    map(a => new ToggleUnavailableDeliveryTimeError(false))
  ));


  onGeocodeAddress = createEffect(() => this.actions$.pipe(
    ofType<GeocodeAddress>(StoreActionType.GeocodeAddress),
    switchMap((action) =>
      this.storeService.getLocationFromAddress(
        action.address,
        action.zipCode,
        action.countryCode
      ).pipe(
        map(res =>
          res.results.length
            ? new GeocodeAddressSuccess(res.results[0].geometry.location.lat, res.results[0].geometry.location.lng,
              this.eventHelper.getEvent(action, 'Fetch location from address successfull'))
            : new GeocodeAddressFailed(this.eventHelper.getEvent(action, 'Fetch location from address failed (no results)'))
        ),
        catchError(() => of(new GeocodeAddressFailed(this.eventHelper.getEvent(action, 'Fetch location from address failed (error)')))),
      )
    )
  ));

  onGeocodeAddressSuccess = createEffect(() => this.actions$.pipe(
    ofType<GeocodeAddressSuccess>(StoreActionType.GeocodeAddressSuccess),
    withLatestFrom(
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang),
    ),
    switchMap(([action, orderMeta, clientStore, cart, validLocations, selectedLang]) => {
      if(action.latitude !== orderMeta.data.latitude || action.longitude !== orderMeta.data.longitude) {
          orderMeta.data.latitude = action.latitude;
        orderMeta.data.longitude = action.longitude;
        const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
        return [
          new AddOrderMeta('latitude', action.latitude, this.eventHelper.getEvent(action, 'Geocode address changed')),
          new AddOrderMeta('longitude', action.longitude, this.eventHelper.getEvent(action, 'Geocode address changed')),
          new OrderUpdate(clientStore.id, cart.uuid, orderUpdateRequest, 'UpdateZoneLocation', this.eventHelper.getEvent(action, 'Geocode address changed'))
        ];
      } else {
        return [new GetAssociatedZone(cart.storeId, cart.uuid, cart.deliveryPostCode,
          this.eventHelper.getEvent(action, 'Geocode address updated')
        )];
      }
    })
  ));

  onGeocodeAddressFailed = createEffect(() => this.actions$.pipe(
    ofType<GeocodeAddressFailed>(StoreActionType.GeocodeAddressFailed),
    withLatestFrom(
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getSelectedStore),
      this.store.select(getCurrentCartUuid),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    filter(([, orderMetaData]) => !!orderMetaData.data.latitude || !!orderMetaData.data.longitude),
    map(([action, orderMeta, clientStore, orderUuid, validLocations, selectedLang]) => {
      delete orderMeta.data.latitude;
      // orderMeta.data.latitude = undefined;
      delete orderMeta.data.longitude;
      // orderMeta.data.longitude = undefined;
      const orderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(orderMeta.data, this.translate.getDefaultLang(), validLocations, selectedLang);
      return new OrderUpdate(clientStore.id, orderUuid, orderUpdateRequest, null, this.eventHelper.getEvent(action, 'Geocode address failed'));
    })
  ));

  onSaveStoreByAlias = createEffect(() => this.actions$.pipe(
    ofType<SaveStoreByAlias>(StoreActionType.SaveStoreByAlias),
    switchMap(action => this.storeService.load(action.storeAlias).pipe(
      map(s => new SaveStoreByAliasSuccess(s.id, s.aliasName, s.name, action.storeUrl, action.saveMode, s.settings.LOGO)),
      catchError(() => of(new SaveStoreByAliasFailed()))
    ))
  ));

  setUiStyles(settings: { [key: string]: any; }): void {
    if (settings.UI_BRANDING_STYLES) {
      ThemeUtils.setThemeStyles(JSON.parse(settings.UI_BRANDING_STYLES));
    } else {
      ThemeUtils.setDefaultStyle();
    }
  }
}
