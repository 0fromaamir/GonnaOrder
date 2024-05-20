import { LocationService } from './location.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { WINDOW } from './window-providers';
import { WhitelabelService } from '../shared/whitelabel.service';

@Injectable()
export class AdminBasketEnabledGuard {

  subdomain: string;
  constructor(private cookieService: CookieService,
              private locationService: LocationService,
              private whitelabelService: WhitelabelService
              ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const storeAlias = this.getSubdomain(route);
    if (storeAlias !== 'admin' && !this.whitelabelService.getAllWhiteLabelDomains().includes(storeAlias)) {


      // Set basket enabled based on url param
      // Does it only if value not set or has changed from previous value
      const basketEnabled = route.queryParams.basket;

      if (basketEnabled !== undefined) {
        if (!this.cookiesEnabled && (this.locationService.isBasketEnabled() === null
          || this.locationService.isBasketEnabled() !== basketEnabled)) {
          this.locationService.setBasketEnabled(basketEnabled);
        } else if (this.cookiesEnabled && (!this.cookieService.check('basketEnabled')
          || !!this.cookieService.get('basketEnabled') !== basketEnabled)) {
          this.cookieService.set('basketEnabled', basketEnabled, 1);
        }
      }

    }

    return true;
  }

  getSubdomain(route: ActivatedRouteSnapshot): string {
    return route.params.storeAlias;
  }

  cookiesEnabled() {
    let cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled === 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') !== -1) ? true : false;
    }
    return (cookieEnabled);
  }

}
