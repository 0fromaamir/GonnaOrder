import { Action } from '@ngrx/store';
import { MynextLoginFailed, MynextLoginSuccess } from 'src/app/stores/+state/stores.actions';
import { Event } from 'src/app/stores/event';
import {
  AssociatedZone,
  ClientStore,
  CustomerLoyalty,
  EmailMessage,
  LocationValid,
  Offer,
  Order,
  OrderItem,
  PresetOrderData,
  StoreCatalog,
  StoreSaveMode,
  StoreViewState
} from '../../../stores/stores';
import { AvailableSlotsResponse, Slot } from '../types/AvailableSlotsResponse';
import { CustomerDetailsUpdateRequest, CustomerSocialLoginResponse, SocialAccountLoginDetails } from '../types/CustomerSocialLogin';
import { OrderUpdateRequest } from '../types/OrderUpdateRequest';
import { OutOfStockOffer } from '../types/OutOfStockOffer';
import { SameDayOrderingError } from '../types/SameDayOrderingError';
import { StandalonePaymentOrder, UpdateStandalonePaymentRequest } from '../types/StandalonePayment';
import { UIError } from '../types/UIError';
import { UnavailableOffer } from '../types/UnavailableOffer';
import { UpdateOrderItemQuantityRequest } from '../types/UpdateOrderItemQuantityRequest';
import { CartState, CatalogLanguagesList, CustomerInfo, ViewState } from './stores.reducer';

export enum StoreActionType {
  InitializeState = '[selectedStore] InitializeState',
  SocialLogin = '[selectedStore] SocialLogin',
  SocialLoginSuccess = '[selectedStore] SocialLoginSuccess',
  SocialLoginFailed = '[selectedStore] SocialLoginFailed',
  SocialLogout = '[selectedStore] SocialLogout',
  CustomerDetailsUpdate = '[selectedStore] CustomerDetailsUpdate',
  CustomerDetailsUpdateSuccess = '[selectedStore] CustomerDetailsUpdateSuccess',
  CustomerDetailsUpdateFailed = '[selectedStore] CustomerDetailsUpdateFailed',
  LoadStore = '[selectedStore] LoadStore',
  LoadStoreSuccess = '[selectedStore] LoadStoreSuccess',
  LoadStoreFailed = '[selectedStore] LoadStoreFailed',
  LoadStoreSeveralTimes = '[selectedStore] LoadStoreSeveralTimes',
  // customer loyalty
  LoadCustomerLoyalty = '[selectedStore] LoadCustomerLoyalty',
  LoadCustomerLoyaltySuccess = '[selectedStore] LoadCustomerLoyaltySuccess',
  LoadCustomerLoyaltyFailed = '[selectedStore] LoadCustomerLoyaltyFailed',
  // link code
  LoadLinkCode = '[selectedStore] LoadLinkCode',
  ApplyLinkCode = '[selectedStore] ApplyLinkCode',
  LoadLinkCodeSuccess = '[selectedStore] LoadLinkCodeSuccess',
  LinkCodeSet = '[selectedStore] LinkCodeSet',
  LoadLinkCodeFailed = '[selectedStore] LoadLinkCodeFailed',
  // stored customer data
  LoadStoredCustomerData = '[selectedStore] LoadStoredCustomerData',
  ApplyStoredCustomerData = '[selectedStore] ApplyStoredCustomerData',
  LoadStoredCustomerDataSuccess = '[selectedStore] LoadStoredCustomerDataSuccess',
  StoredCustomerDataSet = '[selectedStore] StoredCustomerDataSet',
  StoredCustomerDataChanged = '[selectedStore] StoredCustomerDataChanged',
  LoadStoredCustomerDataFailed = '[selectedStore] LoadStoredCustomerDataFailed',
  // catalog actions
  LoadCatalog = '[selectedStore] LoadCatalog',
  LoadCatalogSuccess= '[selectedStore] LoadCatalogSuccess',
  LoadCatalogFailed= '[selectedStore] LoadCatalogFailed',
  SelectCategory = '[selectedStore] SelectCategory',
  SelectCategorySuccess = '[selectedStore] SelectCategorySuccess',
  SelectCategoryFailed = '[selectedStore] SelectCategoryFailed',
  SelectCatalogLanguage = '[selectedStore] SelectCatalogLanguage',
  LoadCatalogLanguages = '[selectedStore] LoadCatalogLanguages',
  LoadCatalogLanguagesSuccess = '[selectedStore] LoadCatalogLanguagesSuccess',
  LoadCatalogLanguagesFailed = '[selectedStore] LoadCatalogLanguagesFailed',
  // order actions
  ResetOrder = '[selectedStore] ResetOrder',
  InitializeOrder = '[selectedStore] InitializeOrder',
  InitializeOrderSuccess = '[selectedStore] InitializeOrderSuccess',
  InitializeOrderFailed = '[selectedStore] InitializeOrderFailed',
  InitializeCartState = '[selectedStore] InitializeCartState', // initialize cart state
  CheckExistingOrder = '[selectedStore] CheckExistingOrder',
  CheckExistingOrderSuccess = '[selectedStore] CheckExistingOrderSuccess',
  CheckExistingOrderFailed = '[selectedStore] CheckExistingOrderFailed',
  OrderRemove = '[selectedStore] OrderRemove',
  OrderRemoveSuccess = '[selectedStore] OrderRemoveSuccess',
  OrderRemoveFailed = '[selectedStore] OrderRemoveFailed',
  OrderUpdate = '[selectedStore] OrderUpdate',
  OrderUpdateSuccess = '[selectedStore] OrderUpdateSuccess',
  OrderUpdateFailed = '[selectedStore] OrderUpdateFailed',
  SubmitOrder = '[selectedStore] SubmitOrder',
  SubmitOrderSuccess = '[selectedStore] SubmitOrderSuccess',
  SubmitOrderFailed = '[selectedStore] SubmitOrderFailed',
  OrderUpdateStatus = '[selectedStore] OrderUpdateStatus',
  OrderUpdateStatusSuccess = '[selectedStore] OrderUpdateStatusSuccess',
  OrderUpdateStatusFailed = '[selectedStore] OrderUpdateStatusFailed',
  InitializeOrderItem = '[selectedStore] InitializeOrderItem',
  ViewOrderItem = '[selectedStore] ViewOrderItem',
  ViewOrderItemSuccess = '[selectedStore] ViewOrderItemSuccess',
  ViewOrderItemFailed = '[selectedStore] ViewOrderItemFailed',
  AddOrderItem = '[selectedStore] AddOrderItem',
  AddRuleOrderItem = '[selectedStore] AddRuleOrderItem',
  AddOrderItems = '[selectedStore] AddOrderItems',
  AddOrderItemSuccess = '[selectedStore] AddOrderItemSuccess',
  AddRuleOrderItemSuccess = '[selectedStore] AddRuleOrderItemSuccess',
  AddOrderItemFailed = '[selectedStore] AddOrderItemFailed',
  AddRuleOrderItemFailed = '[selectedStore] AddRuleOrderItemFailed',
  UpdateOrderItem = '[selectedStore] UpdateOrderItem',
  UpdateOrderItemSuccess = '[selectedStore] UpdateOrderItemSuccess',
  UpdateOrderItemFailed = '[selectedStore] UpdateOrderItemFailed',
  RemoveOrderItem = '[selectedStore] RemoveOrderItem',
  RemoveOrderItemSuccess = '[selectedStore] RemoveOrderItemSuccess',
  RemoveOrderItemFailed = '[selectedStore] RemoveOrderItemFailed',
  RemoveRuleOrderItem = '[selectedStore] RemoveRuleOrderItem',
  RemoveRuleOrderItemSuccess = '[selectedStore] RemoveRuleOrderItemSuccess',
  InitializeOrderMeta = '[selectedStore] RemoveOrderItemFailed',
  AddOrderMeta = '[selectedStore] AddOrderMeta',
  AddOrderMetaSuccess = '[selectedStore] AddOrderMetaSuccess',
  AddOrderMetaFailed = '[selectedStore] AddOrderMetaFailed',
  ClearOrderMeta = '[selectedStore] ClearOrderMeta',
  UpdateOrderMetaStatus = '[selectedStore] UpdateOrderMetaStatus',
  UpdateOrderMetaStatusSuccess = '[selectedStore] UpdateOrderMetaStatusSuccess',
  UpdateOrderMetaStatusFailed = '[selectedStore] UpdateOrderMetaStatusFailed',
  AddCheckoutState = '[checkoutState] AddCheckoutState',
  AddCheckoutStateSuccess = '[checkoutState] AddCheckoutStateSuccess',
  ClearCheckoutState = '[checkoutState] clearCheckoutState',
  CheckoutInvalidSubmit = '[checkoutState] InvalidSubmit',
  UpdateVoucher = '[checkoutState] UpdateVoucher',
  RemoveVoucher = '[checkoutState] RemoveVoucher',
  ValidateVoucher = '[checkoutState] ValidateVoucher',
  ValidateVoucherSuccess = '[checkoutState] ValidateVoucherSuccess',
  ValidateVoucherFailed = '[checkoutState] ValidateVoucherFailed',
  UpdateDeliveryMethod = '[checkoutState] UpdateDeliveryMethod',
  UpdateZipCode = '[checkoutState] UpdateZipCode',
  UpdateLocation = '[checkoutState] UpdateLocation',
  ProceedToCheckout = '[checkoutState] ProceedToCheckout',
  // view order status - thank you page - can view any order passed through url param
  ViewOrderStatus = '[orderStatus] ViewOrderStatus',
  ViewOrderStatusSuccess = '[orderStatus] ViewOrderStatusSuccess',
  ViewOrderStatusFailed = '[orderStatus] ViewOrderStatusFailed',
  // Get Combined order items
  GetCombinedOrder = '[combinedOrderState] GetCombinedOrder',
  GetCombinedOrderSuccess = '[combinedOrderState] GetCombinedOrderSucces',
  GetCombinedOrderFailed = '[combinedOrderState] GetCombinedOrderFailed',
  // manage view state
  InitialViewState = '[viewStoreState] InitialViewState',
  ViewStateUpdate = '[viewStoreState] ViewStateUpdate',
  ViewStateUpdateSuccess = '[viewStoreState] ViewStateUpdateSuccess',
  ViewStateUpdateFailed = '[viewStoreState] ViewStateUpdateFailed',
  ViewStateUpdateUserLanguage = '[viewStoreState] ViewStateUpdateUserLanguage',
  // error
  ErrorMessage = '[error] ErrorMessage',
  ErrorMessages = '[error] ErrorMessages',
  ErrorMessageSuccess = '[error] ErrorMessageSuccess',
  ErrorMessageFailed = '[error] ErrorMessageFailed',
  // cart status update
  CartStatusUpdate = '[cart] CartStatusUpdate',
  // store locations
  ValidateStoreLocations = '[storeLocation] ValidateStoreLocations',
  ValidateStoreLocationsSuccess = '[storeLocation] ValidateStoreLocationsSuccess',
  ValidateStoreLocationsFail = '[storeLocation] ValidateStoreLocationsFail',
  ClearStoreLocation = '[storeLocation] ClearStoreLocation',
  // send email from thankyou page
  SendOrderByEmail = '[orderEmail] SendOrderByEmail',
  SendOrderByEmailSuccess = '[orderEmail] SendOrderByEmailSuccess',
  SendOrderByEmailFail = '[orderEmail] SendOrderByEmailFail',
  ClearOrderByEmail = '[orderEmail] ClearOrderByEmail',

  SendStandaloneOrderByEmail = '[orderEmail] SendStandaloneOrderByEmail',
  SendStandaloneOrderByEmailSuccess = '[orderEmail] SendStandaloneOrderByEmailSuccess',
  SendStandaloneOrderByEmailFail = '[orderEmail] SendStandaloneOrderByEmailFail',
  // cookie consent
  InitCookieMessage = '[cookie] InitCookieMessage',
  HideCookieMessage = '[cookie] HideCookieMessage',
  AcceptCookie = '[cookie] AcceptCookie',
  RejectCookie = '[cookie] RejectCookie',
  // zone per zip code
  GetZonePerZipcode = '[zone] GetZonePerZipcode',
  GetZonePerZipcodeSuccess = '[zone] GetZonePerZipcodeSuccess',
  GetZonePerZipcodeFail = '[zone] GetZonePerZipcodeFail',
  ClearZonePerZipcode = '[zone] ClearZonePerZipcode',
  // store and retrieve last selected category on catalog page
  SetCurrentSelectedCategory = '[catalog] SetCurrentSelectedCategory',
  SetCurrentSelectedTopCategory = '[catalog] SetCurrentSelectedTopCategory',
  // store promotion rules
  GetStoreRules = '[rules] GetStoreRules',
  GetStoreRulesSuccess = '[rules] GetStoreRulesSuccess',
  GetStoreRulesFail = '[rules] GetStoreRulesFail',
  // Checkout error actions
  ToggleOffersUnavailable = '[checkoutState] ToggleOffersUnavailable',
  ToggleOffersOutOfStock = '[checkoutState] ToggleOffersOutOfStock',
  UpdateOrderItemQuantities = '[checkoutState] UpdateOrderItemQuantities',
  UpdateOrderItemQuantitiesSuccess = '[checkoutState] UpdateOrderItemQuantitiesSuccess',
  UpdateOrderItemQuantitiesFailed = '[checkoutState] UpdateOrderItemQuantitiesFailed',
  FetchSlots = '[orderMetaState] FetchSlots',
  FetchSlotsSuccess = '[orderMetaState] FetchSlotsSuccess',
  FetchSlotsFailed = '[orderMetaState] FetchSlotsFailed',

  CreateStandalonePayment = '[standalonePaymentState] CreateStandalonePayment',
  CreateStandalonePaymentSuccess = '[standalonePaymentState] CreateStandalonePaymentSuccess',
  CreateStandalonePaymentFailed = '[standalonePaymentState] CreateStandalonePaymentFailed',

  CustomerStandalonePaymentSearch = '[standalonePaymentState] CustomerStandalonePaymentSearch',
  CustomerStandalonePaymentSearchSuccess = '[standalonePaymentState] CustomerStandalonePaymentSearchSuccess',
  CustomerStandalonePaymentSearchFailed = '[standalonePaymentState] CustomerStandalonePaymentSearchFailed',

  UpdateStandalonePayment = '[standalonePaymentState] UpdateStandalonePayment',
  UpdateStandalonePaymentSuccess = '[standalonePaymentState] UpdateStandalonePaymentSuccess',
  UpdateStandalonePaymentFailed = '[standalonePaymentState] UpdateStandalonePaymentFailed',

  InitiateStandalonePayment = '[standalonePaymentState] InitiateStandalonePayment',
  InitiateStandalonePaymentSuccess = '[standalonePaymentState] InitiateStandalonePaymentSuccess',
  InitiateStandalonePaymentFailed = '[standalonePaymentState] InitiateStandalonePaymentFailed',

  CompleteStandalonePayment = '[standalonePaymentState] CompleteStandalonePayment',
  CompleteStandalonePaymentSuccess = '[standalonePaymentState] CompleteStandalonePaymentSuccess',

  ToggleUnavailableDeliveryTimeError = '[orderMetaState] ToggleUnavailableDeliveryTimeError',
  UpdateOrderWishTime = '[orderMetaState] UpdateOrderWishTime',
  UpdateOrderWishTimeSuccess = '[orderMetaState] UpdateOrderWishTimeSuccess',
  UpdateOrderWishTimeFailed = '[orderMetaState] UpdateOrderWishTimeFailed',
  SlotSelected = '[orderMetaState] SlotSelected',
  UpdateOrderWish = '[orderMetaState] UpdateOrderWish',
  ToggleSameDayOrderingDisabled = '[checkoutState] ToggleSameDayOrderingDisabled',
  ToggleOrderSubmitError = '[checkoutState] ToggleOrderSubmitError',
  GeocodeAddress = '[checkoutState] GeocodeAddress',
  GeocodeAddressSuccess = '[checkoutState] GeocodeAddressSuccess',
  GeocodeAddressFailed = '[checkoutState] GeocodeAddressFailed',
  GetAssociatedZone = '[checkoutState] GetAssociatedZone',
  GetAssociatedZoneSuccess = '[checkoutState] GetAssociatedZoneSuccess',
  GetAssociatedZoneFailed = '[checkoutState] GetAssociatedZoneFailed',
  SetCustomerInfo = '[stores] SetCustomerInfo',
  ClearCustomerInfo = '[stores] ClearCustomerInfo',
  TrackingEvent = '[stores] TrackingEvent',
  SetMobileStore = '[Customer Guard]: SetMobileStore',
  SetCustomerFooterHeight = '[Customer Footer Height] SetCustomerFooterHeight',
  // store storage
  SaveStoreByAlias = '[store-storage] SaveStoreByAlias',
  SaveStoreByAliasSuccess = '[store-storage] SaveStoreByAliasSuccess',
  SaveStoreByAliasFailed = '[store-storage] SaveStoreByAliasFailed',
  CheckIfStoreExistsByAlias = '[store-storage] CheckIfStoreExistsByAlias',
  LoadSavedStoreAliases = '[store-storage] LoadSavedStoreAliases',
  LoadSavedStoreAliasesSuccess = '[store-storage] LoadSavedStoreAliasesSuccess',
  LoadSavedStoreAliasesFailed = '[store-storage] LoadSavedStoreAliasesFailed',
  UpdateLastOpen = '[store-storage] UpdateLastOpen',
}

export class SetCustomerInfo implements Action {
  readonly type = StoreActionType.SetCustomerInfo;

  constructor(public readonly info: CustomerInfo) { }
}

export class ClearCustomerInfo implements Action {
  readonly type = StoreActionType.ClearCustomerInfo;

  constructor() { }
}

export class InitializeState implements Action {
  readonly type = StoreActionType.InitializeState;

  constructor() {}
}

export class SocialLogin implements Action {
  readonly type = StoreActionType.SocialLogin;

  constructor(public readonly login: SocialAccountLoginDetails, public readonly event?: Event) {}
}

export class SocialLoginSuccess implements Action {
  readonly type = StoreActionType.SocialLoginSuccess;

  constructor(public readonly response: CustomerSocialLoginResponse, public readonly event?: Event) {}
}

export class SocialLoginFailed implements Action {
  readonly type = StoreActionType.SocialLoginFailed;

  constructor(public readonly event?: Event) {}
}

export class SocialLogout implements Action {
  readonly type = StoreActionType.SocialLogout;

  constructor(public readonly event?: Event) {}
}

export class CustomerDetailsUpdate implements Action {
  readonly type = StoreActionType.CustomerDetailsUpdate;

  constructor(public readonly customerDetails: CustomerDetailsUpdateRequest, public readonly event?: Event) {}
}

export class CustomerDetailsUpdateSuccess implements Action {
  readonly type = StoreActionType.CustomerDetailsUpdateSuccess;

  constructor(public readonly response: CustomerSocialLoginResponse) {}
}

export class CustomerDetailsUpdateFailed implements Action {
  readonly type = StoreActionType.CustomerDetailsUpdateFailed;

  constructor() {}
}

export class LoadStore implements Action {
  readonly type = StoreActionType.LoadStore;

  constructor(public readonly storeAlias: string) {}

}

export class LoadStoreSuccess implements Action {
  readonly type = StoreActionType.LoadStoreSuccess;

  constructor(public readonly store: ClientStore) {}

}

export class LoadCustomerLoyalty implements Action {
  readonly type = StoreActionType.LoadCustomerLoyalty;

  constructor(public readonly event?: Event) {}
}

export class LoadCustomerLoyaltySuccess implements Action {
  readonly type = StoreActionType.LoadCustomerLoyaltySuccess;

  constructor(public readonly loyalty: CustomerLoyalty, public readonly event?: Event) {}
}

export class LoadCustomerLoyaltyFailed implements Action {
  readonly type = StoreActionType.LoadCustomerLoyaltyFailed;

  constructor(public readonly event?: Event) {}
}

export class LoadStoreFailed implements Action {
  readonly type = StoreActionType.LoadStoreFailed;

  constructor() {}

}

export class LoadStoreSeveralTimes implements Action {
  readonly type = StoreActionType.LoadStoreSeveralTimes;

  constructor() {}

}

export class LoadLinkCode implements Action {
  readonly type = StoreActionType.LoadLinkCode;

  constructor() {}
}

export class ApplyLinkCode implements Action {
  readonly type = StoreActionType.ApplyLinkCode;

  constructor(public readonly order: Order, public readonly event?: Event) {}
}

export class LoadLinkCodeSuccess implements Action {
  readonly type = StoreActionType.LoadLinkCodeSuccess;

  constructor(public readonly linkCodeData: PresetOrderData) {}
}


export class LoadLinkCodeFail implements Action {
  readonly type = StoreActionType.LoadLinkCodeFailed;

  constructor() {}
}

export class LinkCodeSet implements Action {
  readonly type = StoreActionType.LinkCodeSet;

  constructor() {}
}

export class LoadStoredCustomerData implements Action {
  readonly type = StoreActionType.LoadStoredCustomerData;

  constructor() {}
}

export class ApplyStoredCustomerData implements Action {
  readonly type = StoreActionType.ApplyStoredCustomerData;

  constructor(public readonly order: Order, public readonly event?: Event) {}
}

export class LoadStoredCustomerDataSuccess implements Action {
  readonly type = StoreActionType.LoadStoredCustomerDataSuccess;

  constructor(public readonly storedCustomerData: PresetOrderData) {}
}


export class LoadStoredCustomerDataFail implements Action {
  readonly type = StoreActionType.LoadStoredCustomerDataFailed;

  constructor() {}
}

export class StoredCustomerDataSet implements Action {
  readonly type = StoreActionType.StoredCustomerDataSet;

  constructor(public readonly event?: Event) {}
}

export class StoredCustomerDataChanged implements Action {
  readonly type = StoreActionType.StoredCustomerDataChanged;

  constructor(public readonly key: string, public readonly value: string | number, public readonly event?: Event) {}
}

export class LoadCatalog implements Action {
  readonly type = StoreActionType.LoadCatalog;

  constructor(
    public readonly id: number,
    public readonly selectedLang: string = null,
    public readonly referenceTime?: string,
    public readonly event?: Event) {}

}

export class LoadCatalogSuccess implements Action {
  readonly type = StoreActionType.LoadCatalogSuccess;

  constructor(public readonly catalog: StoreCatalog, public readonly lang: string, public readonly event?: Event) {}

}

export class LoadCatalogFailed implements Action {
  readonly type = StoreActionType.LoadCatalogFailed;

  constructor() {}

}

export class SelectCategory implements Action {
  readonly type = StoreActionType.SelectCategory;

  constructor(public readonly selectedCategoryId: number, public readonly event?: Event) {}

}

export class SelectCategorySuccess implements Action {
  readonly type = StoreActionType.SelectCategorySuccess;

  constructor(public readonly catalog: StoreCatalog) {}

}

export class SelectCategoryFailed implements Action {
  readonly type = StoreActionType.SelectCategoryFailed;

  constructor() {}

}

export class SelectCatalogLanguage implements Action {
  readonly type = StoreActionType.SelectCatalogLanguage;

  constructor(public readonly selectedLanguage: string, public readonly event?: Event) {}

}

export class LoadCatalogLanguages implements Action {
  readonly type = StoreActionType.LoadCatalogLanguages;

  constructor(public readonly storeId: number) {}

}

export class LoadCatalogLanguagesSuccess implements Action {
  readonly type = StoreActionType.LoadCatalogLanguagesSuccess;

  constructor(
    public readonly availableLanguageList: CatalogLanguagesList,
    public readonly storeId: number,
    public readonly event?: Event
    ) {}

}

export class LoadCatalogLanguagesFailed implements Action {
  readonly type = StoreActionType.LoadCatalogLanguagesFailed;

  constructor() {}

}

// orders
export class ResetOrder implements Action {
  readonly type = StoreActionType.ResetOrder;

  constructor() {}
}

export class InitializeOrder implements Action {
  readonly type = StoreActionType.InitializeOrder;

  constructor(public readonly storeId: number, public readonly payload: Order) {}
}

export class InitializeOrderSuccess implements Action {
  readonly type = StoreActionType.InitializeOrderSuccess;

  constructor(public readonly order: Order) {}
}

export class InitializeOrderFailed implements Action {
  readonly type = StoreActionType.InitializeOrderFailed;

  constructor() {}
}

export class InitializeCartState implements Action {
  readonly type = StoreActionType.InitializeCartState;

  constructor() {}
}

export class CheckExistingOrder implements Action {
  readonly type = StoreActionType.CheckExistingOrder;

  constructor(public readonly storeId: number,
              public readonly orderUuid: string,
              public readonly cartIntent: CartState['status'] = 'CHECKEXISTING',
              public readonly locale: string = 'en',
              public readonly failbackPayload: Order = null,
              public readonly event?: Event) {}
}

export class CheckExistingOrderSuccess implements Action {
  readonly type = StoreActionType.CheckExistingOrderSuccess;

  constructor(public readonly order: Order, public readonly event?: Event) {}
}

export class CheckExistingOrderFailed implements Action {
  readonly type = StoreActionType.CheckExistingOrderFailed;

  constructor() {}
}

export class ViewOrderStatus implements Action {
  readonly type = StoreActionType.ViewOrderStatus;

  constructor(  public readonly storeId: number
              , public readonly orderUuid: string
              , public readonly cartIntent: CartState['status'] = 'CHECKEXISTING'
              , public readonly locale: string = 'en') {}
}

export class ViewOrderStatusSuccess implements Action {
  readonly type = StoreActionType.ViewOrderStatusSuccess;

  constructor(public readonly order: Order) {}
}

export class ViewOrderStatusFailed implements Action {
  readonly type = StoreActionType.ViewOrderStatusFailed;

  constructor() {}
}

export class GetCombinedOrder implements Action {
  readonly type = StoreActionType.GetCombinedOrder;

  constructor(  public readonly storeId: number
              , public readonly locationId: string
              ) {}
}

export class GetCombinedOrderSuccess implements Action {
  readonly type = StoreActionType.GetCombinedOrderSuccess;

  constructor(public readonly order: Order) {}
}

export class GetCombinedOrderFailed implements Action {
  readonly type = StoreActionType.GetCombinedOrderFailed;

  constructor(public readonly errorCode: string) {}
}

export class OrderRemove implements Action {
  readonly type = StoreActionType.OrderRemove;

  constructor() {}
}

export class OrderRemoveSuccess implements Action {
  readonly type = StoreActionType.OrderRemoveSuccess;

  constructor(public readonly order: Order) {}
}

export class OrderRemoveFailed implements Action {
  readonly type = StoreActionType.OrderRemoveFailed;

  constructor() {}
}

export class OrderUpdate implements Action {
  readonly type = StoreActionType.OrderUpdate;

  constructor(
    public readonly storeId: number,
    public readonly orderUuid: string,
    public readonly payload: OrderUpdateRequest,
    public readonly orderUpdateType?: string,
    public readonly event?: Event,
  ) {}
}

export class OrderUpdateSuccess implements Action {
  readonly type = StoreActionType.OrderUpdateSuccess;

  constructor(public readonly order: Order, public readonly event?: Event) {}
}

export class OrderUpdateFailed implements Action {
  readonly type = StoreActionType.OrderUpdateFailed;

  constructor() {}
}

export class SubmitOrder implements Action {
  readonly type = StoreActionType.SubmitOrder;

  constructor(
    public readonly storeId: number,
    public readonly orderUuid: string,
    public readonly payload: OrderUpdateRequest,
    public readonly v2Support = false) {}
}

export class SubmitOrderSuccess implements Action {
  readonly type = StoreActionType.SubmitOrderSuccess;

  constructor(public readonly order: Order) {}
}

export class SubmitOrderFailed implements Action {
  readonly type = StoreActionType.SubmitOrderFailed;

  constructor() {}
}

export class TrackingEvent implements Action {
  readonly type = StoreActionType.TrackingEvent;

  constructor(public readonly event: string) {}
}

export class OrderUpdateStatus implements Action {
  readonly type = StoreActionType.OrderUpdateStatus;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly orderStatus: string) {}
}

export class OrderUpdateStatusSuccess implements Action {
  readonly type = StoreActionType.OrderUpdateStatusSuccess;

  constructor(public readonly order: Order) {}
}

export class OrderUpdateStatusFailed implements Action {
  readonly type = StoreActionType.OrderUpdateStatusFailed;

  constructor() {}
}

export class InitializeOrderItem implements Action {
  readonly type = StoreActionType.InitializeOrderItem;

  constructor() {}
}

export class ViewOrderItem implements Action {
  readonly type = StoreActionType.ViewOrderItem;

  constructor(public readonly storeId: number
            , public readonly catalogId: number
            , public readonly offerId: number
            , public readonly selectedItemOrderUuid: string
            , public readonly locale: string) {}
}

export class ViewOrderItemSuccess implements Action {
  readonly type = StoreActionType.ViewOrderItemSuccess;

  constructor(public readonly offerItem: Offer) {}
}

export class ViewOrderItemFailed implements Action {
  readonly type = StoreActionType.ViewOrderItemFailed;

  constructor() {}
}

export class AddOrderItem implements Action {
  readonly type = StoreActionType.AddOrderItem;

  constructor(public readonly storeId: number, public readonly uuid: string, public readonly orderItem: OrderItem) {}
}

export class AddRuleOrderItem implements Action {
  readonly type = StoreActionType.AddRuleOrderItem;

  constructor(public readonly storeId: number, public readonly uuid: string, public readonly orderItem: OrderItem) {}
}

export class AddOrderItems implements Action {
  readonly type = StoreActionType.AddOrderItems;

  constructor(public readonly storeId: number, public readonly uuid: string, public readonly orderItems: OrderItem[]) {}
}

export class AddOrderItemSuccess implements Action {
  readonly type = StoreActionType.AddOrderItemSuccess;

  constructor(public readonly orderItem: Order) {}
}

export class AddRuleOrderItemSuccess implements Action {
  readonly type = StoreActionType.AddRuleOrderItemSuccess;

  constructor(public readonly orderItem: Order) {}
}

export class AddOrderItemFailed implements Action {
  readonly type = StoreActionType.AddOrderItemFailed;

  constructor() {}
}

export class AddRuleOrderItemFailed implements Action {
  readonly type = StoreActionType.AddRuleOrderItemFailed;

  constructor() {}
}

export class UpdateOrderItem implements Action {
  readonly type = StoreActionType.UpdateOrderItem;

  constructor(
    public readonly storeId: number,
    public readonly cartUuid: string,
    public readonly itemUuid: string,
    public readonly orderItem: OrderItem,
  ) {}
}

export class UpdateOrderItemSuccess implements Action {
  readonly type = StoreActionType.UpdateOrderItemSuccess;

  constructor(public readonly orderItem: OrderItem) {}
}

export class UpdateOrderItemFailed implements Action {
  readonly type = StoreActionType.UpdateOrderItemFailed;

  constructor() {}
}

export class RemoveOrderItem implements Action {
  readonly type = StoreActionType.RemoveOrderItem;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly itemUuid: string) {}
}

export class RemoveOrderItemSuccess implements Action {
  readonly type = StoreActionType.RemoveOrderItemSuccess;

  constructor(public readonly orderItem: Order) {}
}

export class RemoveRuleOrderItem implements Action {
  readonly type = StoreActionType.RemoveRuleOrderItem;

  constructor(public readonly storeId: number, public readonly uuid: string, public readonly itemUuid: string) {}
}

export class RemoveRuleOrderItemSuccess implements Action {
  readonly type = StoreActionType.RemoveRuleOrderItemSuccess;

  constructor(public readonly orderItem: Order) {}
}

export class InitializeOrderMeta implements Action {
  readonly type = StoreActionType.InitializeOrderMeta;

  constructor() {}
}

export class AddOrderMeta implements Action {
  readonly type = StoreActionType.AddOrderMeta;

  constructor(public readonly key: string, public readonly value: string | number, public readonly event?: Event) {}
}

export class AddOrderMetaSuccess implements Action {
  readonly type = StoreActionType.AddOrderMetaSuccess;

  constructor() {}
}

export class AddOrderMetaFailed implements Action {
  readonly type = StoreActionType.AddOrderMetaFailed;

  constructor() {}
}

export class ClearOrderMeta implements Action {
  readonly type = StoreActionType.ClearOrderMeta;

  constructor(public readonly settingsToKeep: { [key: string]: any }) {}
}

export class UpdateOrderMetaStatus implements Action {
  readonly type = StoreActionType.UpdateOrderMetaStatus;

  constructor(public readonly status: 'INITIAL' | 'INPROGRESS' | 'FINISHED' | 'FINISHED_ONLINE_PAYMENT') {}
}

export class UpdateOrderMetaStatusSuccess implements Action {
  readonly type = StoreActionType.UpdateOrderMetaStatusSuccess;

  constructor() {}
}

export class UpdateOrderMetaStatusFailed implements Action {
  readonly type = StoreActionType.UpdateOrderMetaStatusFailed;

  constructor() {}
}


export class AddCheckoutState implements Action {
  readonly type = StoreActionType.AddCheckoutState;

  constructor(public readonly key: string, public readonly value: string | boolean | number | any[], public readonly event?: Event) {}
}

export class AddCheckoutStateSuccess implements Action {
  readonly type = StoreActionType.AddCheckoutStateSuccess;

  constructor() {}
}

export class ClearCheckoutState implements Action {
  readonly type = StoreActionType.ClearCheckoutState;

  constructor() {}
}

export class CheckoutInvalidSubmit implements Action {
  readonly type = StoreActionType.CheckoutInvalidSubmit;

  constructor(event?: Event) {}
}

export class RemoveOrderItemFailed implements Action {
  readonly type = StoreActionType.RemoveOrderItemFailed;

  constructor() {}
}

export class InitialViewState implements Action {
  readonly type = StoreActionType.InitialViewState;

  constructor() {}
}

export class ViewStateUpdate implements Action {
  readonly type = StoreActionType.ViewStateUpdate;

  constructor(public readonly viewState: StoreViewState, public readonly event?: Event) {}
}

export class ViewStateUpdateSuccess implements Action {
  readonly type = StoreActionType.ViewStateUpdateSuccess;

  constructor(public readonly viewstate: ViewState) {}
}

export class ViewStateUpdateFailed implements Action {
  readonly type = StoreActionType.ViewStateUpdateFailed;

  constructor() {}
}

export class ViewStateUpdateUserLanguage implements Action {
  readonly type = StoreActionType.ViewStateUpdateUserLanguage;

  constructor(public readonly ulang: string, public readonly event?: Event) {}
}

// error handling
export class ErrorMessage implements Action {
  readonly type = StoreActionType.ErrorMessage;

  constructor(
    public readonly errorMessage: string,
    public readonly  errorCode: string = '',
    public readonly additionalInfo?: string[],
    public readonly errorMessageParams?: any,
    public readonly event?: Event
  ) {}

}

export class ErrorMessages implements Action {
  readonly type = StoreActionType.ErrorMessages;

  constructor(public readonly errorPageTitle: string = null, public readonly errors: UIError[]) {}
}

export class ErrorMessageSuccess implements Action {
  readonly type = StoreActionType.ErrorMessageSuccess;

  constructor(public readonly catalog: StoreCatalog) {}

}

export class ErrorMessageFailed implements Action {
  readonly type = StoreActionType.ErrorMessageFailed;

  constructor() {}

}

export class CartStatusUpdate implements Action {
  readonly type = StoreActionType.CartStatusUpdate;

  constructor(public readonly cartStatus: CartState['status'], public readonly event?: Event) {}
}

export class ValidateStoreLocations implements Action {
    readonly type = StoreActionType.ValidateStoreLocations;

    constructor(public readonly storeId: number, public readonly storeLocation) {}
}

export class ValidateStoreLocationsSuccess implements Action {
    readonly type = StoreActionType.ValidateStoreLocationsSuccess;

    constructor(public readonly locations: LocationValid, public readonly event?: Event) {}
}

export class ClearStoreLocation implements Action {
  readonly type = StoreActionType.ClearStoreLocation;

  constructor() {}
}

export class ValidateStoreLocationsFail implements Action {
    readonly type = StoreActionType.ValidateStoreLocationsFail;

    constructor() {}
}

export class SendOrderByEmail implements Action {
  readonly type = StoreActionType.SendOrderByEmail;

  constructor(
    public readonly orderUuid: string,
    public readonly email: string,
    public readonly uiLanguageLocale: string,
    public readonly catalogLanguageLocale: string,
    public readonly sendSilent: boolean,
  ) {}
}

export class SendOrderByEmailSuccess implements Action {
  readonly type = StoreActionType.SendOrderByEmailSuccess;

  constructor(public readonly message: EmailMessage) {}
}

export class SendOrderByEmailFail implements Action {
  readonly type = StoreActionType.SendOrderByEmailFail;

  constructor() {}
}

export class ClearOrderByEmail implements Action {
  readonly type = StoreActionType.ClearOrderByEmail;

  constructor() {}
}

export class SendStandaloneOrderByEmail implements Action {
  readonly type = StoreActionType.SendStandaloneOrderByEmail;

  constructor(
    public readonly storeId: string,
    public readonly standalonePaymentId: string,
    public readonly email: string,
  ) {}
}

export class SendStandaloneOrderByEmailSuccess implements Action {
  readonly type = StoreActionType.SendStandaloneOrderByEmailSuccess;

  constructor(public readonly message: EmailMessage) {}
}

export class SendStandaloneOrderByEmailFail implements Action {
  readonly type = StoreActionType.SendStandaloneOrderByEmailFail;

  constructor() {}
}

export class InitCookieMessage implements Action {
  readonly type = StoreActionType.InitCookieMessage;

  constructor( public readonly cookieState: 'INITIAL' | 'UNSET' | 'ACCEPT' | 'REJECT' | 'VISITED') {}
}

export class HideCookieMessage implements Action {
  readonly type = StoreActionType.HideCookieMessage;

  constructor() {}
}

export class AcceptCookie implements Action {
  readonly type = StoreActionType.AcceptCookie;

  constructor() {}
}

export class RejectCookie implements Action {
  readonly type = StoreActionType.RejectCookie;

  constructor() {}
}

export class GetZonePerZipcode implements Action {
  readonly type = StoreActionType.GetZonePerZipcode;

  constructor(  public readonly storeId: number, public readonly zipCode: string ) {}
}

export class GetZonePerZipcodeSuccess implements Action {
  readonly type = StoreActionType.GetZonePerZipcodeSuccess;

  constructor( public readonly zone: any ) {}
}

export class GetZonePerZipcodeFail implements Action {
  readonly type = StoreActionType.GetZonePerZipcodeFail;

  constructor() {}
}

export class ClearZonePerZipcode implements Action {
  readonly type = StoreActionType.ClearZonePerZipcode;

  constructor() {}
}

export class SetCurrentSelectedCategory implements Action {
  readonly type = StoreActionType.SetCurrentSelectedCategory;

  constructor( public readonly selectedCategory: number, public readonly event?: Event) {}
}

export class SetCurrentSelectedTopCategory implements Action {
  readonly type = StoreActionType.SetCurrentSelectedTopCategory;

  constructor( public readonly selectedTopCategory: number, public readonly event?: Event) {}
}

export class ProceedToCheckout implements Action {
  readonly type = StoreActionType.ProceedToCheckout;

  constructor() {}
}

export class GetStoreRules implements Action {
  readonly type = StoreActionType.GetStoreRules;

  constructor( public readonly storeId: number, public readonly langId: string = '', public readonly event?: Event ) {}
}

export class GetStoreRulesSuccess implements Action {
  readonly type = StoreActionType.GetStoreRulesSuccess;

  constructor( public readonly rules: any, public readonly event?: Event ) {}
}

export class GetStoreRulesFail implements Action {
  readonly type = StoreActionType.GetStoreRulesFail;

  constructor(public readonly event?: Event) {}
}

export class ToggleOffersUnavailable implements Action {
  readonly type = StoreActionType.ToggleOffersUnavailable;

  constructor(public readonly display: boolean, public readonly offers?: UnavailableOffer) {}
}

export class ToggleOffersOutOfStock implements Action {
  readonly type = StoreActionType.ToggleOffersOutOfStock;

  constructor(public readonly display: boolean, public readonly offers?: OutOfStockOffer[]) {}
}

export class UpdateOrderItemQuantities implements Action {
  readonly type = StoreActionType.UpdateOrderItemQuantities;

  constructor(public readonly offers: UpdateOrderItemQuantityRequest[]) {}
}

export class UpdateOrderItemQuantitiesSuccess implements Action {
  readonly type = StoreActionType.UpdateOrderItemQuantitiesSuccess;

  constructor() {}
}

export class UpdateOrderItemQuantitiesFailed implements Action {
  readonly type = StoreActionType.UpdateOrderItemQuantitiesFailed;

  constructor() {}
}

export class UpdateVoucher implements Action {
  readonly type = StoreActionType.UpdateVoucher;

  constructor(
    public readonly voucherCode: string,
    public readonly orderUuid: string
  ) {}
}

export class RemoveVoucher implements Action {
  readonly type = StoreActionType.RemoveVoucher;

  constructor() {}
}

export class ValidateVoucher implements Action {
  readonly type = StoreActionType.ValidateVoucher;

  constructor(
    public readonly voucherCode: string,
    public readonly orderUuid: string
  ) {}
}

export class ValidateVoucherSuccess implements Action {
  readonly type = StoreActionType.ValidateVoucherSuccess;

  constructor(
    public readonly voucherDiscount: number,
    public readonly voucherDiscountType: string,
    public readonly voucherUseType,
    public orderMinAmount?: number,
    public formattedOrderMinAmount?: string
    ) {}
}

export class ValidateVoucherFailed implements Action {
  readonly type = StoreActionType.ValidateVoucherFailed;

  constructor() {}
}

export class FetchSlots implements Action {
  readonly type = StoreActionType.FetchSlots;

  constructor(
    public readonly storeId: number,
    public readonly deliveryMode: string,
    public readonly date?: string,
    public readonly event?: Event ) {}
}

export class FetchSlotsSuccess implements Action {
  readonly type = StoreActionType.FetchSlotsSuccess;

  constructor(
    public readonly deliveryMode: string,
    public readonly response: AvailableSlotsResponse,
    public readonly requestDate: string,
    public readonly event?: Event
  ) {}
}


export class FetchSlotsFailed implements Action {
  readonly type = StoreActionType.FetchSlotsFailed;

  constructor(public readonly error?: string) {}
}

export class CreateStandalonePayment implements Action {
  readonly type = StoreActionType.CreateStandalonePayment;

  constructor(
    public readonly storeId: number,
    public readonly orderToken?: string,
    public readonly locationId?: string,
    public readonly deviceIdentifier?: string,
    public readonly amountReference?: number) {}
}

export class CreateStandalonePaymentSuccess implements Action {
  readonly type = StoreActionType.CreateStandalonePaymentSuccess;

  constructor(public readonly standaloneOrder: StandalonePaymentOrder) {}
}


export class CreateStandalonePaymentFailed implements Action {
  readonly type = StoreActionType.CreateStandalonePaymentFailed;

  constructor() {}
}

export class UpdateStandalonePayment implements Action {
  readonly type = StoreActionType.UpdateStandalonePayment;

  constructor(
    public readonly storeId: number,
    public readonly paymentId: string,
    public readonly payload: UpdateStandalonePaymentRequest
  ) {}
}

export class UpdateStandalonePaymentSuccess implements Action {
  readonly type = StoreActionType.UpdateStandalonePaymentSuccess;

  constructor(public readonly standaloneOrder: StandalonePaymentOrder) {}
}


export class UpdateStandalonePaymentFailed implements Action {
  readonly type = StoreActionType.UpdateStandalonePaymentFailed;

  constructor() {}
}


export class CustomerStandalonePaymentSearch implements Action {
  readonly type = StoreActionType.CustomerStandalonePaymentSearch;

  constructor(
    public readonly storeId: number,
    public readonly orderToken?: string,
    public readonly locationId?: string,
    public readonly tapId?: string
  ) {}
}

export class CustomerStandalonePaymentSearchSuccess implements Action {
  readonly type = StoreActionType.CustomerStandalonePaymentSearchSuccess;

  constructor(public readonly res: any) {}
}


export class CustomerStandalonePaymentSearchFailed implements Action {
  readonly type = StoreActionType.CustomerStandalonePaymentSearchFailed;

  constructor() {}
}

export class InitiateStandalonePayment implements Action {
  readonly type = StoreActionType.InitiateStandalonePayment;

  constructor(
    public readonly storeId: number,
    public readonly paymentId: string,
    public readonly originType?:string,
    public readonly originDomain?:string,
  ) {}
}

export class InitiateStandalonePaymentSuccess implements Action {
  readonly type = StoreActionType.InitiateStandalonePaymentSuccess;

  constructor(public readonly standaloneOrder: StandalonePaymentOrder) {}
}


export class InitiateStandalonePaymentFailed implements Action {
  readonly type = StoreActionType.InitiateStandalonePaymentFailed;

  constructor() {}
}

export class CompleteStandalonePayment implements Action {
  readonly type = StoreActionType.CompleteStandalonePayment;

  constructor(
    public readonly storeId: number,
    public readonly paymentId: string,
    public readonly paymentResponse: any,
    public readonly paymentMethod,
  ) {}
}

export class CompleteStandalonePaymentSuccess implements Action {
  readonly type = StoreActionType.CompleteStandalonePaymentSuccess;

  constructor(public readonly standaloneOrder: StandalonePaymentOrder) {}
}

export class ToggleUnavailableDeliveryTimeError implements Action {
  readonly type = StoreActionType.ToggleUnavailableDeliveryTimeError;

  constructor(public readonly visible: boolean, public readonly suggestedSlot?: Slot) {}
}

export class UpdateOrderWishTime implements Action {
  readonly type = StoreActionType.UpdateOrderWishTime;

  constructor(public readonly suggestedSlot: Slot) {}
}

export class UpdateOrderWishTimeSuccess implements Action {
  readonly type = StoreActionType.UpdateOrderWishTimeSuccess;

  constructor(
    public readonly suggestedSlot: Slot,
    public readonly deliveryMethod: string,
    public readonly availableSlots: AvailableSlotsResponse,
  ) {}
}

export class UpdateOrderWishTimeFailed implements Action {
  readonly type = StoreActionType.UpdateOrderWishTimeFailed;

  constructor() {}
}

export class ToggleSameDayOrderingDisabled implements Action {
  readonly type = StoreActionType.ToggleSameDayOrderingDisabled;

  constructor(public readonly display: boolean, public readonly errors?: SameDayOrderingError[]) {}
}

export class SlotSelected implements Action {
  readonly type = StoreActionType.SlotSelected;

  constructor(public readonly selectedSlot: Slot) {}
}

export class UpdateOrderWish implements Action {
  readonly type = StoreActionType.UpdateOrderWish;

  constructor(public readonly wish: Date, public readonly event?: Event) {}
}

export class ToggleOrderSubmitError implements Action {
  readonly type = StoreActionType.ToggleOrderSubmitError;

  constructor(public readonly display: boolean, public readonly errors?: any[]) {}
}

export class UpdateDeliveryMethod implements Action {
  readonly type = StoreActionType.UpdateDeliveryMethod;

  constructor(public readonly deliveryMethod: string, public readonly event?: Event) {}
}

export class UpdateZipCode implements Action {
  readonly type = StoreActionType.UpdateZipCode;

  constructor(public readonly zipCode: string, public readonly event?: Event) {}
}

export class UpdateLocation implements Action {
  readonly type = StoreActionType.UpdateLocation;

  constructor(public readonly locationId: number, public readonly deviceIdentifier){}
}

export class GeocodeAddress implements Action {
  readonly type = StoreActionType.GeocodeAddress;

  constructor(
    public readonly address: string,
    public readonly zipCode: string,
    public readonly countryCode: string,
    public readonly event?: Event) {}
}

export class GeocodeAddressSuccess implements Action {
  readonly type = StoreActionType.GeocodeAddressSuccess;

  constructor(public readonly latitude: number, public readonly longitude: number, public readonly event?: Event) {}
}

export class GeocodeAddressFailed implements Action {
  readonly type = StoreActionType.GeocodeAddressFailed;

  constructor(public readonly event?: Event) {}
}

export class GetAssociatedZone implements Action {
  readonly type = StoreActionType.GetAssociatedZone;

  constructor(
    public readonly storeId: number,
    public readonly orderUuid: string,
    public readonly orderPostCode: string,
    public readonly event?: Event) {}
}

export class GetAssociatedZoneSuccess implements Action {
  readonly type = StoreActionType.GetAssociatedZoneSuccess;

  constructor(
    public readonly zoneData: AssociatedZone,
    public readonly orderPostCode: string,
    public readonly event?: Event) {}
}

export class GetAssociatedZoneFailed implements Action {
  readonly type = StoreActionType.GetAssociatedZoneFailed;

  constructor() {}
}

export class SetMobileStore implements Action {
  readonly type = StoreActionType.SetMobileStore;
  constructor(public readonly storeAlias: string) {}
}

export class SetCustomerFooterHeight implements Action {
  readonly type = StoreActionType.SetCustomerFooterHeight;
  constructor(public readonly customerFooterHeight: number = 0) {}
}

export class SaveStoreByAlias implements Action {
  readonly type = StoreActionType.SaveStoreByAlias;
  constructor(public readonly storeAlias: string, public readonly storeUrl: string, public readonly saveMode: StoreSaveMode) {}
}

export class SaveStoreByAliasSuccess implements Action {
  readonly type = StoreActionType.SaveStoreByAliasSuccess;
  constructor(public readonly storeId: number,
    public readonly storeAlias: string,
    public readonly storeName: string,
    public readonly storeUrl: string,
    public readonly saveMode: StoreSaveMode,
    public readonly storeLogoUrl?: string) {}
}

export class SaveStoreByAliasFailed implements Action {
  readonly type = StoreActionType.SaveStoreByAliasFailed;
  constructor() {}
}

export class CheckIfStoreExistsByAlias implements Action {
  readonly type = StoreActionType.CheckIfStoreExistsByAlias;
  constructor(public readonly storeAlias: string) {}
}

export class LoadSavedStoreAliases implements Action {
  readonly type = StoreActionType.LoadSavedStoreAliases;
  constructor() {}
}

export class LoadSavedStoreAliasesSuccess implements Action {
  readonly type = StoreActionType.LoadSavedStoreAliasesSuccess;
  constructor() {}
}

export class LoadSavedStoreAliasesFailed implements Action {
  readonly type = StoreActionType.LoadSavedStoreAliasesFailed;
  constructor() {}
}

export class UpdateLastOpen implements Action {
  readonly type = StoreActionType.UpdateLastOpen;
  constructor(public readonly storeAlias: string) {}
}


export type StoreAction =
  InitializeState
  | SocialLogin
  | SocialLoginSuccess
  | SocialLoginFailed
  | SocialLogout
  | CustomerDetailsUpdate
  | CustomerDetailsUpdateSuccess
  | CustomerDetailsUpdateFailed
  | LoadStore
  | LoadStoreSuccess
  | LoadStoreFailed
  | LoadStoreSeveralTimes
  | LoadCustomerLoyalty
  | LoadCustomerLoyaltySuccess
  | LoadCustomerLoyaltyFailed
  | LoadLinkCode
  | LoadLinkCodeSuccess
  | LoadLinkCodeFail
  | LinkCodeSet
  | ApplyLinkCode
  | LoadStoredCustomerData
  | LoadStoredCustomerDataSuccess
  | LoadStoredCustomerDataFail
  | StoredCustomerDataSet
  | ApplyStoredCustomerData
  // catalog
  | LoadCatalog
  | LoadCatalogSuccess
  | LoadCatalogFailed
  | SelectCategory
  | SelectCategorySuccess
  | SelectCategoryFailed
  | SelectCatalogLanguage
  | LoadCatalogLanguages
  | LoadCatalogLanguagesSuccess
  | LoadCatalogLanguagesFailed
  // order
  | ResetOrder
  | InitializeOrder
  | InitializeOrderSuccess
  | InitializeOrderFailed
  | InitializeCartState
  | CheckExistingOrder
  | CheckExistingOrderSuccess
  | CheckExistingOrderFailed
  | OrderRemove
  | OrderRemoveSuccess
  | OrderRemoveFailed
  | OrderUpdate
  | OrderUpdateSuccess
  | OrderUpdateFailed
  | SubmitOrder
  | SubmitOrderSuccess
  | SubmitOrderFailed
  | OrderUpdateStatus
  | OrderUpdateStatusSuccess
  | OrderUpdateStatusFailed
  | InitializeOrderItem
  | ViewOrderItem
  | ViewOrderItemSuccess
  | ViewOrderItemFailed
  | AddOrderItem
  | AddRuleOrderItem
  | AddOrderItems
  | AddOrderItemSuccess
  | AddRuleOrderItemSuccess
  | AddOrderItemFailed
  | AddRuleOrderItemFailed
  | UpdateOrderItem
  | UpdateOrderItemSuccess
  | UpdateOrderItemFailed
  | RemoveOrderItem
  | RemoveOrderItemSuccess
  | RemoveOrderItemFailed
  | RemoveRuleOrderItem
  | RemoveRuleOrderItemSuccess
  | InitializeOrderMeta
  | AddOrderMeta
  | AddOrderMetaSuccess
  | AddOrderMetaFailed
  | ClearOrderMeta
  | UpdateOrderMetaStatus
  | UpdateOrderMetaStatusSuccess
  | UpdateOrderMetaStatusFailed
  // state of checkout components
  | AddCheckoutState
  | AddCheckoutStateSuccess
  | ClearCheckoutState
  | CheckoutInvalidSubmit
  // view order status - thank you page - can view any order passed through url param
  | ViewOrderStatus
  | ViewOrderStatusSuccess
  | ViewOrderStatusFailed
  | GetCombinedOrder
  | GetCombinedOrderSuccess
  | GetCombinedOrderFailed
  // manage view state
  | InitialViewState
  | ViewStateUpdate
  | ViewStateUpdateSuccess
  | ViewStateUpdateFailed
  | ViewStateUpdateUserLanguage
  // errors
  | ErrorMessage
  | ErrorMessages
  | ErrorMessageSuccess
  | ErrorMessageFailed
  // manage cart status
  | CartStatusUpdate
  // store locations
  | ValidateStoreLocations
  | ValidateStoreLocationsSuccess
  | ValidateStoreLocationsFail
  | ClearStoreLocation
  // send email from thankyou page
  | SendOrderByEmail
  | SendOrderByEmailSuccess
  | SendOrderByEmailFail
  | ClearOrderByEmail
  | SendStandaloneOrderByEmail
  | SendStandaloneOrderByEmailSuccess
  | SendStandaloneOrderByEmailFail
  // cookie consent
  | InitCookieMessage
  | HideCookieMessage
  | AcceptCookie
  | RejectCookie
  // zone per zip code
  | GetZonePerZipcode
  | GetZonePerZipcodeSuccess
  | GetZonePerZipcodeFail
  | ClearZonePerZipcode
  // set/retrieve last selected category on catalog page
  | SetCurrentSelectedCategory
  | SetCurrentSelectedTopCategory
  // store promotion rules
  | GetStoreRules
  | GetStoreRulesSuccess
  | GetStoreRulesFail
  | ToggleOffersUnavailable
  | ToggleOffersOutOfStock
  | UpdateOrderItemQuantities
  | UpdateOrderItemQuantitiesSuccess
  | UpdateOrderItemQuantitiesFailed
  | UpdateVoucher
  | RemoveVoucher
  | ValidateVoucher
  | ValidateVoucherSuccess
  | ValidateVoucherFailed
  | FetchSlots
  | FetchSlotsSuccess
  | FetchSlotsFailed
  | CreateStandalonePayment
  | CreateStandalonePaymentSuccess
  | CreateStandalonePaymentFailed
  | CustomerStandalonePaymentSearch
  | CustomerStandalonePaymentSearchSuccess
  | CustomerStandalonePaymentSearchFailed
  | UpdateStandalonePayment
  | UpdateStandalonePaymentSuccess
  | UpdateStandalonePaymentFailed
  | InitiateStandalonePayment
  | InitiateStandalonePaymentSuccess
  | InitiateStandalonePaymentFailed
  | CompleteStandalonePayment
  | CompleteStandalonePaymentSuccess
  | ToggleUnavailableDeliveryTimeError
  | UpdateOrderWishTime
  | UpdateOrderWishTimeSuccess
  | UpdateOrderWishTimeFailed
  | UpdateOrderWish
  | SlotSelected
  | ToggleSameDayOrderingDisabled
  | UpdateDeliveryMethod
  | UpdateZipCode
  | UpdateLocation
  | ToggleOrderSubmitError
  | MynextLoginSuccess
  | MynextLoginFailed
  | GeocodeAddress
  | GeocodeAddressSuccess
  | GeocodeAddressFailed
  | GetAssociatedZone
  | GetAssociatedZoneSuccess
  | GetAssociatedZoneFailed
  | SetCustomerInfo
  | ClearCustomerInfo
  | TrackingEvent
  | ProceedToCheckout
  | SetMobileStore
  | SetCustomerFooterHeight
  // store storage
  | SaveStoreByAlias
  | SaveStoreByAliasSuccess
  | SaveStoreByAliasFailed
  | CheckIfStoreExistsByAlias
  | LoadSavedStoreAliases
  | LoadSavedStoreAliasesSuccess
  | LoadSavedStoreAliasesFailed
  | UpdateLastOpen
;
