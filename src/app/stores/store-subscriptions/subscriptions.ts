import dayjs from 'dayjs';

export type StoreSubscriptionStatus = 'VALID' | 'TRIAL' | 'TRIAL_EXCEEDED';

export type StorePurchaseStatus = 'DRAFT' | 'PAYMENT_IN_PROGRESS' | 'CLOSED' | 'REJECTED';

export interface PurchaseInvoiceResponse {
    blob: Blob;
    filename: string;
}
export interface ClientStoreSubscription {
    createdAt: string;
    status: StoreSubscriptionStatus;
    recurring: boolean;
}
export interface StoreSubscription {
    endDate: string;
    status: StoreSubscriptionStatus;
    recurring: boolean;
}
export interface StorePurchase {
    id: number;
    createdAt: string;
    updatedAt: string;
    price?: number;
    paymentId?: string;
    discountedPrice?: number;
    discount?: number;
    discountPercentage?: number;
    currency?: string;
    voucherCode?: string;
    status: StorePurchaseStatus;
    vatNumber?: string;
    vatPercentage?: number;
    vatCharge?: number;
    totalPrice?: number;
    vatChargeType?: string;
    paymentProvider?: string;
    yearlyPrice?: number;
    monthlyPrice?: number;
    subscriptionType?: string;
    recurringPayment: boolean;
}

export interface StorePurchaceUpdateRequest {
    voucherCode: string;
    vatNumber: string;
    status: StorePurchaseStatus;
    subscriptionType: SubscriptionType;
    recurringPayment: boolean;
}

export enum SubscriptionType {
    YEARLY,
    MONTHLY
}

export interface StripeCheckoutSession {
    sessionId: string;
    sessionUrl: string;
    stripePublicKey: string;
}

export interface GenerateSubscriptionPaymentLinkResponse {
  sessionUrl: string;
}

export function toSubscriptionStatus(status: StoreSubscriptionStatus): string {
    switch (status) {
        case 'VALID':
            return 'Active';
        case 'TRIAL':
            return 'Inactive - Limited Trial Functionality';
        case 'TRIAL_EXCEEDED':
            return 'Inactive - Trial Limit has been exceeded';
        default:
            return '';
    }
}

export function toClientSubscriptionStatus(clientSub: ClientStoreSubscription): string {
    if (clientSub.recurring && clientSub.status === 'VALID') {
        return 'admin.store.subscription.activeRecurring';
    }
    if (clientSub.status === 'VALID') {
        return 'admin.store.subscription.active';
    } else if (clientSub.status === 'TRIAL_EXCEEDED') {
        return 'admin.store.subscription.limitedFreemiumnumberof';
    } else if (clientSub.status === 'TRIAL') {
        const days = dayjs(new Date()).diff(dayjs(clientSub.createdAt), 'day');
        if (days <= 14) {
            return 'admin.store.subscription.fourteenfreetrial';
        } else if (days > 14) {
            return 'admin.store.subscription.limitedFreemium';
        }
    } else {
        return '';
    }
}
