import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PrintersEffects } from './+state/printers.effects';
import { PrintersRoutingModule } from './printers-routing.module';
import { PrintersListComponent } from './printers-list/printers-list.component';
import { RegisterPrinterPopupComponent } from './register-printer-popup/register-printer-popup.component';
import { LocalStorageService } from '../local-storage.service';
import { storageMetaReducer } from '../storage.metareducer';
import { PRINTERS_LOCAL_STORAGE_KEY, PRINTERS_CONFIG_TOKEN } from './printers.tokens';

import { MatIconModule } from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { printersReducer } from './+state/printers.reducer';
import { PrinterListPopupComponent } from './printer-list-popup/printer-list-popup.component';
import { ToastrModule } from 'ngx-toastr';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { SelectPrinterPopupComponent } from './select-printer-popup/select-printer-popup.component';

export function getPrintersConfig(
  localStorageKey: string,
  storageService: LocalStorageService
) {
  return { metaReducers: [storageMetaReducer(({ list, autoprintState }) => ({ list, autoprintState }), localStorageKey, storageService)] };
}

@NgModule({
  declarations: [
    PrintersListComponent,
    RegisterPrinterPopupComponent,
    PrinterListPopupComponent,
    SelectPrinterPopupComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PrintersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    EffectsModule.forFeature([PrintersEffects]),
    StoreModule.forFeature('printers', printersReducer, PRINTERS_CONFIG_TOKEN),
    ToastrModule.forRoot({
      timeOut: 1000,
      positionClass: 'toast-bottom-right'
    })
  ],
  providers: [
    { 
      provide: PRINTERS_LOCAL_STORAGE_KEY, 
      useValue: '__printers_storage__' 
    },
    {
      provide: PRINTERS_CONFIG_TOKEN,
      deps: [PRINTERS_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getPrintersConfig
    },
    File,
  ],
  exports: [
    PrintersListComponent,
  ],
  entryComponents: [
    PrintersListComponent,
    RegisterPrinterPopupComponent,
    PrinterListPopupComponent,
  ]
})
export class PrintersModule { }
