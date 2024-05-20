import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs/operators';
import { AddOrderMeta, SocialLoginSuccess, SocialLogout } from 'src/app/public/store/+state/stores.actions';
import { getSelectedStore, getSocialAuth } from 'src/app/public/store/+state/stores.selectors';
import { environment } from 'src/environments/environment';
import { SocialLoginFailed } from '../auth/+state/auth.actions';
import { AuthService } from '../auth/auth.service';
import { ClientStore } from '../stores/stores';
import { LocationService } from './location.service';
import { StoreService } from './store/store.service';
import { CustomerSocialLoginResponse, SocialAccountLoginDetails } from './store/types/CustomerSocialLogin';

@Injectable({
  providedIn: 'root',
})
export class CustomerAuthService {
  tokenCookieName = '__auth_storage__';
  selectedStore: ClientStore;
  isAdminOrderCaptureUpdate: boolean;
  private sociallyLoggedIn = false;

  constructor(
    private store: Store,
    private cookieService: CookieService,
    public sanitizer: DomSanitizer,
    private locationService: LocationService,
    private authService: AuthService,
    private storeService: StoreService
  ) {
    this.onInit();
  }

  private onInit(): void {
    this.isAdminOrderCaptureUpdate = this.locationService.isAdminOrderCaptureUpdate();
    this.listenToLoginEvents();

    this.store
      .select(getSelectedStore)
      .pipe(filter((selectedStore) => !!selectedStore))
      .subscribe((selectedStore) => {
        this.selectedStore = selectedStore;
      });

    this.store.select(getSocialAuth).subscribe((state) => {
      if (state?.socialLoginState && this.sociallyLoggedIn) {
        const socialLoginResponse = state.socialLoginState;
        const { socialAuthStatus } = socialLoginResponse;

        if (socialAuthStatus === 'SUCCESS') {
          const event = { src: 'CustomerAuthService', description: 'Social login successfull' };
          if (socialLoginResponse.userId) {
            this.store.dispatch(new AddOrderMeta('customerUserId', socialLoginResponse.userId, event));
          }
        }

        if (socialAuthStatus === 'FAILED') {
          this.logout();
        }
      }
    });
  }

  private listenToLoginEvents() {
    window.addEventListener(
      'message',
      (event) => {
        const { data } = event;
        this.login(data);
      },
      false
    );
  }

  enableCustomerAuth(): boolean {
    return this.selectedStore?.settings['ENABLE_CUSTOMER_AUTHENTICATION'] && !this.isAdminOrderCaptureUpdate;
  }

  isUserLoggedIn(): boolean {
    return this.sociallyLoggedIn;
  }

  checkCurrentSession() {
    try {
      const data: CustomerSocialLoginResponse = JSON.parse(this.cookieService.get(this.tokenCookieName) || null);
      if (data && !this.sociallyLoggedIn) {
        const event = { src: 'CustomerAuthService', description: 'Current session loaded' };

        this.store.dispatch(new SocialLoginSuccess(data, event));
        this.store.dispatch(new AddOrderMeta('customerEmail', data.email, event));
        this.sociallyLoggedIn = true;
      }
    } catch (error) {
      this.cookieService.delete(this.tokenCookieName);
      console.error('An error occurred:', error);
    }
  }

  login(data: any) {
    if (data?.mode === 'customer-login') {
      this.sociallyLoggedIn = true;
      this.cookieService.set(this.tokenCookieName, JSON.stringify(data));
      const socialAccountDetails: SocialAccountLoginDetails = {
        provider: (data.provider as string).toLowerCase(),
        accessToken: data.authToken || data.accessToken,
        countryId: this.selectedStore.address.country.code,
        appleCode: data.appleCode,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const event = { src: 'CustomerAuthService', description: 'User Social Authentication' };
      this.store.dispatch(new AddOrderMeta('customerEmail', data.email, event));

      this.storeService.socialLogin(socialAccountDetails).subscribe(
        (res) => {
          res.email = data.email;
          this.cookieService.set(this.tokenCookieName, JSON.stringify(res));
          this.store.dispatch(new SocialLoginSuccess(res, event));
        },
        (error) => {
          this.store.dispatch(new SocialLoginFailed());
        }
      );
    }
  }

  passwordLogin(
    { email, password }: { email: string; password: string },
    { onSuccess, onError }: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}
  ) {
    this.authService.login(email, password).subscribe(
      (res) => {
        this.sociallyLoggedIn = true;
        const response: CustomerSocialLoginResponse = {
          userId: res.userId,
          userName: res.username,
          tokens: res.tokens,
          email: email,
        };

        const event = { src: 'CustomerAuthService', description: 'User authenticated' };
        this.cookieService.set(this.tokenCookieName, JSON.stringify(response));

        this.store.dispatch(new SocialLoginSuccess(response, event));
        this.store.dispatch(new AddOrderMeta('customerEmail', email, event));

        onSuccess && onSuccess(res);
      },
      (error) => {
        this.sociallyLoggedIn = false;
        onError && onError(error);
      }
    );
  }

  customerRegistration(
    { email }: { email: string },
    { onSuccess, onError }: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}
  ) {
    this.storeService.customerRegistration(email).subscribe(
      (res) => onSuccess && onSuccess(res),
      (error) => { console.log("resposta", error); onError && onError(error)}
    );
  }

  customerResetByCode(
    { email }: { email: string },
    { onSuccess, onError }: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}
  ) {
    this.storeService.customerResetByCode(email).subscribe(
      (res) => onSuccess && onSuccess(res),
      (error) => onError && onError(error)
    );
  }

  customerVerification(
    { email, code }: { email: string; code: string },
    { onSuccess, onError }: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}
  ) {
    this.storeService.customerActivation(email, code).subscribe(
      (res) => {
        this.sociallyLoggedIn = true;
        this.cookieService.set(this.tokenCookieName, JSON.stringify(res));
        const event = { src: 'CustomerAuthService', description: 'User registered and verified' };
        this.store.dispatch(new SocialLoginSuccess(res, event));
        this.store.dispatch(new AddOrderMeta('customerEmail', email, event));
        onSuccess && onSuccess(res);
      },
      (error) => onError && onError(error)
    );
  }

  changePassword(
    { code, password }: { code: string; password: string },
    { onSuccess, onError }: { onSuccess?: (response: any) => void; onError?: (error: any) => void } = {}
  ) {
    this.storeService.customerPasswordUpdateByCode(code, password).subscribe(
      (res) => onSuccess && onSuccess(res),
      (error) => onError && onError(error)
    );
  }

  logout() {
    this.sociallyLoggedIn = false;
    this.cookieService.delete(this.tokenCookieName);
    const event = { src: 'CustomerAuthService', description: 'User logged out' };
    this.store.dispatch(new AddOrderMeta('customerUserId', null, event));
    this.store.dispatch(new SocialLogout(event));
    const retries = 3;
    this.postMessageToIframe(retries);
  }

  private postMessageToIframe(retries = 0) {
    const iframe = window.frames['user-login']?.contentWindow;
    const userLogin = this.sanitizer.bypassSecurityTrustResourceUrl(environment.adminHostURL + '/user-login');
    if (iframe) {
      iframe.postMessage({ logout: true }, this.sanitizer.sanitize(SecurityContext.URL, userLogin));
    } else if (retries > 0) {
      setTimeout(() => this.postMessageToIframe(retries - 1), 1000);
    }
  }
}
