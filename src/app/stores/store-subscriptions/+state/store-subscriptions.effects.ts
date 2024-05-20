import { getSelectedStore } from '../../+state/stores.selectors';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions, act } from '@ngrx/effects';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { StoreSubscriptionsService } from '../store-subscriptions.service';
import {
  StoreSubscriptionsActionType,
  CheckoutSubscriptionStripe,
  CheckoutSubscriptionStripeSuccess,
  CheckoutSubscriptionStripeFail,
  PurchaseSubscription,
  PurchaseSubscriptionSuccess,
  PurchaseSubscriptionFail,
  UpdateSubscriptionPurchaseFail,
  UpdateSubscriptionPurchase,
  UpdateSubscriptionPurchaseSuccess,
  CheckoutSubscription,
  CheckoutSubscriptionPaypal,
  CheckoutSubscriptionPaypalFail,
  CheckoutSubscriptionPaypalSuccess,
  PurchaseSubscriptionsSuccess,
  PurchaseSubscriptionsFail,
  DownloadPurchaseInvoicePdf,
  DownloadPurchaseInvoicePdfSuccess,
  DownloadPurchaseInvoicePdfFailed,
  PurchaseSubscriptions,
  CheckoutSubscriptionIdeal,
  CheckoutSubscriptionIdealSuccess,
  CheckoutSubscriptionIdealFail,
  CheckoutSubscriptionBancontact,
  CheckoutSubscriptionBancontactFail,
  CheckoutSubscriptionBancontactSuccess,
  ExtendSubscriptionPurchase,
  ExtendSubscriptionPurchaseSuccess,
  ExtendSubscriptionPurchaseFailed,
  SaveInvoice,
  SaveInvoiceSuccess,
  SaveInvoiceFailed,
  LoadInvoice,
  LoadInvoiceSuccess,
  LoadInvoiceFail,
  DeleteInvoice,
  DeleteInvoiceSuccess,
  DeleteInvoiceFailed,
  GenerateSubscriptionPaymentLink,
  GenerateSubscriptionPaymentLinkSuccess,
  GenerateSubscriptionPaymentLinkFail,
  UpdatePriceFailed,
  UpdatePriceSuccess,
  UpdatePrice
} from './store-subscriptions.actions';
import { getSubscriptionPurchase } from './store-subscriptions.selectors';
import { LoadStore } from '../../+state/stores.actions';
import { StorePurchase } from '../subscriptions';
declare var Stripe: any;

@Injectable()
export class StoreSubscriptionsEffects {

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private subscriptionsService: StoreSubscriptionsService,
    private toastr: ToastrService,
    private router: Router) { }

  onPurchaseSubscriptions = createEffect(() => this.actions$.pipe(
    ofType<PurchaseSubscriptions>(StoreSubscriptionsActionType.PurchaseSubscriptions),
    switchMap(action => this.subscriptionsService.list(action.storeId, !!action.status ? action.status : '').pipe(
      map(p => new PurchaseSubscriptionsSuccess(p)),
      catchError(e => of(new PurchaseSubscriptionsFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onPurchaseSubscription = createEffect(() => this.actions$.pipe(
    ofType<PurchaseSubscription>(StoreSubscriptionsActionType.PurchaseSubscription),
    switchMap((action) => this.subscriptionsService.initiatePurchase(action.storeId).pipe(
      map(p => new PurchaseSubscriptionSuccess(p)),
      catchError(e => of(new PurchaseSubscriptionFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onCheckoutSubscription = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscription>(StoreSubscriptionsActionType.CheckoutSubscription),
    map(action => {
      switch (action.provider) {
        case 'IDEAL':
          return new CheckoutSubscriptionIdeal();
        case 'BANCONTACT':
          return new CheckoutSubscriptionBancontact();
        case 'STRIPE':
          return new CheckoutSubscriptionStripe();
        case 'PAYPAL':
          return new CheckoutSubscriptionPaypal();
      }
    })
  ));


  onCheckoutSubscriptionStripe = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionStripe>(StoreSubscriptionsActionType.CheckoutSubscriptionStripe),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSubscriptionPurchase))),
    switchMap(([action, store, purchase]) => this.subscriptionsService.checkoutStripe(store.id, purchase.id).pipe(
      map(s => new CheckoutSubscriptionStripeSuccess(s)),
      catchError(e => of(new CheckoutSubscriptionStripeFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onGenerateSubscriptionPaymentLink = createEffect(() => this.actions$.pipe(
    ofType<GenerateSubscriptionPaymentLink>(StoreSubscriptionsActionType.GenerateSubscriptionPaymentLink),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSubscriptionPurchase))),
    switchMap(([action, store, purchase]) => this.subscriptionsService.checkoutStripe(store.id, purchase.id, true).pipe(
      map(s => new GenerateSubscriptionPaymentLinkSuccess(s.sessionUrl)),
      catchError(e => of(new GenerateSubscriptionPaymentLinkFail(e.error.errors.map(err => err.message))))
    ))
  ));

  onGenerateSubscriptionPaymentLinkFailed = createEffect(() => this.actions$.pipe(
    ofType<GenerateSubscriptionPaymentLinkFail>(StoreSubscriptionsActionType.GenerateSubscriptionPaymentLinkFail),
    tap(a => a.errorMessages.forEach(e => {
      this.toastr.error(e, 'Action failed!');

    }))
  ), { dispatch: false });


  onCheckoutSubscriptionIdeal = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionIdeal>(StoreSubscriptionsActionType.CheckoutSubscriptionIdeal),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSubscriptionPurchase))),
    switchMap(([action, store, purchase]) => this.subscriptionsService.checkoutIdeal(store.id, purchase.id).pipe(
      map(s => new CheckoutSubscriptionIdealSuccess(s)),
      catchError(e => of(new CheckoutSubscriptionIdealFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onCheckoutSubscriptionBancontact = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionIdeal>(StoreSubscriptionsActionType.CheckoutSubscriptionBancontact),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSubscriptionPurchase))),
    switchMap(([action, store, purchase]) => this.subscriptionsService.checkoutBancontact(store.id, purchase.id).pipe(
      map(s => new CheckoutSubscriptionBancontactSuccess(s)),
      catchError(e => of(new CheckoutSubscriptionBancontactFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onCheckoutSubscriptionStripeSuccess = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionStripeSuccess | CheckoutSubscriptionIdealSuccess | CheckoutSubscriptionBancontactSuccess>(
      StoreSubscriptionsActionType.CheckoutSubscriptionStripeSuccess,
      StoreSubscriptionsActionType.CheckoutSubscriptionIdealSuccess,
      StoreSubscriptionsActionType.CheckoutSubscriptionBancontactSuccess
    ),
    tap(a => {
      const stripe = Stripe(a.session.stripePublicKey);
      stripe.redirectToCheckout({
        sessionId: a.session.sessionId
      });
    })
  ), { dispatch: false });



  onCheckoutSubscriptionStripeFailed = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionStripeFail
      | UpdateSubscriptionPurchaseFail
      | CheckoutSubscriptionPaypalFail
      | CheckoutSubscriptionIdealFail
      | CheckoutSubscriptionBancontactFail>(
        StoreSubscriptionsActionType.CheckoutSubscriptionStripeFail,
        StoreSubscriptionsActionType.UpdateSubscriptionPurchaseFail,
        StoreSubscriptionsActionType.CheckoutSubscriptionPaypalFail,
        StoreSubscriptionsActionType.CheckoutSubscriptionIdealFail,
        StoreSubscriptionsActionType.CheckoutSubscriptionBancontactFail),
    tap(a => a.errorMessages.forEach(e => {
      if (e !== 'No voucher present with the code.' &&
        e !== 'Invalid VAT number' &&
        e !== 'The voucher is reserved by some other purchase.') {
        this.toastr.error(e, 'Action failed!');
      }

    }))
  ), { dispatch: false });


  onCheckoutSubscriptionPaypal = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionPaypal>(StoreSubscriptionsActionType.CheckoutSubscriptionPaypal),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSubscriptionPurchase))),
    switchMap(([action, store, purchase]) => this.subscriptionsService.checkoutPaypal(store.id, purchase.id).pipe(
      map(s => new CheckoutSubscriptionPaypalSuccess(s)),
      catchError(e => of(new CheckoutSubscriptionPaypalFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onCheckoutSubscriptionPaypalSuccess = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSubscriptionPaypalSuccess>(StoreSubscriptionsActionType.CheckoutSubscriptionPaypalSuccess),
    tap(a => window.location.href = a.approvalLink)
  ), { dispatch: false });


  onUpdateSubscriptionPurchase = createEffect(() => this.actions$.pipe(
    ofType<UpdateSubscriptionPurchase>(StoreSubscriptionsActionType.UpdateSubscriptionPurchase),
    withLatestFrom(this.store.pipe(select(getSelectedStore)), this.store.pipe(select(getSubscriptionPurchase))),
    switchMap(([action, store, purchase]) => this.subscriptionsService.updatePurchase(store.id, purchase.id, action.updateRequest).pipe(
      map(ret => new UpdateSubscriptionPurchaseSuccess(ret)),
      catchError(e => of(new UpdateSubscriptionPurchaseFail(e.error.errors.map(err => err.message))))
    ))
  ));


  onDownloadPurchaseInvoicePdf = createEffect(() => this.actions$.pipe(
    ofType<DownloadPurchaseInvoicePdf>(StoreSubscriptionsActionType.DownloadPurchaseInvoicePdf),
    switchMap(action => this.subscriptionsService.downloadPurchaseInvoicePdf(action.storeId, action.purchaseId)
      .pipe(
        map(s => new DownloadPurchaseInvoicePdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadPurchaseInvoicePdfFailed('An error occured. Please try again')))
      ))
  ));

  onExtendSubscriptionPurchase = createEffect(() => this.actions$.pipe(
    ofType<ExtendSubscriptionPurchase>(StoreSubscriptionsActionType.ExtendSubscriptionPurchase),
    switchMap(action => this.subscriptionsService.extendSubsriptionPurchase(action.storeId, action.request)
      .pipe(
        map(s => new ExtendSubscriptionPurchaseSuccess(s)),
        catchError(a => of(new ExtendSubscriptionPurchaseFailed('An error occured. Please try again')))
      ))
  ));

  onExtendSubscriptionPurchaseSuccess = createEffect(() => this.actions$.pipe(
    ofType<ExtendSubscriptionPurchaseSuccess>(StoreSubscriptionsActionType.ExtendSubscriptionPurchaseSuccess),
    tap(a => {
      this.store.dispatch(new LoadStore(a.store.id));
      this.router.navigate(['/manager/stores/' + a.store.id + '/billing/subscriptions']);
    })
  ), { dispatch: false });


  onExtendSubscriptionPurchaseFailed = createEffect(() => this.actions$.pipe(
    ofType<ExtendSubscriptionPurchaseFailed>(StoreSubscriptionsActionType.ExtendSubscriptionPurchaseFailed),
    tap(a => this.toastr.error('An error occured while saving subscription'))
  ), { dispatch: false });


  onSaveInvoice = createEffect(() => this.actions$.pipe(
    ofType<SaveInvoice>(StoreSubscriptionsActionType.SaveInvoice),
    switchMap(action => this.subscriptionsService.saveInvoice(action.invoiceId, action.request)
      .pipe(
        map(s => new SaveInvoiceSuccess(s, action.request.storeId)),
        catchError(a => of(new SaveInvoiceFailed('An error occured. Please try again')))
      ))
  ));

  onSaveInvoiceSuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveInvoiceSuccess>(StoreSubscriptionsActionType.SaveInvoiceSuccess),
    tap(a => {
      this.toastr.success('Saving invoice success');
      this.router.navigate(['/manager/stores/' + a.storeId + '/billing/invoices']);
    })
  ), { dispatch: false });


  onSaveInvoiceFailed = createEffect(() => this.actions$.pipe(
    ofType<SaveInvoiceFailed>(StoreSubscriptionsActionType.SaveInvoiceFailed),
    tap(a => this.toastr.error('An error occured while saving invoice'))
  ), { dispatch: false });

  onDeleteInvoice = createEffect(() => this.actions$.pipe(
    ofType<DeleteInvoice>(StoreSubscriptionsActionType.DeleteInvoice),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([a, store]) => this.subscriptionsService.deleteInvoice(a.invoiceId)
      .pipe(
        map(s => new DeleteInvoiceSuccess(store.id)),
        catchError(err => of(new DeleteInvoiceFailed('An error occured. Please try again')))
      ))
  ));

  onDeleteInvoiceSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteInvoiceSuccess>(StoreSubscriptionsActionType.DeleteInvoiceSuccess),
    tap(a => {
      this.router.navigate(['/manager/stores/' + a.storeId + '/billing/invoices']);
    })
  ), { dispatch: false });


  onDeleteInvoiceFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteInvoiceFailed>(StoreSubscriptionsActionType.DeleteInvoiceFailed),
    tap(a => this.toastr.error('An error occured while saving subscription'))
  ), { dispatch: false });

  onLoadInvoice = createEffect(() => this.actions$.pipe(
    ofType<LoadInvoice>(StoreSubscriptionsActionType.LoadInvoice),
    switchMap((action) => this.subscriptionsService.getInvoiceById(action.storeId, action.invoiceId).pipe(
      map(p => new LoadInvoiceSuccess(p)),
      catchError(e => of(new LoadInvoiceFail(e.error.errors.map(err => err.message))))
    ))
  ));

  onUpdatePrice = createEffect(() => this.actions$.pipe(
    ofType<UpdatePrice>(StoreSubscriptionsActionType.UpdatePrice),
    switchMap(action => this.subscriptionsService.updatePrice(action.storeId, action.request)
      .pipe(
        map((s: StorePurchase) => new UpdatePriceSuccess(action.storeId)),
        catchError(a => of(new UpdatePriceFailed('An error occurred. Please try again')))
      ))
  ));


  onUpdatePriceSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdatePriceSuccess>(StoreSubscriptionsActionType.UpdatePriceSuccess),
    tap(a => {
      this.toastr.success('Settings updated!', 'Success!');
      this.store.dispatch(new LoadStore(a.storeId));
      this.router.navigate(['/manager/stores/' + a.storeId + '/billing/subscriptions']);
    })
  ), { dispatch: false });


  onUpdatePriceFailed = createEffect(() => this.actions$.pipe(
    ofType<UpdatePriceFailed>(StoreSubscriptionsActionType.UpdatePriceFailed),
    tap(a => this.toastr.error('An error occured while saving fee'))
  ), { dispatch: false });
}
