import {
  getSubscriptionPurchase,
  getStatus,
  getValidations,
  getSharePaymentLinkUrl
} from './../+state/store-subscriptions.selectors';
import { StorePurchase } from './../subscriptions';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest, forkJoin } from 'rxjs';
import {
  UpdateSubscriptionPurchase,
  CheckoutSubscription,
  GenerateSubscriptionPaymentLink
} from '../+state/store-subscriptions.actions';
import { map, filter, debounceTime, takeUntil, tap, take } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getSelectedStore } from '../../+state/stores.selectors';
import { ClientStore } from '../../stores';
import { helpPage } from 'src/app/shared/help-page.const';
import { getLoggedInUser } from "../../../auth/+state/auth.selectors";

@Component({
  selector: 'app-subscription-purchase',
  templateUrl: './subscription-purchase.component.html',
  styleUrls: ['./subscription-purchase.component.scss']
})
export class SubscriptionPurchaseComponent implements OnInit, OnDestroy {

  readonly NETHERLANDS = 'NL';
  readonly BELGIUM = 'BE';
  readonly YEARLY = 'YEARLY';
  readonly MONTHLY = 'MONTHLY';

  selectedStore$: Observable<ClientStore>;

  subscriptionPurchase$: Observable<StorePurchase>;

  checkoutEnabled$: Observable<boolean>;

  vatInfo$: Observable<{percentage: number; vatCharge: number}>;

  subscriptionPurchaseForm: FormGroup;

  private destroy$ = new Subject();

  subscriptionPurchaseHelpPage = helpPage.subscription;

  storeSubscriptionErrors$: Observable<any>;
  inValidVat: boolean;
  inValidVoucher: boolean;
  reservedVoucher: boolean;

  sharePaymentLinkUrl: string;
  showSharePaymentLinkButton: boolean = false;

  constructor(private store: Store<any>, private fb: FormBuilder) { }

  ngOnInit() {

    this.selectedStore$ = this.store.pipe(
      select(getSelectedStore)
    );

    this.subscriptionPurchase$ = this.store.pipe(
      select(getSubscriptionPurchase)
    );

    this.checkoutEnabled$ = this.store.pipe(
      select(getStatus),
      map(s => s === 'LOADED')
    );

    this.subscriptionPurchaseForm = this.fb.group({
      vatNumber: ['',  Validators.compose([Validators.minLength(5), Validators.maxLength(20)])],
      voucherCode: ['',
        Validators.compose(
          [Validators.minLength(1), Validators.maxLength(16), Validators.pattern('^[a-zA-Z0-9]{4}(-)?[a-zA-Z0-9]{4}$')]
        )],
      subscriptionType: ['YEARLY', Validators.required],
      recurringPayment: true
    });


    combineLatest([this.selectedStore$, this.subscriptionPurchase$])
      .pipe(
        filter(([store, subscriptionPurchase]) => store.id !== -1 && subscriptionPurchase.id !== -1),
        takeUntil(this.destroy$),
        take(1)
      ).subscribe(([store, subscriptionPurchase]) => {
        // Set selected form values if any
        this.subscriptionPurchaseForm.patchValue({
          voucherCode: subscriptionPurchase.voucherCode,
          vatNumber: subscriptionPurchase.vatNumber ? subscriptionPurchase.vatNumber : store.vatNumber,
          subscriptionType: subscriptionPurchase.subscriptionType,
          recurringPayment: subscriptionPurchase.recurringPayment
        }, {emitEvent: false});

        if (store.address?.country.europeanCountry && store.address.country.code !== this.NETHERLANDS) {
          this.subscriptionPurchaseForm.get('vatNumber').setValidators(
            [Validators.required, Validators.compose([Validators.minLength(5), Validators.maxLength(20)])]);
          this.subscriptionPurchaseForm.get('vatNumber').updateValueAndValidity();
        }
      });


    // Update purchase in backend on change
    this.subscriptionPurchaseForm.get('vatNumber').valueChanges.pipe(
      debounceTime(500),
      filter(_ => this.subscriptionPurchaseForm.get('vatNumber').valid),
      takeUntil(this.destroy$)
    ).subscribe(
      val => this.store.dispatch(new UpdateSubscriptionPurchase(
        {
          voucherCode: this.getControl('voucherCode').value,
          vatNumber: val,
          status: 'DRAFT',
          subscriptionType: this.getControl('subscriptionType').value,
          recurringPayment: this.getControl('recurringPayment').value
        }))
    );

    this.subscriptionPurchaseForm.get('voucherCode').valueChanges.pipe(
      debounceTime(500),
      filter(_ => this.subscriptionPurchaseForm.get('voucherCode').valid),
      takeUntil(this.destroy$)
    ).subscribe(
      val => this.store.dispatch(new UpdateSubscriptionPurchase(
        {
          voucherCode: val,
          vatNumber: this.getControl('vatNumber').value,
          status: 'DRAFT',
          subscriptionType: this.getControl('subscriptionType').value,
          recurringPayment: this.getControl('recurringPayment').value
        }))
    );

    this.subscriptionPurchaseForm.get('subscriptionType').valueChanges.pipe(
      debounceTime(500),
      filter(_ => this.subscriptionPurchaseForm.get('subscriptionType').valid),
      takeUntil(this.destroy$)
    ).subscribe(
      val => this.store.dispatch(new UpdateSubscriptionPurchase(
        {
          voucherCode: this.getControl('voucherCode').value,
          vatNumber: this.getControl('vatNumber').value,
          status: 'DRAFT',
          subscriptionType: val,
          recurringPayment: this.getControl('recurringPayment').value
        }))
    );

    this.subscriptionPurchaseForm.get('recurringPayment').valueChanges.pipe(
      debounceTime(500),
      filter(_ => this.subscriptionPurchaseForm.get('recurringPayment').valid),
      takeUntil(this.destroy$)
    ).subscribe(
      val => this.store.dispatch(new UpdateSubscriptionPurchase(
        {
          voucherCode: this.getControl('voucherCode').value,
          vatNumber: this.getControl('vatNumber').value,
          status: 'DRAFT',
          subscriptionType: this.getControl('subscriptionType').value,
          recurringPayment: val
        }))
    );

    // End - Update purchase in backend on change

    this.vatInfo$ = this.subscriptionPurchase$.pipe(
      filter(s => s.id > 0),
      map(s => {
        if (s.vatChargeType === 'REVERSE_CHARGE') {
          return {percentage: 0, vatCharge: 0};
        } else {
          return {percentage: s.vatPercentage, vatCharge: s.vatCharge};
        }
      })
    );

    this.storeSubscriptionErrors$ = this.store.pipe(select(getValidations));
    this.storeSubscriptionErrors$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(
     message => {
        if (!!message && Array.isArray(message) && [...message].includes('No voucher present with the code.')) {
          this.inValidVoucher = true;
        } else if (!!message && !!message.voucherCode) {
          this.inValidVoucher = false;
        } else {
          this.inValidVoucher = null;
        }
        if (!!message && Array.isArray(message) && [...message].includes('Invalid VAT number')) {
          this.inValidVat = true;
        } else if (!!message && !!message.vatNumber) {
          this.inValidVat = false;
        } else {
          this.inValidVat = null;
        }
        if (!!message && Array.isArray(message) && [...message].includes('The voucher is reserved by some other purchase.')) {
          this.reservedVoucher = true;
        } else if (!!message && !!message.voucherCode) {
          this.reservedVoucher = false;
        } else {
          this.reservedVoucher = null;
        }
    });

    this.subscriptionPurchaseForm.get('voucherCode').valueChanges
    .pipe(
      takeUntil(this.destroy$)
    ).subscribe(v => {
      this.inValidVoucher = null;
      this.reservedVoucher = null;
    });

    this.subscriptionPurchaseForm.get('vatNumber').valueChanges
    .pipe(
      takeUntil(this.destroy$)
    ).subscribe(v => {
      this.inValidVat = null;
    });


    combineLatest([this.subscriptionPurchaseForm.get('subscriptionType').valueChanges, this.subscriptionPurchase$])
    .pipe(
      takeUntil(this.destroy$)
    ).subscribe(([bp, subscriptionPurchase]) => {
      if (bp === this.MONTHLY) {
        this.subscriptionPurchaseForm.patchValue({
          recurringPayment: true
        }, {emitEvent: false});
      }
    });

    this.store.select(getSharePaymentLinkUrl)
    .pipe(takeUntil(this.destroy$))
    .subscribe(url => {
      this.sharePaymentLinkUrl = url;
    });

    combineLatest([
      this.store.pipe(select(getLoggedInUser)),
      this.store.pipe(select(getSelectedStore))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([loggedInUser, store]) => {
      if (loggedInUser?.superAdmin) {
        this.showSharePaymentLinkButton = true;
      }
    });
  }

  onContinue() {
    // Recurring payment only support Stripe credit card
    this.store.dispatch(new CheckoutSubscription('STRIPE'));
  }

  getControl(name: string) {
    return this.subscriptionPurchaseForm.get(name);
  }

  isSubscriptionTypeMonthly() {
    return this.subscriptionPurchaseForm.get('subscriptionType').value === this.MONTHLY;
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClickSharePaymentLink() {
    this.store.dispatch(new GenerateSubscriptionPaymentLink('STRIPE'));
  }

  copySharePaymentLinkUrl() {
    navigator.clipboard.writeText(this.sharePaymentLinkUrl);
  }
}
