import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  Paypal,
  Paymentsense,
  JCC,
  TrustPayments,
  PaymentRedirectInfoData,
  Square,
  OrderPayment,
  GlobalPay,
  RealexPayment, Rms
} from './payment.reducer';

export const getPaypalState = createFeatureSelector<Paypal>('currentPaypalState');
export const getPaypalStore = createSelector(getPaypalState, (state: Paypal) => state.paypalState);
export const getPaypalAccessToken = createSelector(getPaypalState, (state: Paypal) => state.paypalState.accessTokenData);
export const getPaypalOrderData = createSelector(getPaypalState, (state: Paypal) => state.paypalState.paypalOrderData);

export const getPaymentsenseStore = createFeatureSelector<Paymentsense>('currentPaymentsenseState');
export const getSquareStore = createFeatureSelector<Square>('currentSquareState');
export const getTrustPaymentsStore = createFeatureSelector<TrustPayments>('currentTrustPaymentsState');
export const getJCCStore = createFeatureSelector<JCC>('currentJCCState');

export const getOrderPaymentStore = createFeatureSelector<OrderPayment>('orderPaymentState');

export const getSelectedStorePaymentRedirectInfoState = createFeatureSelector<PaymentRedirectInfoData>('paymentRedirectInfo');
export const getPaymentRedirectInfo = createSelector(getSelectedStorePaymentRedirectInfoState,
    (state: PaymentRedirectInfoData) => state?.paymentRedirectInfo);


export const getGlobalPayStore = createFeatureSelector<GlobalPay>('globalPayState');
export const getRmsStore = createFeatureSelector<Rms>('rmsState');
export const getRealexPaymentStore = createFeatureSelector<RealexPayment>('realexPaymentState');
