import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadStoreOrder } from '../+state/store-order.actions';
import { ResetOrder } from 'src/app/public/store/+state/stores.actions';

@Injectable({
  providedIn: 'root'
})
export class StoreOrderGuard {

  constructor(private store: Store<any>) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    const orderUuid = route.params.orderUuid;
    const stationId = route.params.stationId;
    this.store.dispatch(new ResetOrder());
    this.store.dispatch(new LoadStoreOrder(id, orderUuid, stationId));
    return true;
  }

}
