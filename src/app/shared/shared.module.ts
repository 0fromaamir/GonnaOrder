import { ApiModule } from './../api/api.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagerComponent } from './pager/pager.component';
import { UserDetailsFormComponent } from './user-details-form/user-details-form.component';
import { DownloadDirective } from './download.directive';
import { EnumPipe } from './enum.pipe';
import { HighlightSearchPipe } from './highlight-search/highlights-search.pipe';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { DisableControlDirective } from './disable-control.directive';
import { LocalizedDatePipe } from './localized-date.pipe';
import { LocalizedCurrencyPipe } from './localized-currency.pipe';
import { FormatPrice } from './format-price.pipe';
import { HelpIconComponent } from './help-icon/help-icon.component';
import { PriceInputComponent } from './price-input/price-input.component';
import { PreventDoubleClickDirective } from './directives/prevent-double-click.directive';
import { NotificationSoundDirective } from './directives/notification-sound.directive';
import { NgxTrimDirective, NgxTrimDirectiveModule } from 'ngx-trim-directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MonthDatePickerComponent } from './month-date-picker/month-date-picker.component';
import { DayDatePickerComponent } from './day-date-picker/day-date-picker.component';
import { GoTimepickerComponent } from './go-timepicker/go-timepicker.component';
import { AuthEffects } from '../auth/+state/auth.effects';
import { AUTH_LOCAL_STORAGE_KEY, AUTH_STORAGE_KEYS, AUTH_CONFIG_TOKEN } from '../auth/auth.tokens';
import { LocalStorageService } from '../local-storage.service';
import { storageMetaReducer } from '../storage.metareducer';
import { UserLoginComponent } from './user-login/user-login.component';
import { GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import {CommonFormModule} from "./common-form/common-form.module";
import { PhoneInputComponent } from './phone-input/phone-input.component';
import { LoadingPanelComponent } from './loading-panel/loading-panel.component';
import { PreventEnterDirective } from './directives/prevent-enter.directive';
import { CustomGoogleDirective } from './custom-google.directive';
import { GoToast } from './go-toast.component';
import { DialogComponent } from './dialog/dialog.component';

export function getAuthConfig(saveKeys: string, localStorageKey: string, storageService: LocalStorageService) {
  return {
    metaReducers: [storageMetaReducer(({tokens}) => ({tokens}), localStorageKey, storageService)]
  };
}

@NgModule({
  declarations: [
    PagerComponent, UserDetailsFormComponent, DownloadDirective, EnumPipe, HighlightSearchPipe,
    ImageUploadComponent, DisableControlDirective, LocalizedDatePipe, LocalizedCurrencyPipe,
    HelpIconComponent, FormatPrice, PriceInputComponent, PreventDoubleClickDirective,
    NotificationSoundDirective, MonthDatePickerComponent, DayDatePickerComponent, GoTimepickerComponent,
    UserLoginComponent, PhoneInputComponent, LoadingPanelComponent, PreventEnterDirective, CustomGoogleDirective, DialogComponent,
    GoToast
  ],
  providers: [
    AuthEffects,
    {provide: AUTH_LOCAL_STORAGE_KEY, useValue: '__auth_storage__'},
    {provide: AUTH_STORAGE_KEYS, useValue: 'auth'},
    {
      provide: AUTH_CONFIG_TOKEN,
      deps: [AUTH_STORAGE_KEYS, AUTH_LOCAL_STORAGE_KEY, LocalStorageService],
      useFactory: getAuthConfig
    }
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    ApiModule,
    TranslateModule,
    NgxTrimDirectiveModule,
    GoogleSigninButtonModule,
    CommonFormModule
  ],
  exports: [
    PagerComponent, UserDetailsFormComponent, DownloadDirective, EnumPipe, HighlightSearchPipe, ImageUploadComponent,
    TranslateModule, DisableControlDirective, LocalizedDatePipe, LocalizedCurrencyPipe,
    HelpIconComponent, FormatPrice, PriceInputComponent, PreventDoubleClickDirective,
    NotificationSoundDirective, NgxTrimDirective, MonthDatePickerComponent, DayDatePickerComponent, GoTimepickerComponent,
    UserLoginComponent, CommonFormModule, PhoneInputComponent, LoadingPanelComponent, PreventEnterDirective, CustomGoogleDirective,
    GoToast
  ]
})
export class SharedModule { }
