import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WindowRefService } from 'src/app/window.service';
import { StandalonePaymentService } from '../store-standalone-payment/standalone-payment.service';
import { Order } from '../stores';
import { StoresService } from '../stores.service';
import { WhitelabelService } from '../../shared/whitelabel.service';

@Component({
    selector: 'app-pay-online-dialog',
    templateUrl: 'pay-online-dialog.component.html',
    styleUrls: ['./pay-online-dialog.component.scss']
})
export class PayOnlineDialogComponent implements OnInit, OnDestroy {
    private window: Window;
    @ViewChild('qrImage', { static: true }) qrimage: ElementRef;
    destroyed$ = new Subject<void>();
    @Input() order: Order;
    sharePreviewURL: string;
    locale: string;
    constructor(
        public dialogRef: MatDialogRef<PayOnlineDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private windowRefService: WindowRefService,
        private storesService: StoresService,
        private standalonePaymentService: StandalonePaymentService,
        private whitelabelService: WhitelabelService
    ) { }

    ngOnInit() {
        if (this.data.selectedStore){
            this.locale = this.data.selectedStore.address.country.defaultLocale
            + '-'
            + this.data.selectedStore.address.country.code;
        }
        this.window = this.windowRefService.nativeWindow;
        const storeAliasName = this.data.storeAliasName;
        const protocol = this.windowRefService.nativeWindowLocation.protocol;
        const host = this.whitelabelService.getHost();
        const locationURL = protocol + '//' + storeAliasName + '.' + host;
        this.sharePreviewURL = this.data.uuid ?
            `${locationURL}/standalone-payment/orderToken/${this.data.uuid}` :
            `${locationURL}/standalone-payment/amount/${this.data.amount}`;
        this.storesService.downloadQRImage(this.data.storeId, this.sharePreviewURL).pipe(
            takeUntil(this.destroyed$)
        ).subscribe(b => {
            // tslint:disable-next-line
            this.qrimage.nativeElement.src = this.window['URL'].createObjectURL(b.blob);
            // this.storeOrderService.printBlobPDF(b.blob, b.filename);
            const elem = document.getElementById('url-text-input') as HTMLInputElement;
            if (elem) {
                elem.blur();
                if (elem.setSelectionRange) {
                    elem.setSelectionRange(this.sharePreviewURL.length, 0, 'forward');
                }
                elem.select();
            }
        });
    }

    save(): void {
        this.dialogRef.close(this.data);
        window.open(this.sharePreviewURL);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    copySharePreviewURL() {
        navigator.clipboard.writeText(this.sharePreviewURL)
    }

    printQRCode() {
        this.standalonePaymentService.printQrCode(this.qrimage.nativeElement.src);
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
