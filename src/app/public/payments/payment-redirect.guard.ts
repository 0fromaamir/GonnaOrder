import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  ClearOrderPayment,
  FetchPaymentStatus
} from './+state/payment.actions';
import {
  getOrderPaymentStore,
} from './+state/payment.selectors';
import { takeUntil } from 'rxjs/operators';
import {CartStatusUpdate, ErrorMessage} from '../store/+state/stores.actions';
import { Subject } from 'rxjs';
import { LocalStorageService } from 'src/app/local-storage.service';
import { HelperService } from '../helper.service';
import { OrderPaymentState } from './+state/payment.reducer';
import { ORIGIN_TYPE } from '../store/store-checkout/checkout.service';


@Injectable({
  providedIn: 'root'
})
export class PaymentRedirectGuard implements OnDestroy {
  unsubscribe$: Subject<void> = new Subject<void>();
  baseUrl: string;

  subdomain: string;
  constructor(private store: Store<any>,
              private router: Router,
              private helperService: HelperService,
              private zone: NgZone,
              private storageService: LocalStorageService) {
}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.baseUrl = (state.url.includes('/capture/')) ? state.url.split('/payment-redirect')[0] : '';
    const isStandalonePayment = state.url.includes('/sp/');
    if (route.params.provider && route.params.storeId && route.params.orderUuid && route.queryParams) {
        switch (route.params.provider) {
          case 'paymentsense':
          case 'jcc':
          case 'payabl':
          case 'rms':
          case 'trust':
          case 'square':
          case 'stripe':
          case 'globalpay':
          case 'mollie':
          case 'fygaro':
          case 'epay':
          case 'apcopay':
          case 'viva':
          case 'hobex':
            this.fetchPaymentStatus(route.params.storeId, route.params.orderUuid, isStandalonePayment);
            this.store
            .select(getOrderPaymentStore)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe( orderPayment => {
              let orderPaymentState = orderPayment?.orderPaymentState;

              switch (orderPayment?.orderPaymentState?.status) {
                case 'COMPLETE_ORDER_PAYMENT_SUCCESS':
                  this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
                  if (isStandalonePayment) {
                    this.storageService.setSavedState(true, 'standalone-payment-completed');
                    this.storageService.setSavedState(Number(route.params.storeId), 'storeId');
                    this.storageService.setSavedState(route.params.orderUuid, 'standalonePaymentId');
                    const url = '/standalone-payment/standalone-payment-success';
                    this.handleRedirection(isStandalonePayment, url, orderPaymentState);
                  } else {
                    this.baseUrl = this.helperService.generateBasePath(
                      this.baseUrl, 
                      route.params.storeId,
                      orderPaymentState?.requestJSON?.originType,
                      orderPaymentState?.requestJSON?.originDomain,
                      orderPaymentState?.requestJSON?.storeAliasName
                    );

                    const thankYouPath = `${this.baseUrl}#thankyou/e/${route.params.orderUuid}`;
                    this.handleRedirection(isStandalonePayment, thankYouPath, orderPaymentState);
                  }
                  break;
                case 'COMPLETE_ORDER_PAYMENT_FAILURE':
                  this.store.dispatch(new ClearOrderPayment());
                  if (isStandalonePayment) {
                    this.storageService.setSavedState(true, 'standalone-payment-completed');
                    this.storageService.setSavedState(Number(route.params.storeId), 'storeId');
                    this.storageService.setSavedState(route.params.orderUuid, 'standalonePaymentId');

                    const url = '/standalone-payment/standalone-payment-error';
                    this.handleRedirection(isStandalonePayment, url, orderPaymentState);
                    
                  } else {
                    this.baseUrl = this.helperService.generateBasePath(
                      this.baseUrl, 
                      route.params.storeId,
                      orderPaymentState?.requestJSON?.originType,
                      orderPaymentState?.requestJSON?.originDomain,
                      orderPaymentState?.requestJSON?.storeAliasName
                    );

                    const url = this.baseUrl + `#paymentError`;
                    this.handleRedirection(isStandalonePayment, url, orderPaymentState);

                  }
                  this.store.dispatch(new ErrorMessage('public.checkout.errors.paymentFailed'));
                  break;
              }
            });
            break;
        default:
          this.navigateToHome();
      }
    } else {
      this.navigateToHome();
    }
    return true;
  }

  handleRedirection(isStandalonePayment: boolean, urlRedrection: string, orderPaymentState: OrderPaymentState) {
    const isOrderMobileApp = orderPaymentState?.requestJSON?.originType == ORIGIN_TYPE.APP;

    if (isOrderMobileApp) {
      this.handleMobileRedirection(isStandalonePayment, urlRedrection, orderPaymentState);
    }

    if (!isOrderMobileApp) {
      this.handleWebRedirection(isStandalonePayment, urlRedrection);
    }
  }

  private handleMobileRedirection(isStandalonePayment: boolean, urlRedrection: string, orderPaymentState: OrderPaymentState) {
    if (isStandalonePayment) {
      const url = `${orderPaymentState?.requestJSON?.originDomain}://${window.location.hostname}${urlRedrection}`;
      console.log('Navigate to Mobile SA', url);
      window.location.href = url;
      return;
    }

    if (!isStandalonePayment) {
      const url = `${orderPaymentState?.requestJSON?.originDomain}://${window.location.hostname}${urlRedrection}`;
      console.log('Navigate to Mobile', url);
      window.location.href = url;
      return;
    }
  }

  private handleWebRedirection(isStandalonePayment: boolean, urlRedirection: string) {
    if (isStandalonePayment) {
      const url = `${urlRedirection}`
      console.log('Navigate to Web SA', url);
      this.router.navigateByUrl(url);
      return;
    }

    if (!isStandalonePayment) {
      const url = `${urlRedirection}`;
      console.log('Navigate to Web', url);
      this.router.navigateByUrl(url);
      return;
    }
  }


  public_url() {
    const url: string = this.router.url;
    return url.split('#')[0];
  }

  isOrderCapture(): boolean {
    return this.public_url().includes('/capture/');
  }

  navigateToHome(): void {
    this.router.navigateByUrl(this.baseUrl);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  navigateToStandalone(){

      const standaloneOrder: string = this.storageService.getSavedState('standalone-order');
      const standaloneLocation: string = this.storageService.getSavedState('standalone-location');
      const amount = this.storageService.getSavedState('sp-amount');
      let url = window.location.origin + '/standalone-payment';
      if (amount){
        url = url + `/amount/${amount}`;
      } else if (standaloneLocation) {
        url = url + `/l/${standaloneLocation}`;
      } else {
        url = url + `/orderToken/${standaloneOrder}`;
      }
      window.location.href = url;

  }
  fetchPaymentStatus(storeId: number, paymentId: string, isStandalonePayment: boolean) {
    this.store.dispatch(new FetchPaymentStatus(storeId, paymentId, isStandalonePayment));
  }


}
