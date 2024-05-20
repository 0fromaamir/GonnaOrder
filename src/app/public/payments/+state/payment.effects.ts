import {
  CartStatusUpdate,
  StoreActionType
} from './../../store/+state/stores.actions';
import { SquareService } from './../square.service';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import {
  PaymentActionType,
  ObtainToken,
  ObtainTokenFailed,
  ObtainTokenSuccess,
  CreatePaypalOrder,
  CreatePaypalOrderSuccess,
  CreatePaypalOrderFailed,
  CheckoutSquare,
  CreatePaymentsenseToken,
  CreatePaymentsenseTokenSuccess,
  CreatePaymentsenseTokenFailed,
  CompletePaymentsensePayment,
  CompletePaymentsensePaymentSuccess,
  CompletePaymentsensePaymentFailed,
  CreateTrustPaymentsRequestJSON,
  CreateTrustPaymentsRequestJSONSuccess,
  CreateTrustPaymentsRequestJSONFailed,
  CompleteTrustPaymentsPayment,
  CompleteTrustPaymentsPaymentFailed,
  CreateJCCRequestJSON,
  CreateJCCRequestJSONSuccess,
  CreateJCCRequestJSONFailed,
  CompleteJCCPayment,
  CompleteJCCPaymentSuccess,
  CompleteJCCPaymentFailed,
  CompleteVivaPayment,
  CompleteVivaPaymentSuccess,
  CheckoutSquareSuccess,
  CheckoutSquareFailed,
  CompleteSquarePaymentSuccess,
  CompleteSquarePaymentFailed,
  CompleteSquarePayment,
  InitiateOrderPayment,
  InitiateOrderPaymentSuccess,
  InitiateOrderPaymentFailed,
  CompleteOrderPayment,
  CompleteOrderPaymentSuccess,
  CompleteOrderPaymentFailed, FetchPaymentStatus, CompletePayment, CompletePaymentSuccess,
} from './payment.actions';
import { PaypalService } from '../paypal.service';
import { Observable, of } from 'rxjs';
import { StripeService } from '../stripe.service';
import { ErrorMessage } from '../../store/+state/stores.actions';
import { VivaService } from '../viva.service';
import { Store } from '@ngrx/store';
import { PaymentsenseService } from '../paymentsense.service';
import { getCurrentOrderMetaState, getSelectedLang, getSelectedStore, getStoreLocationsState } from '../../store/+state/stores.selectors';

import OrderUtils from '../../store/utils/OrderUtils';
import { OrderUpdateRequest } from '../../store/types/OrderUpdateRequest';
import { RMSService } from '../rms.service';
import { TrustPaymentsService } from '../trustPayments.service';
import { JCCService } from '../jcc.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { StoreService } from '../../store/store.service';
import { LocalStorageService } from 'src/app/local-storage.service';
import {PaymentService} from '../payment.service';
import {StoreOrderService} from '../../../stores/store-order/store-order.service';
import {StandalonePaymentService} from '../../../stores/store-standalone-payment/standalone-payment.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PaymentStoresEffects {

  constructor(
    private actions$: Actions,
    private paypalService: PaypalService,
    private stripeService: StripeService,
    private squareService: SquareService,
    private vivaService: VivaService,
    private paymentSenseService: PaymentsenseService,
    private rmsService: RMSService,
    private trustPaymentsService: TrustPaymentsService,
    private store: Store<any>,
    private jccService: JCCService,
    private router: Router,
    private storeService: StoreService,
    private storageService: LocalStorageService,
    private paymentService: PaymentService,
    private storeOrderService: StoreOrderService,
    private standalonePaymentService: StandalonePaymentService,
    private translate: TranslateService
  ) { }


  onObtainToken = createEffect(() => this.actions$.pipe(
    ofType<ObtainToken>(PaymentActionType.ObtainToken),
    switchMap(action => this.paypalService.obtainAccessToken().pipe(
      map(s => new ObtainTokenSuccess(s)),
      catchError(a => of(new ObtainTokenFailed()))
    ))
  ));


  onCreatePaypalOrder = createEffect(() => this.actions$.pipe(
    ofType<CreatePaypalOrder>(PaymentActionType.CreatePaypalOrder),
    switchMap(action => this.paypalService.createPaypalOrder(action.paypalConfigObject, action.accessToken).pipe(
      map(s => new CreatePaypalOrderSuccess(s)),
      catchError(a => of(new CreatePaypalOrderFailed()))
    ))
  ));

  // STRIPE

  // Square


  onCheckoutSquare = createEffect(() => this.actions$.pipe(
    ofType<CheckoutSquare>(PaymentActionType.CheckoutSquare),
    switchMap(action => {
      return this.squareService.generateSquareSession(action.storeId, action.orderUuid, action.redirectUrl)
      .pipe(
        map((res: any) => new CheckoutSquareSuccess(res.squareSessionUrl)),
        catchError(e => {
          if (e.error instanceof ErrorEvent) {
            return of(new CheckoutSquareFailed(e.error.message));
          } else {
            return of(new CheckoutSquareFailed(e.error.errors[0].message));
          }
        })
      );
    })
  ));


  onCompleteSquarePayment = createEffect(() => this.actions$.pipe(
    ofType<CompleteSquarePayment>(PaymentActionType.CompleteSquarePayment),
    switchMap(action => {
      return this.squareService.verifyPayment(action.storeId, action.orderUuid)
      .pipe(
        map(_ => new CompleteSquarePaymentSuccess()),
        catchError(e => {
          if (e.error instanceof ErrorEvent) {
            return of(new CompleteSquarePaymentFailed(e.error.message));
          } else {
            return of(new CompleteSquarePaymentFailed(e.error.errors[0].message));
          }
        })
      );
    })
  ));

  // Viva
  onCompleteVivaPayment = createEffect(() => this.actions$.pipe(
      ofType<CompleteVivaPayment>(PaymentActionType.CompleteVivaPayment),
      switchMap( action => {
        let payload: any;
        payload = {
          orderCode: action.orderCode,
          eventId: action.eventId,
          eci: action.transId,
        };
        if (action?.transId){
          payload.transId = action.transId;
        }
        let apiResponse: Observable<any>;
        if (action.isStandaloneOrder) {
          apiResponse = this.storeService.completeStandalonePayment(action.storeId, action.orderUuid, payload);
        }else {
          apiResponse = this.vivaService
            .verifyPayment(action.storeId, action.orderUuid, payload);
        }

        return apiResponse
        .pipe(
          map((r: any) => new CompleteVivaPaymentSuccess(r.status && action.storeId && action.aliasName ? true : false,
            action.storeId, action.aliasName, action.orderUuid, action.redirectUrl, action.redirectThankyouUrl)),
          catchError(e => {
            console.warn('Error: ', e);
            window.location.href = action.redirectUrl;
            this.router.navigate([`/#cart`]);
            return of(new ErrorMessage('public.payment.errorCouldNotConnect'));
          })
        );
      })
    )
  )
  /*
  onCompleteVivaPayment = createEffect(() => this.actions$.pipe(
    ofType<CompleteVivaPayment>(PaymentActionType.CompleteVivaPayment),
    switchMap((action) => {
      let payload: any;
      payload = {
        orderCode: action.orderCode,
        eventId: action.eventId,
        eci: action.transId,
      };
      if (action?.transId){
        payload.transId = action.transId;
      }
      let apiResponse;
      if (action.isStandaloneOrder) {
        apiResponse = this.storeService.completeStandalonePayment(action.storeId, action.orderUuid, payload);
      }else {
        apiResponse = this.vivaService
          .verifyPayment(action.storeId, action.orderUuid, payload);
      }
      return apiResponse
        .pipe(
          map((r: any) => new CompleteVivaPaymentSuccess(r.status && action.storeId && action.aliasName ? true : false,
            action.storeId, action.aliasName, action.orderUuid, action.redirectUrl, action.redirectThankyouUrl)),
          catchError(e => {
            console.warn('Error: ', e);
            window.location.href = action.redirectUrl;
            this.router.navigate([`/#cart`]);
            return of(new ErrorMessage('public.payment.errorCouldNotConnect'));
          })
        );
    })
  ));
  */


  onCompleteVivaPaymentSuccess = createEffect(() => this.actions$.pipe(
    ofType<CompleteVivaPaymentSuccess>(PaymentActionType.CompleteVivaPaymentSuccess),
    tap(action =>
       window.location.href = action.redirectThankyouUrl
  )), { dispatch: false });

  // Paymentsense

  onCreatePaymentsenseToken = createEffect(() => this.actions$.pipe(
    ofType<CreatePaymentsenseToken>(PaymentActionType.CreatePaymentsenseToken),
    switchMap(action => this.paymentSenseService.createToken(action.storeId, action.orderUuid).pipe(
      map(r => new CreatePaymentsenseTokenSuccess(r)),
      catchError(e => of(new CreatePaymentsenseTokenFailed()))
    ))
  ));


  onCompletePaymentsensePayment = createEffect(() => this.actions$.pipe(
    ofType <CompletePaymentsensePayment>(PaymentActionType.CompletePaymentsensePayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        this.translate.getDefaultLang(),
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.status = 'SUBMITTED';
      return this.paymentSenseService
        .completePayment(action.storeId, action.orderUuid, orderUpdateRequest)
        .pipe(
          map(r => new CompletePaymentsensePaymentSuccess()),
          catchError(e => of (new CompletePaymentsensePaymentFailed()))
        );
    })
  ));


  // TrustPayments


  onCreateTrustPaymentsRequestJSON = createEffect(() => this.actions$.pipe(
    ofType<CreateTrustPaymentsRequestJSON>(PaymentActionType.CreateTrustPaymentsRequestJSON),
    switchMap(action => this.trustPaymentsService.initPayment(action.storeId, action.orderUuid).pipe(
      map(r => new CreateTrustPaymentsRequestJSONSuccess(r)),
      catchError(e => of(new CreateTrustPaymentsRequestJSONFailed()))
    ))
  ));


  onCompleteTrustPaymentsPayment = createEffect(() => this.actions$.pipe(
    ofType<CompleteTrustPaymentsPayment>(PaymentActionType.CompleteTrustPaymentsPayment),
    switchMap((action) => {
      return this.trustPaymentsService
        .verifyPayment(action.storeId, action.orderUuid, action.paymentInfo)
        .pipe(
          map(r => new CartStatusUpdate('FINISHED_ONLINE_PAYMENT')),
          catchError(e => {
            this.router.navigateByUrl(`#cart`);
            return of(new CompleteTrustPaymentsPaymentFailed());
          })
        );
    })
  ));



  onCreateJCCRequestJSON = createEffect(() => this.actions$.pipe(
    ofType<CreateJCCRequestJSON>(PaymentActionType.CreateJCCRequestJSON),
    switchMap(action => this.jccService.initPayment(action.storeId, action.orderUuid).pipe(
      map(r => new CreateJCCRequestJSONSuccess(r)),
      catchError(e => of(new CreateJCCRequestJSONFailed()))
    ))
  ));


  onCompleteJCCPayment = createEffect(() => this.actions$.pipe(
    ofType<CompleteJCCPayment>(PaymentActionType.CompleteJCCPayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        this.translate.getDefaultLang(),
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.paymentInfo = action.paymentInfo;
      orderUpdateRequest.status = 'SUBMITTED';
      return this.jccService
        .completePayment(action.storeId, action.orderUuid, orderUpdateRequest)
        .pipe(
          map(r => new CompleteJCCPaymentSuccess()),
          catchError(e => of(new CompleteJCCPaymentFailed()))
        );
    })
  ));


  onInitiateOrderPayment = createEffect(() => this.actions$.pipe(
    ofType<InitiateOrderPayment>(PaymentActionType.InitiateOrderPayment),
    switchMap((action) => {
      return this.paymentService.initiateOrderPayment(action.storeId, action.orderUuid, { paymentMethod: action.paymentMethod, originType: action.originType, originDomain: action.originDomain }).pipe(
        map(s => new InitiateOrderPaymentSuccess(s)),
        catchError((err) => of(new InitiateOrderPaymentFailed()))
      );
    })
  ));


  onCompleteOrderPayment = createEffect(() => this.actions$.pipe(
    ofType<CompleteOrderPayment>(PaymentActionType.CompleteOrderPayment),
    withLatestFrom(
      this.store.select(getSelectedStore),
      this.store.select(getCurrentOrderMetaState),
      this.store.select(getStoreLocationsState),
      this.store.select(getSelectedLang)
    ),
    switchMap(([action, selectedStore, orderMeta, validLocations, selectedLang]) => {
      const orderUpdateRequest: OrderUpdateRequest = OrderUtils.mapOrderMetadataToOrderUpdateRequest(
        orderMeta.data,
        this.translate.getDefaultLang(),
        validLocations,
        selectedLang,
      );
      orderUpdateRequest.paymentInfo = action.orderPaymentInfo;
      orderUpdateRequest.status = 'SUBMITTED';
      return this.paymentService
      .completeOrderPayment(action.storeId, action.orderUuid, orderUpdateRequest)
      .pipe(
        map(r => new CompleteOrderPaymentSuccess(r)),
        catchError(e => of (new CompleteOrderPaymentFailed(e)))
      );
    })
  ));


  onFetchPaymentStatus = createEffect(() => this.actions$.pipe(
    ofType<FetchPaymentStatus>(PaymentActionType.FetchPaymentStatus),
    switchMap((action: FetchPaymentStatus) => {
      if (action.isStandalonePayment) {
        return this.storeService.getStandaloneOrderPayment(action.storeId, action.paymentId).pipe(
          map(stdOrder => stdOrder.paymentStatus === 'COMPLETED'
            ? new CompleteOrderPaymentSuccess(stdOrder) : new CompleteOrderPaymentFailed(stdOrder)),
          catchError(e => of(new CompleteOrderPaymentFailed(e)))
        );
      } else {
        return this.storeOrderService.get(action.storeId, action.paymentId).pipe(
          map(order => order.paymentStatus === 'SUCCESSFULLY_COMPLETED'
            ? new CompleteOrderPaymentSuccess(order) : new CompleteOrderPaymentFailed(order)),
          catchError(e => of(new CompleteOrderPaymentFailed(e)))
        );
      }
    })
  ));

  onCompletePayment = createEffect(() => this.actions$.pipe(
    ofType<CompletePayment>(PaymentActionType.CompletePayment),
    switchMap( action => {
      let apiResponse: Observable<any>;
      if (action.isStandaloneOrder) {
        apiResponse = this.storeService.completeStandalonePayment(action.storeId, action.orderUuid, action.paymentProviderResponse);
      } else {
        apiResponse = this.paymentService.verifyOrderPayment(action.storeId, action.orderUuid, action.paymentProviderResponse);
      }

      return apiResponse
      .pipe(
        map((r: any) => new CompletePaymentSuccess(action.redirectUrl)),
        catchError(e => {
          console.warn('Error: ', e);
          window.location.href = action.redirectUrl;
          this.router.navigate([`/#cart`]);
          return of(new ErrorMessage('public.payment.errorCouldNotConnect'));
        })
      );
    })
    )
  )

  onCompletePaymentSuccess = createEffect(() => this.actions$.pipe(
    ofType<CompletePaymentSuccess>(PaymentActionType.CompletePaymentSuccess),
    tap(action =>
      window.location.href = action.redirectThankyouUrl
    )), { dispatch: false });

}
