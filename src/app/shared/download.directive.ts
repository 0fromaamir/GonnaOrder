import { DownloadPurchaseInvoicePdfSuccess, StoreSubscriptionsActionType } from './../stores/store-subscriptions/+state/store-subscriptions.actions';
import { StoresCatalogActionType } from '../stores/store-catalog/+state/stores-catalog.actions';
import { StoresActionType } from './../stores/+state/stores.actions';
import { Subscription } from 'rxjs';
import { filter ,  map } from 'rxjs/operators';

import { Directive, OnDestroy, OnInit } from '@angular/core';

import { Actions, ofType } from '@ngrx/effects';

import * as FileSaver from 'file-saver';
import { StoreLocationActionType } from '../stores/store-location/+state/store-location.actions';
import { StoreOrderActionType } from '../stores/store-order/+state/store-order.actions';
import { UserActionType } from '../user/+state/user.actions';
import { PlatformActionType } from '../store-platform/+state/platform.actions';
import { HelperService } from '../public/helper.service';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

export interface IoAction {
  type: string;
  blob: Blob;
  filename: string;
}

const isIo = (io: any): io is IoAction => {
  return ( io as IoAction).blob !== undefined && ( io as IoAction).filename !== undefined;
};

@Directive({
  selector: '[appDownload]'
})
export class DownloadDirective implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(
    private actions$: Actions,
    private helperService: HelperService,
  ) {}

  ngOnInit() {
    this.subscription = this.actions$.pipe(
      ofType<IoAction>(
        StoresActionType.DownloadQRImageSuccess,
        StoresActionType.DownloadQRPdfSuccess,
        StoresActionType.DownloadQRImagesSuccess,
        StoresActionType.DownloadQRFullPdfSuccess,
        StoresActionType.DownloadOrderItemsXlsSuccess,
        StoresActionType.DownloadCustomersListSuccess,
        StoreLocationActionType.DownloadLocationQRImageSuccess,
        StoreLocationActionType.DownloadLocationQRPdfSuccess,
        StoresCatalogActionType.DownloadTranslateCatalogXlsSuccess,
        StoresCatalogActionType.DownloadToUpdateCatalogXlsSuccess,
        StoresCatalogActionType.DownloadOfferOrCategoryImageSuccess,
        StoreSubscriptionsActionType.DownloadPurchaseInvoicePdfSuccess,
        StoreOrderActionType.DownloadOrderPdfSuccess,
        UserActionType.DownloadVoucherPdfSuccess,
        StoresActionType.DownloadFlyerFileSuccess,
        PlatformActionType.DownloadTenantLogoSuccess
      ),
      filter<IoAction>(isIo),
      map(response => {
        if (this.helperService.isMobileApp()) {
          const file: File = new File();
          const fileOpener: FileOpener = new FileOpener();

          //Write file on device storage
          file.writeFile(file.dataDirectory, response.filename, response.blob, {replace: true}).then(res => {
            //Open file on default browser
            fileOpener.open(res.nativeURL, this.getMIMETypeFromFile(res.name))
              .then(() => console.log('File is opened'))
              .catch(e => console.log('Error openening file', e));
          });

          return;
        }
        
        return FileSaver.saveAs(response.blob, response.filename)

      })
    ).subscribe();
  }

  getMIMETypeFromFile(fileName: string){
    let extension = fileName.split('.')[fileName.split('.').length-1];
    let MIMETypes={
      'txt': 'text/plain',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'bmp': 'image/bmp',
      'png': 'image/png',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'rtf': 'application/rtf',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }
    return MIMETypes[extension];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
