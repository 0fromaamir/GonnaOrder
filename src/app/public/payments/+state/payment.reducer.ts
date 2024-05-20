import {PaymentActionType, PaymentStoresAction} from './payment.actions';
import {combineReducers} from '@ngrx/store';
import {
  JCCRequestJSON,
  PaymentsenseToken,
  PaypalAccessToken,
  PaypalOrderData,
  TrustPaymentsRequestJSON,
  VivaToken
} from '../payment.types';
import {StoreAction, StoreActionType} from '../../store/+state/stores.actions';
import {InitiateOrderPaymentResponse} from '../../store/types/OrderPayment';

/**
 * PAYPAL STATE MANAGEMENT
 */
export interface Paypal {
  paypalState: PaypalState;
}

export interface PaypalState {
  status:
    'OBTAINING_TOKEN'
  | 'TOKEN_OBTAINED'
  | 'TOKEN_FAILED'
  | 'CREATING_PAYPAL_ORDER'
  | 'PAYPAL_ORDER_CREATED'
  | 'PAYPAL_ORDER_FAILED';
  accessTokenData: PaypalAccessToken;
  paypalOrderData: PaypalOrderData; // for now the type is any, TODO add paypalOrderData type
}

export const paypalInitialState: Paypal = {
  paypalState: {
    status: 'OBTAINING_TOKEN',
    accessTokenData: null,
    paypalOrderData: null
  }
};

export function paypalState(
  state: PaypalState = paypalInitialState.paypalState,
  action: PaymentStoresAction): PaypalState {
  switch (action.type) {
    case PaymentActionType.ObtainToken:
      return paypalInitialState.paypalState;
    case PaymentActionType.ObtainTokenSuccess:
      return {
        ...state,
        status: 'TOKEN_OBTAINED',
        accessTokenData: action.tokenData
      };
    case PaymentActionType.ObtainTokenFailed:
      return {
        ...state,
        status: 'TOKEN_FAILED',
      };
    case PaymentActionType.CreatePaypalOrder:
      return {
        ...state,
        status: 'CREATING_PAYPAL_ORDER',
      };
    case PaymentActionType.CreatePaypalOrderSuccess:
      return {
        ...state,
        status: 'PAYPAL_ORDER_CREATED',
        paypalOrderData: action.linksData
      };
    case PaymentActionType.CreatePaypalOrderFailed:
      return {
        ...state,
        status: 'PAYPAL_ORDER_FAILED',
      };
  }
  return state;
}


const reducerPaypalState: (state: Paypal, action: PaymentStoresAction) => Paypal = combineReducers({
  paypalState
});

export function paypalStateReducer(state: Paypal = paypalInitialState, action: PaymentStoresAction): Paypal {
    return reducerPaypalState(state, action);
}

// EOF: paypal state management

// EOF: stripe state management

// Viva state management
export interface Viva {
  vivaState: VivaState;
}

export interface VivaState {
  status:
    'INITIAL' |
    'TOKEN_REQUEST' |
    'TOKEN_REQUEST_SUCCESS' |
    'TOKEN_REQUEST_FAILURE' |
    'CHARGE_REQUEST' |
    'CHARGE_REQUEST_SUCCESS' |
    'CHARGE_REQUEST_FAILURE' |
    'VIVA_PAYMENT_COMPLETED' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  vivaToken: VivaToken;
}

export const vivaInitialState: Viva = {
  vivaState: {
    status: 'INITIAL',
    vivaToken: {
      accessToken: null,
      expiresIn: null,
      orderCode: null,
    },
  }
};

export function vivaState(state: VivaState = vivaInitialState.vivaState, action: PaymentStoresAction | StoreAction): VivaState {
  switch (action.type) {
    case PaymentActionType.CompleteVivaPayment:
      return {
        ...state,
        status: 'VIVA_PAYMENT_COMPLETED'
      };
    case PaymentActionType.CompleteVivaPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteVivaPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case PaymentActionType.ClearVivaPayment:
      return vivaInitialState.vivaState;
    case StoreActionType.ClearCheckoutState:
      return vivaInitialState.vivaState;

  }
  return state;
}

const reducerVivaState: (state: Viva, action: PaymentStoresAction) => Viva = combineReducers({
  vivaState
});

export function vivaStateReducer(state: Viva = vivaInitialState, action: PaymentStoresAction): Viva {
  return reducerVivaState(state, action);
}

// EOF Viva state management


// Paymentsense state management
export interface Paymentsense {
  paymentSenseState: PaymentsenseState;
}

export interface PaymentsenseState {
  status:
    'INITIAL' |
    'TOKEN_REQUEST' |
    'TOKEN_REQUEST_SUCCESS' |
    'TOKEN_REQUEST_FAILURE' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  paymentSenseToken: PaymentsenseToken;
}

export const paymentSenseInitialState: Paymentsense = {
  paymentSenseState: {
    status: 'INITIAL',
    paymentSenseToken: {
      id: null,
      expiresAt: null
    }
  }
};

export function paymentSenseState(
  state: PaymentsenseState = paymentSenseInitialState.paymentSenseState,
  action: PaymentStoresAction | StoreAction
): PaymentsenseState {
  switch (action.type) {
    case PaymentActionType.CreatePaymentsenseToken:
      return {
        ...state,
        status: 'TOKEN_REQUEST'
      };
    case PaymentActionType.CreatePaymentsenseTokenSuccess:
      return {
        status: 'TOKEN_REQUEST_SUCCESS',
        paymentSenseToken: action.token
      };
    case PaymentActionType.CreatePaymentsenseTokenFailed:
      return {
        status: 'TOKEN_REQUEST_FAILURE',
        paymentSenseToken: paymentSenseInitialState.paymentSenseState.paymentSenseToken
      };
    case PaymentActionType.CompletePaymentsensePaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompletePaymentsensePaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearPaymentsense:
      return paymentSenseInitialState.paymentSenseState;

  }
  return state;
}

const reducerPaymentsenseState: (state: Paymentsense, action: PaymentStoresAction) => Paymentsense = combineReducers({
  paymentSenseState
});

export function paymentSenseStateReducer(state: Paymentsense = paymentSenseInitialState, action: PaymentStoresAction): Paymentsense {
  return reducerPaymentsenseState(state, action);
}

// EOF Paymentsense state management


// Square state management
export interface Square {
  squareState: SquareState;
}

export interface SquareState {
  status:
    'INITIAL' |
    'SESSION_REQUEST' |
    'SESSION_REQUEST_SUCCESS' |
    'SESSION_REQUEST_FAILURE' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  squareSessionUrl: string;
  errorMessage: any;
}

export const squareInitialState: Square = {
  squareState: {
    status: 'INITIAL',
    squareSessionUrl: '',
    errorMessage: null
  }
};

export function squareState(
  state: SquareState = squareInitialState.squareState,
  action: PaymentStoresAction | StoreAction
): SquareState {
  switch (action.type) {
    case PaymentActionType.CheckoutSquare:
      return {
        ...state,
        status: 'SESSION_REQUEST'
      };
    case PaymentActionType.CheckoutSquareSuccess:
      return {
        status: 'SESSION_REQUEST_SUCCESS',
        squareSessionUrl: action.squareSessionUrl,
        errorMessage: null
      };
    case PaymentActionType.CheckoutSquareFailed:
      return {
        status: 'SESSION_REQUEST_FAILURE',
        squareSessionUrl: null,
        errorMessage: action.errorMessage
      };
    case PaymentActionType.CompleteSquarePaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteSquarePaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
        errorMessage: action.errorMessage
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearSquarePayment:
      return squareInitialState.squareState;

  }
  return state;
}

const reducerSquareState: (state: Square, action: PaymentStoresAction) => Square = combineReducers({
  squareState
});

export function squareStateReducer(state: Square = squareInitialState, action: PaymentStoresAction): Square {
  return reducerSquareState(state, action);
}

// EOF Square state management


// TrustPayments state management

export interface TrustPayments {
  trustPaymentsState: TrustPaymentsState;
}

export interface TrustPaymentsState {
  status:
    'INITIAL' |
    'INIT_PAYMENT' |
    'INIT_PAYMENT_SUCCESS' |
    'INIT_PAYMENT_FAILURE' |
    'COMPLETE_PAYMENT' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  requestJSON: TrustPaymentsRequestJSON;
}

export const trustPaymentsInitialState: TrustPayments = {
  trustPaymentsState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

export function trustPaymentsState(
  state: TrustPaymentsState = trustPaymentsInitialState.trustPaymentsState,
  action: PaymentStoresAction | StoreAction
): TrustPaymentsState {
  switch (action.type) {
    case PaymentActionType.CreateTrustPaymentsRequestJSON:
      return {
        ...state,
        status: 'INIT_PAYMENT'
      };
    case PaymentActionType.CreateTrustPaymentsRequestJSONSuccess:
      return {
        status: 'INIT_PAYMENT_SUCCESS',
        requestJSON: action.token
      };
    case PaymentActionType.CreateTrustPaymentsRequestJSONFailed:
      return {
        status: 'INIT_PAYMENT_FAILURE',
        requestJSON: trustPaymentsInitialState.trustPaymentsState.requestJSON
      };
    case PaymentActionType.CompleteTrustPaymentsPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteTrustPaymentsPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearTrustPaymentsPayment:
      return trustPaymentsInitialState.trustPaymentsState;

  }
  return state;
}

const reducerTrustPaymentsState: (state: TrustPayments, action: PaymentStoresAction) => TrustPayments = combineReducers({
  trustPaymentsState
});

export function trustPaymentsStateReducer(state: TrustPayments = trustPaymentsInitialState, action: PaymentStoresAction): TrustPayments {
  return reducerTrustPaymentsState(state, action);
}

// EOF TrustPayments state management

// JCC state management
export interface JCC {
  jccState: JCCState;
}

export interface JCCState {
  status:
    'INITIAL' |
    'INIT_PAYMENT' |
    'INIT_PAYMENT_SUCCESS' |
    'INIT_PAYMENT_FAILURE' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  requestJSON: JCCRequestJSON;
}

export const jccInitialState: JCC = {
  jccState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

export function jccState(
  state: JCCState = jccInitialState.jccState,
  action: PaymentStoresAction | StoreAction
): JCCState {
  switch (action.type) {
    case PaymentActionType.CreateJCCRequestJSON:
      return {
        ...state,
        status: 'INIT_PAYMENT'
      };
    case PaymentActionType.CreateJCCRequestJSONSuccess:
      return {
        status: 'INIT_PAYMENT_SUCCESS',
        requestJSON: action.token
      };
    case PaymentActionType.CreateJCCRequestJSONFailed:
      return {
        status: 'INIT_PAYMENT_FAILURE',
        requestJSON: jccInitialState.jccState.requestJSON
      };
    case PaymentActionType.CompleteJCCPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompleteJCCPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearJCCPayment:
      return jccInitialState.jccState;

  }
  return state;
}

const reducerJCCState: (state: JCC, action: PaymentStoresAction) => JCC = combineReducers({
  jccState
});

export function jccStateReducer(state: JCC = jccInitialState, action: PaymentStoresAction): JCC {
  return reducerJCCState(state, action);
}

// EOF JCC state management

// PaymentRedirectInfo details for order
export interface PaymentRedirectInfo {
  currentUrl: string;
  storeAliasName: string;
  orderUuid: string;
  storeId: number;
  orderCode?: number;
  thankyouUrl?: string;
  jwt?: string;
  callbackUrl?: string;
}

export interface PaymentRedirectInfoData {
  paymentRedirectInfo: PaymentRedirectInfo;
}

export const paymentRedirectInfoInitialState: PaymentRedirectInfoData = {
  paymentRedirectInfo: {
    currentUrl: null,
    storeAliasName: '',
    orderUuid: '',
    storeId: -1,
    orderCode: null,
    thankyouUrl: null,
    callbackUrl: null,
  }
};

export function paymentRedirectInfo(
  state: PaymentRedirectInfo = paymentRedirectInfoInitialState.paymentRedirectInfo,
  action: PaymentStoresAction | StoreAction): PaymentRedirectInfo {
  switch (action.type) {
    case PaymentActionType.SetPaymentRedirectInfo:
      return { ...state , currentUrl: action.info.currentUrl, orderCode: action.info.orderCode,
        storeAliasName: action.info.storeAliasName,
        orderUuid: action.info.orderUuid,
        storeId: action.info.storeId,
        thankyouUrl: action.info.thankyouUrl,
        callbackUrl: action.info.callbackUrl
      };
    case StoreActionType.SubmitOrderSuccess:
    case PaymentActionType.ClearPaymentRedirectInfo:
      return { ...paymentRedirectInfoInitialState.paymentRedirectInfo };
    default:
      return state;
  }
}

const reducerPaymentRedirectInfoData: (state: PaymentRedirectInfoData, action: StoreAction) => PaymentRedirectInfoData = combineReducers({
  paymentRedirectInfo
});

export function paymentRedirectInfoReducer(state: PaymentRedirectInfoData = paymentRedirectInfoInitialState,
                                           action: StoreAction): PaymentRedirectInfoData {
  return reducerPaymentRedirectInfoData(state, action);
}
// EOF : PaymentRedirectInfo details


// Order Payment state management


export interface OrderPayment {
  orderPaymentState: OrderPaymentState;
}

export interface OrderPaymentState {
  status:
      'INITIAL' |
      'INITIATE_ORDER_PAYMENT' |
      'INITIATE_ORDER_PAYMENT_SUCCESS' |
      'INITIATE_ORDER_PAYMENT_FAILURE' |
      'COMPLETE_ORDER_PAYMENT' |
      'COMPLETE_ORDER_PAYMENT_SUCCESS' |
      'COMPLETE_ORDER_PAYMENT_FAILURE' |
      'FETCH_PAYMENT_STATUS'
  ;
  requestJSON: InitiateOrderPaymentResponse;
}


export const orderPaymentInitialState: OrderPayment = {
  orderPaymentState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

export function orderPaymentState(
    state: OrderPaymentState = orderPaymentInitialState.orderPaymentState,
    action: PaymentStoresAction | StoreAction
): OrderPaymentState {
  switch (action.type) {
    case PaymentActionType.InitiateOrderPayment:
      return {
        ...state,
        status: 'INITIATE_ORDER_PAYMENT'
      };
    case PaymentActionType.InitiateOrderPaymentSuccess:
      return {
        status: 'INITIATE_ORDER_PAYMENT_SUCCESS',
        requestJSON: action.initiateOrderPaymentResponse
      };
    case PaymentActionType.InitiateOrderPaymentFailed:
      return {
        status: 'INITIATE_ORDER_PAYMENT_FAILURE',
        requestJSON: orderPaymentInitialState.orderPaymentState.requestJSON
      };
    case PaymentActionType.CompleteOrderPaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_ORDER_PAYMENT_SUCCESS',
        requestJSON: action.order
      };
    case PaymentActionType.CompleteOrderPaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_ORDER_PAYMENT_FAILURE',
        requestJSON: action.order
      };
    case PaymentActionType.FetchPaymentStatus:
      return {
        ...state,
        status: 'FETCH_PAYMENT_STATUS',
      };
    case StoreActionType.ClearCheckoutState:
    case PaymentActionType.ClearOrderPayment:
      return orderPaymentInitialState.orderPaymentState;

  }
  return state;
}

const reducerOrderPaymentState: (state: OrderPayment, action: PaymentStoresAction) => OrderPayment = combineReducers({
  orderPaymentState
});


export function orderPaymentStateReducer(state: OrderPayment = orderPaymentInitialState, action: PaymentStoresAction): OrderPayment {
  return reducerOrderPaymentState(state, action);
}


export interface GlobalPay {
  globalPayState: GlobalPayState;
}

export interface GlobalPayState {
  status:
    'INITIAL' |
    'SET_REQUEST_JSON' |
    'SET_REQUEST_JSON_SUCCESS';
  requestJSON: any;
}


export const globalPayInitialState: GlobalPay = {
  globalPayState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

const reducerGlobalPayState: (state: GlobalPay, action: PaymentStoresAction) => GlobalPay = combineReducers({
  globalPayState
});


export function globalPayStateReducer(state: GlobalPay = globalPayInitialState, action: PaymentStoresAction): GlobalPay {
  return reducerGlobalPayState(state, action);
}

export function globalPayState(
  state: GlobalPayState = globalPayInitialState.globalPayState,
  action: PaymentStoresAction | StoreAction
): GlobalPayState {
  switch (action.type) {
    case PaymentActionType.setGlobalPayRequestJson:
      return {
        ...state,
        requestJSON: action.requestJSON,
        status: 'SET_REQUEST_JSON',
      };
    case PaymentActionType.setGlobalPayRequestJsonSuccess:
      return {
        ...state,
        status: 'SET_REQUEST_JSON_SUCCESS',
      };
  }
  return state;
}

export interface RealexPayment {
    realexPaymentState: RealexPaymentState;
  }

export interface RealexPaymentState {
    status:
      'INITIAL' |
      'REDIRECT_PAYMENT_PROVIDER_PAGE' |
      'REDIRECT_PAYMENT_PROVIDER_PAGE_SUCCESS'
    ;
    hppUrl: string;
    responseUrl: string;
    jsonFromRequestEndpoint: any;
  }


export const realexPaymentInitialState: RealexPayment = {
    realexPaymentState: {
      status: 'INITIAL',
      hppUrl: null,
      responseUrl: null,
      jsonFromRequestEndpoint: null,
    }
  };

const reducerRealexPaymentState: (state: RealexPayment, action: PaymentStoresAction) => RealexPayment = combineReducers({
    realexPaymentState
  });


export function realexPaymentStateReducer(state: RealexPayment = realexPaymentInitialState, action: PaymentStoresAction): RealexPayment {
    return reducerRealexPaymentState(state, action);
  }

export function realexPaymentState(
    state: RealexPaymentState = realexPaymentInitialState.realexPaymentState,
    action: PaymentStoresAction | StoreAction
  ): RealexPaymentState {
    switch (action.type) {
      case PaymentActionType.redirectPaymentProviderPage:
        return {
          ...state,
          hppUrl: action.hppUrl,
          responseUrl: action.responseUrl,
          jsonFromRequestEndpoint: action.jsonFromRequestEndpoint,
          status: 'REDIRECT_PAYMENT_PROVIDER_PAGE',
        };
      case PaymentActionType.redirectPaymentProviderPageSuccess:
        return {
          ...state,
          status: 'REDIRECT_PAYMENT_PROVIDER_PAGE_SUCCESS',
        };
    }
    return state;
  }


export interface Rms {
  rmsState: RmsState;
}

export interface RmsState {
  status:
    'INITIAL' |
    'SET_REQUEST_JSON' |
    'SET_REQUEST_JSON_SUCCESS';
  requestJSON: any;
}


export const rmsInitialState: Rms = {
  rmsState: {
    status: 'INITIAL',
    requestJSON: null,
  }
};

const reducerRmsState: (state: Rms, action: PaymentStoresAction) => Rms = combineReducers({
  rmsState
});


export function rmsStateReducer(state: Rms = rmsInitialState, action: PaymentStoresAction): Rms {
  return reducerRmsState(state, action);
}

export function rmsState(
  state: RmsState = rmsInitialState.rmsState,
  action: PaymentStoresAction | StoreAction
): RmsState {
  switch (action.type) {
    case PaymentActionType.setRmsRequestJson:
      return {
        ...state,
        requestJSON: action.requestJSON,
        status: 'SET_REQUEST_JSON',
      };
    case PaymentActionType.setRmsRequestJsonSuccess:
      return {
        ...state,
        status: 'SET_REQUEST_JSON_SUCCESS',
      };
  }
  return state;
}

export interface CompletePayment {
  completePaymentState: CompletePaymentState;
}

export interface CompletePaymentState {
  status:
    'INITIAL' |
    'COMPLETE_PAYMENT_SUCCESS' |
    'COMPLETE_PAYMENT_FAILURE'
  ;
  storeId: number,
  orderUuid: string,
  paymentProviderResponse: string,
  isStandaloneOrder: boolean,
  redirectUrl: string
}

export const completePaymentInitialState: CompletePayment = {
  completePaymentState: {
    status: 'INITIAL',
    storeId: 0,
    orderUuid: '',
    paymentProviderResponse: '',
    isStandaloneOrder: false,
    redirectUrl: ''
  }
};

export function completePaymentState(state: CompletePaymentState = completePaymentInitialState.completePaymentState, action: PaymentStoresAction | StoreAction): CompletePaymentState {
  switch (action.type) {
    case PaymentActionType.CompletePayment:
      return {
        ...state,
        status: 'INITIAL'
      };
    case PaymentActionType.CompletePaymentSuccess:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_SUCCESS',
      };
    case PaymentActionType.CompletePaymentFailed:
      return {
        ...state,
        status: 'COMPLETE_PAYMENT_FAILURE',
      };
    case PaymentActionType.ClearVivaPayment:
    case StoreActionType.ClearCheckoutState:
      return completePaymentInitialState.completePaymentState;
  }
  return state;
}

const reducerCompletePaymentState: (state: CompletePayment, action: PaymentStoresAction) => CompletePayment = combineReducers({
  completePaymentState
});

export function completePaymentStateReducer(state: CompletePayment = completePaymentInitialState, action: PaymentStoresAction): CompletePayment {
  return reducerCompletePaymentState(state, action);
}
