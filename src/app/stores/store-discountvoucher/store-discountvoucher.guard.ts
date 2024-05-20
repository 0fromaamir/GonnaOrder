import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { defaultPaging } from 'src/app/api/types/Pageable';
import { LoadDiscountVouchers } from './+state/store-discountvoucher.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreDiscountvoucherGuard {
  constructor(private store: Store<any>) { }
  canActivate(
    next: ActivatedRouteSnapshot) {
    const storeId = next.parent.parent.params.id;
    this.store.dispatch(new LoadDiscountVouchers(storeId, defaultPaging));
    return true;
  }

}
