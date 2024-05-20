import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {ViewState} from "../+state/stores.reducer";
import {Router} from "@angular/router";
import {LocationService} from "../../location.service";
import {PaymentMethod} from "../types/PaymentMethod";
import {LocalStorageService} from "../../../local-storage.service";
import {TranslateService} from "@ngx-translate/core";
import {getSelectedLang} from "../+state/stores.selectors";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ViewStateUpdateUserLanguage} from "../+state/stores.actions";

@Component({
  selector: 'app-store-payment-pay',
  templateUrl: './store-payment-pay.component.html',
  styleUrls: ['./store-payment-pay.component.scss']
})
export class StorePaymentPayComponent implements OnInit {

  private readonly PAYMENT_PAY_DETAILS = 'paymentPayDetails';
  paymentPayDetails: any;
  unsubscribe$: Subject<void> = new Subject<void>();
  selectedLang: string;
  lang: string;
  langLoaded = false;

  constructor(private store: Store<ViewState>,
              private router: Router,
              private locationService: LocationService,
              private storageService: LocalStorageService,
              private translate: TranslateService
              ) {

  }

  ngOnInit(): void {
    this.paymentPayDetails = this.getPaymentPayDetails()
    this.store.select(getSelectedLang)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(value => {
      this.selectedLang = value;
    });

    this.loadLanguage(this.translate.getBrowserLang())
    .catch(_ => {
      this.loadLanguage('en');
      this.langLoaded = true;
    });
  }

  onGoBack(event) {
    event.preventDefault();
    if (this.paymentPayDetails?.isStandalonePayment) {
      this.handleStandalonePaymentBack();
    } else {
      this.handleOrderBack();
    }
  }

  private handleOrderBack() {
   let backUrl = '';
    if (this.paymentPayDetails?.backToCurrentCat) {
      backUrl = `category/${this.paymentPayDetails?.backToCurrentCat}`;
    }
    this.router.navigateByUrl(this.locationService.base_url(backUrl), {state: {clearCart: false}})
    .then(() => {
      window.location.reload();
    });
  }

  private getPaymentPayDetails() {
    const PaymentPayDetailsStr = this.storageService.getSavedState(this.PAYMENT_PAY_DETAILS);
    return JSON.parse(PaymentPayDetailsStr);
  }

  hobexEnabled() {
    return PaymentMethod.CREDIT_CARD_HOBEX === this.paymentPayDetails.requestJSON?.paymentMethod;
  }

  private handleStandalonePaymentBack() {
    window.location.href = this.paymentPayDetails.requestJSON?.paymentFormParams?.cancelUrl;
  }


  private loadLanguage(locale) {
    return import(`./../../translations/i18n/translation.${locale}.json`)
    .then(lang => {
      this.translate.setTranslation(locale, { ...lang });
      this.translate.setDefaultLang(locale);

      this.langLoaded = true;
      switch (locale) {
        case 'en':
        case 'fr':
        case 'nl':
        case 'el':
        case 'ja':
          this.lang = locale;
          break;
        default:
          this.lang = 'en';
      }

      // store user language to view state...
      this.store.dispatch(new ViewStateUpdateUserLanguage(this.lang, {
        src: 'StorePaymentPayComponent',
        description: 'Load language'
      }));
    });
  }
}
