import { Action } from '@ngrx/store';
import { PrinterInfo, AutoprintSubscriptions, AutoprintQueueElement } from '../printers';

export enum PrintersActionType {
  InitializeState = '[printers] InitializeState',
  AddPrinter = '[printers] AddPrinter',
  RemovePrinter = '[printers] RemovePrinter',
  TogglePrinterAutoStatus = '[printers] TogglePrinterAutoStatus',
  OrderDirectPrint = '[printers] OrderDirectPrint',
  PrintToEnabledPrinters = '[printers] PrintToEnabledPrinters',
  SaveBlobToStorageAsPDFAndPrint = '[printers] SaveBlobToStorageAsPDFAndPrint',
  HandlePrintJobs = '[printers] HandlePrintJobs',
  PrintJob = '[printers] PrintJob',
  SinglePrintJob = '[printers] SinglePrintJob',
  PrintJobSuccess = '[printers] PrintJobSuccess',
  PrintJobFailed = '[printers] PrintJobFailed',
  UpdateAutoprintSubscriptions = '[printers] UpdateAutoprintSubscriptions',
  UpdateAutoprintQueue = '[printers] UpdateAutoprintQueue',
  DownloadOrderPdfAndPrint = '[printers] DownloadOrderPdfAndPrint',
}

export class InitializeState implements Action {
  readonly type = PrintersActionType.InitializeState;

  constructor() { }
}

export class AddPrinter implements Action {
  readonly type = PrintersActionType.AddPrinter;

  constructor(public readonly newPrinter: PrinterInfo) { }
}

export class RemovePrinter implements Action {
  readonly type = PrintersActionType.RemovePrinter;

  constructor(public readonly url: string) { }
}

export class TogglePrinterAutoStatus implements Action {
  readonly type = PrintersActionType.TogglePrinterAutoStatus;

  constructor(public readonly url: string, public readonly newStatus: boolean) { }
}

export class OrderDirectPrint implements Action {
  readonly type = PrintersActionType.OrderDirectPrint;

  constructor(public readonly message: any, public readonly storeId: number) {}
}


export class PrintToEnabledPrinters implements Action {
  readonly type = PrintersActionType.PrintToEnabledPrinters;

  constructor(public readonly contentUrl: string, public readonly storeId: number, public readonly orderUuid: string) {}

}

export class HandlePrintJobs implements Action {
  readonly type = PrintersActionType.HandlePrintJobs;

  constructor(public readonly contentUrl: string, public readonly toPrints: PrinterInfo[], public readonly storeId: number, public readonly orderUuid: string) {}
}

export class SaveBlobToStorageAsPDFAndPrint implements Action {
  readonly type = PrintersActionType.SaveBlobToStorageAsPDFAndPrint;

  constructor(public readonly blob: Blob,
              public readonly filename: string,
              public readonly mode: string,
              public readonly selectedPrinter: PrinterInfo,
              public readonly storeId?: number,
              public readonly orderUuid?: string) {}
}

export class PrintJob implements Action {
  readonly type = PrintersActionType.PrintJob;

  constructor(public readonly contentUrl: string,
              public readonly printer: PrinterInfo,
              public readonly toPrints: PrinterInfo[],
              public readonly storeId: number,
              public readonly orderUuid: string) {}
}

export class SinglePrintJob implements Action {
  readonly type = PrintersActionType.SinglePrintJob;

  constructor(public readonly contentUrl: string,
    public readonly printer: PrinterInfo,
    public readonly storeId: number,
    public readonly orderUuid: string) {}
 
}

export class PrintJobSuccess implements Action {
  readonly type = PrintersActionType.PrintJobSuccess;

  constructor() {}
}

export class PrintJobFailed implements Action {
  readonly type = PrintersActionType.PrintJobFailed;

  constructor() {}
}

export class UpdateAutoprintSubscriptions implements Action {
  readonly type = PrintersActionType.UpdateAutoprintSubscriptions;

  constructor(public readonly subscriptions: AutoprintSubscriptions) { }
}

export class UpdateAutoprintQueue implements Action {
  readonly type = PrintersActionType.UpdateAutoprintQueue;

  constructor(public readonly autoprintQueue: AutoprintQueueElement[]) { }
}

export class DownloadOrderPdfAndPrint implements Action {
  readonly type = PrintersActionType.DownloadOrderPdfAndPrint;
  
  constructor(public readonly storeId: number, 
    public readonly orderId: string, 
    public readonly uiLanguageLocale: string, 
    public readonly catalogLanguageLocale: string, 
    public readonly printer: PrinterInfo) {}
  
}

export type PrintersAction = 
  InitializeState
  | AddPrinter
  | RemovePrinter
  | TogglePrinterAutoStatus
  | OrderDirectPrint
  | PrintToEnabledPrinters
  | SaveBlobToStorageAsPDFAndPrint
  | HandlePrintJobs
  | PrintJob
  | SinglePrintJob
  | PrintJobSuccess
  | PrintJobFailed
  | UpdateAutoprintSubscriptions
  | UpdateAutoprintQueue
  | DownloadOrderPdfAndPrint;