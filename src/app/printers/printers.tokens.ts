import { InjectionToken } from "@angular/core";
import { StoreConfig } from '@ngrx/store';
import { PrintersAction } from './+state/printers.actions';
import { PrintersState } from './+state/printers.reducer';

export const PRINTERS_LOCAL_STORAGE_KEY = new InjectionToken<string>('PrintersStorage');
export const PRINTERS_CONFIG_TOKEN = new InjectionToken<StoreConfig<PrintersState, PrintersAction>>('PrintersConfigToken');