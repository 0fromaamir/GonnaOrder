import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import {
  StorePaymentMethodsActionType,
  ConnectStripe,
  ToggleStripe,
  ToggleStripeSuccess,
  ToggleStripeFailed,
  DisconnectStripe,
  DisconnectStripeSuccess,
  DisconnectStripeFailed,
  ConnectPaypal,
  TogglePaypal,
  TogglePaypalSuccess,
  TogglePaypalFailed,
  DisconnectPaypal,
  DisconnectPaypalSuccess,
  DisconnectPaypalFailed,
  ToggleSquareSuccess,
  ToggleSquareFailed,
  ToggleSquare,
  ConnectPaymentsense,
  ConnectPaymentsenseSuccess,
  ConnectPaymentsenseFailed,
  ConnectJCC,
  ConnectJCCSuccess,
  ConnectJCCFailed,
  DisConnectJCC,
  DisConnectJCCSuccess,
  DisConnectJCCFailed,
  ConnectTrustPayments,
  ConnectTrustPaymentsSuccess,
  ConnectTrustPaymentsFailed,
  DisconnectTrustPaymentsFailed,
  DisconnectTrustPaymentsSuccess,
  DisconnectTrustPayments,
  ConnectVivaPayments,
  ConnectVivaPaymentsSuccess,
  ConnectVivaPaymentsFailed,
  DisconnectVivaPayments,
  DisconnectVivaPaymentsSuccess,
  DisconnectVivaPaymentsFailed,
  ConnectPayabl,
  ConnectPayablSuccess,
  ConnectPayablFailed,
  DisConnectPayabl,
  DisConnectPayablSuccess,
  DisConnectPayablFailed,
  ConnectGlobalPay,
  ConnectGlobalPayFailed,
  DisConnectGlobalPay,
  DisConnectGlobalPayFailed,
  ConnectMollieFailed,
  ConnectMollie,
  DisConnectMollie,
  DisConnectMollieFailed,
  DisConnectFygaroFailed,
  ConnectFygaro,
  ConnectFygaroFailed,
  DisConnectFygaro,
  ConnectEpay,
  ConnectEpayFailed,
  DisConnectEpay,
  DisConnectEpayFailed,
  ConnectApcopayFailed,
  ConnectApcopay,
  DisConnectApcopay,
  DisConnectApcopayFailed, ConnectHobex, ConnectHobexFailed, DisconnectHobex, DisconnectHobexFailed,
} from './payment.actions';
import { StorePaymentMethodsService } from '../store-payment-methods.service';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { getSelectedStore } from '../../+state/stores.selectors';
import { ToastrService } from 'ngx-toastr';
import { StoresService } from '../../stores.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadStore } from '../../+state/stores.actions';
import {UpdateStoreSettingsSuccess} from '../../+state/stores.actions';

@Injectable()
export class StorePaymentEffects {

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private storePaymentMethodsService: StorePaymentMethodsService,
    private storesService: StoresService,
    private toastr: ToastrService,
    private translateSer: TranslateService) { }



  onConnectStripe = createEffect(() => this.actions$.pipe(
    ofType<ConnectStripe>(StorePaymentMethodsActionType.ConnectStripe),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.connectStripe(store.id).pipe(
      tap(s => window.location.href = s)
    ))
  ), { dispatch: false });


  onToggleStripe = createEffect(() => this.actions$.pipe(
    ofType<ToggleStripe>(StorePaymentMethodsActionType.ToggleStripe),
    withLatestFrom(this.store.select(getSelectedStore)),
    map(([a, s]) => ({settings: [{key: a.key, value: a.enabled}], id: s.id, enabled: a.enabled, key: a.key})),
    switchMap( r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(store => new ToggleStripeSuccess(store.settings)),
        catchError(e => {
          return of(new ToggleStripeFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onToggleStripeSuccess = createEffect(() => this.actions$.pipe(
    ofType<ToggleStripeSuccess>(StorePaymentMethodsActionType.ToggleStripeSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onToggleStripeFailed = createEffect(() => this.actions$.pipe(
    ofType<ToggleStripeFailed>(StorePaymentMethodsActionType.ToggleStripeFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onDisconnectStripe = createEffect(() => this.actions$.pipe(
    ofType<DisconnectStripe>(StorePaymentMethodsActionType.DisconnectStripe),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.disconnectStripe(store.id).pipe(
      map(s => {
        this.store.dispatch(new LoadStore(store.id));
        return new DisconnectStripeSuccess();
      }),
      catchError(e => of(new DisconnectStripeFailed(e.error.errors.map((err: { message: any; }) => err.message))))
    ))
  ));


  onDisconnectStripeSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisconnectStripeSuccess>(StorePaymentMethodsActionType.DisconnectStripeSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.stripeDisconnect'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onDisconnectStripeFailed = createEffect(() => this.actions$.pipe(
    ofType<DisconnectStripeFailed>(StorePaymentMethodsActionType.DisconnectStripeFailed),
    tap(a => a.errorMessages.forEach( e =>
      this.toastr.error(e, 'Failed!')
    ))
  ), { dispatch: false });


  onConnectPaypal = createEffect(() => this.actions$.pipe(
    ofType<ConnectPaypal>(StorePaymentMethodsActionType.ConnectPaypal),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.connectPaypal(store.id).pipe(
      tap(s => window.location.href = s)
    ))
  ), { dispatch: false });


  onTogglePaypal = createEffect(() => this.actions$.pipe(
    ofType<TogglePaypal>(StorePaymentMethodsActionType.TogglePaypal),
    withLatestFrom(this.store.select(getSelectedStore)),
    map(([a, s]) => ({settings: [{key: 'PAYMENT_PAYPAL_ENABLED', value: a.enabled}], id: s.id, enabled: a.enabled})),
    switchMap( r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(store => new TogglePaypalSuccess(store.settings)),
        catchError(e => {
          return of(new TogglePaypalFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onTogglePaypalSuccess = createEffect(() => this.actions$.pipe(
    ofType<TogglePaypalSuccess>(StorePaymentMethodsActionType.TogglePaypalSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onTogglePaypalFailed = createEffect(() => this.actions$.pipe(
    ofType<TogglePaypalFailed>(StorePaymentMethodsActionType.TogglePaypalFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onDisconnectPaypal = createEffect(() => this.actions$.pipe(
    ofType<DisconnectPaypal>(StorePaymentMethodsActionType.DisconnectPaypal),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storePaymentMethodsService.disconnecPaypal(store.id).pipe(
      map(s => {
        this.store.dispatch(new LoadStore(store.id));
        return new DisconnectPaypalSuccess();
      }),
      catchError(e => of(new DisconnectPaypalFailed(e.error.errors.map((err: { message: any; }) => err.message))))
    ))
  ));


  onDisconnectPaypalSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisconnectPaypalSuccess>(StorePaymentMethodsActionType.DisconnectPaypalSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.paypalDisconnect'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onDisconnectPaypalFailed = createEffect(() => this.actions$.pipe(
    ofType<DisconnectPaypalFailed>(StorePaymentMethodsActionType.DisconnectPaypalFailed),
    tap(a => a.errorMessages.forEach( e =>
      this.toastr.error(e, 'Failed!')
    ))
  ), { dispatch: false });


  onToggleSquare = createEffect(() => this.actions$.pipe(
    ofType<ToggleSquare>(StorePaymentMethodsActionType.ToggleSquare),
    withLatestFrom(this.store.select(getSelectedStore)),
    map(([a, s]) => ({settings: [{key: 'PAYMENT_SQUARE_CREDIT_CARD_ENABLED', value: a.enabled}], id: s.id, enabled: a.enabled})),
    switchMap( r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(store => new ToggleSquareSuccess(store.settings)),
        catchError(e => {
          return of(new ToggleSquareFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onToggleSquareSuccess = createEffect(() => this.actions$.pipe(
    ofType<ToggleSquareSuccess>(StorePaymentMethodsActionType.ToggleSquareSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onToggleSquareFailed = createEffect(() => this.actions$.pipe(
    ofType<ToggleSquareFailed>(StorePaymentMethodsActionType.ToggleSquareFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onConnectPaymentsense = createEffect(() => this.actions$.pipe(
    ofType<ConnectPaymentsense>(StorePaymentMethodsActionType.ConnectPaymentsense),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectPaymentsense(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectPaymentsenseSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectPaymentsenseFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onConnectPaymentsenseSuccess = createEffect(() => this.actions$.pipe(
    ofType<ConnectPaymentsenseSuccess>(StorePaymentMethodsActionType.ConnectPaymentsenseSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onConnectPaymentsenseFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectPaymentsenseFailed>(StorePaymentMethodsActionType.ConnectPaymentsenseFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onConnectJCC = createEffect(() => this.actions$.pipe(
    ofType<ConnectJCC>(StorePaymentMethodsActionType.ConnectJCC),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectJcc(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectJCCSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectJCCFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onConnectJCCSuccess = createEffect(() => this.actions$.pipe(
    ofType<ConnectJCCSuccess>(StorePaymentMethodsActionType.ConnectJCCSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onConnectJCCFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectJCCFailed>(StorePaymentMethodsActionType.ConnectJCCFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onDisConnectJCC = createEffect(() => this.actions$.pipe(
    ofType<DisConnectJCC>(StorePaymentMethodsActionType.DisConnectJCC),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectJcc(selectedStore.id)
      .pipe(
        map(store => {
          this.store.dispatch(new LoadStore(selectedStore.id));
          return new DisConnectJCCSuccess();
        }),
        catchError(e => {
          return of(new DisConnectJCCFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onDisConnectJCCSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisConnectJCCSuccess>(StorePaymentMethodsActionType.DisConnectJCCSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onDisConnectJCCFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectJCCFailed>(StorePaymentMethodsActionType.DisConnectJCCFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onConnectTrustPayments = createEffect(() => this.actions$.pipe(
    ofType<ConnectTrustPayments>(StorePaymentMethodsActionType.ConnectTrustPayments),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectTrustPayments(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectJCCSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectJCCFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onConnectTrustPaymentsSuccess = createEffect(() => this.actions$.pipe(
    ofType<ConnectTrustPaymentsSuccess>(StorePaymentMethodsActionType.ConnectTrustPaymentsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onConnectTrustPaymentsFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectTrustPaymentsFailed>(StorePaymentMethodsActionType.ConnectTrustPaymentsFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onDisconnectTrustPayments = createEffect(() => this.actions$.pipe(
    ofType<DisconnectTrustPayments>(StorePaymentMethodsActionType.DisconnectTrustPayments),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectTrustPayments(selectedStore.id)
      .pipe(
        map(store => {
          this.store.dispatch(new LoadStore(selectedStore.id));
          return new DisconnectTrustPaymentsSuccess();
        }),
        catchError(e => {
          return of(new DisconnectTrustPaymentsFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onDisconnectTrustPaymentsSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisconnectTrustPaymentsSuccess>(StorePaymentMethodsActionType.DisconnectTrustPaymentsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onDisconnectTrustPaymentsFailed = createEffect(() => this.actions$.pipe(
    ofType<DisconnectTrustPaymentsFailed>(StorePaymentMethodsActionType.DisconnectTrustPaymentsFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onConnectVivaPayments = createEffect(() => this.actions$.pipe(
    ofType<ConnectVivaPayments>(StorePaymentMethodsActionType.ConnectVivaPayments),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectVivaPayments(selectedStore.id, action.settings)
      .pipe(
        map(store => new ConnectVivaPaymentsSuccess(store.settings)),
        catchError(e => {
          return of(new ConnectVivaPaymentsFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onConnectVivaPaymentsSuccess = createEffect(() => this.actions$.pipe(
    ofType<ConnectVivaPaymentsSuccess>(StorePaymentMethodsActionType.ConnectVivaPaymentsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onConnectVivaPaymentsFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectVivaPaymentsFailed>(StorePaymentMethodsActionType.ConnectVivaPaymentsFailed),
    tap(a => a.errorMessages.forEach( err => {
      this.toastr.error(err, 'Failed!'); }
    ))
  ), { dispatch: false });


  onDisconnectVivaPayments = createEffect(() => this.actions$.pipe(
    ofType<DisconnectVivaPayments>(StorePaymentMethodsActionType.DisconnectVivaPayments),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectVivaPayments(selectedStore.id)
      .pipe(
        map(store => {
          this.store.dispatch(new LoadStore(selectedStore.id));
          return new DisconnectVivaPaymentsSuccess();
        }),
        catchError(e => {
          return of(new DisconnectVivaPaymentsFailed(e.error.errors.map((err: { message: any; }) => err.message)));
        })
      ))
  ));


  onDisconnectVivaPaymentsSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisconnectVivaPaymentsSuccess>(StorePaymentMethodsActionType.DisconnectVivaPaymentsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onDisconnectVivaPaymentsFailed = createEffect(() => this.actions$.pipe(
    ofType<DisconnectVivaPaymentsFailed>(StorePaymentMethodsActionType.DisconnectVivaPaymentsFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });

  // Payable

  onConnectPayabl = createEffect(() => this.actions$.pipe(
    ofType<ConnectPayabl>(StorePaymentMethodsActionType.ConnectPayabl),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectPayabl(selectedStore.id, action.settings)
    .pipe(
      map(store => new ConnectPayablSuccess(store.settings)),
      catchError(e => {
        return of(new ConnectPayablFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));


  onConnectPayablSuccess = createEffect(() => this.actions$.pipe(
    ofType<ConnectPayablSuccess>(StorePaymentMethodsActionType.ConnectPayablSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onConnectPayablFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectPayablFailed>(StorePaymentMethodsActionType.ConnectPayablFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onDisConnectPayabl = createEffect(() => this.actions$.pipe(
    ofType<DisConnectPayabl>(StorePaymentMethodsActionType.DisConnectPayabl),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectPayabl(selectedStore.id)
    .pipe(
      map(store => {
        this.store.dispatch(new LoadStore(selectedStore.id));
        return new DisConnectPayablSuccess();
      }),
      catchError(e => {
        return of(new DisConnectPayablFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));


  onDisConnectPayablSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisConnectPayablSuccess>(StorePaymentMethodsActionType.DisConnectPayablSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });


  onDisConnectPayablFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectPayablFailed>(StorePaymentMethodsActionType.DisConnectPayablFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });


  onConnectGlobalPay = createEffect(() => this.actions$.pipe(
    ofType<ConnectGlobalPay>(StorePaymentMethodsActionType.ConnectGlobalPay),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectGlobalPay(selectedStore.id, action.settings)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new ConnectGlobalPayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onConnectGlobalPayFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectGlobalPayFailed>(StorePaymentMethodsActionType.ConnectGlobalPayFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onDisConnectGlobalPay = createEffect(() => this.actions$.pipe(
    ofType<DisConnectGlobalPay>(StorePaymentMethodsActionType.DisConnectGlobalPay),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectGlobalPay(selectedStore.id)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new DisConnectGlobalPayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onDisConnectGlobalPayFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectGlobalPayFailed>(StorePaymentMethodsActionType.DisConnectGlobalPayFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });


  onConnectMollie = createEffect(() => this.actions$.pipe(
    ofType<ConnectMollie>(StorePaymentMethodsActionType. ConnectMollie),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectMollie(selectedStore.id)
    .pipe(
      tap(s => window.location.href = s)
    ))
  ), { dispatch: false} );

  onConnectMollieFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectMollieFailed>(StorePaymentMethodsActionType.ConnectMollieFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onDisConnectMollie = createEffect(() => this.actions$.pipe(
    ofType<DisConnectMollie>(StorePaymentMethodsActionType.DisConnectMollie),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectMollie(selectedStore.id)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new DisConnectMollieFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onDisConnectMollieFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectMollieFailed>(StorePaymentMethodsActionType.DisConnectMollieFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onConnectFygaro= createEffect(() => this.actions$.pipe(
    ofType<ConnectFygaro>(StorePaymentMethodsActionType.ConnectFygaro),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectFygaro(selectedStore.id, action.settings)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new ConnectGlobalPayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onConnectFygaroFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectFygaroFailed>(StorePaymentMethodsActionType.ConnectFygaroFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onDisConnectFygaro = createEffect(() => this.actions$.pipe(
    ofType<DisConnectFygaro>(StorePaymentMethodsActionType.DisConnectFygaro),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectFygaro(selectedStore.id)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new DisConnectFygaroFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  DisConnectFygaroFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectFygaroFailed>(StorePaymentMethodsActionType.DisConnectFygaroFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onConnectEpay = createEffect(() => this.actions$.pipe(
    ofType<ConnectEpay>(StorePaymentMethodsActionType.ConnectEpay),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectEpay(selectedStore.id, action.settings)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new ConnectEpayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onConnectEpayFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectEpayFailed>(StorePaymentMethodsActionType.ConnectEpayFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onDisConnectEpay = createEffect(() => this.actions$.pipe(
    ofType<DisConnectEpay>(StorePaymentMethodsActionType.DisConnectEpay),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectEpay(selectedStore.id)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new DisConnectEpayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onDisConnectEpayFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectEpayFailed>(StorePaymentMethodsActionType.DisConnectEpayFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onConnectApcopay = createEffect(() => this.actions$.pipe(
    ofType<ConnectApcopay>(StorePaymentMethodsActionType.ConnectApcopay),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.connectApcopay(selectedStore.id, action.settings)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new ConnectApcopayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onConnectApcopayFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectApcopayFailed>(StorePaymentMethodsActionType.ConnectApcopayFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onDisConnectApcopay = createEffect(() => this.actions$.pipe(
    ofType<DisConnectApcopay>(StorePaymentMethodsActionType.DisConnectApcopay),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap( ([action, selectedStore]) => this.storesService.disConnectApcopay(selectedStore.id)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new DisConnectApcopayFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onDisConnectApcopayFailed = createEffect(() => this.actions$.pipe(
    ofType<DisConnectApcopayFailed>(StorePaymentMethodsActionType.DisConnectApcopayFailed),
    tap(a => a.errorMessages.forEach( err =>
      this.toastr.error(err, 'Failed!')
    ))
  ),{ dispatch: false });

  onConnectHobex = createEffect(() => this.actions$.pipe(
    ofType<ConnectHobex>(StorePaymentMethodsActionType.ConnectHobex),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) => this.storesService.connectHobex(selectedStore.id, action.settings)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new ConnectHobexFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onConnectHobexFailed = createEffect(() => this.actions$.pipe(
    ofType<ConnectHobexFailed>(StorePaymentMethodsActionType.ConnectHobexFailed),
    tap(a => a.errorMessages.forEach(err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });

  onDisconnectHobex = createEffect(() => this.actions$.pipe(
    ofType<DisconnectHobex>(StorePaymentMethodsActionType.DisconnectHobex),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, selectedStore]) => this.storesService.disconnectHobex(selectedStore.id)
    .pipe(
      map(store => new UpdateStoreSettingsSuccess(store)),
      catchError(e => {
        return of(new DisconnectHobexFailed(e.error.errors.map((err: { message: any; }) => err.message)));
      })
    ))
  ));

  onDisconnectHobexFailed = createEffect(() => this.actions$.pipe(
    ofType<DisconnectHobexFailed>(StorePaymentMethodsActionType.DisconnectHobexFailed),
    tap(a => a.errorMessages.forEach(err =>
      this.toastr.error(err, 'Failed!')
    ))
  ), { dispatch: false });

}
