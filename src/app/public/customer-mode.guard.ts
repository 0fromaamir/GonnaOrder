import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HelperService } from './helper.service';
import { Store } from '@ngrx/store';
import { SetMobileStore } from './store/+state/stores.actions';
import { Subscription } from 'rxjs';
import { getMobileStoreAlias } from './store/+state/stores.selectors';

@Injectable({
  providedIn: 'root'
})
export class CustomerModeGuard {

  allSubscriptions = new Subscription();
  subdomain: string;
  constructor(
    private router: Router,
    private helperService: HelperService,
    private store: Store<any>,) { }

  canActivate(route: ActivatedRouteSnapshot) {

    let storeAlias: string;

    if (this.helperService.isMobileApp()) {

      this.allSubscriptions.add(this.store.select(getMobileStoreAlias).subscribe(res => {
        storeAlias = res;
      }));

      // Skip redirect for customer if store is provided
      if ((this.helperService.isGoApp() || this.helperService.isGoTemplateApp()) && storeAlias) {
        return true;
      }
      if (this.helperService.isGoApp()) {
        this.router.navigate(['/public/customer']);
      } else if (this.helperService.isGoAdminApp()) {
        this.router.navigate(['/manager']);
      } else if (this.helperService.isGoTemplateApp()) {
        if (environment.templateStoreAlias) {
          this.router.navigate([`/public/template/${environment.templateStoreAlias}`]);
          this.store.dispatch(new SetMobileStore(environment.templateStoreAlias));
        } else {
          return true;
        }
      } return true;
    } 
    return true;
  }
}
