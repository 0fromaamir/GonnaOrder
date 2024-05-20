export interface CreateStandalonePaymentRequest {
    locationReference?: number;
    orderReference?: string;
    tapId?: string;
    amountReference?: number;
    deviceIdentifier?: string;
    referenceType?: string;
}

export interface UpdateStandalonePaymentRequest{
    amountSelected?: number;
    amountTip?: number;
    tipPercentage?: number;
    divideBillBy?: number;
    referenceType?: string;
    customerName?: string;
    paymentStatus?: string;
}

export interface StandalonePaymentOrder {
    id: string;
    storeId: string;
    order?: string;
    tapId?: string;
    paymentType?: string;
    amountReference?: number;
    amountSelected?: number;
    amountTip?: number;
    divideBillBy?: number;
    amountTotal?: number;
    tipPercentage?: number;
    currency?: number;
    customerName?: string;
    location?: number;
    deviceIdentifier?: string;
    createdAt?: string;
    updatedAt?: string;
    paymentTransactionId?: string;
    paymentMethod?: string;
    paymentProviderIdentifier?: string;
    referenceType?: string;
    paymentStatus?: string;
    possibleTips?: PossibleTips[];
    formattedAmountReference?: string;
    currencySymbol?: string;
    currencyIsoCode?: string;
    locale?: string;
    checkoutUrl?: string;
    paymentFormParams?: any;
    storeLogo?: string;
}

interface PossibleTips {
    position: number;
    tipPercentage: number;
    tipAmount: number;
}
