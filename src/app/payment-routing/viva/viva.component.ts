import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShowLoader, HideLoader } from 'src/app/loader/+state/loader.actions';
import { CompleteVivaPayment, SetPaymentRedirectInfo } from 'src/app/public/payments/+state/payment.actions';
import { PaymentRedirectInfo } from 'src/app/public/payments/+state/payment.reducer';
import { getPaymentRedirectInfo } from 'src/app/public/payments/+state/payment.selectors';
import { ErrorMessage } from 'src/app/public/store/+state/stores.actions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-viva',
  templateUrl: './viva.component.html',
  styleUrls: ['./viva.component.scss']
})
export class VivaComponent implements OnInit, OnDestroy {
  vivaServerLink: string;
  vivaOrderCode: string;
  @ViewChild('vivaForm') vivaForm: ElementRef;
  vivaCardForm: any;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute,  private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(new ShowLoader({ payload: {type: 'payment-routing'}}));
    this.vivaCardForm = this.fb.group({
    });

    this.route.queryParams.subscribe(params => {
    console.log('viva params', params);
    if ( params ){
      if (params?.ordercode && params.ordercode !== null ){
        const info: PaymentRedirectInfo = {
          currentUrl: params?.url,
          storeAliasName: params?.storeAliasName,
          orderUuid: params?.orderUuid,
          storeId: params?.storeId,
          orderCode: params?.ordercode,
          thankyouUrl: params?.thankUrl
        };
        this.vivaOrderCode = params?.ordercode;
        this.store.dispatch(new SetPaymentRedirectInfo(info));
        this.vivaServerLink = environment.name === 'production' ?
        'https://www.vivapayments.com/web/checkout?ref=' + this.vivaOrderCode
        : 'https://demo.vivapayments.com/web/checkout?ref=' + this.vivaOrderCode;
        setTimeout(() => this.vivaForm.nativeElement?.submit());
        this.router.navigate(['.'], { relativeTo: this.route,
          queryParams: { ... params , ordercode : null},
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      } else if (params?.t && params?.s){
        this.store.select(getPaymentRedirectInfo).subscribe(
          redInfo => {
            if (redInfo?.currentUrl !== ''){
              this.store.dispatch(new CompleteVivaPayment(redInfo?.storeId, redInfo?.orderUuid, params.s, params.eventId,
                params.eci, redInfo?.storeAliasName, params.t, redInfo.currentUrl, redInfo.thankyouUrl, redInfo.thankyouUrl.includes('standalone-payment')));
            }
          }
        );
      } else {
        this.redirectBackTo();
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

  ngOnDestroy() {
    this.store.dispatch(new HideLoader({ payload: {type: 'payment-routing'}}));
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
