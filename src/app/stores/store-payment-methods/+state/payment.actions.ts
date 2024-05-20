import { Action } from '@ngrx/store';

export enum StorePaymentMethodsActionType {
  ToggleStripe = '[storesPaymentMethods] ToggleStripe',
  ToggleStripeSuccess = '[storesPaymentMethods] ToggleStripeSuccess',
  ToggleStripeFailed = '[storesPaymentMethods] ToggleStripeFailed',
  ConnectStripe = '[storesPaymentMethods] ConnectStripe',
  DisconnectStripe = '[storesPaymentMethods] DisconnectStripe',
  DisconnectStripeSuccess = '[storesPaymentMethods] DisconnectStripeSuccess',
  DisconnectStripeFailed = '[storesPaymentMethods] DisconnectStripeFailed',

  TogglePaypal = '[storesPaymentMethods] TogglePaypal',
  TogglePaypalSuccess = '[storesPaymentMethods] TogglePaypalSuccess',
  TogglePaypalFailed = '[storesPaymentMethods] TogglePaypalFailed',
  ConnectPaypal = '[storesPaymentMethods] ConnectPaypal',
  DisconnectPaypal = '[storesPaymentMethods] DisconnectPaypal',
  DisconnectPaypalSuccess = '[storesPaymentMethods] DisconnectPaypalSuccess',
  DisconnectPaypalFailed = '[storesPaymentMethods] DisconnectPaypalFailed',
  ToggleSquare = '[storesPaymentMethods] ToggleSquare',
  ToggleSquareSuccess = '[storesPaymentMethods] ToggleSquareSuccess',
  ToggleSquareFailed = '[storesPaymentMethods] ToggleSquareFailed',

  ConnectPaymentsense = '[storesPaymentMethods] ConnectPaymentsense',
  ConnectPaymentsenseSuccess = '[storesPaymentMethods] ConnectPaymentsenseSuccess',
  ConnectPaymentsenseFailed = '[storesPaymentMethods] ConnectPaymentsenseFailed',
  ConnectRMS = '[storesPaymentMethods] ConnectRMS',
  ConnectRMSSuccess = '[storesPaymentMethods] ConnectRMSSuccess',
  ConnectRMSFailed = '[storesPaymentMethods] ConnectRMSFailed',
  ConnectJCC = '[storesPaymentMethods] ConnectJCC',
  ConnectJCCSuccess = '[storesPaymentMethods] ConnectJCCSuccess',
  ConnectJCCFailed = '[storesPaymentMethods] ConnectJCCFailed'  ,
  DisConnectJCC = '[storesPaymentMethods] DisConnectJCC',
  DisConnectJCCSuccess = '[storesPaymentMethods] DisConnectJCCSuccess',
  DisConnectJCCFailed = '[storesPaymentMethods] DisConnectJCCFailed',
  ConnectTrustPayments = '[storesPaymentMethods] ConnectTrustPayments',
  ConnectTrustPaymentsSuccess = '[storesPaymentMethods] ConnectTrustPaymentsSuccess',
  ConnectTrustPaymentsFailed = '[storesPaymentMethods] ConnectTrustPaymentsFailed',
  DisconnectTrustPayments = '[storesPaymentMethods] DisconnectTrustPayments',
  DisconnectTrustPaymentsSuccess = '[storesPaymentMethods] DisconnectTrustPaymentsSuccess',
  DisconnectTrustPaymentsFailed = '[storesPaymentMethods] DisconnectTrustPaymentsFailed',

  ConnectVivaPayments = '[storesPaymentMethods] ConnectVivaPayments',
  ConnectVivaPaymentsSuccess = '[storesPaymentMethods] ConnectVivaPaymentsSuccess',
  ConnectVivaPaymentsFailed = '[storesPaymentMethods] ConnectVivaPaymentsFailed',
  DisconnectVivaPayments = '[storesPaymentMethods] DisconnectVivaPayments',
  DisconnectVivaPaymentsSuccess = '[storesPaymentMethods] DisconnectVivaPaymentsSuccess',
  DisconnectVivaPaymentsFailed = '[storesPaymentMethods] DisconnectVivaPaymentsFailed',

  ConnectPayabl = '[storesPaymentMethods] ConnectPayabl',
  ConnectPayablSuccess = '[storesPaymentMethods] ConnectPayablSuccess',
  ConnectPayablFailed = '[storesPaymentMethods] ConnectPayablFailed'  ,
  DisConnectPayabl = '[storesPaymentMethods] DisConnectPayabl',
  DisConnectPayablSuccess = '[storesPaymentMethods] DisConnectPayablSuccess',
  DisConnectPayablFailed = '[storesPaymentMethods] DisConnectPayablFailed',

  ConnectGlobalPay = '[storesPaymentMethods] ConnectGlobalPay',
  ConnectGlobalPayFailed = '[storesPaymentMethods] ConnectGlobalPayFailed'  ,
  DisConnectGlobalPay = '[storesPaymentMethods] DisConnectGlobalPay',
  DisConnectGlobalPayFailed = '[storesPaymentMethods] DisConnectGlobalPayFailed',

  ConnectMollie = '[storesPaymentMethods] ConnectMollie',
  ConnectMollieFailed = '[storesPaymentMethods] ConnectMollieFailed',
  DisConnectMollie = '[storesPaymentMethods] DisConnectMollie',
  DisConnectMollieFailed = '[storesPaymentMethods] DisConnectMollieFailed',

  ConnectFygaro = '[storesPaymentMethods] ConnectFygaro',
  ConnectFygaroFailed = '[storesPaymentMethods] ConnectFygaroFailed'  ,
  DisConnectFygaro = '[storesPaymentMethods] DisConnectFygaro',
  DisConnectFygaroFailed = '[storesPaymentMethods] DisConnectFygaroFailed',

  ConnectEpay = '[storesPaymentMethods] ConnectEpay',
  ConnectEpayFailed = '[storesPaymentMethods] ConnectEpayFailed',
  DisConnectEpay = '[storesPaymentMethods] DisConnectEpay',
  DisConnectEpayFailed = '[storesPaymentMethods] DisConnectEpayFailed',

  ConnectApcopay = '[storesPaymentMethods] ConnectApcopay',
  ConnectApcopayFailed = '[storesPaymentMethods] ConnectApcopayFailed'  ,
  DisConnectApcopay = '[storesPaymentMethods] DisConnectApcopay',
  DisConnectApcopayFailed = '[storesPaymentMethods] DisConnectApcopayFailed',

  ConnectHobex = '[storesPaymentMethods] ConnectHobex',
  ConnectHobexFailed = '[storesPaymentMethods] ConnectHobexFailed',
  DisconnectHobex = '[storesPaymentMethods] DisconnectHobex',
  DisconnectHobexFailed = '[storesPaymentMethods] DisconnectHobexFailed'

}

// Stripe integration
export class ToggleStripe implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleStripe;

  constructor(public readonly key: string, public readonly enabled: boolean) {}
}

export class ToggleStripeSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleStripeSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ToggleStripeFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleStripeFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectStripe implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectStripe;

  constructor() {}
}

export class DisconnectStripe implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectStripe;

  constructor() {}
}

export class DisconnectStripeSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectStripeSuccess;

  constructor() {}
}

export class DisconnectStripeFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectStripeFailed;

  constructor(public readonly errorMessages: string[]) {}
}

// Paypal integration
export class TogglePaypal implements Action {
  readonly type = StorePaymentMethodsActionType.TogglePaypal;

  constructor(public readonly enabled: boolean) {}
}

export class TogglePaypalSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.TogglePaypalSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class TogglePaypalFailed implements Action {
  readonly type = StorePaymentMethodsActionType.TogglePaypalFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectPaypal implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaypal;

  constructor() {}
}

export class DisconnectPaypal implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectPaypal;

  constructor() {}
}

export class DisconnectPaypalSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectPaypalSuccess;

  constructor() {}
}

export class DisconnectPaypalFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectPaypalFailed;

  constructor(public readonly errorMessages: string[]) {}
}

// Suqare integration
export class ToggleSquare implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleSquare;

  constructor(public readonly enabled: boolean) {}
}

export class ToggleSquareSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleSquareSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ToggleSquareFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ToggleSquareFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectPaymentsense implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaymentsense;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectPaymentsenseSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaymentsenseSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectPaymentsenseFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPaymentsenseFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectRMS implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectRMS;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectRMSSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectRMSSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectRMSFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectRMSFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectJCC implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectJCC;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectJCCSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectJCCSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectJCCFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectJCCFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectJCC implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectJCC;

  constructor() {}
}

export class DisConnectJCCSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectJCCSuccess;

  constructor() {}
}

export class DisConnectJCCFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectJCCFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectTrustPayments implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectTrustPayments;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectTrustPaymentsSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectTrustPaymentsSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectTrustPaymentsFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectTrustPaymentsFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisconnectTrustPayments implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectTrustPayments;

  constructor() {}
}

export class DisconnectTrustPaymentsSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectTrustPaymentsSuccess;

  constructor() {}
}

export class DisconnectTrustPaymentsFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectTrustPaymentsFailed;

  constructor(public readonly errorMessages: string[]) {}
}


export class ConnectVivaPayments implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectVivaPayments;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectVivaPaymentsSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectVivaPaymentsSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectVivaPaymentsFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectVivaPaymentsFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisconnectVivaPayments implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectVivaPayments;

  constructor() {}
}

export class DisconnectVivaPaymentsSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectVivaPaymentsSuccess;

  constructor() {}
}

export class DisconnectVivaPaymentsFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectVivaPaymentsFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectPayabl implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPayabl;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectPayablSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPayablSuccess;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectPayablFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectPayablFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectPayabl implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectPayabl;

  constructor() {}
}

export class DisConnectPayablSuccess implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectPayablSuccess;

  constructor() {}
}

export class DisConnectPayablFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectPayablFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectGlobalPay implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectGlobalPay;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectGlobalPayFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectGlobalPayFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectGlobalPay implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectGlobalPay;

  constructor() {}
}

export class DisConnectGlobalPayFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectGlobalPayFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectMollie implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectMollie;

  constructor() {}
}

export class ConnectMollieFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectMollieFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectMollie implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectMollie;

  constructor() {}
}

export class DisConnectMollieFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectMollieFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectFygaro implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectFygaro;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectFygaroFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectFygaroFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectFygaro implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectFygaro;

  constructor() {}
}

export class DisConnectFygaroFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectFygaroFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectEpay implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectEpay;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectEpayFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectEpayFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectEpay implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectEpay;

  constructor() {}
}

export class DisConnectEpayFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectEpayFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectApcopay implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectApcopay;

  constructor(public readonly settings: {[key: string]: any}) {}
}

export class ConnectApcopayFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectApcopayFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisConnectApcopay implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectApcopay;

  constructor() {}
}

export class DisConnectApcopayFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisConnectApcopayFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class ConnectHobex implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectHobex;

  constructor(public readonly settings: { [key: string]: any }) {}
}

export class ConnectHobexFailed implements Action {
  readonly type = StorePaymentMethodsActionType.ConnectHobexFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export class DisconnectHobex implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectHobex;

  constructor() {}
}

export class DisconnectHobexFailed implements Action {
  readonly type = StorePaymentMethodsActionType.DisconnectHobexFailed;

  constructor(public readonly errorMessages: string[]) {}
}

export type StorePaymentMethodsAction =
  ToggleStripe
  | ToggleStripeFailed
  | ToggleStripeSuccess
  | ConnectStripe
  | DisconnectStripe
  | DisconnectStripeFailed
  | DisconnectStripeSuccess
  | TogglePaypal
  | TogglePaypalFailed
  | TogglePaypalSuccess
  | ConnectPaypal
  | DisconnectPaypal
  | DisconnectPaypalFailed
  | DisconnectPaypalSuccess
  | ToggleSquare
  | ToggleSquareFailed
  | ToggleSquareSuccess
  | ConnectPaymentsense
  | ConnectPaymentsenseSuccess
  | ConnectPaymentsenseFailed
  | ConnectRMS
  | ConnectRMSSuccess
  | ConnectRMSFailed
  | ConnectJCC
  | ConnectJCCSuccess
  | ConnectJCCFailed
  | DisConnectJCC
  | DisConnectJCCSuccess
  | DisConnectJCCFailed
  | ConnectTrustPayments
  | ConnectTrustPaymentsSuccess
  | ConnectTrustPaymentsFailed
  | DisconnectTrustPayments
  | DisconnectTrustPaymentsSuccess
  | DisconnectTrustPaymentsFailed
  | ConnectVivaPayments
  | ConnectVivaPaymentsSuccess
  | ConnectVivaPaymentsFailed
  | DisconnectVivaPayments
  | DisconnectVivaPaymentsSuccess
  | DisconnectVivaPaymentsFailed
  | ConnectPayabl
  | ConnectPayablSuccess
  | ConnectPayablFailed
  | DisConnectPayabl
  | DisConnectPayablSuccess
  | DisConnectPayablFailed
  | ConnectGlobalPay
  | ConnectGlobalPayFailed
  | DisConnectGlobalPay
  | DisConnectGlobalPayFailed
  | ConnectMollie
  | ConnectMollieFailed
  | DisConnectMollie
  | DisConnectMollieFailed
  | ConnectFygaro
  | ConnectFygaroFailed
  | DisConnectFygaro
  | DisConnectFygaroFailed
  | ConnectEpay
  | ConnectEpayFailed
  | DisConnectEpay
  | DisConnectEpayFailed
  | ConnectApcopay
  | ConnectApcopayFailed
  | DisConnectApcopay
  | DisConnectApcopayFailed
  | ConnectHobex
  | ConnectHobexFailed
  | DisconnectHobex
  | DisconnectHobexFailed
;
