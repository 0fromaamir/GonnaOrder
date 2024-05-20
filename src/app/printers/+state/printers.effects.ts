import { PRINTERS_LOCAL_STORAGE_KEY } from '../printers.tokens';
import { from, Observable, of } from 'rxjs';
import { take, switchMap, catchError, tap, withLatestFrom, mergeMap } from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { LocalStorageService } from 'src/app/local-storage.service';
import { Printers } from '../printers';
import { PrinterService } from '../printer.service';
import { Store } from '@ngrx/store';
import { 
  PrintersActionType, 
  OrderDirectPrint ,
  PrintToEnabledPrinters,
  HandlePrintJobs,
} from './printers.actions';
import { StoresService } from 'src/app/stores/stores.service';
import { getClientStoreByAliasName } from 'src/app/stores/+state/stores.selectors';
import { TranslateService } from '@ngx-translate/core';
import { DownloadOrderPdfFailed } from 'src/app/stores/store-order/+state/store-order.actions';
import {
  getPrinters,
  getAutoprintSubscriptionsByStoreId,
} from './printers.selectors';
import { 
  SaveBlobToStorageAsPDFAndPrint, 
  PrintJob,
  SinglePrintJob,
  PrintJobSuccess,
  PrintJobFailed,
  DownloadOrderPdfAndPrint,
} from './printers.actions';
import { Platform } from '@ionic/angular';
import { ToastrService } from 'ngx-toastr';
import { GoToast } from 'src/app/shared/go-toast.component';
import { LogService } from 'src/app/shared/logging/LogService';

@Injectable()
export class PrintersEffects {

  constructor(
    private actions$: Actions,
    private store: Store<Printers>,
    private storageService: LocalStorageService,
    @Inject(PRINTERS_LOCAL_STORAGE_KEY) private localStorageKey,
    private printerService: PrinterService,
    private storesService: StoresService,
    private translateSer: TranslateService,
    private platform: Platform,
    private toastr: ToastrService,
    private logger: LogService
  ) { 

  }

  onOrderDirectPrint = createEffect(() => this.actions$.pipe(
    ofType<OrderDirectPrint>(PrintersActionType.OrderDirectPrint),
    mergeMap(action => {
      return this.store.select(getClientStoreByAliasName, {aliasName: action.message.storeAlias}).pipe(
        take(1),
        mergeMap(clientStore => {
          if (!clientStore) {
            clientStore = {...clientStore, id: action.storeId};
          }
          return from(this.storesService.getStorageForStoreId('autoprintSubscriptions', clientStore.id))
          .pipe(
            take(1), 
            mergeMap(autoprintEnabled => {
              this.logger.debug('onOrderDirectPrint: ', autoprintEnabled);
              if (autoprintEnabled) {
                return this.storesService.downloadOrderPdf(clientStore.id, action.message.uuid).pipe(
                  mergeMap(s => of(new SaveBlobToStorageAsPDFAndPrint(s.blob, `${action.message.uuid}.pdf`, 'enabled-printers', null, clientStore.id, action.message.uuid))),
                  catchError(a => {
                    this.logger.error("DownloadOrderPdfFailed: ", a);
                    return of(new DownloadOrderPdfFailed(this.translateSer.instant('admin.store.message.downloadFail')));
                  })
                );
              } else {
                this.logger.debug("onOrderDirectPrint: ", 'autoprint not enabled, and finishing action without printing...');
                return of(new PrintJobSuccess());
              }
            })
          )
        })
      )
    })
  ));
  
  onDownloadOrderPdfAndPrint = createEffect(() => this.actions$.pipe(
    ofType<DownloadOrderPdfAndPrint>(PrintersActionType.DownloadOrderPdfAndPrint),
    mergeMap(action => {
      this.logger.debug("onDownloadOrderPdfAndPrint: ", action);
      return this.storesService.downloadOrderPdf(action.storeId, action.orderId).pipe(
        mergeMap(s => of(new SaveBlobToStorageAsPDFAndPrint(s.blob, `${action.orderId}.pdf`, 'selected-printer', action.printer, action.storeId, action.orderId))),
        catchError(a => of(new DownloadOrderPdfFailed(this.translateSer.instant('admin.store.message.downloadFail'))))
      )
    })
  ));

  onDownloadOrderPdfSuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveBlobToStorageAsPDFAndPrint>(PrintersActionType.SaveBlobToStorageAsPDFAndPrint),
    mergeMap(action => {
      this.logger.debug("onDownloadOrderPdfSuccess: ", action);
      if (action.mode == 'enabled-printers') {
        return this.printerService.saveFile(action.blob, action.filename).pipe(
          mergeMap(updateFileEntry => {
            this.logger.debug("updateFileEntry enabled-printers: ", updateFileEntry);
            return of(new PrintToEnabledPrinters(updateFileEntry.nativeURL, action.storeId, action.orderUuid));
          }),
          catchError(a => {
            this.store.dispatch(new PrintToEnabledPrinters(URL.createObjectURL(action.blob), action.storeId, action.orderUuid));
            return of(new DownloadOrderPdfFailed(this.translateSer.instant('admin.store.message.downloadFail')))
          })
        );
      } else {
        return this.printerService.saveFile(action.blob, action.filename).pipe(
          mergeMap(updateFileEntry => {
            this.logger.debug("updateFileEntry selected printer: ", updateFileEntry);
            return of(new SinglePrintJob(updateFileEntry.nativeURL, action.selectedPrinter, action.storeId, action.orderUuid));
          }),
          catchError(a => {
            this.store.dispatch(new PrintToEnabledPrinters(URL.createObjectURL(action.blob), action.storeId, action.orderUuid));
            return of(new DownloadOrderPdfFailed(this.translateSer.instant('admin.store.message.downloadFail')))
        })
        );
      }
    })
  ));

  onPrintToEnabledPrinters = createEffect(() => this.actions$.pipe(
    ofType<PrintToEnabledPrinters>(PrintersActionType.PrintToEnabledPrinters),
    mergeMap(action => {
      return from(this.storesService.getStorage('enabledPrinters')).pipe(
        switchMap(printers => {
          const enabledPrinters = (!!printers && Array.isArray(printers)) ? printers.filter(printerInfo => printerInfo.enabled === true) : [];
          this.logger.debug("onPrintToEnabledPrinters: ", enabledPrinters);
          return of(new HandlePrintJobs(action.contentUrl, enabledPrinters, action.storeId, action.orderUuid));
        })
      )
    })
  ));

  onHandlePrintJobs = createEffect(() => this.actions$.pipe(
    ofType<HandlePrintJobs>(PrintersActionType.HandlePrintJobs),
    mergeMap(action => {
      this.logger.debug("HandlePrintJobs: ", action)
      if (action.toPrints.length == 0) {
        return of(new PrintJobSuccess());
      } else {
        let toPrints = JSON.parse(JSON.stringify(action.toPrints));
        let toPrint = toPrints.pop();
        return of(new PrintJob(action.contentUrl, toPrint, toPrints, action.storeId, action.orderUuid))
      }
    })
  ));


  onPrintJob = createEffect(() => this.actions$.pipe(
    ofType<PrintJob>(PrintersActionType.PrintJob),
    mergeMap(action => {
      let printRes: Observable<any>;
      if (this.platform.is('android')) {
        printRes = this.printerService.addToAutoPrintQueue(action.printer, action.storeId, action.orderUuid);
      } else {
        printRes = this.printerService.printContentUrl(action.contentUrl, action.printer);
      }
      return printRes.pipe(
        switchMap(result => {
          this.logger.debug("result: ", result);
          return of(new HandlePrintJobs(action.contentUrl, action.toPrints, action.storeId, action.orderUuid));
        })
      );
    })
  ));

  onPrintJobSuccess = createEffect(() => this.actions$.pipe(
    ofType<PrintJobSuccess>(PrintersActionType.PrintJobSuccess),
    tap(_ => {
      this.logger.debug("Print Job Success!");
    })
  ), { dispatch: false });

  onPrintJobFailed = createEffect(() => this.actions$.pipe(
    ofType<PrintJobFailed>(PrintersActionType.PrintJobFailed),
    tap(_ => this.logger.error("Print Job Failed!"))
  ), { dispatch: false });

  onSinglePrintJob = createEffect(() => this.actions$.pipe(
    ofType<SinglePrintJob>(PrintersActionType.SinglePrintJob),
    mergeMap(action => {
      let printRes: Observable<any>
      if (this.platform.is('android')) {
        printRes = this.printerService.autoPrint(action.printer, action.storeId, action.orderUuid);
      } else {
        printRes = this.printerService.printContentUrl(action.contentUrl, action.printer);
      }
      return printRes.pipe(
        switchMap(result => {
          this.logger.debug("print result", result);
          return of(new PrintJobSuccess());
        })
      )
    })
  ));

}