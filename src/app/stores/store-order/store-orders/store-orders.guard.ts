import { take } from 'rxjs/operators';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Initialize } from '../+state/store-order.actions';
import {
  LoadNotificationSubscriptionStatus,
  ToggleNotificationPermitted,
  InitializeStoreUserExperience,
  LoadAutoprintSubscriptionStatus,
  ToggleAutoprintPermitted,
  RequestNotificationPermission
} from '../../+state/stores.actions';
import { PushNotificationService } from 'src/app/shared/push-notification.service';
import { Initialize as InitializeStoreLocations, LoadStoreLocations } from '../../store-location/+state/store-location.actions';
import { LoadStation } from '../../store-catalog/+state/stores-catalog.actions';
import { HelperService } from 'src/app/public/helper.service';
import { PrinterService } from 'src/app/printers/printer.service';
@Injectable({
  providedIn: 'root'
})
export class StoreOrdersGuard {

  constructor(
    private store: Store<any>, 
    private pushNotificationService: PushNotificationService,
    private helperService: HelperService,
    private printerService: PrinterService
  ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.params.id;
    // Initilaizing store order list...
    this.store.dispatch(new Initialize());

    // Initialize store user experience...
    this.store.dispatch(new InitializeStoreUserExperience(id));

    if (this.helperService.isMobileApp()) {
      this.store.dispatch(new LoadAutoprintSubscriptionStatus(id));
      this.store.dispatch(new ToggleAutoprintPermitted(this.printerService.isSupported()));

    } else {
      this.pushNotificationService.currentSubscription().pipe(take(1)).subscribe(
        s => this.store.dispatch(new LoadNotificationSubscriptionStatus(id, s)),
        _ => this.store.dispatch(new LoadNotificationSubscriptionStatus(id, null)));
  
      this.store.dispatch(new ToggleNotificationPermitted(this.pushNotificationService.isSupported()));
    }

    this.store.dispatch(new LoadStation(id));

    // Load all store locations for order search...
    this.store.dispatch(new InitializeStoreLocations());
    this.store.dispatch(new LoadStoreLocations(id, { page: 0, size: 10000 }));
    return true;
  }

}
