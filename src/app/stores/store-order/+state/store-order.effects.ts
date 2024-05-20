import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { StoreOrderService } from '../store-order.service';
import { Store, select } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import {
  StoreOrderActionType,
  LoadStoreOrdersSortFilter,
  LoadStoreOrdersSortFilterSuccess,
  LoadStoreOrdersSortFilterFail,
  UpdateOrderStatus,
  UpdateOrderStatusSuccess,
  UpdateOrderStatusFail,
  UpdateBulkOrderStatus,
  UpdateBulkOrderStatusSuccess,
  UpdateBulkOrderStatusFail,
  LoadStoreOrder,
  LoadStoreOrderSuccess,
  LoadStoreOrderFail,
  DownloadOrderPdf,
  DownloadOrderPdfSuccess,
  DownloadOrderPdfFailed,
  DownloadAndPrintOrderPdf,
  DownloadAndPrintOrderPdfSuccess,
  DownloadAndPrintOrderPdfFailed,
} from './store-order.actions';
import { switchMap, map, catchError, withLatestFrom, tap, filter, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { getSelectedStore } from '../../+state/stores.selectors';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { LocationService } from 'src/app/public/location.service';


@Injectable()
export class StoreOrderEffects {

  constructor(
    private translateSer: TranslateService,
    private actions$: Actions,
    private store: Store<any>,
    private orderService: StoreOrderService,
    private toastr: ToastrService,
    private router: Router,
    private cookieService: CookieService,
    private locationService: LocationService) { }



  onLoadStoreOrdersSortFilter = createEffect(() => this.actions$.pipe(
    ofType<LoadStoreOrdersSortFilter>(StoreOrderActionType.LoadStoreOrdersSortFilter),
    switchMap(
      action => this.orderService.listWithSortFilterParams(action.storeId, action.tabName, action.tabSortFilterParams, action.paging)
      .pipe(
      map(s => new LoadStoreOrdersSortFilterSuccess(s)),
      catchError(a => of(new LoadStoreOrdersSortFilterFail()))
    ))
  ));


  onUpdateOrderStatus = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderStatus>(StoreOrderActionType.UpdateOrderStatus),
    withLatestFrom(this.store.pipe(select(getSelectedStore))),
    switchMap(([action, store]) => this.orderService.updateStatus(
        store.id, action.orderUuid, action.status, action.rejectReason, action.estimatedTime, action.isReady
      ).pipe(
        map(l => new UpdateOrderStatusSuccess(action.orderUuid)),
        catchError(e => {
          this.toastr.error('The order could not be updated', 'Action failed!');
          if (e.status === 400) {
            return of(new UpdateOrderStatusFail(e.error.errors[0].message));
          }

          return of(new UpdateOrderStatusFail(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  ));


  onUpdateBulkOrderStatus = createEffect(() => this.actions$.pipe(
    ofType<UpdateBulkOrderStatus>(StoreOrderActionType.UpdateBulkOrderStatus),
    withLatestFrom(this.store.pipe(select(getSelectedStore))),
    switchMap(([action, store]) => this.orderService.onUpdateBulkOrderStatus(store.id, action.bulkOrderUpdateRequest)
      .pipe(
        map(l => new UpdateBulkOrderStatusSuccess()),
        catchError(e => {
          this.toastr.error('The order could not be updated', 'Action failed!');
          if (e.status === 400) {
            return of(new UpdateBulkOrderStatusFail(e.error.errors[0].message));
          }
          return of(new UpdateBulkOrderStatusFail(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  ));


  onLoadStoreOrder = createEffect(() => this.actions$.pipe(
    ofType<LoadStoreOrder>(StoreOrderActionType.LoadStoreOrder),
    withLatestFrom(this.store.pipe(select(getSelectedStore))),
    switchMap(([action, store]) => this.orderService.get(action.storeId, action.orderUuid, action.stationId).pipe(
      tap(()=> {
        this.locationService.setOrderUuid(action.orderUuid);
        this.cookieService.set(
          'orderUuid-' + (this.locationService.isAdminOrderUpdate() ? 'admin-' : '') + store.aliasName,
          action.orderUuid,
          1,
          '/'
        );
      }),
      map(s => new LoadStoreOrderSuccess(s)),
      catchError(a => of(new LoadStoreOrderFail()))
    ))
  ));


  onOrderActionFailed = createEffect(() => this.actions$.pipe(
    ofType<UpdateOrderStatusFail>(
      StoreOrderActionType.UpdateOrderStatusFail
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  ), { dispatch: false });


  onDownloadOrderPdf = createEffect(() => this.actions$.pipe(
    ofType<DownloadOrderPdf>(StoreOrderActionType.DownloadOrderPdf),
    switchMap(action => this.orderService.downloadOrderPdf(action.storeId, action.orderId, action.stationId)
      .pipe(
        map(s => new DownloadOrderPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadOrderPdfFailed(this.translateSer.instant('admin.store.message.downloadFail'))))
      ))
  ));


  onDownloadAndPrintOrderPdf = createEffect(() => this.actions$.pipe(
    ofType<DownloadAndPrintOrderPdf>(StoreOrderActionType.DownloadAndPrintOrderPdf),
    switchMap(action => this.orderService.downloadOrderPdf(action.storeId, action.orderId, action.stationId)
      .pipe(
        map(s => new DownloadAndPrintOrderPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadAndPrintOrderPdfFailed(this.translateSer.instant('admin.store.message.downloadFail'))))
      ))
  ));


  onDownloadAndPrintOrderPdfFailed = createEffect(() => this.actions$.pipe(
    ofType<DownloadAndPrintOrderPdfFailed>(StoreOrderActionType.DownloadAndPrintOrderPdfFailed),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  ), { dispatch: false });


  onDownloadAndPrintOrderPdfSuccess = createEffect(() => this.actions$.pipe(
    ofType<DownloadAndPrintOrderPdfSuccess>(StoreOrderActionType.DownloadAndPrintOrderPdfSuccess),
    tap(s => {
      this.orderService.printBlobPDF(s.blob, decodeURIComponent(s.filename));
    }),
  ), { dispatch: false });
}
