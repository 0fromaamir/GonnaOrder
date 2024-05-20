import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Platform } from './platform.reducer';

export const getPlatformState = createFeatureSelector<Platform>('platform');
export const getTenantsList = createSelector(getPlatformState, (state: Platform) => state.tenantsList.data);
export const getSelectedTenant = createSelector(getPlatformState, (state: Platform) => state.tenant);
export const getTenantUsersList = createSelector(getPlatformState, (state: Platform) => state.tenantUsersList);