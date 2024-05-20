import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  Inject
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AddOrderMeta,
  ErrorMessage,
  AddCheckoutState,
  CartStatusUpdate,
  CheckExistingOrder,
} from '../../+state/stores.actions';
import { Store, select } from '@ngrx/store';
import { Cart, CatalogList, OrderMetaData } from '../../+state/stores.reducer';
import { ClientStore, Order } from 'src/app/stores/stores';
import { Observable, Subject, combineLatest } from 'rxjs';
import {
  getSelectedStore,
  getSelectedStoreCatalog,
  getCurrentCartUuid,
  getSelectedCategoryState
} from '../../+state/stores.selectors';
import { takeUntil, filter } from 'rxjs/operators';
import {
  LocationService
} from '../../../location.service';
import {
  CreatePaypalOrder,
  ClearVivaPayment,
  ClearJCCPayment,
  InitiateOrderPayment,
  ClearOrderPayment,
  CompleteOrderPayment,
  SetGlobalPayRequestJson,
  SetRmsRequestJson,
} from '../../../payments/+state/payment.actions';
import {
  getPaypalAccessToken,
  getPaypalOrderData,
  getJCCStore,
  getOrderPaymentStore
} from '../../../payments/+state/payment.selectors';
import {
  CheckoutService,
  PAYMENT_OPTION,
  PAYMENT_METHOD,
  ORIGIN_TYPE
} from '../checkout.service';
import { WINDOW } from 'src/app/public/window-providers';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { JCCRequestJSON, RMSRequestJSON } from 'src/app/public/payments/payment.types';
import {InitiateOrderPaymentResponse, PaymentFormParams} from '../../types/OrderPayment';
import {PaymentsenseService} from '../../../payments/paymentsense.service';
import { Event } from 'src/app/stores/event';
import {TrustpaymentComponent} from "../../../payments/trustpayment/trustpayment.component";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../../../local-storage.service";
import {ApcopayComponent} from "../../../payments/apcopay/apcopay.component";
import {HelperService} from "../../../helper.service";
import {PaymentService} from "../../../payments/payment.service";

declare var RealexHpp;
@Component({
  selector: 'app-store-checkout-payment',
  templateUrl: './store-checkout-payment.component.html',
  styleUrls: ['./store-checkout-payment.component.scss']
})
export class StoreCheckoutPaymentComponent implements OnInit, OnDestroy {

  vivaCardForm: FormGroup;
  paymentsenseForm: FormGroup;
  rmsCardForm: FormGroup;
  jccCardForm: FormGroup;
  @ViewChild('paymentWrapper') paymentWrapper: ElementRef;
  @ViewChild('jccForm') jccForm: ElementRef;
  @ViewChild('vivaForm') vivaForm: ElementRef;
  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  catalog$: Observable<CatalogList>;
  catalogData: CatalogList;
  orderMetaData: OrderMetaData;
  orderUuid: string;
  PAYMENT_OPTION = PAYMENT_OPTION;
  selectedPaymentOption: number;  // id of payment method: -1 - undefined; 0 - pay later; 1 - pay now
  PAYMENT_METHOD = PAYMENT_METHOD;
  selectedPaymentMethod: number;  // id of payment method: -1 - undefined; 0 - I will pay in store; 1 - I will pay online
  qty: number;
  paypalActionUrl: string;
  checkoutStateData;
  @Output() scrollToPayment = new EventEmitter();
  vivaAccessToken: string;
  vivaOrderCode: number;
  @ViewChild('vivaCardVerificationModal') vivaCardVerificationModal: ElementRef;
  paymentMethodStripe: any;
  paymentRequestStripe: any;
  requestJSON: InitiateOrderPaymentResponse;
  jccRequestJSON: JCCRequestJSON;
  jccResponseURL: string;
  jccServerLink: string;
  vivaServerLink: string;
  jccCallbackURL: string;
  selectedOptionalPayment = '';
  jccFormRequest: PaymentFormParams;
  backToCurrentCat: number;
  payLaterLabel = 'public.payment.payLater';
  @ViewChild('trustpaymentComponent') trustpaymentComponent: TrustpaymentComponent;
  @ViewChild('apcopayComponent') apcopayComponent: ApcopayComponent;

  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    private locationService: LocationService,
    private cd: ChangeDetectorRef,
    public checkoutService: CheckoutService,
    @Inject(WINDOW) private window: Window,
    private translate: TranslateService,
    private paymentsenseService: PaymentsenseService,
    private router: Router,
    private storageService: LocalStorageService,
    private paymentService: PaymentService
  ) { }

  ngOnInit() {
    this.checkoutService.setCheckoutState('orderBtnDisabled', true, {
      src: 'StoreCheckoutPaymentComponent',
      description: 'On Init'
    });

    this.paypalActionUrl = null;

    // set payment option to undefined
    this.setPaymentOption(PAYMENT_OPTION.UNDEFINED);

    // set payment method to undefined
    this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
    // get selected store state
    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );

    combineLatest([
      this.selectedStore$
      , this.store.select(getCurrentCartUuid)
    ]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state[0]) {
          this.selectedStore = state[0];
        }
        if (state && state[1]) {
          this.orderUuid = state[1];
          let baseUrl = this.locationService.public_url();
          baseUrl = (baseUrl.endsWith('/')) ? baseUrl : baseUrl + '/';
          this.jccResponseURL = `${location.origin}${baseUrl}#payment-redirect/jcc/${this.selectedStore.id}/${this.orderUuid}/`;
          this.jccCallbackURL = location.origin + `${this.locationService.public_url()}api/v2/stores/${this.selectedStore.id}/orders/${this.orderUuid}/verifyPayment`;
        }
        if (state && this.selectedStore && this.orderUuid) {
          if (this.checkoutService.ifEnabledPaymentSelection()) {
            if (this.checkoutService.ifEnabledPaymentSelectionPreselected()) {
              this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
              this.setIfSinglePaymentMethod();
            } else {
              this.togglePaymentPayLaterOption('PAY_LATER');
            }
          }
          if (this.checkoutService.ifEnabledPaymentMandatory()) {
            if (this.selectedStore.settings.PAYMENT_TRUSTPAYMENTS_CREDIT_CARD_ENABLED) { // if payment is mandatory
              this.setPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS);
            }
            // set payment option to pay now
            this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
            // set payment method if only one payment method is enabled
            this.setIfSinglePaymentMethod();
          }
        }

        if (this.selectedStore.settings.OPTIONAL_PAYMENT_PRESELECTED) {
          this.selectedOptionalPayment = 'PAY_ONLINE';
        } else {
          this.selectedOptionalPayment = 'PAY_LATER';
        }
        this.setPayLaterOptionLabel(this.selectedStore.settings.PAY_LATER_OPTION);
      });

    this.catalog$ = this.store.pipe(
      select(getSelectedStoreCatalog)
    );
    this.catalog$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(c => c.data.catalogId !== -1)
      )
      .subscribe(value => (this.catalogData = value));

    // subscribe to paypal Token obtained
    this.store.select(getPaypalAccessToken).subscribe(state => {
      if (state) {
        this.store.dispatch(new CreatePaypalOrder(this.prepareOrderForPaypal(), state.access_token));
      }
    });

    // subscribe to paypal createdOrder
    // TODO: we need to be able to retrieve this from BE
    //       if we want to maintain persistancy on reload
    this.store.select(getPaypalOrderData)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        if (state && state.links) {
          this.paypalActionUrl = state.links[1].href;
          // links are obtained import paypal external script
        }
      });

    if (this.selectedPaymentOption === PAYMENT_OPTION.PAY_LATER) {
      this.store.dispatch(new ClearVivaPayment());
    }


    // subscribe to order payment status
    this.store
      .select(getOrderPaymentStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        const evt : Event = {
          src: 'StoreCheckoutPaymentComponent',
          description: `Payment Status: ${state?.orderPaymentState?.status}`
        };
        switch (state?.orderPaymentState?.status) {
          case 'INITIATE_ORDER_PAYMENT_SUCCESS':
            this.requestJSON = state.orderPaymentState.requestJSON;
            this.checkoutService.setCheckoutState('orderBtnDisabled', false, evt);
            this.handlePaymentRedirection();
            break;
          case 'INITIATE_ORDER_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false, evt);
            this.store.dispatch(new ClearOrderPayment(evt));
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'COMPLETE_ORDER_PAYMENT_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT', evt));
            break;
          case 'COMPLETE_ORDER_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false, evt);
            this.store.dispatch(new ClearOrderPayment(evt));
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });


    // subscribe to JCC status
    this.store
      .select(getJCCStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(state => {
        switch (state.jccState.status) {
          case 'INIT_PAYMENT_SUCCESS':
            this.jccRequestJSON = state.jccState.requestJSON;
            this.handlePaymentRedirection();
            break;
          case 'INIT_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearJCCPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
          case 'COMPLETE_PAYMENT_SUCCESS':
            this.store.dispatch(new CartStatusUpdate('FINISHED_ONLINE_PAYMENT'));
            break;
          case 'COMPLETE_PAYMENT_FAILURE':
            this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
            this.checkoutService.setCheckoutState('paymentValid', false);
            this.store.dispatch(new ClearJCCPayment());
            this.store.dispatch(new ErrorMessage('public.payment.errorCouldNotConnect'));
            break;
        }
      });

    this.rmsCardForm = this.fb.group({
    });
    this.jccCardForm = this.fb.group({
    });
    this.vivaCardForm = this.fb.group({
    });
    this.checkoutService.setOrderMetaState('accountHolderName', this.translate.instant('public.checkout.yourName'), {
      src: 'StoreCheckoutPaymentComponent',
      description: 'On Init'
    });

    this.store.select(getSelectedCategoryState)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(value => {
      if (value && value.currentCategoryState) {
        this.backToCurrentCat = value.currentCategoryState.selectedCategory;
      }
    });
  } // EOF: ngOnInit


  setPaymentOption(id: number) {
    this.selectedPaymentOption = id;
    // Added setTimeout so we do not get ExpressionChangedAfterItHasBeenCheckedError
    // after redirecting back from error page to checkout screen
    setTimeout(() => {
      this.checkoutService.setOrderMetaState('paymentOption', id, {
        src: 'StoreCheckoutPaymentComponent',
        description: 'Payment option changed'
      });
    }, 0);
  }

  setPaymentMethod(id: number) {
    this.selectedPaymentMethod = id;
    this.checkoutService.setOrderMetaState('paymentMethod', id, {
      src: 'StoreCheckoutPaymentComponent',
      description: 'Payment method changed'
    });
    if (id !== PAYMENT_METHOD.UNDEFINED) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', false, {
        src: 'StoreCheckoutPaymentComponent',
        description: 'Payment method changed'
      });
    }
  }

  private initiatePayment(selectedPaymentMethod: number) {
    switch (selectedPaymentMethod) {
      case PAYMENT_METHOD.PAYPAL:
        // do nothing at the moment
        // this.parseMetaData();
        break;
      default:
        this.store.dispatch(new InitiateOrderPayment(this.selectedStore.id, this.orderUuid, this.paymentService.getOriginType(),  this.paymentService.getOriginDomain()));
        break;
    }
  }

  togglePaymentOnlineOption() {
    if (this.selectedPaymentOption !== PAYMENT_OPTION.PAY_NOW) {
      this.setPaymentOption(PAYMENT_OPTION.PAY_LATER);
      this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
      this.checkoutService.setCheckoutState('orderBtnDisabled', false, {
        src: 'StoreCheckoutPaymentComponent',
        description: 'Toggle payment online option | Not Pay Now'
      });
      this.invalidatePayment(false);
    } else {
      this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
      this.invalidatePayment(true);
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.JCC);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE)
        && !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC)
        && !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.STRIPE);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.RMS);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.SQUARE);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.VIVA);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.GLOBALPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.GLOBALPAY);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.MOLLIE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.GLOBALPAY) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.MOLLIE);
      }
      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.FYGARO) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.GLOBALPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.MOLLIE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.FYGARO);
      }

      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.EPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.FYGARO) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.GLOBALPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.MOLLIE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.EPAY);
      }

      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.APCOPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.EPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.FYGARO) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.GLOBALPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.MOLLIE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.APCOPAY);
      }

      if (
        this.ifEnabledPaymentMethod(PAYMENT_METHOD.HOBEX) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.APCOPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.EPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.FYGARO) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.TRUSTPAYMENTS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.JCC) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.SQUARE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.STRIPE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.RMS) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.VIVA) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYMENTSENSE) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.GLOBALPAY) &&
        !this.ifEnabledPaymentMethod(PAYMENT_METHOD.MOLLIE) &&
        !this.ifEnabledMultiplePaymentMethods()
      ) {
        this.setPaymentMethod(PAYMENT_METHOD.HOBEX);
      }


      if (this.ifEnabledPaymentMethod(PAYMENT_METHOD.PAYPAL) && !this.ifEnabledMultiplePaymentMethods()) {
        // TODO: Uncomment this when Paypal implementation is ready
        // this.setPaymentMethod(1);
      }
      this.scrollToPayment.emit('');
    }
  }

  togglePaymentPayLaterOption(value) {
    this.selectedOptionalPayment = value;
    if (this.selectedOptionalPayment === 'PAY_ONLINE') {
      this.setPaymentOption(PAYMENT_OPTION.PAY_LATER);
      this.setPaymentMethod(PAYMENT_METHOD.UNDEFINED);
      this.setPaymentOption(PAYMENT_OPTION.PAY_NOW);
      this.setIfSinglePaymentMethod();
    } else {
      this.selectedPaymentOption = 0;
      this.togglePaymentOnlineOption();
    }
  }

  invalidatePayment(state: boolean) {
    this.store.dispatch(new AddCheckoutState('paymentValid', state));
  }

  /**
   * would you like to pay is displayed only in the use cases that the payment-option is optional
   * In all other cases (payment option = mandatory or payment option = disabled) it is not displayed
   */

  ifEnabledPaymentStripe() {
    if (this.selectedStore &&
      this.selectedStore.settings &&
      this.selectedStore.settings.PAYMENT_STRIPE_CREDIT_CARD_ENABLED) {
      return true;
    }
    return false;
  }

  ifEnabledPaymentPaypal() {
    if (this.selectedStore &&
      this.selectedStore.settings &&
      this.selectedStore.settings.PAYMENT_PAYPAL_ENABLED) {
      return true;
    }
    return false;
  }

  ifEnabledPaymentMethod(method: string | number) {
    if (typeof method === 'number') {
      method = this.checkoutService.getMethodKey(method);
      if (!method) {
        return false;
      }
    }
    if (this.selectedStore &&
      this.selectedStore.settings &&
      this.selectedStore.settings[method]
    ) {
      return true;
    }
    return false;
  }

  ifEnabledMultiplePaymentMethods() {
    return (this.checkoutService.countEnabledPaymentMethods() > 1);
  }

  // if only one payment method is enabled
  // set it as selected
  setIfSinglePaymentMethod() {
    if (!this.selectedStore || !this.selectedStore.settings) {
      return 0;
    }
    const $this = this;
    const selectedPaymentMethods = new Array();
    Object.keys(PAYMENT_METHOD).forEach(method => {
      // if ($this.selectedStore.settings[$this.getMethodKey(PAYMENT_METHOD[method])]) {
      //   selectedPaymentMethods.push(PAYMENT_METHOD[method]);
      // }

      if ($this.selectedStore.settings[$this.checkoutService.getMethodKey(PAYMENT_METHOD[method])]) {
        selectedPaymentMethods.push(PAYMENT_METHOD[method]);
      }
    });

    // Special case if JCC CREDIT CARD and STRIPE CREDIT CARD are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.STRIPE), 1);
    }

    // Special case if JCC CREDIT CARD and RMS are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.RMS), 1);
    }
    // Special case if JCC CREDIT CARD and PAYMENTSENSE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.PAYMENTSENSE), 1);
    }
    // Special case if JCC CREDIT CARD and SQUARE are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if JCC CREDIT CARD and VIVA are enabled then only JCC will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }
    if (this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.JCC)] && selectedPaymentMethods.length === 1) {
      this.setPaymentMethod(selectedPaymentMethods[0]);
      return;
    }
    // Special case if STRIPE CREDIT CARD and RMS are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.RMS), 1);
    }

    // Special case if STRIPE CREDIT CARD and PAYMENTSENSE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.PAYMENTSENSE));
    }

    // Special case if STRIPE CREDIT CARD and SQUARE are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if STRIPE CREDIT CARD and VIVA are enabled then only STRIPE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.STRIPE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    // Special case if RMS and PAYMENTSENSE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.PAYMENTSENSE), 1);
    }

    // Special case if RMS and SQUARE are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if RMS and VIVA are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    // Special case if RMS and VIVA are enabled then only RMS will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.RMS)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.GLOBALPAY)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.RMS), 1);
    }

    // Special case if PAYMENTSENSE CREDIT CARD and SQUARE are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.SQUARE), 1);
    }

    // Special case if PAYMENTSENSE CREDIT CARD and VIVA are enabled then only PAYMENTSENSE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.PAYMENTSENSE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    // Special case if SQUARE CREDIT CARD and VIVA are enabled then only SQUARE will be shown
    if (
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.SQUARE)] &&
      this.selectedStore.settings[this.checkoutService.getMethodKey(PAYMENT_METHOD.VIVA)]
    ) {
      selectedPaymentMethods.splice(selectedPaymentMethods.indexOf(PAYMENT_METHOD.VIVA), 1);
    }

    if (selectedPaymentMethods.length === 1) {
      this.setPaymentMethod(selectedPaymentMethods[0]);
    }
    // return multiple;
  }

  getControl(name: string, form: string = 'vivaForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  private prepareOrderForPaypal() {
    // for now return hardcoded data for testing
    // TODO: PARSE CURRENT ORDER FOR PAYPAL
    // TODO BE: send payee email address
    return {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: this.catalogData.data.currency,
          value: this.cartData.totalDiscountedPrice
        }
      }],
    };
  }


  addOrderMeta(metaKey, control, formGroup = '') {
    this.store.dispatch(new AddOrderMeta(metaKey, this.getControl(control, formGroup).value));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  comingSoon() {
    alert('coming soon ...');
  }

  onChange(event) {
    const { error, complete } = event;
    if (error) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true, {
        src: 'StoreCheckoutPaymentComponent',
        description: 'On change | Error'
      });
    } else if (!complete) {
      this.checkoutService.setCheckoutState('orderBtnDisabled', true, {
        src: 'StoreCheckoutPaymentComponent',
        description: 'On change | Not complete'
      });
    } else {
      this.checkoutService.setCheckoutState('orderBtnDisabled', false, {
        src: 'StoreCheckoutPaymentComponent',
        description: 'On change | Complete'
      });
    }
    this.cd.detectChanges();
  }

  async onSubmit() {
    if (!this.checkoutService.ifSubmitOrderReady()) {
      return;
    }

    const billingDetails: any = {};

    if (this.checkoutService.getOrderMetaData('customerName')) {
      billingDetails.name = this.checkoutService.getOrderMetaData('customerName').trim();
    }
    if (this.checkoutService.getOrderMetaData('customerEmail')) {
      billingDetails.email = this.checkoutService.getOrderMetaData('customerEmail').trim();
    }
    if (this.checkoutService.getOrderMetaData('customerPhoneNumber')) {
      billingDetails.phone = this.checkoutService.getOrderMetaData('customerPhoneNumber').trim();
    }
    this.initiatePayment(this.selectedPaymentMethod);
  }


  private handlePaymentRedirection() {
    this.checkoutService.setCheckoutState('orderBtnDisabled', true, {
      src: 'StoreCheckoutPaymentComponent',
      description: 'Payment redirection'
    });

    if (this.requestJSON?.paymentFormParams?.providerPaymentType && this.requestJSON?.paymentFormParams?.providerPaymentType === 'PHYSICAL') {
      this.setPhysicalPaymentDetails();
      this.router.navigateByUrl(this.locationService.base_url(`paymentProgress`));
      return;
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.HOBEX) {
      this.setPaymentPayDetails();
      this.router.navigateByUrl(this.locationService.base_url(`paymentPay`));
      return;
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.STRIPE || this.selectedPaymentMethod === PAYMENT_METHOD.MOLLIE) {
      this.window.location.href = this.requestJSON.checkoutUrl;
    }

    if (this.selectedPaymentMethod == PAYMENT_METHOD.APCOPAY) {
      this.apcopayComponent.submitForm(this.requestJSON);
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.SQUARE) {
      this.window.location.href = this.requestJSON.checkoutUrl;
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.VIVA) {
      const baseUrl = `${this.window.location.protocol}//${this.requestJSON?.paymentFormParams?.storeAlias}.${environment.envDomain}`;
      const url = `${baseUrl}${this.window.location.pathname}${this.window.location.hash}`;

      this.window.location.href = environment.adminHostURL + '/payment-routing/viva?ordercode=' + (this.requestJSON.intentId || null)
        + '&url=' + encodeURIComponent(url)
        + '&storeAliasName=' + this.requestJSON?.paymentFormParams?.storeAlias
        + '&orderUuid=' + this.requestJSON?.paymentFormParams?.paymentId
        + '&storeId=' + this.requestJSON?.paymentFormParams?.storeId
        + '&thankUrl=' + encodeURIComponent(this.requestJSON?.paymentFormParams?.successUrl);
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.FYGARO) {
      this.window.location.href = environment.adminHostURL + '/payment-routing/fygaro?jwt=' + (this.requestJSON?.paymentFormParams?.jwt || null)
        + '&url=' + encodeURIComponent(window.location.href)
        + '&storeAliasName=' + this.requestJSON?.paymentFormParams?.storeAlias
        + '&orderUuid=' + this.requestJSON?.paymentFormParams?.paymentId
        + '&storeId=' + this.requestJSON?.paymentFormParams?.storeId
        + '&callbackUrl=' + this.requestJSON?.paymentFormParams?.callbackUrl
        + '&checkoutUrl='+ this.requestJSON.checkoutUrl
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.EPAY) {
      this.window.location.href = environment.adminHostURL + '/payment-routing/epay?checkoutUrl=' + (this.requestJSON?.checkoutUrl || null)
        + '&url=' + encodeURIComponent(window.location.href)
        + '&storeAliasName=' + this.requestJSON?.paymentFormParams?.storeAlias
        + '&orderUuid=' + this.requestJSON?.paymentFormParams?.orderId
        + '&storeId=' + this.requestJSON?.paymentFormParams?.storeId
        + '&callbackUrl=' + this.requestJSON?.paymentFormParams?.responseUrl
        + '&acquirerId='+ this.requestJSON?.paymentFormParams?.acquirerId
        + '&merchantId='+ this.requestJSON?.paymentFormParams?.merchantId
        + '&posId='+ this.requestJSON?.paymentFormParams?.posId
        + '&user='+ this.requestJSON?.paymentFormParams?.username
        + '&languageCode='+ this.requestJSON?.paymentFormParams?.languageCode
        + '&merchantReference='+ this.requestJSON?.paymentFormParams?.merchantReference
        + '&parameters='+ this.requestJSON?.paymentFormParams?.parameters;
    }


    if (this.selectedPaymentMethod === PAYMENT_METHOD.PAYMENTSENSE) {
      this.paymentsenseService.handlePaymentSenseFlow(this.store, this.requestJSON, false);
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.RMS) {
      this.store.dispatch(new SetRmsRequestJson(this.requestJSON));
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.TRUSTPAYMENTS) {
      this.trustpaymentComponent.submitForm(this.requestJSON);
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.JCC) {
      this.jccFormRequest = this.requestJSON?.paymentFormParams;
      if (this.jccForm.nativeElement) {
        this.jccServerLink = environment.name === 'production' ?
          'https://jccpg.jccsecure.com/EcomPayment/RedirectAuthLink'
          : 'https://tjccpg.jccsecure.com/EcomPayment/RedirectAuthLink';
        setTimeout(_ => this.jccForm.nativeElement?.submit());
      }
    }
    if (this.selectedPaymentMethod === PAYMENT_METHOD.PAYAPL) {
      this.window.location.href = this.requestJSON.checkoutUrl;
    }

    if (this.selectedPaymentMethod === PAYMENT_METHOD.GLOBALPAY) {
      this.store.dispatch(new SetGlobalPayRequestJson(this.requestJSON));
    }
  }

  private setPhysicalPaymentDetails() {
    const physicalPaymentDetails = {
      'orderId': this.requestJSON.paymentFormParams.orderId,
      'storeId': this.requestJSON.paymentFormParams.storeId,
      'isStandalonePayment': false,
      'redirectUrl': this.requestJSON.paymentFormParams.responseUrl
    };
    this.storageService.setSavedState(JSON.stringify(physicalPaymentDetails), 'physicalPaymentDetails');
  }

  setPayLaterOptionLabel(payLaterOption?: string): void {
    if (payLaterOption === 'CASH') {
      this.payLaterLabel = 'public.payment.payLaterWithCash';
    } else if (payLaterOption === 'CARD') {
      this.payLaterLabel = 'public.payment.payLaterWithCard';
    } else if (payLaterOption === 'CASH_CARD') {
      this.payLaterLabel = 'public.payment.payLaterWithCashOrCard';
    }
  }

  // go back to previous screen
  OnGoBack(event) {
    event.preventDefault();
    this.locationService.goBack();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setPaymentPayDetails() {
    const paymentPayDetails = {
      'requestJSON': this.requestJSON,
      'isStandalonePayment': false,
      'selectedStore': this.selectedStore,
      'backToCurrentCat': this.backToCurrentCat
    }
    this.storageService.setSavedState(JSON.stringify(paymentPayDetails), 'paymentPayDetails');
  }
}
