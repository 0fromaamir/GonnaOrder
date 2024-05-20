import { ActivatedRouteSnapshot } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { CompleteStandalonePaymentSuccess, CustomerStandalonePaymentSearch, GetCombinedOrder } from './store/+state/stores.actions';
import { WINDOW } from './window-providers';
import { environment } from 'src/environments/environment';
import { StoreService } from './store/store.service';
import { LocalStorageService } from '../local-storage.service';
import { combineLatest, Observable } from 'rxjs';
import { getCombinedOrdersData, getCreatedStandaloneOrderData } from './store/+state/stores.selectors';

@Injectable({
  providedIn: 'root'
})
export class StandaloneThankyouGuard {

  subdomain: string;
  constructor(
    private store: Store<any>,
    @Inject(WINDOW) private window: Window,
    private storeService: StoreService,
    private storageService: LocalStorageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const standaloneOrder: string = this.storageService.getSavedState('standalone-order');
    const standaloneLocation: string = this.storageService.getSavedState('standalone-location');
    const storeAlias = this.getSubdomain();
    let selectedStoreData;
    if (storeAlias) {
      this.storeService.load(storeAlias).subscribe(selectedStore => {
        if (selectedStore.id) {
          selectedStoreData = selectedStore;
          if (selectedStore && standaloneOrder) {
            this.store.dispatch(new CustomerStandalonePaymentSearch(selectedStore.id, standaloneOrder, null, null));
          } else if (standaloneLocation) {
            this.store.dispatch(new GetCombinedOrder(selectedStore.id, standaloneLocation));
          }
        }
      });
    }


    this.store.select(getCombinedOrdersData).subscribe((combinedOrder) => {
      if (combinedOrder) {
        if (standaloneLocation && combinedOrder.status === 'LOADED') {
          this.store.dispatch(
            new CustomerStandalonePaymentSearch(
              selectedStoreData.id,
              null,
              standaloneLocation,
              combinedOrder?.data?.tapId?.toString())
          );
        }
      }
    });

    return new Promise((response) => {
      combineLatest([this.store.select(getCreatedStandaloneOrderData), this.store.select(getCombinedOrdersData)])
      .subscribe(([state, combinedOrder]) => {
        let lastOrder;
        let isAmountReferenceOrder = false;
        let amountReferenceOrderId;
        let storeId;
        let standalonePaymentCompleted = false;
        let standalonePaymentId;
        if (this.storageService.getSavedState('standalone-amount') !== null){
          amountReferenceOrderId = this.storageService.getSavedState('standalone-amount').split('/')[0];
          storeId = this.storageService.getSavedState('standalone-amount').split('/')[1];
          isAmountReferenceOrder = true;
        }
        if (state.status === 'ITEMSEARCHSUCCESS') {
          const openStandalonePaymentOrder = state.openStandalonePaymentOrder;
          let paidOrders;
          if (state.standalonePaymentOrders && state.standalonePaymentOrders.length > 0) {
            paidOrders = state.standalonePaymentOrders[0];
          }
          if (openStandalonePaymentOrder) { lastOrder = openStandalonePaymentOrder; }
          if (paidOrders) { lastOrder = paidOrders; }
        }
        if (this.storageService.getSavedState('standalone-payment-completed') !== null) {
          standalonePaymentCompleted = this.storageService.getSavedState('standalone-payment-completed');
          storeId = this.storageService.getSavedState('storeId');
          standalonePaymentId = this.storageService.getSavedState('standalonePaymentId');
        }
        if (standalonePaymentCompleted ) {
          this.storeService.getStandaloneOrderPayment(storeId, standalonePaymentId)
          .subscribe(res => {
              if (isAmountReferenceOrder) {
                this.storageService.removeSavedState('standalone-amount');
              }
              this.storageService.removeSavedState('standalone-payment-completed');
              this.storageService.removeSavedState('storeId');
              this.storageService.removeSavedState('standalonePaymentId');
              if (res) {
                if (res.error) {
                  this.window.location.href = this.window.location.origin + '/standalone-payment/standalone-payment-error';
                }
                this.store.dispatch(new CompleteStandalonePaymentSuccess(res));
                response(true);
              } else {
                this.window.location.href = this.window.location.origin + '/standalone-payment/standalone-payment-error';
                response(false);
              }
            }
          );
        } else if (lastOrder || isAmountReferenceOrder) {
          this.storeService.getStandaloneOrderPayment(
            isAmountReferenceOrder ? storeId : Number(lastOrder.storeId),
            isAmountReferenceOrder ? amountReferenceOrderId : lastOrder.id)
          .subscribe(res => {
              if (isAmountReferenceOrder) {
                this.storageService.removeSavedState('standalone-amount');
              }
              if (res) {
                if (res.error) {
                  this.window.location.href = this.window.location.origin + '/standalone-payment/standalone-payment-error';
                }
                this.store.dispatch(new CompleteStandalonePaymentSuccess(res));
                response(true);
              } else {
                this.window.location.href = this.window.location.origin + '/standalone-payment/standalone-payment-error';
                response(false);
              }
            }
          );
        }
        if (combinedOrder && combinedOrder.status === 'FAILED' && combinedOrder.errorCode === 'ORDER_NOT_FOUND') {
          response(true);
        }
      });
    });
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
}
