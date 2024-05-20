import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomParser } from './translate.parser';
import { TranslateModule, TranslateLoader, TranslateParser, TranslateService } from '@ngx-translate/core';
import { ErrorInterceptor } from './error/error.interceptor';
import { ErrorModule } from './error/error.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpBackend, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { MetaReducer, StoreModule, USER_PROVIDED_META_REDUCERS } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TokenInterceptor } from './auth/token.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { WINDOW_PROVIDERS } from './public/window-providers';
import { SharedModule } from './shared/shared.module';
import { AuthActionType } from './auth/+state/auth.actions';
import { LoaderModule } from './loader/loader.module';
import { HttpClient } from '@angular/common/http';
import { CustomErrorHandler } from './error/custom-error-handler';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StripeVerificationComponent } from './stripe-verification.component';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider, GoogleInitOptions } from '@abacritt/angularx-social-login';
import { ApplicationStateModule } from './application-state/application-state.module';
import { ActionReducer } from 'ngx-bootstrap/mini-ngrx';
import { LogService } from './shared/logging/LogService';
import { CookieService } from 'ngx-cookie-service';
import { authReducer } from './auth/+state/auth.reducer';
import { AUTH_CONFIG_TOKEN } from './auth/auth.tokens';
import { ViewportService } from './shared/viewport.service';
import { ApiInterceptor } from './api/api.interceptor';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { APPMODE } from 'src/environments/appmode.enum';
import { CustomerTokenInterceptor } from './auth/customer-token.interceptor';
import { LayoutModule } from '@angular/cdk/layout';
import { GoToast } from './shared/go-toast.component';
import { goAdminAppImports } from './goadmin-app.module';
import { goTemplateAppImports } from './template-app.module';
import { goAppImports } from './gonnaorder-app.module';

/* Logs all state changes */
export function debugStateFactory(logger: LogService): MetaReducer<any> {
  return (reducer: ActionReducer<any>): ActionReducer<any> => {
    return (state, action) => {
      logger.debug('state action', action);

      return reducer(state, action);
    };
  };
}

export function clearState(reducer) {
  return (state, action) => {
    if (action.type === AuthActionType.LogoutSuccess) {
      state = undefined;
    }

    return reducer(state, action);
  };
}

export function getMetaReducers(logger: LogService): MetaReducer<any>[] {
  return [debugStateFactory(logger), clearState];
}

const googleLoginOptions: GoogleInitOptions = {
  oneTapEnabled: false,
  prompt: '',
  scopes: 'https://www.googleapis.com/auth/userinfo.profile'
};

const socialAuthConfig = {
  autoLogin: false,
  providers: [
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(environment.googleClientId, googleLoginOptions)
    },
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider(environment.facebookClientId)
    }
  ],
  onError: (e) => {
    if (e.error === 'idpiframe_initialization_failed') { // Showing a message and disabling Google Login, if cookies disabled
      document.querySelector('.google-btn').setAttribute('style', 'pointer-events: none; opacity: 0.4;');
    }
  }
} as SocialAuthServiceConfig;

export function provideSocialAuthConfig() {
  return socialAuthConfig;
}

@NgModule({
  declarations: [
    AppComponent,
    StripeVerificationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    LayoutModule,
    ToastrModule.forRoot({
      positionClass: (environment.mode !== APPMODE.Web) ? 'toast-top-center' : 'toast-top-right',
    }),
    ApplicationStateModule,
    AuthModule,
    ErrorModule,
    LoaderModule,
    SocialLoginModule,
    StoreModule.forRoot({}, {
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
    StoreModule.forFeature('auth', authReducer, AUTH_CONFIG_TOKEN),
    EffectsModule.forRoot([]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpBackend]
      },
      parser: { provide: TranslateParser, useClass: CustomParser },
    }),
    !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 250, logOnly: environment.production }) : [],
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    ...goAdminAppImports,
    ...goTemplateAppImports,
    ...goAppImports
  ],
  providers: [
    {
      provide: USER_PROVIDED_META_REDUCERS,
      deps: [LogService],
      useFactory: getMetaReducers
    },
    {
      provide: 'SocialAuthServiceConfig',
      useFactory: provideSocialAuthConfig
    },
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomerTokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    CookieService,
    WINDOW_PROVIDERS,
    ViewportService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [ GoToast ]
})
export class AppModule {
  constructor(private translate: TranslateService
             ) {
    this.translate.addLangs(['en', 'nl', 'el', 'de', 'fr', 'es', 'it', 'pt', 'bg', 'tr', 'ru', 'hi', 'ja']);
    this.translate.setDefaultLang('en');
  }
}

export function HttpLoaderFactory(httpBackend: HttpBackend) {
  return new TranslateHttpLoader(new HttpClient(httpBackend), '/assets/translations/i18n/admin-translation.', '.json');
}
