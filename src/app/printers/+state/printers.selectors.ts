import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Printers } from '../printers';

export const getPrintersState = createFeatureSelector<Printers>('printers');
export const getPrintersList = createSelector(getPrintersState, (state: Printers) => state.list);
export const getPrinters = createSelector(getPrintersState, (state: Printers) => state.list.data);

export const getAutoprintSubscriptions = createSelector(getPrintersState, (state: Printers) => state.autoprintState.subscriptions);
export const getAutoprintQueue = createSelector(getPrintersState, (state: Printers) => state?.autoprintState?.autoprintQueue);
export const getAutoprintSubscriptionsByStoreId = createSelector(getPrintersState, (state: Printers, props) => Object.prototype.hasOwnProperty.call(state.autoprintState.subscriptions, props.storeId));


