import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StandalonePaymentAdminState } from './stores.reducer';

export const getCreatedStandaloneOrder = createFeatureSelector<StandalonePaymentAdminState>('standalonePaymentAdminState');
export const getCreatedStandaloneOrderData = createSelector(getCreatedStandaloneOrder,
    (state: StandalonePaymentAdminState) => state.standalonePaymentAdminOrderState);
