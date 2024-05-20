import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, Inject, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Store } from '@ngrx/store';
import { InitCookieMessage, InitializeCartState, LoadStore } from './store/+state/stores.actions';
import { WINDOW } from './window-providers';
import { environment } from 'src/environments/environment';
import { HelperService } from './helper.service';
import { getMobileStoreAlias, getSelectedStore } from './store/+state/stores.selectors';
import { Subscription } from 'rxjs';
import { ClientStore } from '../stores/stores';
import { WhitelabelService } from '../shared/whitelabel.service';

@Injectable({
  providedIn: 'root'
})
export class StoreLoadingGuard implements OnDestroy {

  subdomain: string;
  allSubscriptions = new Subscription();
  selectedStore: ClientStore;

  constructor(private cookieService: CookieService,
              private store: Store<any>,
              @Inject(WINDOW) private window: Window,
              private router: Router,
              private helperService: HelperService,
              private whitelabelService: WhitelabelService
              ) { }

  canActivate(route: ActivatedRouteSnapshot) {

    let storeAlias: string;
    if (this.helperService.isMobileApp()) {
      this.allSubscriptions.add(
        this.store.select(getMobileStoreAlias).subscribe(res => {
          storeAlias = res;
        })
      );
      this.allSubscriptions.add(
        this.store.select(getSelectedStore).subscribe((selectedStore) => {
          this.selectedStore = selectedStore;
        })
      )
    } else {
      storeAlias = this.getSubdomain();
    }
    if (window.location.hash.includes('#payment-redirect/jcc/') || window.location.hash.includes('#payment-redirect/sp/jcc/')){
      window.location.href = window.location.href.replace('#', '');
    }
    if ((storeAlias === '' && !this.helperService.isMobileApp()) || storeAlias === 'admin' || this.whitelabelService.getAllWhiteLabelDomains().includes(storeAlias)) {
      this.router.navigateByUrl('/manager');
    } else {
      if ((storeAlias === '' || storeAlias === 'undefined' || !storeAlias) && this.helperService.isMobileApp()) {
        return true;
      }
      if (this.selectedStore && this.selectedStore.aliasName === storeAlias) {
        return true;
      }
      this.store.dispatch(new InitializeCartState());
      this.store.dispatch(new LoadStore(storeAlias));

      if (this.cookiesEnabled()) {
        const cookieEnabled = this.cookieService.get('cookieEnabled');
        if (cookieEnabled && (cookieEnabled === 'ACCEPT' || cookieEnabled === 'REJECT')) {
          this.store.dispatch(new InitCookieMessage(cookieEnabled));
          return true;
        }
      }
      this.store.dispatch(new InitCookieMessage('UNSET'));
      return true;
    }
  }

  getSubdomain(): string {
    const domain = this.window.location.hostname;

    if (domain.indexOf(environment.envDomain) < 0) {
      return domain;
    }

    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      return '';
    }
    return domain.split('.')[0];
  }

  cookiesEnabled() {
    let cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    }
    return (cookieEnabled);
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }

}
