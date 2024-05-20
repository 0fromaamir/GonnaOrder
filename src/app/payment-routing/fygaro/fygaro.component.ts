import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subject } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router} from '@angular/router';
import { Store } from '@ngrx/store';
import { HideLoader, ShowLoader } from '../../loader/+state/loader.actions';
import { takeUntil } from 'rxjs/operators';
import { getPaymentRedirectInfo } from '../../public/payments/+state/payment.selectors';
import { PaymentRedirectInfo } from '../../public/payments/+state/payment.reducer';
import {
  SetPaymentRedirectInfo
} from '../../public/payments/+state/payment.actions';

@Component({
  selector: 'app-fygaro',
  templateUrl: './fygaro.component.html',
  styleUrls: ['./fygaro.component.scss']
})
export class FygaroComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<void> = new Subject<void>();
  fygaroCheckoutUrl: string;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private store: Store) {
  }


  ngOnInit(): void {
    this.store.dispatch(new ShowLoader({payload: {type: 'payment-routing'}}));
    this.route.queryParams.subscribe(params => {
      if ( params ){
        if (params?.jwt ){
          const info: PaymentRedirectInfo = {
            currentUrl: params?.url,
            storeAliasName: params?.storeAliasName,
            orderUuid: params?.orderUuid,
            storeId: params?.storeId,
            jwt: params?.jwt,
            callbackUrl: params?.callbackUrl
          };
          this.fygaroCheckoutUrl = `${params?.checkoutUrl}?jwt=${params?.jwt}`;
          this.store.dispatch(new SetPaymentRedirectInfo(info));
          setTimeout(() => window.location.href = this.fygaroCheckoutUrl);
          this.router.navigate(['.'], { relativeTo: this.route,
            queryParams: { ... params , jwt : null},
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        } else {
          this.store.select(getPaymentRedirectInfo).subscribe(
            redInfo => {
              if (redInfo?.currentUrl !== '' && redInfo.callbackUrl !== '') {
                window.location.href = redInfo.callbackUrl
              }
            }
          );
        }
      } else {
        this.redirectBackTo();
      }
    });

    this.router.events
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((event: NavigationStart) => {
      if (event.navigationTrigger === 'popstate') {
        this.redirectBackTo();
      }
    });
  }

  redirectBackTo(){
    this.store.select(getPaymentRedirectInfo).subscribe(
      redInfo => {
        window.location.href = redInfo.currentUrl;
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new HideLoader({payload: {type: 'payment-routing'}}));
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}

