import { combineReducers } from '@ngrx/store';
import { Paging } from '../../api/types/Pageable';
import { Tenant } from '../platform';
import { PlatformAction, PlatformActionType } from './platform.actions';
import { User } from 'src/app/stores/stores';

export interface TenantUsersList {
  data: User[],
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
}

export interface Platform {
  tenantsList: TenantsList;
  tenant: SelectedTenant;
  tenantUsersList: TenantUsersList;
}

export interface SelectedTenant {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  selectedTenant: Tenant;
}

export interface TenantsList {
  status: 'INITIAL' | 'LOADING' | 'LOADED' | 'FAILED';
  data: Tenant[];
  paging: Paging;
  totalPages: number;
}

export const platformInitialState: Platform = {
  tenantsList: {
    status: 'INITIAL',
    data: [],
    paging: { page: 0, size: 20 },
    totalPages: 0
  },
  tenant: {
    status: 'INITIAL',
    selectedTenant: null
  },
  tenantUsersList: {
    status: 'INITIAL',
    data: []
  }
};

export function tenantsList(state: TenantsList = platformInitialState.tenantsList, action: PlatformAction): TenantsList {

  switch (action.type) {
    case PlatformActionType.LoadTenants:
      return { ...state, status: 'LOADING', paging: action.paging };
    case PlatformActionType.LoadTenantsSuccess:
      return {
        status: 'LOADED',
        data: action.tenants.allTenants,
        paging: { ...state.paging, page: action.tenants.pageNumber },
        totalPages: action.tenants.totalPages
      };
    case PlatformActionType.LoadTenantsFailed:
      return { ...platformInitialState.tenantsList, status: 'FAILED' };
    case PlatformActionType.CreateTenant:
      return { ...state, status: 'LOADING'};
    case PlatformActionType.CreateTenantSuccess:
        return {...state, status: 'LOADED'};
    case PlatformActionType.CreateTenantFailed:
        return {...state, status: 'FAILED'};
    default:
      return state;
  }
}

export function tenant(state: SelectedTenant = platformInitialState.tenant, action: PlatformAction): SelectedTenant {

  switch (action.type) {
    case PlatformActionType.LoadSelectedTenant:
      return {...state, status: 'LOADING'};
    case PlatformActionType.LoadSelectedTenantSuccess:
      return {...state, status:'LOADED', selectedTenant: action.tenant };
    case PlatformActionType.LoadSelectedTenantFailed:
      return {...state, status: 'FAILED'};
    default:
      return state;
  }
}

export function tenantUsersList(state: TenantUsersList = platformInitialState.tenantUsersList, action: PlatformAction): TenantUsersList {

  switch (action.type) {
    case PlatformActionType.LoadTenantUsers:
      return {...state, status: 'LOADING'};
    case PlatformActionType.LoadTenantUsersSuccess:
      return {...state, status:'LOADED', data: action.users };
    case PlatformActionType.LoadTenantUsersFailed:
      return {...state, status: 'FAILED'};
    default:
      return state;
  }
}

const platformReducer: (state: Platform, action: PlatformAction) => Platform = combineReducers({
  tenantsList,
  tenant,
  tenantUsersList
});

export function platformsReducer(state: Platform = platformInitialState, action: PlatformAction): Platform {
  return platformReducer(state, action);
}
