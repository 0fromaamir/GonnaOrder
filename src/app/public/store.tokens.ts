import { InjectionToken } from "@angular/core";
import { StoreConfig } from '@ngrx/store';
import { StoreAction } from './store/+state/stores.actions';
import { StoreRecents } from './store/+state/stores.reducer';

export const STORERECENTS_LOCAL_STORAGE_KEY = new InjectionToken<string>('StoreRecentsStorage');
export const STORERECENTS_CONFIG_TOKEN = new InjectionToken<StoreConfig<StoreRecents, StoreAction>>('StoreRecentsConfigToken');