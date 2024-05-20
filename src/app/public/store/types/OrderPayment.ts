export interface InitiateOrderPaymentResponse {
  checkoutUrl?: string;
  intentId?: string;
  paymentParams: PaymentParams;
  paymentFormParams: PaymentFormParams;
  paymentMethod?: string;
  originDomain?: string;
  originType?: string;
  storeAliasName?: string;
}

export interface PaymentParams {
  PAYMENT_REFERENCE: string;
}

export interface PaymentFormParams {
  storeId: number;
  storeAlias: string;
  accountId: string;
  merchantId: string;
  sharedSecret: string;
  serviceUrl: string;
  totalAmount: number;
  currency: string;
  clientReference: string;
  customerEmail: string;
  customerPhoneNumber?: any;
  description: string;
  orderId: string;
  orderType?: any;
  paymentId: string;
  paymentType?: any;
  responseUrl: string;
  callbackUrl: string;
  cancelUrl: string;
  version?: string;
  acquirerId?: string;
  formattedPurchaseAmount?: string;
  currencyExponent?: string;
  captureFlag?: string;
  signature?: string;
  signatureMethod?: string;

  // trust payments
  siteReference?: string;
  webserviceUser?: string;
  webservicePassword?: string;
  stProfile?: string;
  stDefaultProfile?: string;
  currencyIso3a?: string;
  mainAmount?: string;
  orderReference?: string;
  ruleIdentifiers?: string[];
  stextraUrlRedirectFields?: string[];
  successfulUrlRedirect?: string;
  declinedUrlRedirect?: string;
  errorUrlRedirect?: string;
  siteSecurityTimestamp?: string;
  siteSecurity?: string;

  // payment sense
  accessToken?: string;

  // fygaro
  jwt?: string;

  // epay
  posId?: string;
  username?: string;
  languageCode?: string;
  merchantReference?: string;
  parameters?: string;


  providerPaymentType?: string;
  successUrl?: string;
}
