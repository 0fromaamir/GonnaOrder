import { LocationService } from 'src/app/public/location.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, Inject, OnDestroy } from '@angular/core';
import { WINDOW } from './window-providers';
import { HelperService } from './helper.service';
import { getMobileStoreAlias } from './store/+state/stores.selectors';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { WhitelabelService } from '../shared/whitelabel.service';

@Injectable()
export class BasketEnabledGuard implements OnDestroy {

  subdomain: string;
  allSubscriptions = new Subscription();

  constructor(private cookieService: CookieService,
              private locationService: LocationService,
              @Inject(WINDOW) private window: Window,
              private store: Store<any>,
              private helperService: HelperService,
              private whitelabelService: WhitelabelService
              ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    let storeAlias: string;
    if (this.isMobileApp()) {
      this.allSubscriptions.add(this.store.select(getMobileStoreAlias).subscribe(res => {
        storeAlias = res;
      }));
    } else {
      storeAlias = this.getSubdomain();
    }
    if ((storeAlias === '' || storeAlias === 'undefined' || !storeAlias) && this.isMobileApp()) {
      return true;
    }

    if (storeAlias !== 'admin' && !this.whitelabelService.getAllWhiteLabelDomains().includes(storeAlias)) {


      // Set basket enabled based on url param
      // Does it only if value not set or has changed from previous value
      const basketEnabled = route.queryParams.basket;

      if (basketEnabled !== undefined) {
        if (!this.cookiesEnabled
          && (this.locationService.isBasketEnabled() === null || this.locationService.isBasketEnabled() !== basketEnabled)) {
          this.locationService.setBasketEnabled(basketEnabled);
        } else if (this.cookiesEnabled
          && (!this.cookieService.check('basketEnabled') || !!this.cookieService.get('basketEnabled') !== basketEnabled)) {
          this.cookieService.set('basketEnabled', basketEnabled, 1);
        }
      }

    }

    return true;
  }

  getSubdomain(): string {
    const domain = this.window.location.hostname;
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

  isMobileApp() {
    return this.helperService.isMobileApp();
  }

  ngOnDestroy(): void {
    this.allSubscriptions.unsubscribe();
  }
}
