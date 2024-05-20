import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoadDiscountVoucher } from '../+state/store-discountvoucher.actions';
import { LoadCatalog } from '../../store-catalog/+state/stores-catalog.actions';

@Injectable({
  providedIn: 'root'
})
export class DiscountvoucherFormGuard {
  constructor(private store: Store<any>) { }
  canActivate(
    next: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const voucherId: number = next.params.voucherId;
    const storeId: number = next.parent.parent.params.id;
    this.store.dispatch(new LoadCatalog(storeId.toString()));
    if (voucherId > 0) {
      this.store.dispatch(new LoadDiscountVoucher(storeId, voucherId));
    }
    return true;
  }

}
