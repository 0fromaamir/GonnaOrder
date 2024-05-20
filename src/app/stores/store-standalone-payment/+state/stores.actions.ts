import { Action } from '@ngrx/store';
import { Paging } from 'src/app/api/types/Pageable';

export enum StoreActionType {
  AdminStandalonePaymentSearch = '[standalonePaymentAdminState] AdminStandalonePaymentSearch',
  AdminStandalonePaymentSearchSuccess = '[standalonePaymentAdminState] AdminStandalonePaymentSearchSuccess',
  AdminStandalonePaymentSearchFailed = '[standalonePaymentAdminState] AdminStandalonePaymentSearchFailed',
}

export class AdminStandalonePaymentSearch implements Action {
  readonly type = StoreActionType.AdminStandalonePaymentSearch;

  constructor(
    public readonly storeId: number,
    public readonly locationId?: string,
    public readonly tapId?: string,
    public readonly customerName?: string,
    public readonly paging?: Paging
  ) {}
}

export class AdminStandalonePaymentSearchSuccess implements Action {
  readonly type = StoreActionType.AdminStandalonePaymentSearchSuccess;

  constructor(public readonly res: any) {}
}


export class AdminStandalonePaymentSearchFailed implements Action {
  readonly type = StoreActionType.AdminStandalonePaymentSearchFailed;

  constructor() {}
}

export type StoresAction =
AdminStandalonePaymentSearch |
AdminStandalonePaymentSearchSuccess |
AdminStandalonePaymentSearchFailed;
