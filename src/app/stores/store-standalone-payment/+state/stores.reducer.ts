import { StoreActionType, StoresAction } from './stores.actions';
import { combineReducers } from '@ngrx/store';
import { StandalonePaymentOrder } from 'src/app/public/store/types/StandalonePayment';


export interface StandalonePaymentAdminOrderState {
  status:
  'INITIAL'
  | 'ITEMSEARCHSUCCESS'
  | 'ITEMSEARCHFAILED'
  ;
  formattedOpenBalance: string;
  formattedTotalPaid: string;
  openBalance: number;
  standalonePaymentOrders: StandalonePaymentOrder[];
  totalPaid: number;
  totalPages: number;
}
export interface StandalonePaymentAdminState {
  standalonePaymentAdminOrderState: StandalonePaymentAdminOrderState;
}

export const standalonePaymentAdminInitialState: StandalonePaymentAdminState = {
  standalonePaymentAdminOrderState: {
    status: 'INITIAL',
    formattedOpenBalance: '',
    formattedTotalPaid: '',
    openBalance: 0,
    standalonePaymentOrders: [],
    totalPaid: 0,
    totalPages: 0,
  }
};

export function standalonePaymentAdminOrderState(
  state: StandalonePaymentAdminOrderState = standalonePaymentAdminInitialState.standalonePaymentAdminOrderState,
  action: StoresAction): StandalonePaymentAdminOrderState {
  switch (action.type) {
    case StoreActionType.AdminStandalonePaymentSearch:
      return { ...state, status: 'INITIAL' };
    case StoreActionType.AdminStandalonePaymentSearchSuccess:
      return { ...state, ...action.res, status: 'ITEMSEARCHSUCCESS' };
    case StoreActionType.AdminStandalonePaymentSearchFailed:
      return { ...state, status: 'ITEMSEARCHFAILED' };
    default:
      return state;
  }
}


const reducerStandalonePaymentOrders: (state: StandalonePaymentAdminState, action: StoresAction) =>
   StandalonePaymentAdminState = combineReducers({
    standalonePaymentAdminOrderState
  });

export function standalonePaymentAdminOrderReducer(
  state: StandalonePaymentAdminState = standalonePaymentAdminInitialState,
  action: StoresAction): StandalonePaymentAdminState {
  return reducerStandalonePaymentOrders(state, action);
}
