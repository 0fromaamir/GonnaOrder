import { Action } from '@ngrx/store';
import {
  PaypalAccessToken,
  PaymentsenseToken,
  TrustPaymentsRequestJSON,
  TrustPaymentsPaymentInfo,
  JCCRequestJSON,
  JCCPaymentInfo, OrderPaymentInfo
} from '../payment.types';
import { PaymentRedirectInfo } from './payment.reducer';
import {InitiateOrderPaymentResponse} from '../../store/types/OrderPayment';
import { Event } from 'src/app/stores/event';
export enum PaymentActionType {
  ObtainToken = '[paypal] ObtainToken',
  ObtainTokenSuccess = '[paypal] ObtainTokenSuccess',
  ObtainTokenFailed = '[paypal] ObtainTokenFailed',
  CreatePaypalOrder = '[paypal] CreatePaypalOrder',
  CreatePaypalOrderSuccess = '[paypal] ObtainPartnerLinksSuccess',
  CreatePaypalOrderFailed = '[paypal] ObtainPartnerLinksFailed',
  // Square
  CheckoutSquare = '[Square] CheckoutSquare',
  CheckoutSquareSuccess = '[Square] CheckoutSquareSuccess',
  CheckoutSquareFailed = '[Square] CheckoutSquareFailed',
  CompleteSquarePayment = '[Square] CompleteSquarePayment',
  CompleteSquarePaymentSuccess = '[Square] CompleteSquarePaymentSuccess',
  CompleteSquarePaymentFailed = '[Square] CompleteSquarePaymentFailed',
  ClearSquarePayment = '[Square] ClearSquarePayment',
  // VIVA
  ClearVivaPayment = '[Viva] ClearVivaPayment',
  CompleteVivaPayment = '[Viva] CompleteVivaPayment',
  CompleteVivaPaymentSuccess = '[Viva] CompleteVivaPaymentSuccess',
  CompleteVivaPaymentFailed = '[Viva] CompleteVivaPaymentFailed',
  // Paymentsense
  CreatePaymentsenseToken = '[Paymentsense] CreatePaymentsenseToken',
  CreatePaymentsenseTokenSuccess = '[Paymentsense] CreatePaymentsenseTokenSuccess',
  CreatePaymentsenseTokenFailed = '[Paymentsense] CreatePaymentsenseTokenFailed',
  CompletePaymentsensePayment = '[Paymentsense] CompletePaymentsensePayment',
  CompletePaymentsensePaymentSuccess = '[Paymentsense] CompletePaymentsensePaymentSuccess',
  CompletePaymentsensePaymentFailed = '[Paymentsense] CompletePaymentsensePaymentFailed',
  ClearPaymentsense = '[Paymentsense] ClearPaymentsense',

  // TrustPayments
  CreateTrustPaymentsRequestJSON = '[TrustPayments] CreateTrustPaymentsRequestJSON',
  CreateTrustPaymentsRequestJSONSuccess = '[TrustPayments] CreateTrustPaymentsRequestJSONSuccess',
  CreateTrustPaymentsRequestJSONFailed = '[TrustPayments] CreateTrustPaymentsRequestJSONFailed',
  CompleteTrustPaymentsPayment = '[TrustPayments] CompleteTrustPaymentsPayment',
  CompleteTrustPaymentsPaymentSuccess = '[TrustPayments] CompleteTrustPaymentsPaymentSuccess',
  CompleteTrustPaymentsPaymentFailed = '[TrustPayments] CompleteTrustPaymentsPaymentFailed',
  ClearTrustPaymentsPayment = '[TrustPayments] ClearTrustPaymentsPayment',
  // JCC
  CreateJCCRequestJSON = '[JCC] CreateJCCRequestJSON',
  CreateJCCRequestJSONSuccess = '[JCC] CreateJCCRequestJSONSuccess',
  CreateJCCRequestJSONFailed = '[JCC] CreateJCCRequestJSONFailed',
  CompleteJCCPayment = '[JCC] CompleteJCCPayment',
  CompleteJCCPaymentSuccess = '[JCC] CompleteJCCPaymentSuccess',
  CompleteJCCPaymentFailed = '[JCC] CompleteJCCPaymentFailed',
  ClearJCCPayment = '[JCC] ClearJCCPayment',
  SetCustomerInfo = '[stores] SetCustomerInfo',
  ClearCustomerInfo = '[stores] ClearCustomerInfo',
  SetPaymentRedirectInfo = 'SetPaymentRedirectInfo',
  ClearPaymentRedirectInfo = 'ClearPaymentRedirectInfo',
  InitiateVivaPaymentSuccess = '[Viva] InitiateVivaPaymentSuccess',

  // Order Payment
  InitiateOrderPayment = '[orderPaymentState] InitiateOrderPayment',
  InitiateOrderPaymentSuccess = '[orderPaymentState] InitiateOrderPaymentSuccess',
  InitiateOrderPaymentFailed = '[orderPaymentState] InitiateOrderPaymentFailed',

  CompleteOrderPayment = '[orderPaymentState] CompleteOrderPayment',
  CompleteOrderPaymentSuccess = '[orderPaymentState] CompleteOrderPaymentSuccess',
  CompleteOrderPaymentFailed = '[orderPaymentState] CompleteOrderPaymentFailed',
  ClearOrderPayment = '[orderPaymentState] ClearOrderPayment',
  FetchPaymentStatus = '[orderPaymentState] FetchPaymentStatus',

  setGlobalPayRequestJson = '[globalPayState] setGlobalPayRequestJson',
  setGlobalPayRequestJsonSuccess = '[globalPayState] setGlobalPayRequestJsonSuccess',

  redirectPaymentProviderPage = '[realexPaymentState] redirectPaymentProviderPage',
  redirectPaymentProviderPageSuccess = '[realexPaymentState] redirectPaymentProviderPageSuccess',

  setRmsRequestJson = '[rmsState] setRmsRequestJson',
  setRmsRequestJsonSuccess = '[rmsState] setRmsRequestJsonSuccess',

  CompletePayment = '[paymentState] CompletePayment',
  CompletePaymentSuccess = '[paymentState] CompletePaymentSuccess',
  CompletePaymentFailed = '[paymentState] CompletePaymentFailed',

}

export class ObtainToken implements Action {
  readonly type = PaymentActionType.ObtainToken;

  constructor() {}
}

export class ObtainTokenSuccess implements Action {
  readonly type = PaymentActionType.ObtainTokenSuccess;

  constructor(public readonly tokenData: PaypalAccessToken) {}

}

export class ObtainTokenFailed implements Action {
  readonly type = PaymentActionType.ObtainTokenFailed;

  constructor() {}

}


export class CreatePaypalOrder implements Action {
  readonly type = PaymentActionType.CreatePaypalOrder;

  constructor(public readonly paypalConfigObject: {}, public readonly accessToken: string) {}
}

export class CreatePaypalOrderSuccess implements Action {
  readonly type = PaymentActionType.CreatePaypalOrderSuccess;

  constructor(public readonly linksData: any) {}

}

export class CreatePaypalOrderFailed implements Action {
  readonly type = PaymentActionType.CreatePaypalOrderFailed;

  constructor() {}

}

// STRIPE

export class CheckoutSquare implements Action {
  readonly type = PaymentActionType.CheckoutSquare;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly redirectUrl: string,
  ) {}
}

export class CheckoutSquareSuccess implements Action {
  readonly type = PaymentActionType.CheckoutSquareSuccess;

  constructor(public readonly squareSessionUrl: string) { }
}

export class CheckoutSquareFailed implements Action {
  readonly type = PaymentActionType.CheckoutSquareFailed;

  constructor(public readonly errorMessage: any) { }
}

export class CompleteSquarePayment implements Action {
  readonly type = PaymentActionType.CompleteSquarePayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string) { }
}

export class CompleteSquarePaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteSquarePaymentSuccess;

  constructor() { }
}

export class CompleteSquarePaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteSquarePaymentFailed;

  constructor(public readonly errorMessage: any) { }
}

export class ClearSquarePayment implements Action {
  readonly type = PaymentActionType.ClearSquarePayment;

  constructor() { }
}

// Viva
export class ClearVivaPayment implements Action {
  readonly type = PaymentActionType.ClearVivaPayment;

  constructor() {}
}

export class CompleteVivaPayment implements Action {
  readonly type = PaymentActionType.CompleteVivaPayment;
  constructor(
    public readonly storeId: number, public readonly orderUuid: string,
    public readonly orderCode: number, public readonly eventId: number,
    public readonly eci: number, public readonly aliasName: string, public readonly transId?: string,
    public readonly redirectUrl?: string, public readonly redirectThankyouUrl?: string, public readonly isStandaloneOrder?: boolean){}
}
// Paymentsense

export class CreatePaymentsenseToken implements Action {
  readonly type = PaymentActionType.CreatePaymentsenseToken;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreatePaymentsenseTokenSuccess implements Action {
  readonly type = PaymentActionType.CreatePaymentsenseTokenSuccess;

  constructor(public readonly token: PaymentsenseToken) {}
}

export class CreatePaymentsenseTokenFailed implements Action {
  readonly type = PaymentActionType.CreatePaymentsenseTokenFailed;

  constructor() {}
}

export class ClearPaymentsense implements Action {
  readonly type = PaymentActionType.ClearPaymentsense;

  constructor() {}
}

export class CompletePaymentsensePayment implements Action {
  readonly type = PaymentActionType.CompletePaymentsensePayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CompletePaymentsensePaymentSuccess implements Action {
  readonly type = PaymentActionType.CompletePaymentsensePaymentSuccess;

  constructor() {}
}

export class CompletePaymentsensePaymentFailed implements Action {
  readonly type = PaymentActionType.CompletePaymentsensePaymentFailed;

  constructor() {}
}

// TrustPayments

export class CreateTrustPaymentsRequestJSON implements Action {
  readonly type = PaymentActionType.CreateTrustPaymentsRequestJSON;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateTrustPaymentsRequestJSONSuccess implements Action {
  readonly type = PaymentActionType.CreateTrustPaymentsRequestJSONSuccess;

  constructor(public readonly token: TrustPaymentsRequestJSON) {}
}

export class CreateTrustPaymentsRequestJSONFailed implements Action {
  readonly type = PaymentActionType.CreateTrustPaymentsRequestJSONFailed;

  constructor() {}
}

export class ClearTrustPaymentsPayment implements Action {
  readonly type = PaymentActionType.ClearTrustPaymentsPayment;

  constructor() {}
}

export class CompleteTrustPaymentsPayment implements Action {
  readonly type = PaymentActionType.CompleteTrustPaymentsPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly paymentInfo: TrustPaymentsPaymentInfo) {}
}

export class CompleteTrustPaymentsPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteTrustPaymentsPaymentSuccess;

  constructor() {}
}

export class CompleteTrustPaymentsPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteTrustPaymentsPaymentFailed;

  constructor() {}
}

export class CreateJCCRequestJSON implements Action {
  readonly type = PaymentActionType.CreateJCCRequestJSON;

  constructor(public readonly storeId: number, public readonly orderUuid: string) {}
}

export class CreateJCCRequestJSONSuccess implements Action {
  readonly type = PaymentActionType.CreateJCCRequestJSONSuccess;

  constructor(public readonly token: JCCRequestJSON) {}
}

export class CreateJCCRequestJSONFailed implements Action {
  readonly type = PaymentActionType.CreateJCCRequestJSONFailed;

  constructor() {}
}

export class ClearJCCPayment implements Action {
  readonly type = PaymentActionType.ClearJCCPayment;

  constructor() {}
}

export class CompleteJCCPayment implements Action {
  readonly type = PaymentActionType.CompleteJCCPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly paymentInfo: JCCPaymentInfo) {}
}

export class CompleteJCCPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteJCCPaymentSuccess;

  constructor() {}
}

export class CompleteJCCPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteJCCPaymentFailed;

  constructor() {}
}

export class CompleteVivaPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteVivaPaymentSuccess;

  constructor(public readonly paymentSuccess = false, public readonly storeId: number, public readonly orderUuid: string,
              public readonly aliasName: string, public readonly redirectUrl?: string, public readonly redirectThankyouUrl?: string) {}
}

export class CompleteVivaPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteVivaPaymentFailed;

  constructor() {}
}

export class SetPaymentRedirectInfo implements Action {
readonly type = PaymentActionType.SetPaymentRedirectInfo
;

constructor(public readonly info: PaymentRedirectInfo) { }
}

export class ClearPaymentRedirectInfo implements Action {
readonly type = PaymentActionType.ClearPaymentRedirectInfo;

constructor() { }
}

// Payment
export class InitiateOrderPayment implements Action {
  readonly type = PaymentActionType.InitiateOrderPayment;

  constructor(
    public readonly storeId: number,
    public readonly orderUuid: string,
    public readonly originType?:string,
    public readonly originDomain?:string,
    public readonly paymentMethod?: string,
  ) {}
}

export class InitiateOrderPaymentSuccess implements Action {
  readonly type = PaymentActionType.InitiateOrderPaymentSuccess;

  constructor(public readonly initiateOrderPaymentResponse: InitiateOrderPaymentResponse) {}
}


export class InitiateOrderPaymentFailed implements Action {
  readonly type = PaymentActionType.InitiateOrderPaymentFailed;

  constructor() {}
}

export class CompleteOrderPayment implements Action {
  readonly type = PaymentActionType.CompleteOrderPayment;

  constructor(public readonly storeId: number, public readonly orderUuid: string, public readonly orderPaymentInfo: OrderPaymentInfo) {}
}

export class CompleteOrderPaymentSuccess implements Action {
  readonly type = PaymentActionType.CompleteOrderPaymentSuccess;

  constructor(public readonly order: any) {}
}


export class CompleteOrderPaymentFailed implements Action {
  readonly type = PaymentActionType.CompleteOrderPaymentFailed;

  constructor(public readonly order: any) {}
}

export class ClearOrderPayment implements Action {
  readonly type = PaymentActionType.ClearOrderPayment;

  constructor(public readonly event?: Event) {}
}

export class FetchPaymentStatus implements Action {
  readonly type = PaymentActionType.FetchPaymentStatus;
  constructor(
    public readonly storeId: number,
    public readonly paymentId: string,
    public readonly isStandalonePayment: boolean,
  ) {}
}

export class SetGlobalPayRequestJson implements Action {
  readonly type = PaymentActionType.setGlobalPayRequestJson;
  constructor(
    public readonly requestJSON: any
  ) {}
}
export class SetGlobalPayRequestJsonSuccess implements Action {
  readonly type = PaymentActionType.setGlobalPayRequestJsonSuccess;
  constructor() {}
}

export class SetRmsRequestJson implements Action {
  readonly type = PaymentActionType.setRmsRequestJson;
  constructor(
    public readonly requestJSON: any
  ) {}
}
export class SetRmsRequestJsonSuccess implements Action {
  readonly type = PaymentActionType.setRmsRequestJsonSuccess;
  constructor() {}
}

export class RedirectPaymentProviderPage implements Action {
  readonly type = PaymentActionType.redirectPaymentProviderPage;
  constructor(
    public readonly hppUrl: string,
    public readonly responseUrl: string,
    public readonly jsonFromRequestEndpoint: any
  ) {}
}

export class RedirectPaymentProviderPageSuccess implements Action {
  readonly type = PaymentActionType.redirectPaymentProviderPageSuccess;
  constructor() {}
}

export class CompletePayment implements Action {
  readonly type = PaymentActionType.CompletePayment;
  constructor(
    public readonly storeId: number,
    public readonly orderUuid: string,
    public readonly paymentProviderResponse: any,
    public readonly isStandaloneOrder: boolean,
    public readonly redirectUrl: string
  ){}
}

export class CompletePaymentSuccess implements Action {
  readonly type = PaymentActionType.CompletePaymentSuccess;
  constructor(
    public readonly redirectThankyouUrl: string
  ){}
}

export class CompletePaymentFailed implements Action {
  readonly type = PaymentActionType.CompletePaymentFailed;
  constructor(
  ){}
}


export type PaymentStoresAction =
  ObtainToken
  | ObtainTokenSuccess
  | ObtainTokenFailed
  | CreatePaypalOrder
  | CreatePaypalOrderSuccess
  | CreatePaypalOrderFailed
  // STRIPE
  // Square
  | CheckoutSquare
  | CheckoutSquareSuccess
  | CheckoutSquareFailed
  | CompleteSquarePayment
  | CompleteSquarePaymentSuccess
  | CompleteSquarePaymentFailed
  | ClearSquarePayment
  // Viva
  | ClearVivaPayment
  | CompleteVivaPayment
  | CompleteVivaPaymentSuccess
  | CompleteVivaPaymentFailed
  // Paymentsense
  | CreatePaymentsenseToken
  | CreatePaymentsenseTokenSuccess
  | CreatePaymentsenseTokenFailed
  | ClearPaymentsense
  | CompletePaymentsensePayment
  | CompletePaymentsensePaymentSuccess
  | CompletePaymentsensePaymentFailed
  // TrustPayments
  | CreateTrustPaymentsRequestJSON
  | CreateTrustPaymentsRequestJSONSuccess
  | CreateTrustPaymentsRequestJSONFailed
  | ClearTrustPaymentsPayment
  | CompleteTrustPaymentsPayment
  | CompleteTrustPaymentsPaymentSuccess
  | CompleteTrustPaymentsPaymentFailed
  // JCC
  | CreateJCCRequestJSON
  | CreateJCCRequestJSONSuccess
  | CreateJCCRequestJSONFailed
  | ClearJCCPayment
  | CompleteJCCPayment
  | CompleteJCCPaymentSuccess
  | CompleteJCCPaymentFailed
  | SetPaymentRedirectInfo
  | ClearPaymentRedirectInfo
  // Order Payment
  | InitiateOrderPayment
  | InitiateOrderPaymentSuccess
  | InitiateOrderPaymentFailed
  | CompleteOrderPayment
  | CompleteOrderPaymentSuccess
  | CompleteOrderPaymentFailed
  | ClearOrderPayment
  | FetchPaymentStatus

  | SetGlobalPayRequestJson
  | SetGlobalPayRequestJsonSuccess
  | SetRmsRequestJson
  | SetRmsRequestJsonSuccess
  | RedirectPaymentProviderPage
  | RedirectPaymentProviderPageSuccess

  | CompletePayment
  | CompletePaymentSuccess
  | CompletePaymentFailed
  ;
