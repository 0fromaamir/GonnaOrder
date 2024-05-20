import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { getLoggedInUser } from '../auth/+state/auth.selectors';
import { WINDOW } from './window-providers';
import {
  LoadStore,
  InitializeCartState,
  CheckExistingOrder
} from './store/+state/stores.actions';
import { LocationService } from './location.service';
import { getSelectedStore } from './store/+state/stores.selectors';
import { take } from 'rxjs/operators';
import { WhitelabelService } from '../shared/whitelabel.service';

@Injectable({
  providedIn: 'root'
})
export class AdminStoreLoadingGuard {

  subdomain: string;
  constructor(  private store: Store<any>
              , private cookieService: CookieService
              , @Inject(WINDOW) private window: Window
              , private router: Router
              , private locationService: LocationService
              , private whitelabelService: WhitelabelService
              ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    // if we want to use /:store-alias then uncomment next line
    // const storeAlias = route.params['store-alias'];
    if (window.location.hash.includes('#payment-redirect/jcc/') || window.location.hash.includes('#payment-redirect/sp/jcc/')){
      window.location.href = window.location.href.replace('/#', '/');
    }
    const storeAlias = this.getSubdomain(route);
    if (storeAlias && storeAlias !== 'admin' && !this.whitelabelService.getAllWhiteLabelDomains().includes(storeAlias)) {
      this.store.select(getSelectedStore)
        .pipe(take(1))
        .subscribe((store) => {
          if (store?.aliasName !== storeAlias) {
            if (!this.router.url.includes('/orders/')) {
              this.store.dispatch(new InitializeCartState());
            }
            this.store.dispatch(new LoadStore(storeAlias));
          }
        });
      this.store.select(getLoggedInUser)
        .pipe(take(1))
        .subscribe(loggedInUser => {
          const locale = loggedInUser.preferredLanguage.locale;
          this.locationService.setLocale(locale);
        });
      return true;
    } else {
      this.router.navigateByUrl('/manager');
    }
  }

  getSubdomain(route: ActivatedRouteSnapshot): string {
    return route.params.storeAlias;
  }

}
