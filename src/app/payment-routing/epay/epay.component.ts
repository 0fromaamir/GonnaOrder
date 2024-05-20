import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {FormBuilder} from "@angular/forms";
import {ActivatedRoute, NavigationStart, Router} from "@angular/router";
import {Store} from "@ngrx/store";
import {HideLoader, ShowLoader} from "../../loader/+state/loader.actions";
import {getPaymentRedirectInfo} from "../../public/payments/+state/payment.selectors";
import {PaymentRedirectInfo} from "../../public/payments/+state/payment.reducer";
import {
  CompletePayment,
  SetPaymentRedirectInfo
} from "../../public/payments/+state/payment.actions";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-epay',
  templateUrl: './epay.component.html',
  styleUrls: ['./epay.component.scss']
})
export class EpayComponent implements OnInit, OnDestroy {

  unsubscribe$: Subject<void> = new Subject<void>();
  acquirerId: string;
  merchantId: string;
  posId: string;
  user: string;
  languageCode: string;
  merchantReference: string;
  parameters: string
  checkoutUrl: string;
  @ViewChild('epayForm') epayForm: ElementRef;
  epayCardForm: any;

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private store: Store) {
  }

  ngOnInit(): void {
    this.epayCardForm = this.fb.group({
    });
    this.store.dispatch(new ShowLoader({payload: {type: 'payment-routing'}}));
    this.route.url.subscribe(segments => {
      if (segments.length > 0 && segments.some(segment => segment.path === 'cancel')) {
        this.redirectBackTo();
      } else {
        this.handlePaymentRedirection();
      }
    });
  }


  redirectBackTo(){
    this.store.select(getPaymentRedirectInfo).subscribe(
      redInfo => {
        if (redInfo?.currentUrl !== '') {
          this.store.dispatch(new HideLoader({payload: {type: 'payment-routing'}}));
          window.location.href = redInfo.currentUrl;
        }
      });
  }


  ngOnDestroy(): void {
    this.store.dispatch(new HideLoader({payload: {type: 'payment-routing'}}));
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private handlePaymentRedirection() {
    this.route.queryParams.subscribe(params => {
      if ( params ){
        if (params?.checkoutUrl){
          const info: PaymentRedirectInfo = {
            currentUrl: params?.url,
            storeAliasName: params?.storeAliasName,
            orderUuid: params?.orderUuid,
            storeId: params?.storeId,
            callbackUrl: params?.callbackUrl,
          };
          this.checkoutUrl = params?.checkoutUrl;
          this.acquirerId = params?.acquirerId;
          this.merchantId = params?.merchantId;
          this.posId = params?.posId;
          this.user = params?.user;
          this.languageCode = params?.languageCode;
          this.merchantReference = params?.merchantReference;
          this.parameters = params?.parameters;
          this.store.dispatch(new SetPaymentRedirectInfo(info));
          setTimeout(_ => this.epayForm.nativeElement?.submit());
        } else {
          this.store.select(getPaymentRedirectInfo).subscribe(
            redInfo => {
              if (redInfo.callbackUrl !== '') {
                  const isStandaloneOrder = redInfo.callbackUrl.includes('/sp/');
                  this.store.dispatch(new CompletePayment(redInfo?.storeId, redInfo?.orderUuid, params, isStandaloneOrder, redInfo.callbackUrl));
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
}
