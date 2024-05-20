import { combineReducers } from '@ngrx/store';
import dayjs from 'dayjs';
import {
  ClientStore,
  EmailMessage,
  Lang,
  LocationValid,
  Offer,
  Order,
  OrderMeta,
  PresetOrderData,
  StoreCatalog,
  StoreViewState,
  StoreRecentsInfo,
  CustomerLoyalty
} from '../../../stores/stores';
import { PAYMENT_METHOD } from '../store-checkout/checkout.service';
import { ModeSlotsInfo, Slot } from '../types/AvailableSlotsResponse';
import { Tokens } from '../types/CustomerSocialLogin';
import { DELIVERY_METHOD_VALUES } from '../types/DeliveryMethod';
import { StandalonePaymentOrder } from '../types/StandalonePayment';
import { UIError } from '../types/UIError';
import { StoreAction, StoreActionType } from './stores.actions';

export interface SelectedStore {
  selectedStore: SelectedStoreState;
}
export interface SelectedStoreState {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: ClientStore;
  firstLoading: true | false;
}

export const selectedStoreInitialState: SelectedStore = {
  selectedStore: {
    status: 'INITIAL',
    firstLoading: false,
    //  data: null,
    data: {
      id: null,
      name: '',
      companyName: '',
      vatNumber: '',
      companyAddress: {
        addressLine1: '',
        addressLine2: '',
        postCode: '',
        region: '',
        city: '',
        country: {
          id: 1,
          name: '',
          code: '',
          phoneCode: '',
          defaultLocale: '',
          europeanCountry: true
        }
      },
      // image: 'loading.jpg',
      // logo: 'generic-logo.svg',
      description: '',
      coordinates: {
        longitude: 0,
        latitude: 0,
      },
      aliasName: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        postCode: '',
        region: '',
        city: '',
        country: {
          id: -1,
          name: '',
          phoneCode: '',
          europeanCountry: false
        },
      },
      phoneNumber: '',
      language: {
        id: -1,
        name: '',
        locale: ''
      },
      relation: {
        childStores: [],
        parentStore: null,
        siblingStores: [],
      },
      settings: {},
      externalId: '',
      numberOfLocations: 0,
      numberOfOffers: 0,
      numberOfOrders: 0,
      specialSchedules: [],
      tag: '',
      createdAt: ''
    },
  }
};

export function selectedStore(
  state: SelectedStoreState = selectedStoreInitialState.selectedStore,
  action: StoreAction): SelectedStoreState {
  switch (action.type) {
    case StoreActionType.LoadStore:
      return { ...selectedStoreInitialState.selectedStore, status: 'LOADING'};
    case StoreActionType.LoadStoreSuccess:
      return {
        status: 'LOADED',
        data: action.store,
        firstLoading: true,
      };
    case StoreActionType.LoadStoreFailed:
      return { ...selectedStoreInitialState[''], status: 'FAILED' };
    case StoreActionType.LoadStoreSeveralTimes:
      return {
        ...state,
        firstLoading: false,
      };
  }
  return state;
}

const reducerSelectedStore: (state: SelectedStore, action: StoreAction) => SelectedStore = combineReducers({
  selectedStore
});

export function selectedStoresReducer(state: SelectedStore = selectedStoreInitialState, action: StoreAction): SelectedStore {
  return reducerSelectedStore(state, action);
}

/**
 * CATALOG STATE MANAGEMENT
 */

export interface CatalogList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: StoreCatalog;
  selectedCategory: number;
  selectedLang: string; // for now let us assume BE expects lang locale, not the lang id
  loadedLang: string; // lang locale which was used to load the catalog
  errorMessage: any;
}

export interface CatalogState {
  catalog: Catalog;
}

export interface CatalogLanguagesList {
  status: 'INITIAL' | 'FETCHED' | 'FAILED';
  data: Lang[];
  loadedStoreId: number;
}

export interface Catalog {
  cataloglist: CatalogList;
  availableCatalogLanguages: CatalogLanguagesList;
  selectedStore: SelectedStoreState;
}

export const catalogInitialState: Catalog = {
  cataloglist: {
    status: 'INITIAL',
    data: {
      categories: [],
      offers: [],
      catalogId: -1,
      currency: ''
    },
    selectedCategory: -1,
    selectedLang: null,
    loadedLang: null,
    errorMessage: '',
  },
  availableCatalogLanguages: null,
  selectedStore: null
};

export function cataloglist(state: CatalogList = catalogInitialState.cataloglist, action: StoreAction): CatalogList {
  switch (action.type) {
    case StoreActionType.LoadStore:
      return catalogInitialState.cataloglist;
    case StoreActionType.LoadCatalog:
      return { ...state, status: 'LOADING' };
    case StoreActionType.LoadCatalogSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: action.catalog,
        selectedCategory: null,
        loadedLang: action.lang,
        errorMessage: '',
      };
    case StoreActionType.LoadCatalogFailed:
      return { ...catalogInitialState.cataloglist, status: 'FAILED' };
    case StoreActionType.SelectCategory:
      return { ...state, selectedCategory: action.selectedCategoryId };
    case StoreActionType.SelectCategorySuccess:
      return { ...state };
    case StoreActionType.SelectCategoryFailed:
      return { ...catalogInitialState.cataloglist, selectedCategory: null };
    case StoreActionType.SelectCatalogLanguage:
      return { ...state, selectedLang: action.selectedLanguage };
    case StoreActionType.CheckExistingOrderSuccess: {
      return { ...state, selectedLang: action.order.catalogLanguageLocale };
    }
    default:
      return state;
  }
}

export function availableCatalogLanguages(
  state: CatalogLanguagesList = catalogInitialState.availableCatalogLanguages,
  action: StoreAction): CatalogLanguagesList {
  switch (action.type) {
    case StoreActionType.LoadCatalogLanguagesSuccess:
      return {
        status: 'FETCHED',
        data: action.availableLanguageList.data,
        loadedStoreId: action.storeId,
      };
    case StoreActionType.LoadCatalogLanguagesFailed:
      return {
        ...state,
        status: 'FAILED'
      };
  }
  return state;
}

const reducerCatalog: (state: Catalog, action: StoreAction) => Catalog = combineReducers({
  cataloglist,
  availableCatalogLanguages,
  selectedStore
});

export function storesCatalogReducer(state: Catalog = catalogInitialState, action: StoreAction): Catalog {
  return reducerCatalog(state, action);
}

// EOF: catalog state management

/**
 * LINK CODE
 */

export interface LinkCodeState {
  status: 'INITIAL' | 'LOADED' | 'SET' | 'FAILED';
  data: PresetOrderData;
}

export interface LinkCode {
  linkCodeState: LinkCodeState;
}

export const linkCodeInitialState: LinkCode =  {
 linkCodeState: {
  status: 'INITIAL',
  data: null
 }
};

export function linkCodeState(
  state: LinkCodeState = linkCodeInitialState.linkCodeState,
  action: StoreAction): LinkCodeState {
  switch (action.type) {
    case StoreActionType.LoadLinkCodeSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: action.linkCodeData,
      };
    case StoreActionType.LoadLinkCodeFailed:
      return {
        ...state,
        status: 'FAILED'
      };
    case StoreActionType.LinkCodeSet:
      return {
        ...state,
        status: 'SET'
      };
  }
  return state;
}

const reducerLinkCodeState: (state: LinkCode, action: StoreAction) => LinkCode = combineReducers({
  linkCodeState
});

export function linkCodeStateReducer(state: LinkCode = linkCodeInitialState, action: StoreAction): LinkCode {
  return reducerLinkCodeState(state, action);
}
// EOF: Link code

/**
 * STORED CUSTOMER DATA
 */
export interface StoredCustomerState {
  status: 'INITIAL' | 'LOADED' | 'SET' | 'FAILED';
  data: PresetOrderData;
}

export interface StoredCustomerStateData {
  storedCustomerState: StoredCustomerState;
}

export const storedCustomerDataInitialState: StoredCustomerStateData =  {
  storedCustomerState: {
    status: 'INITIAL',
    data: null
 }
};

export function storedCustomerState(
  state: StoredCustomerState = storedCustomerDataInitialState.storedCustomerState,
  action: StoreAction): StoredCustomerState {
  switch (action.type) {
    case StoreActionType.LoadStoredCustomerDataSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: action.storedCustomerData,
      };
    case StoreActionType.LoadStoredCustomerDataFailed:
      return {
        ...state,
        status: 'FAILED'
      };
    case StoreActionType.StoredCustomerDataSet:
      return {
        ...state,
        status: 'SET'
      };
  }
  return state;
}

const reducerStoredCustomerState: (
  state: StoredCustomerStateData, action: StoreAction) => StoredCustomerStateData = combineReducers({
  storedCustomerState
});

export function storedCustomerStateReducer(
  state: StoredCustomerStateData = storedCustomerDataInitialState, action: StoreAction): StoredCustomerStateData {
  return reducerStoredCustomerState(state, action);
}
// EOF: Stored customer data

/**
 * VIEW OFFER ITEM DETAILS
 */
export interface OfferItem {
  offerItemState: OfferItemState;
}

export interface OfferItemState {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  selectedOrderItemUuid: string;
  data: Offer;
}

export const offerItemInitialState: OfferItem = {
  offerItemState: {
    status: 'INITIAL',
    selectedOrderItemUuid: null,
    data: null
  }
};

export function offerItemState(
  state: OfferItemState = offerItemInitialState.offerItemState,
  action: StoreAction): OfferItemState {
  switch (action.type) {
    case StoreActionType.InitializeOrderItem:
      return { ...offerItemInitialState[''], status: 'INITIAL' };
    case StoreActionType.ViewOrderItem:
      return {
        ...state,
        selectedOrderItemUuid: action.selectedItemOrderUuid,
        status: 'LOADING'
      };
    case StoreActionType.ViewOrderItemSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: action.offerItem,
      };
    case StoreActionType.ViewOrderItemFailed:
      return {
        ...offerItemInitialState[''],
        status: 'FAILED'
      };
  }
  return state;
}


const reducerOfferItemState: (state: OfferItem, action: StoreAction) => OfferItem = combineReducers({
  offerItemState
});

export function offerItemStateReducer(state: OfferItem = offerItemInitialState, action: StoreAction): OfferItem {
  return reducerOfferItemState(state, action);
}


/**
 * ORDER STATE MANAGEMENT
 */
export interface Cart {
  cartState: CartState;
}

export interface CartState {
  status:
  'INITIAL'
  | 'LOADING'
  | 'CHECKEXISTING'
  | 'REFRESH'
  | 'REFRESHED'
  | 'LOADED'
  | 'ITEMADDING'
  | 'ITEMADDED'
  | 'ITEMREMOVING'
  | 'ITEMREMOVED'
  | 'RULE_OFFERS_REMOVED'
  | 'FAILED'
  | 'ITEMADDFAILED'
  | 'ITEMREMOVEFAILED'
  | 'ITEMUPDATING'
  | 'ITEMUPDATED'
  | 'ITEMUPDATEFAILED'
  | 'ORDERUPDATING'
  | 'ORDERUPDATEFAILED'
  | 'CHECKEXISTINGFAILED'
  | 'ORDERSUBMITTED'
  | 'ORDERSUBMITFAILED'
  | 'INIT_ONLINE_PAYMENT'
  | 'FINISHED_ONLINE_PAYMENT'
  | 'RULE_OFFERS_ADDED'
  | 'RULE_OFFERS_ADD_FAILED'
  ;
  data: Order;
  errorCode?: string;
}

export const cartInitialState: Cart = {
  cartState: {
    status: 'INITIAL',
    data: {
      location: -1,
      uuid: null,
      orderItems: []
    }
  }
};

export function cartState(
  state: CartState = cartInitialState.cartState,
  action: StoreAction): CartState {
  switch (action.type) {
    case StoreActionType.LoadStore:
    case StoreActionType.ResetOrder:
      return cartInitialState.cartState;
    case StoreActionType.InitializeOrder:
      return { ...state, status: 'LOADING' };
    case StoreActionType.InitializeOrderSuccess:
      return {
        status: 'LOADED',
        data: action.order,
      };
    case StoreActionType.InitializeOrderFailed:
      return { ...cartInitialState.cartState, status: 'FAILED' };
    case StoreActionType.InitializeCartState:
      return { ...cartInitialState.cartState, status: 'INITIAL' };
    case StoreActionType.CheckExistingOrder:
      let data = state.data;
      if (action.orderUuid !== state.data.uuid){
        data = cartInitialState.cartState.data;
      }
      return { ...state, status: action.cartIntent, data };
    case StoreActionType.CheckExistingOrderSuccess:
      let newStatus: CartState['status'] = 'LOADED';
      switch (state.status) {
        case 'REFRESH':
          newStatus = 'REFRESHED';
          break;
      }
      return {
        status: newStatus,
        data: action.order,
      };
    case StoreActionType.CheckExistingOrderFailed:
      return { ...selectedStoreInitialState[''], status: 'CHECKEXISTINGFAILED' };
    case StoreActionType.AddOrderItem:
      return { ...state, status: 'ITEMADDING' };
    case StoreActionType.AddOrderItemSuccess:
      return { ...state, status: 'ITEMADDED' };
    case StoreActionType.AddRuleOrderItemSuccess:
      return { ...state, status: 'RULE_OFFERS_ADDED' };
    case StoreActionType.AddOrderItemFailed:
      return { ...state, status: 'ITEMADDFAILED' };
    case StoreActionType.AddRuleOrderItemFailed:
      return { ...state, status: 'RULE_OFFERS_ADD_FAILED' };
    case StoreActionType.UpdateOrderItem:
      return { ...state, status: 'ITEMUPDATING' };
    case StoreActionType.UpdateOrderItemSuccess:
      return { ...state, status: 'ITEMUPDATED' };
    case StoreActionType.UpdateOrderItemFailed:
      return { ...state, status: 'ITEMUPDATEFAILED' };
    case StoreActionType.RemoveOrderItem:
      return { ...state, status: 'ITEMREMOVING' };
    case StoreActionType.RemoveOrderItemSuccess:
      return { ...state, status: 'ITEMREMOVED' };
    case StoreActionType.RemoveRuleOrderItemSuccess:
      return { ...state, status: 'RULE_OFFERS_REMOVED' };
    case StoreActionType.RemoveOrderItemFailed:
      return { ...state, status: 'ITEMREMOVEFAILED' };
    case StoreActionType.OrderUpdate:
      return { ...state, status: 'ORDERUPDATING' };
    case StoreActionType.OrderUpdateSuccess:
      return { ...state, data: { ...state.data, ...action.order }, status: 'LOADED' };
    case StoreActionType.RemoveVoucher:
    case StoreActionType.ValidateVoucherFailed: {
      const newSt = { ...state };
      delete newSt.data.voucherCode;
      delete newSt.data.voucherDiscount;
      delete newSt.data.voucherDiscountType;
      return newSt;
    }
    case StoreActionType.CartStatusUpdate:
      return {
        ...state,
        status: action.cartStatus,
      };
    case StoreActionType.SubmitOrder:
      return {
        ...state,
        status: 'LOADING'
      };
    case StoreActionType.SubmitOrderSuccess:
      return {
        ...state,
        status: 'ORDERSUBMITTED',
        // data: action.order,
      };
    case StoreActionType.SubmitOrderFailed:
      return {
        ...state,
        status: 'ORDERSUBMITFAILED',
        // data: action.order,
      };
    case StoreActionType.OrderUpdateStatus:
      return {
        ...state,
        status: 'LOADING'
      };
    case StoreActionType.OrderUpdateStatusSuccess:
      const newState = { ...state };
      newState.data.status = 'SUBMITTED';
      newState.status = 'LOADED';
      return newState;
    case StoreActionType.OrderUpdateFailed:
      return { ...state, status: 'ORDERUPDATEFAILED' };

  }
  return state;
}


const reducerCartState: (state: Cart, action: StoreAction) => Cart = combineReducers({
  cartState
});

export function cartStateReducer(state: Cart = cartInitialState, action: StoreAction): Cart {
  return reducerCartState(state, action);
}

// EOF: order state management

/**
 * ORDER STATUS MANAGEMENT
 * fe can view status of any order by passing orderUuid in the url params
 */

export interface OrderStatus {
  orderStatus: CartState;
}

export const OrderStatusInitialState: OrderStatus = {
  orderStatus: {
    status: 'INITIAL',
    data: {
      location: -1,
      uuid: null,
      orderItems: [],
      createdAt: ''
    }
  }
};

export function orderStatus(
  state: CartState = cartInitialState.cartState,
  action: StoreAction): CartState {
  switch (action.type) {
    case StoreActionType.InitializeOrder:
      return { ...state, status: 'LOADING' };
    case StoreActionType.InitializeOrderSuccess:
      return {
        status: 'LOADED',
        data: action.order,
      };
    case StoreActionType.InitializeOrderFailed:
      return { ...selectedStoreInitialState[''], status: 'FAILED' };
    case StoreActionType.InitializeCartState:
      return { ...selectedStoreInitialState[''], status: 'INITIAL' };
    case StoreActionType.ViewOrderStatus:
      return { ...state, status: 'LOADING' };
    case StoreActionType.ViewOrderStatusSuccess:
      return {
        status: 'LOADED',
        data: action.order,
      };
    case StoreActionType.ViewOrderStatusFailed:
      return { ...selectedStoreInitialState[''], status: 'FAILED' };
    // case StoreActionType.CheckExistingOrder:
    //   return { ...state, status: action.cartIntent };
    // case StoreActionType.CheckExistingOrderSuccess:
    //   let newStatus: CartState['status'] = 'LOADED';
    //   switch (state.status) {
    //     case 'REFRESH':
    //       newStatus = 'REFRESHED';
    //       break;
    //   }
    //   return {
    //     status: newStatus,
    //     data: action.order,
    //   };
  }
  return state;
}


const reducerOrderStatus: (state: OrderStatus, action: StoreAction) => OrderStatus = combineReducers({
  orderStatus
});

export function orderStatusReducer(state: OrderStatus = OrderStatusInitialState, action: StoreAction): OrderStatus {
  return reducerOrderStatus(state, action);
}

// EOF: order state management


/**
 * VIEW STATE MANAGEMENT
 */
export interface View {
  viewState: ViewState;
}

export interface ViewState {
  status: StoreViewState;
  ulang: string;
}

export const viewInitialState: View = {
  viewState: {
    status: {
      state: 'LOADING',
    },
    ulang: 'en',
  }
};

export function viewState(
  state: ViewState = viewInitialState.viewState,
  action: StoreAction): ViewState {
  switch (action.type) {
    case StoreActionType.InitialViewState:
      return { ...viewInitialState[''] };
    case StoreActionType.ViewStateUpdate:
      return { ...state, status: action.viewState };
    case StoreActionType.ViewStateUpdateSuccess:
      return {
        ...state
      };
    case StoreActionType.ViewStateUpdateFailed:
      return { ...viewInitialState[''] };
    case StoreActionType.ViewStateUpdateUserLanguage: {
        const newState = { ... state };
        newState.ulang = action.ulang;
        return newState;
      }
  }
  return state;
}


const reducerViewState: (state: View, action: StoreAction) => View = combineReducers({
  viewState
});

export function viewStateReducer(state: View = viewInitialState, action: StoreAction): View {
  return reducerViewState(state, action);
}

// EOF: order state management


/**
 * possibly temporary solution for passing the order meta data
 * between controllers/screens. if Rigas decides to update the meta
 * fields on focus out to maintain persistancy then this is not needed
 */
// ORDER META

export interface OrderMetaData {
  orderMetaState: OrderMetaState;
}

export interface OrderMetaState {
  status:
  'INITIAL'
  | 'INPROGRESS'
  | 'FINISHED'
  | 'FINISHED_ONLINE_PAYMENT';
  data: OrderMeta;
  storeOpeningInfo: {
    slots: ModeSlotsInfo;
    openInDate: boolean;
    date: string;
    deliveryMethod: string;
  };
  wish: Date;
}

export const orderMetaInitialState: OrderMetaState = {
  status: 'INITIAL',
  data: {},
  storeOpeningInfo: {
    slots: {
      availableSlots: [],
      selectedSlot: {
        startTime: '',
        endTime: '',
        isDisabled: true,
        totalOrders: 0
      },
      slotDurationEnabled: false
    },
    date: null,
    openInDate: null,
    deliveryMethod: null,
  },
  wish: null,
};

export function orderMetaState(
  state: OrderMetaState = orderMetaInitialState,
  action: StoreAction): OrderMetaState {
  switch (action.type) {
    case StoreActionType.InitializeOrderMeta:
      return { ...state, status: 'INITIAL' };
    case StoreActionType.AddOrderMeta: {
      const newState = { ...state, data: { ...state.data } };
      if (action.value != null) {
        newState.data[action.key] = action.value;
        newState.status = 'INPROGRESS';
      } else {
        delete newState.data[action.key];
      }
      return newState;
    }
    case StoreActionType.AddOrderMetaSuccess:
      return {
        ...state
      };
    case StoreActionType.ClearOrderMeta:
      const cleanState: OrderMetaState = { ...orderMetaInitialState };
      // set new value if passed (usually expected this to be the location value)
      Object.keys(action.settingsToKeep).forEach(s => cleanState.data[s] = action.settingsToKeep[s]);
      return cleanState;
    case StoreActionType.AddOrderMetaFailed:
      return { ...state };
    case StoreActionType.UpdateOrderMetaStatus:
      return { ...state, status: action.status };
    case StoreActionType.FetchSlotsFailed:
      return { ...state, storeOpeningInfo: { ...orderMetaInitialState.storeOpeningInfo } };
    case StoreActionType.FetchSlotsSuccess: {

      if (
        action.requestDate &&
        action.requestDate !== action.response.date &&
        (
          state.storeOpeningInfo.date ||
          state.data.wishTime && action.response.date !== dayjs(new Date(state.data.wishTime)).format('YYYY-MM-DD')
        )
      ) {
        return {
          ...state,
          storeOpeningInfo: {
            slots: {
              ...orderMetaInitialState.storeOpeningInfo.slots
            },
            openInDate: false,
            date: action.requestDate,
            deliveryMethod: action.deliveryMode,
          }
        };
      }

      switch (action.deliveryMode) {
        case 'IN_STORE_LOCATION':
          return {
            ...state,
            storeOpeningInfo: {
              slots: {
                availableSlots: action.response.inStoreLocation.availableSlots,
                selectedSlot: getSelectedSlot(
                                action.response.inStoreLocation.selectedSlot,
                                action.response.inStoreLocation.availableSlots,
                                state.data.wishTime
                              ),
                slotDurationEnabled: action.response.inStoreLocation.slotDurationEnabled
              },
              date: action.response.date,
              openInDate: (action.response.inStoreLocation.availableSlots.length > 0 && !!action.response.inStoreLocation.selectedSlot),
              deliveryMethod: action.deliveryMode,
            },
          };
        case 'NO_LOCATION':
          return {
            ...state,
            storeOpeningInfo: {
              slots: {
                availableSlots: action.response.noLocation.availableSlots,
                selectedSlot: getSelectedSlot(
                                action.response.noLocation.selectedSlot,
                                action.response.noLocation.availableSlots,
                                state.data.wishTime
                              ),
                slotDurationEnabled: action.response.noLocation.slotDurationEnabled
              },
              date: action.response.date,
              openInDate: (action.response.noLocation.availableSlots.length > 0 && !!action.response.noLocation.selectedSlot),
              deliveryMethod: action.deliveryMode,
            },
          };
        case 'ADDRESS':
          return {
            ...state,
            storeOpeningInfo: {
              slots: {
                availableSlots: action.response.address.availableSlots,
                selectedSlot: getSelectedSlot(
                                action.response.address.selectedSlot,
                                action.response.address.availableSlots,
                                state.data.wishTime
                              ),
                slotDurationEnabled: action.response.address.slotDurationEnabled
              },
              date: action.response.date,
              openInDate: (action.response.address.availableSlots.length > 0 && !!action.response.address.selectedSlot),
              deliveryMethod: action.deliveryMode,
            },
          };
        default:
          return { ...state, storeOpeningInfo: { ...orderMetaInitialState.storeOpeningInfo } };
      }
    }
    case StoreActionType.OrderUpdateSuccess: {
      const {
        location,
        latitude,
        longitude
      } = action.order;
      let newState = { ...state, data: { ...state.data } };
      if (action.order.totalDiscountedPrice === 0) newState = { ...state, data: { ...state.data, paymentMethod: PAYMENT_METHOD.UNDEFINED } };
      newState.data.location = location?.toString();
      newState.data.latitude = latitude;
      newState.data.longitude = longitude;

      return newState;
    }
    case StoreActionType.CheckExistingOrderSuccess: {
      const {
        customerUserId,
        customerEmail,
        customerName,
        customerPhoneNumber,
        deliveryCity,
        deliveryPostCode,
        deliveryStreetAddress,
        floorNumber,
        comment,
        deliveryMethod,
        wishTime,
        location,
        latitude,
        longitude,
        voucherCode,
        deliveryComment
      } = action.order;
      const isAdminOrderUpdate = window.location.href.includes('/orders/');
      const newState = { ...state, data: { ...state.data } };
      if ((!newState.data.customerUserId || isAdminOrderUpdate) && customerUserId !== undefined) {
        newState.data.customerUserId = customerUserId;
      }
      if ((!newState.data.customerEmail || isAdminOrderUpdate) && customerEmail) {
        newState.data.customerEmail = customerEmail;
      }
      if ((!newState.data.customerName || isAdminOrderUpdate) && customerName) {
        newState.data.customerName = customerName;
      }
      if ((!newState.data.customerPhoneNumber || isAdminOrderUpdate) && customerPhoneNumber) {
        newState.data.customerPhoneNumber = customerPhoneNumber;
      }
      if ((!newState.data.customerTown || isAdminOrderUpdate) && deliveryCity) {
        newState.data.customerTown = deliveryCity;
      }
      if ((!newState.data.customerZip || isAdminOrderUpdate) && deliveryPostCode) {
        newState.data.customerZip = deliveryPostCode;
      }
      if ((!newState.data.customerStreet || isAdminOrderUpdate) && deliveryStreetAddress) {
        newState.data.customerStreet = deliveryStreetAddress;
      }
      if ((!newState.data.customerFloor || isAdminOrderUpdate) && floorNumber) {
        newState.data.customerFloor = floorNumber;
      }
      if ((!newState.data.comment || isAdminOrderUpdate) && comment) {
        newState.data.comment = comment;
      }
      if ((!newState.data.location || isAdminOrderUpdate) && location) {
        newState.data.location = location.toString();
      }
      if ((!newState.data.latitude || isAdminOrderUpdate) && latitude) {
        newState.data.latitude = latitude;
      }
      if ((!newState.data.longitude || isAdminOrderUpdate) && longitude) {
        newState.data.longitude = longitude;
      }
      if ((!newState.data.voucherCode || isAdminOrderUpdate) && voucherCode) {
        newState.data.voucherCode = voucherCode;
      }
      if ((!newState.data.deliveryComment || isAdminOrderUpdate) && deliveryComment) {
        newState.data.deliveryComment = deliveryComment;
      }
      if (deliveryMethod && DELIVERY_METHOD_VALUES[deliveryMethod]) {
        newState.data.deliveryMethod = DELIVERY_METHOD_VALUES[deliveryMethod];
      }
      if (wishTime && dayjs(new Date(wishTime)) >= dayjs()) {
        if (!state.data.wishTime) {
          newState.storeOpeningInfo.date = null;
        }
        newState.data.wishTime = wishTime;
      }
      return newState;
    }
    case StoreActionType.UpdateOrderWishTimeSuccess: {

      switch (action.deliveryMethod) {
        case 'IN_STORE_LOCATION':
          return {
            ...state,
            storeOpeningInfo: {
              slots: {
                availableSlots: action.availableSlots.inStoreLocation.availableSlots,
                selectedSlot: action.suggestedSlot,
                slotDurationEnabled: action.availableSlots.inStoreLocation.slotDurationEnabled
              },
              date: action.availableSlots.date,
              openInDate: (action.availableSlots.inStoreLocation.availableSlots.length > 0 &&
                            !!action.availableSlots.inStoreLocation.selectedSlot),
              deliveryMethod: action.deliveryMethod,
            }
          };
        case 'NO_LOCATION':
          return {
            ...state,
            storeOpeningInfo: {
              slots: {
                availableSlots: action.availableSlots.noLocation.availableSlots,
                selectedSlot: action.suggestedSlot,
                slotDurationEnabled: action.availableSlots.noLocation.slotDurationEnabled
              },
              date: action.availableSlots.date,
              openInDate: (action.availableSlots.noLocation.availableSlots.length > 0 && !!action.availableSlots.noLocation.selectedSlot),
              deliveryMethod: action.deliveryMethod,
            }
          };
        case 'ADDRESS':
          return {
            ...state,
            storeOpeningInfo: {
              slots: {
                availableSlots: action.availableSlots.address.availableSlots,
                selectedSlot: action.suggestedSlot,
                slotDurationEnabled: action.availableSlots.address.slotDurationEnabled
              },
              date: action.availableSlots.date,
              openInDate: (action.availableSlots.address.availableSlots.length > 0 && !!action.availableSlots.address.selectedSlot),
              deliveryMethod: action.deliveryMethod,
            }
          };
        default:
          return { ...state, storeOpeningInfo: { ...orderMetaInitialState.storeOpeningInfo } };
      }
    }
    case StoreActionType.SlotSelected:
      return {
        ...state,
        storeOpeningInfo: { ...state.storeOpeningInfo, slots: { ...state.storeOpeningInfo.slots, selectedSlot: action.selectedSlot } }
      };
    case StoreActionType.UpdateOrderWish:
      return {
        ...state,
        wish: action.wish,
      };
  }
  return state;
}

function getSelectedSlot(responseSelectedSlot: Slot, availableSlots: Slot[], wishTime: string) {
  if (!wishTime) {
    return responseSelectedSlot;
  }

  const slotIndex = availableSlots.findIndex(a => dayjs(a.startTime).isSame(dayjs(wishTime)));
  if (slotIndex !== -1 && !availableSlots[slotIndex].isDisabled) {
    return availableSlots[slotIndex];
  } else {
    return responseSelectedSlot;
  }
}


// const reducerOrderMetaData: (state: OrderMetaData, action: StoreAction) => OrderMetaData = combineReducers({
//   orderMetaState
// });

export function orderMetaDataReducer(state: OrderMetaState = orderMetaInitialState, action: StoreAction): OrderMetaState {
  return orderMetaState(state, action);
}

// EOF: ORDER META


// ERROR STATE

export interface ErrorView {
  errorState: ErrorState;
}

export interface ErrorState {
  status: 'INITIAL' | 'EMITTED';
  errorMessage: string;
  errorMessageParams: any;
  errorCode: string;
  additionalInfo: string[];
  errorPageTitle: string;
  uiErrors: UIError[];
}

export const errorInitialState: ErrorView = {
  errorState: {
    status: 'INITIAL',
    errorMessage: '',
    errorMessageParams: {},
    errorCode: '',
    additionalInfo: [],
    errorPageTitle: null,
    uiErrors: []
  }
};

export function errorState(
  state: ErrorState = errorInitialState.errorState,
  action: StoreAction): ErrorState {
  switch (action.type) {
    case StoreActionType.ErrorMessage:
      return {
        status: 'EMITTED',
        errorMessage: action.errorMessage,
        errorMessageParams: action.errorMessageParams,
        errorCode: action.errorCode,
        additionalInfo: action.additionalInfo,
        errorPageTitle: null,
        uiErrors: []
      };
    case StoreActionType.ErrorMessages:
      return {
        status: 'EMITTED',
        errorMessage: '',
        errorMessageParams: {},
        errorCode: '',
        additionalInfo: [],
        errorPageTitle: action.errorPageTitle,
        uiErrors: action.errors
      };
    case StoreActionType.ErrorMessageSuccess:
      return { ...state };
    case StoreActionType.ErrorMessageFailed:
      return { ...state, errorMessage: '', additionalInfo: [] };
  }
  return state;
}


const reducerError: (state: ErrorView, action: StoreAction) => ErrorView = combineReducers({
  errorState
});

export function errorReducer(state: ErrorView = errorInitialState, action: StoreAction): ErrorView {
  return reducerError(state, action);
}

// EOF: ERROR STATE

// STORE LOCATIONS STATE

export interface ValidateStoreLocation {
  storeLocationsState: StoreLocationState;
}

export interface StoreLocationState {
  status: 'INITIAL' | 'LOADING' | 'LOADED';
  locationState: LocationValid;
}

export const storeLocationInitialState: ValidateStoreLocation = {
  storeLocationsState: {
    status: 'INITIAL',
    locationState: null
  }
};

export function storeLocationsState(
  state: StoreLocationState = storeLocationInitialState.storeLocationsState,
  action: StoreAction): StoreLocationState {
  switch (action.type) {
    case StoreActionType.ValidateStoreLocations:
      return {
        ...state,
        status: 'LOADING'
      };
    case StoreActionType.ClearStoreLocation:
      return storeLocationInitialState.storeLocationsState;
    case StoreActionType.ValidateStoreLocationsSuccess:
      return {
        status: 'LOADED',
        locationState: action.locations
      };
    case StoreActionType.ValidateStoreLocationsFail:
      return { ...state, locationState: null };
  }
  return state;
}

const reducerStoreLocations: (state: ValidateStoreLocation, action: StoreAction) => ValidateStoreLocation = combineReducers({
  storeLocationsState
});

export function storeLocationsReducer(state: ValidateStoreLocation = storeLocationInitialState,
                                      action: StoreAction): ValidateStoreLocation {
  return reducerStoreLocations(state, action);
}

// EOF: STORE LOCATIONS


// ORDER EMAIL STATE

export interface OrderEmail {
  orderEmail: OrderEmailState;
}

export interface OrderEmailState {
  status: 'INITIAL' | 'SENDING' | 'SENT' | 'FAILED';
  emailState: EmailMessage;
  isSilent: boolean;
}

export const orderEmailInitialState: OrderEmail = {
  orderEmail: {
    status: 'INITIAL',
    emailState: null,
    isSilent: false,
  }
};

const orderEmailCurrentState: OrderEmail = orderEmailInitialState;

export function orderEmail(
  state: OrderEmailState = orderEmailInitialState.orderEmail,
  action: StoreAction): OrderEmailState {
  switch (action.type) {
    case StoreActionType.SendOrderByEmail:
      orderEmailCurrentState.orderEmail = {
        ...state,
        status: 'SENDING',
        isSilent: action.sendSilent
      };
      return orderEmailCurrentState.orderEmail;
    case StoreActionType.SendOrderByEmailSuccess:
      if (state.isSilent) {
        // state is silent, returning initial state
        return orderEmailInitialState.orderEmail;
      }
      return {
        ...state,
        status: 'SENT',
        emailState: action.message
      };
    case StoreActionType.SendOrderByEmailFail:
      if (state.isSilent) {
        // state is silent, returning initial state
        return orderEmailInitialState.orderEmail;
      }
      return {
        ...state,
        status: 'FAILED',
        emailState: null
      };
    case StoreActionType.ClearOrderByEmail:
      return orderEmailInitialState.orderEmail;
    case StoreActionType.SendStandaloneOrderByEmail:
      orderEmailCurrentState.orderEmail = {
        ...state,
        status: 'SENDING',
      };
      return orderEmailCurrentState.orderEmail;
    case StoreActionType.SendStandaloneOrderByEmailSuccess:
      return {
        ...state,
        status: 'SENT',
        emailState: action.message
      };
    case StoreActionType.SendStandaloneOrderByEmailFail:
      return {
        ...state,
        status: 'FAILED',
        emailState: null
      };
  }
  return state;
}

const reducerOrderEmail: (state: OrderEmail, action: StoreAction) => OrderEmail = combineReducers({
  orderEmail
});

export function orderEmailReducer(state: OrderEmail = orderEmailInitialState,
                                  action: StoreAction): OrderEmail {
  return reducerOrderEmail(state, action);
}

// EOF: STORE LOCATIONS

// CHECKOUT COMPONENTS STATE

export interface CheckoutData {
  checkoutState: CheckoutState;
}

export interface CheckoutState {
  status:
  'INITIAL'
  | 'MODIFIED'
  | 'INVALID_SUBMIT';
  data: any;
}

export const checkoutInitialState: CheckoutData = {
  checkoutState: {
    status: 'INITIAL',
    data: {
      orderBtnDisabled: false,
      personalFormValid: false,
      paymentValid: true,   // since paymment is always optional default value would be set to true
      locationInitiallyPersisted: true,
      locationPersistedInMemory: false,
      offerAvailabilityErrors: {
        visible: false,
        offers: []
      },
      offerOutOfStockErrors: {
        visible: false,
        offers: []
      },
      sameDayOrderingErrors: {
        visible: false,
        errors: [],
      },
      voucherValidation: null,
      voucherDiscount: null,
      voucherDiscountType: null,
      voucherUseType: null,
      voucherOrderMinAmount: null,
      voucherFormattedOrderMinAmount: null,
      slotUnavailableError: {
        visible: false,
        suggestedSlot: {}
      },
      orderSubmitError: {
        visible: false,
        errors: [],
      },
      voucherFormValid: true,
      checkoutOptionsFormValid: false
    }
  }
};

export function checkoutState(
  state: CheckoutState = checkoutInitialState.checkoutState,
  action: StoreAction): CheckoutState {
  switch (action.type) {
    case StoreActionType.AddCheckoutState: {
      const newState = { ...state };
      newState.data[action.key] = action.value;
      newState.status = state.status == 'INVALID_SUBMIT' ? 'INVALID_SUBMIT' : 'MODIFIED';
      return newState;
    }
    case StoreActionType.CheckoutInvalidSubmit: {
      const newState = { ...state };
      newState.status = 'INVALID_SUBMIT';
      return newState;
    }
    case StoreActionType.AddOrderMetaSuccess:
      return {
        ...state
      };
    case StoreActionType.ClearCheckoutState:
      return { ...checkoutInitialState.checkoutState };
    case StoreActionType.ToggleOffersUnavailable: {
      const newState = { ...state };
      if (action.display) {
        newState.data.offerAvailabilityErrors = { visible: action.display, offers: action.offers };
      } else {
        newState.data.offerAvailabilityErrors = { visible: action.display, offers: [] };
      }
      return newState;
    }
    case StoreActionType.ToggleOffersOutOfStock: {
      const newState = { ...state };
      if (action.display) {
        newState.data.offerOutOfStockErrors = { visible: action.display, offers: action.offers };
      } else {
        newState.data.offerOutOfStockErrors = { visible: action.display, offers: [] };
      }
      return newState;
    }
    case StoreActionType.UpdateVoucher:
      return { ...state, data: { ...state.data, voucherValidation: null } };
    case StoreActionType.ValidateVoucherSuccess:
      return { ...state, data: { ...state.data, voucherValidation: true, voucherDiscount: action.voucherDiscount,
        voucherDiscountType: action.voucherDiscountType, voucherUseType: action.voucherUseType,
        voucherOrderMinAmount: action.orderMinAmount, voucherFormattedOrderMinAmount: action.formattedOrderMinAmount } };
    case StoreActionType.ValidateVoucherFailed:
      return { ...state, data: { ...state.data, voucherValidation: false } };
    case StoreActionType.ToggleUnavailableDeliveryTimeError: {
      const newState = { ...state };
      if (action.visible) {
        newState.data.slotUnavailableError = { visible: action.visible, suggestedSlot: action.suggestedSlot };
      } else {
        newState.data.slotUnavailableError = { visible: action.visible, suggestedSlot: {} };
      }
      return newState;

    }
    case StoreActionType.ToggleSameDayOrderingDisabled: {
      const newState = { ...state };
      if (action.display) {
        newState.data.sameDayOrderingErrors = { visible: action.display, errors: action.errors };
      } else {
        newState.data.sameDayOrderingErrors = { visible: action.display, errors: [] };
      }
      return newState;
    }
    case StoreActionType.ToggleOrderSubmitError: {
      const newState = { ...state };
      if (action.display) {
        newState.data.orderSubmitError = { visible: action.display, errors: action.errors };
      } else {
        newState.data.orderSubmitError = { visible: action.display, errors: [] };
      }
      return newState;
    }
    case StoreActionType.CheckExistingOrderSuccess: {
      const newState = { ...state };
      const isAdminOrderUpdate = window.location.href.includes('/orders/');
      if (action.order.voucherCode && isAdminOrderUpdate) {
        newState.data.voucherDiscount = action.order.voucherDiscount;
        newState.data.voucherDiscountType = action.order.voucherDiscountType;
        newState.data.voucherValidation = true;
      } else if (action.order.voucherCode === undefined) {
        if (newState.data.voucherValidation !== undefined) {
          delete newState.data.voucherValidation;
        }
        if (newState.data.voucherDiscountType !== undefined) {
          delete newState.data.voucherDiscountType;
        }
        if (newState.data.voucherDiscountType !== undefined) {
          delete newState.data.voucherDiscountType;
        }
      }
      return newState;
    }
  }
  return state;
}


const reducerCheckoutData: (state: CheckoutData, action: StoreAction) => CheckoutData = combineReducers({
  checkoutState
});

export function checkoutStateReducer(state: CheckoutData = checkoutInitialState, action: StoreAction): CheckoutData {
  return reducerCheckoutData(state, action);
}

// EOF: ORDER META

// COOKIES STATE

export interface CookieData {
  cookieState: CookieState;
}

export interface CookieState {
  status:
  'INITIAL'
  | 'UNSET'
  | 'ACCEPT'
  | 'REJECT'
  | 'VISITED';
}

export const cookieInitialState: CookieData = {
  cookieState: {
    status: 'INITIAL',
  }
};

export function cookieState(
  state: CookieState = cookieInitialState.cookieState, action: StoreAction): CookieState {
  switch (action.type) {
    case StoreActionType.HideCookieMessage:
      const newState = { ...state };
      newState.status = 'VISITED';
      return newState;
    case StoreActionType.InitCookieMessage:
      return { ...state, status: action.cookieState };
    case StoreActionType.AcceptCookie:
      return { ...state, status: 'ACCEPT' };
    case StoreActionType.RejectCookie:
      return { ...state, status: 'REJECT' };
  }
  return state;
}


const reducerCookieData: (state: CookieData, action: StoreAction) => CookieData = combineReducers({
  cookieState
});

export function cookieStateReducer(state: CookieData = cookieInitialState, action: StoreAction): CookieData {
  return reducerCookieData(state, action);
}

// EOF: COOKIES STATE

// ZONE STATE

export interface ZoneData {
  zoneState: ZoneState;
}

export interface ZoneState {
  status:
  'INITIAL'
  | 'DELIVERABLE'
  | 'NOTDELIVERABLE_ADDRESS'
  | 'NOTDELIVERABLE_POSTCODE'
  | 'FAILED'
  | 'FETCHING_GEOCODE';
  settings: any;
}

export const zoneInitialState: ZoneData = {
  zoneState: {
    status: 'INITIAL',
    settings: {}
  }
};

export function zoneState(
  state: ZoneState = zoneInitialState.zoneState,
  action: StoreAction): ZoneState {
  const newState = { ...state };
  switch (action.type) {
    case StoreActionType.GetZonePerZipcodeSuccess:
      newState.status = 'DELIVERABLE';
      newState.settings = action.zone;
      return newState;
    case StoreActionType.GetZonePerZipcodeFail:
      newState.status = 'NOTDELIVERABLE_POSTCODE';
      newState.settings = {};
      return newState;
    case StoreActionType.GeocodeAddress:
      newState.status = 'FETCHING_GEOCODE';
      newState.settings = {};
      return newState;
    case StoreActionType.GeocodeAddressSuccess:
      newState.status = 'INITIAL';
      newState.settings = {};
      return newState;
    case StoreActionType.GeocodeAddressFailed:
      if (newState.status === 'NOTDELIVERABLE_ADDRESS') {
        return state;
      }
      newState.status = 'NOTDELIVERABLE_ADDRESS';
      newState.settings = {};
      return newState;
    case StoreActionType.GetAssociatedZoneSuccess:
      if (!action.zoneData.type) {
        newState.status = 'NOTDELIVERABLE_POSTCODE';
        newState.settings = {};
      } else {
        newState.status = 'DELIVERABLE';
        newState.settings = action.zoneData;
      }
      return newState;
    case StoreActionType.ClearZonePerZipcode:
      return zoneInitialState.zoneState;
  }
  return state;
}

const reducerZoneData: (state: ZoneData, action: StoreAction) => ZoneData = combineReducers({
  zoneState
});

export function zoneStateReducer(state: ZoneData = zoneInitialState, action: StoreAction): ZoneData {
  return reducerZoneData(state, action);
}

// EOF: ZONE STATE

// CURRENT SELECTED CAT ON CATALOG PAGE STATE

export interface CurrentCatData {
  currentCategoryState: CurrentCategoryState;
}

export interface CurrentCategoryState {
  selectedCategory: any;
  selectedTopLevelCategory: any;
}

export const currentCatInitialState: CurrentCatData = {
  currentCategoryState: {
    selectedCategory: null,
    selectedTopLevelCategory: -1
  }
};

export function currentCategoryState(
  state: CurrentCategoryState = currentCatInitialState.currentCategoryState, action: StoreAction): CurrentCategoryState {
  const newState = { ...state };
  switch (action.type) {
    case StoreActionType.SetCurrentSelectedCategory:
      newState.selectedCategory = action.selectedCategory;
      return newState;    
    case StoreActionType.SetCurrentSelectedTopCategory:
      newState.selectedTopLevelCategory = action.selectedTopCategory;
      return newState;
  }
  return state;
}


const reducerCurrentCatData: (state: CurrentCatData, action: StoreAction) => CurrentCatData = combineReducers({
  currentCategoryState
});

export function currentCatStateReducer(state: CurrentCatData = currentCatInitialState, action: StoreAction): CurrentCatData {
  return reducerCurrentCatData(state, action);
}

// EOF: CURRENT SELECTED CAT ON CATALOG PAGE STATE

// STORE PROMOTION RULES

export interface StoreRules {
  storeRulesState: StoreRulesState;
}

export interface StoreRulesState {
  storeRules: any;
}

export const storeRulesInitialState: StoreRules = {
  storeRulesState: {
    storeRules: []
  }
};

export function storeRulesState(
    state: StoreRulesState = storeRulesInitialState.storeRulesState,
    action: StoreAction
  ): StoreRulesState {
  const newState = { ...state };
  switch (action.type) {
    case StoreActionType.GetStoreRulesSuccess:
      newState.storeRules = action.rules;
      return newState;
    case StoreActionType.GetStoreRulesFail:
      newState.storeRules = storeRulesInitialState.storeRulesState.storeRules;
      return newState;
  }
  return state;
}


const reducerStoreRules: (state: StoreRules, action: StoreAction) => StoreRules = combineReducers({
  storeRulesState
});

export function storeRulesReducer(state: StoreRules = storeRulesInitialState, action: StoreAction): StoreRules {
  return reducerStoreRules(state, action);
}

// EOF: STORE PROMOTION RULES


// Customer Social Login

export interface SocialLoginState {
  userId: number;
  userName: string;
  phoneNumber: string;
  tokens: Tokens;
  floorNumber: string;
  streetAddress: string;
  city: string;
  postCode: string;
  socialAuthStatus: 'INITIAL' | 'LOADING' | 'SUCCESS' | 'FAILED';
}

export interface CustomerDetailsUpdateState {
  userId: number;
  email: string;
  userName: string;
  phoneNumber: string;
  tokens: Tokens;
  floorNumber: string;
  streetAddress: string;
  city: string;
  postCode: string;
  customerDetailsUpdateStatus: 'INITIAL' | 'LOADING' | 'SUCCESS' | 'FAILED';
}

export interface SocialAuth {
  socialLoginState: SocialLoginState;
}

export interface CustomerDetailsUpdate {
  customerDetailsUpdateState: CustomerDetailsUpdateState;
}

export const socialLoginInitialState: SocialAuth = {
  socialLoginState: {
    userId: -1,
    userName: '',
    phoneNumber: '',
    floorNumber: '',
    streetAddress: '',
    city: '',
    postCode: '',
    tokens: {
      jwt: null,
      refreshToken: null
    },
    socialAuthStatus: 'INITIAL',
  }
};

export const customerDetailsUpdateInitialState: CustomerDetailsUpdate = {
  customerDetailsUpdateState: {
    userId: -1,
    email: '',
    userName: '',
    phoneNumber: '',
    floorNumber: '',
    streetAddress: '',
    city: '',
    postCode: '',
    tokens: {
      jwt: null,
      refreshToken: null
    },
    customerDetailsUpdateStatus: 'INITIAL',
  }
};

export function socialLoginState(socialAuthState = socialLoginInitialState.socialLoginState, action: StoreAction): SocialLoginState {

  switch (action.type) {
    case StoreActionType.SocialLogin:
      return { ...socialLoginInitialState.socialLoginState, socialAuthStatus: 'LOADING' };
    case StoreActionType.SocialLoginSuccess:
      return {
        userId: action.response.userId,
        userName: action.response.userName,
        phoneNumber: action.response.phoneNumber,
        tokens: action.response.tokens,
        floorNumber: action.response.floorNumber,
        streetAddress: action.response.streetAddress,
        city: action.response.city,
        postCode: action.response.postCode,
        socialAuthStatus: 'SUCCESS'
      };
    case StoreActionType.SocialLoginFailed:
      return { ...socialLoginInitialState.socialLoginState, socialAuthStatus: 'FAILED' };
    case StoreActionType.SocialLogout:
      return { ...socialLoginInitialState.socialLoginState };
    default:
      return socialAuthState;
  }
}

export function customerDetailsUpdateState(
  customerDetailUpdateState = customerDetailsUpdateInitialState.customerDetailsUpdateState,
  action: StoreAction): CustomerDetailsUpdateState {

  switch (action.type) {
    case StoreActionType.CustomerDetailsUpdate:
      return { ...customerDetailsUpdateInitialState.customerDetailsUpdateState, customerDetailsUpdateStatus: 'LOADING' };
    case StoreActionType.CustomerDetailsUpdateSuccess:
      return {
        userId: action.response.userId,
        userName: action.response.userName,
        phoneNumber: action.response.phoneNumber,
        tokens: action.response.tokens,
        floorNumber: action.response.floorNumber,
        streetAddress: action.response.streetAddress,
        city: action.response.city,
        postCode: action.response.postCode,
        email: action.response.email,
        customerDetailsUpdateStatus: 'SUCCESS'
      };
    case StoreActionType.CustomerDetailsUpdateFailed:
      return { ...customerDetailsUpdateInitialState.customerDetailsUpdateState, customerDetailsUpdateStatus: 'FAILED' };
    case StoreActionType.SocialLogout:
      return { ...customerDetailsUpdateInitialState.customerDetailsUpdateState };
    default:
      return customerDetailUpdateState;
  }
}

export function tokens(
  tokensState = socialLoginInitialState.socialLoginState.tokens
    || customerDetailsUpdateInitialState.customerDetailsUpdateState.tokens,
  action: StoreAction): Tokens {
  switch (action.type) {
    case StoreActionType.SocialLoginSuccess:
    case StoreActionType.CustomerDetailsUpdateSuccess:
      return { ...action.response.tokens };
    case StoreActionType.SocialLoginFailed:
    case StoreActionType.CustomerDetailsUpdateFailed:
    case StoreActionType.SocialLogout:
      return { ...socialLoginInitialState.socialLoginState.tokens };
    default:
      return tokensState;
  }
}

const reducerSocialLogin: (state: SocialAuth, action: StoreAction) => SocialAuth = combineReducers({
  socialLoginState,
  tokens
});

export function socialLoginReducer(state: SocialAuth = socialLoginInitialState, action: StoreAction): SocialAuth {
  return reducerSocialLogin(state, action);
}

const reducerCustomerDetailsUpdate: (state: CustomerDetailsUpdate, action: StoreAction) => CustomerDetailsUpdate = combineReducers({
  customerDetailsUpdateState
});

export function customerDetailsUpdateReducer(
  state: CustomerDetailsUpdate = customerDetailsUpdateInitialState, action: StoreAction): CustomerDetailsUpdate {
  return reducerCustomerDetailsUpdate(state, action);
}

// EOF : Customer Details Update

// Customer Loyalty
export interface CustomerLoyaltyState {
  status: 'INITIAL' | 'LOADING' | 'SUCCESS' | 'FAILED';
  data: CustomerLoyalty;
}

export interface CustomerLoyaltyStateData {
  customerLoyaltyState: CustomerLoyaltyState;
}

export const customerLoyaltyInitialState: CustomerLoyaltyStateData =  {
  customerLoyaltyState: {
    status: 'INITIAL',
    data: null
 }
};

export function customerLoyaltyState(
  state: CustomerLoyaltyState = customerLoyaltyInitialState.customerLoyaltyState,
  action: StoreAction): CustomerLoyaltyState {
    switch (action.type) {
      case StoreActionType.LoadCustomerLoyalty:
        return { ...state, status: 'LOADING' };
      case StoreActionType.LoadCustomerLoyaltySuccess:
        return { data: action.loyalty, status: 'SUCCESS' };
      case StoreActionType.LoadCustomerLoyaltyFailed:
        return { data: null, status: 'FAILED' };
      case StoreActionType.SocialLogout:
          return { ...customerLoyaltyInitialState.customerLoyaltyState };
      default:
        return state;
    }
}

const reducerCustomerLoyalty: (
  state: CustomerLoyaltyStateData, action: StoreAction) => CustomerLoyaltyStateData = combineReducers({
    customerLoyaltyState
});

export function customerLoyaltyReducer(
  state: CustomerLoyaltyStateData = customerLoyaltyInitialState, action: StoreAction): CustomerLoyaltyStateData {
  return reducerCustomerLoyalty(state, action);
}
// EOF : Customer Loyalty

// CustomerInfo details for order capture @ admin UI

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CustomerInfoData {
  customerInfo: CustomerInfo;
}

export const customerInfoInitialState: CustomerInfoData = {
  customerInfo: {
    name: null,
    email: null,
    phone: null
  }
};

export function customerInfo(
  state: CustomerInfo = customerInfoInitialState.customerInfo,
  action: StoreAction): CustomerInfo {
  switch (action.type) {
    case StoreActionType.SetCustomerInfo:
      return { name: action.info.name, email: action.info.email, phone: action.info.phone };
    case StoreActionType.SubmitOrderSuccess:
    case StoreActionType.ClearCustomerInfo:
      return {email: null, name: null, phone: null};
    default:
      return state;
  }
}

const reducerCustomerInfoData: (state: CustomerInfoData, action: StoreAction) => CustomerInfoData = combineReducers({
  customerInfo
});

export function customerInfoReducer(state: CustomerInfoData = customerInfoInitialState, action: StoreAction): CustomerInfoData {
  return reducerCustomerInfoData(state, action);
}
// EOF : CustomerInfo details for order capture @ admin UI

// GetCombinedOrder
export interface CombinedOrderState {
  combinedOrderState: CartState;
}

export const combinedOrderInitialState: CombinedOrderState = {
  combinedOrderState: {
    status: 'INITIAL',
    data: {
      location: -1,
      uuid: null,
      orderItems: [],
      createdAt: ''
    },
    errorCode: null
  }
};

export function combinedOrderState(
  state: CartState = cartInitialState.cartState,
  action: StoreAction): CartState {
  switch (action.type) {
    case StoreActionType.InitializeOrder:
      return { ...state, status: 'LOADING' };
    case StoreActionType.InitializeOrderSuccess:
      return {
        status: 'LOADED',
        data: action.order,
      };
    case StoreActionType.InitializeOrderFailed:
      return { ...selectedStoreInitialState[''], status: 'FAILED' };
    case StoreActionType.InitializeCartState:
      return { ...selectedStoreInitialState[''], status: 'INITIAL' };
    case StoreActionType.GetCombinedOrder:
      return { ...state, status: 'LOADING' };
    case StoreActionType.GetCombinedOrderSuccess:
      return {
        status: 'LOADED',
        data: action.order,
      };
    case StoreActionType.GetCombinedOrderFailed:
      return { ...selectedStoreInitialState[''], status: 'FAILED', errorCode: action.errorCode };
  }
  return state;
}


const reducercombinedOrders: (state: CombinedOrderState, action: StoreAction) => CombinedOrderState = combineReducers({
  combinedOrderState
});

export function combinedOrderReducer(state: CombinedOrderState = combinedOrderInitialState, action: StoreAction): CombinedOrderState {
  return reducercombinedOrders(state, action);
}

// Standalone Payment
export interface StandalonePaymentOrderState{
  status:
  'INITIAL'
  | 'LOADING'
  | 'CHECKEXISTING'
  | 'REFRESH'
  | 'REFRESHED'
  | 'LOADED'
  | 'ITEMADDING'
  | 'ITEMADDED'
  | 'ITEMREMOVING'
  | 'ITEMREMOVED'
  | 'RULE_OFFERS_REMOVED'
  | 'FAILED'
  | 'ITEMADDFAILED'
  | 'ITEMREMOVEFAILED'
  | 'ITEMUPDATING'
  | 'ITEMUPDATED'
  | 'ITEMUPDATEFAILED'
  | 'ITEMSEARCHSUCCESS'
  | 'ITEMSEARCHFAILED'
  | 'INITIATE_PAYMENT_SUCCESS'
  | 'INITIATE_PAYMENT_FAILED'
  | 'COMPLETE_PAYMENT_SUCCESS'
  | 'ORDERUPDATING'
  | 'ORDERUPDATEFAILED'
  | 'CHECKEXISTINGFAILED'
  | 'ORDERSUBMITTED'
  | 'ORDERSUBMITFAILED'
  | 'INIT_ONLINE_PAYMENT'
  | 'FINISHED_ONLINE_PAYMENT'
  | 'RULE_OFFERS_ADDED'
  | 'RULE_OFFERS_ADD_FAILED'
  ;
  data: StandalonePaymentOrder;
  formattedOpenBalance: string;
  formattedTotalPaid: string;
  openBalance: number;
  standalonePaymentOrders: StandalonePaymentOrder[];
  totalPaid: number;
  openStandalonePaymentOrder: StandalonePaymentOrder;
}
export interface StandalonePaymentState {
  standalonePaymentOrderState: StandalonePaymentOrderState;
}

export const standalonePaymentInitialState: StandalonePaymentState = {
  standalonePaymentOrderState: {
    status: 'INITIAL',
    data: {
      id: '',
      storeId: '',
      order: '',
      tapId: '',
      paymentType: '',
      amountReference: 0,
      amountSelected: 0,
      amountTip: 0,
      divideBillBy: 0,
      amountTotal: 0,
      tipPercentage: 0,
      currency: 0,
      customerName: '',
      location: 0,
      deviceIdentifier: '',
      createdAt: '',
      updatedAt: '',
      paymentTransactionId: '',
      paymentMethod: '',
      paymentProviderIdentifier: '',
      referenceType: '',
      paymentStatus: '',
      possibleTips: []
    },
    formattedOpenBalance: '',
    formattedTotalPaid: '',
    openBalance: 0,
    standalonePaymentOrders: [],
    totalPaid: 0,
    openStandalonePaymentOrder: null
  }
};

export function standalonePaymentOrderState(
  state: StandalonePaymentOrderState = standalonePaymentInitialState.standalonePaymentOrderState,
  action: StoreAction): StandalonePaymentOrderState {
  switch (action.type) {
    case StoreActionType.InitializeCartState:
      return { ...selectedStoreInitialState[''], status: 'INITIAL' };
    case StoreActionType.CreateStandalonePayment:
      return { ...state, status: 'LOADING' };
    case StoreActionType.CreateStandalonePaymentSuccess:
      return {
        ...state,
        status: 'LOADED',
        data: action.standaloneOrder,
      };
    case StoreActionType.CreateStandalonePaymentFailed:
      return { ...selectedStoreInitialState[''], status: 'FAILED' };
    case StoreActionType.UpdateStandalonePayment:
      return { ...state, status: 'ITEMUPDATING' };
    case StoreActionType.UpdateStandalonePaymentSuccess:
      return {...state, status: 'ITEMUPDATED', data: action.standaloneOrder };
    case StoreActionType.UpdateStandalonePaymentFailed:
      return { ...state, status: 'ITEMUPDATEFAILED' };
    case StoreActionType.CustomerStandalonePaymentSearchSuccess:
      return { ...state, ...action.res, status: 'ITEMSEARCHSUCCESS'};
    case StoreActionType.CustomerStandalonePaymentSearchFailed:
      return { ...state, status: 'ITEMSEARCHFAILED'};
    case StoreActionType.InitiateStandalonePaymentSuccess:
      return { ...state, data: action.standaloneOrder, status: 'INITIATE_PAYMENT_SUCCESS'};
    case StoreActionType.InitiateStandalonePaymentFailed:
      return { ...state, status: 'INITIATE_PAYMENT_FAILED'};
    case StoreActionType.CompleteStandalonePaymentSuccess:
      return { ...state, data: action.standaloneOrder, status: 'COMPLETE_PAYMENT_SUCCESS'};
  }
  return state;
}


const reducerStandalonePaymentOrders: (state: StandalonePaymentState, action: StoreAction) => StandalonePaymentState = combineReducers({
  standalonePaymentOrderState
});

export function standalonePaymentOrderReducer(
  state: StandalonePaymentState = standalonePaymentInitialState,
  action: StoreAction): StandalonePaymentState {
  return reducerStandalonePaymentOrders(state, action);
}


// MOBILE STORE ALIAS STATE
export interface MobileStoreData {
  mobileStoreState: MobileStoreState;
}

export interface MobileStoreState {
  storeAlias: string;
}

export const mobileStoreInitialState: MobileStoreData = {
  mobileStoreState: {
    storeAlias: ''
  }
};

export function mobileStoreState(
  state: MobileStoreState = mobileStoreInitialState.mobileStoreState,
  action: StoreAction): MobileStoreState {
  switch (action.type) {
    case StoreActionType.SetMobileStore:
      return { ...state, storeAlias: action.storeAlias };
    default:
      return state;
  }
}

const reducerMobileStoreData: (state: MobileStoreData, action: StoreAction) => MobileStoreData = combineReducers({
  mobileStoreState
});

export function mobileStoreReducer(state: MobileStoreData = mobileStoreInitialState, action: StoreAction): MobileStoreData {
  return reducerMobileStoreData(state, action);
}
// EOF : MOBILE STORE ALIAS STATE

//Customer footer height state
export interface CustomerFooterHeightData {
  customerFooterHeightState: CustomerFooterHeightState;
}

export interface CustomerFooterHeightState {
  customerFooterHeight: number;
}

export const customerFooterHeightInitialState: CustomerFooterHeightData = {
  customerFooterHeightState: {
    customerFooterHeight: 83
  }
}

export function customerFooterHeightState(
  state: CustomerFooterHeightState = customerFooterHeightInitialState.customerFooterHeightState,
  action: StoreAction): CustomerFooterHeightState {
  switch (action.type) {
    case StoreActionType.SetCustomerFooterHeight:
      return { ...state, customerFooterHeight: action.customerFooterHeight};
    default:
      return { ...state};
  }
}

const reducerCustomerFooterHeight: (state: CustomerFooterHeightData, action: StoreAction) => CustomerFooterHeightData = combineReducers({
  customerFooterHeightState
});

export function customerFooterReducer(state: CustomerFooterHeightData = customerFooterHeightInitialState, action: StoreAction): CustomerFooterHeightData {
  return reducerCustomerFooterHeight(state, action);
}
//End Customer footer height state

// Store recents information saved to storage
export interface StoreRecents {
  storeRecents: StoreRecentsState;
}

export interface StoreRecentsState {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  storeRecentsList: StoreRecentsInfo[];
}

export const storeRecentsInitialState: StoreRecents = {
  storeRecents: {
    status: 'INITIAL',
    storeRecentsList: [],
  }
};

export function storeRecents(
      state: StoreRecentsState = storeRecentsInitialState.storeRecents,
      action: StoreAction): StoreRecentsState {
  switch (action.type) {
    case StoreActionType.SaveStoreByAlias:
      return { ...state, status: 'LOADING' };
    case StoreActionType.SaveStoreByAliasSuccess:
      {
        let newState = { ...state }
        const index = newState.storeRecentsList.findIndex(e => e.storeAlias === action.storeAlias)
        if (index < 0) {
          newState.storeRecentsList.push({
            storeId: action.storeId,
            storeAlias: action.storeAlias,
            storeName: action.storeName,
            storeUrl: action.storeUrl,
            saveMode: action.saveMode,
            storeLogoUrl: action.storeLogoUrl,
            lastOpen: (new Date()).toUTCString(),
          })
          return { ...newState, status: 'LOADED' };
        } else {
          newState.storeRecentsList[index].lastOpen = (new Date()).toUTCString();
          return { ...newState, status: 'LOADED' };
        }
      }
    case StoreActionType.SaveStoreByAliasFailed:
      return { ...state, status: 'FAILED' };
    case StoreActionType.UpdateLastOpen:
      let newState = { ...state }
      const index = newState.storeRecentsList.findIndex(e => e.storeAlias === action.storeAlias)
      if (index >= 0) {
        newState.storeRecentsList[index].lastOpen = (new Date()).toUTCString();
        return { ...newState };
      }
  }
  return state;
}

const reducerStoreRecents: (state: StoreRecents, action: StoreAction) => StoreRecents = combineReducers({		
  storeRecents		
});

export function storesRecentsReducer(state: StoreRecents = storeRecentsInitialState, action: StoreAction): StoreRecents {		
    return reducerStoreRecents(state, action);		
}
