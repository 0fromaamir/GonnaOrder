import { Component, OnInit, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { StoreSaveMode } from '../../../stores/stores';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { take, takeUntil, filter, delay } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators, URL_REGEXP } from 'src/app/shared/custom.validators';
import { CatalogState } from '../+state/stores.reducer';
import { SaveStoreByAlias, SetMobileStore } from '../+state/stores.actions';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofType } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';
import {
  StoreActionType,
  SaveStoreByAliasSuccess,
  SaveStoreByAliasFailed,
} from '../+state/stores.actions';
import { _MatTabGroupBase } from '@angular/material/tabs';
import { environment } from '../../../../environments/environment';

const STOREALIAS_REGEXP = new RegExp(
  "^" +
  "(?:" +
  "(?:" +
  "[a-z0-9\\u00a1-\\uffff]" +
  "[a-z0-9\\u00a1-\\uffff_-]{4,}" +
  "[a-z0-9\\u00a1-\\uffff]" +
  ")" +
  ")" +
  "$", "i"
);

declare let window: any;
declare let cordova: any;

@Component({
  selector: 'app-store-main',
  templateUrl: './store-main.component.html',
  styleUrls: ['./store-main.component.scss']
})
export class StoreMainComponent implements OnInit {

  urlInputForm: FormGroup = this.fb.group({});

  urlSuggestions: string[] = [];

  unsubscribe$: Subject<void> = new Subject<void>();

  storeAlias: string;

  @ViewChild('navigateStoreConfirmDialog', { static: false }) navigateStoreConfirmDialog: TemplateRef<any>;

  constructor(private actions$: Actions,
    private router: Router,
    private fb: FormBuilder,
    private store: Store<CatalogState>,
    private toastr: ToastrService,
    private translateSer: TranslateService,
    public dialog: MatDialog,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.urlInputForm = this.fb.group({
      url_input: ['', Validators.compose([Validators.required, CustomValidators.url])],
    });
    this.getControl('url_input').valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(url => {
      this.generateUrlSuggestionsFromInput(url);
    });
  }

  generateUrlSuggestionsFromInput(urlInput: string) {
    this.urlSuggestions = [];
    if (urlInput.startsWith('http://')) {
      // suggesting in case user inputs http by mistake
      let url_domain = urlInput.substr(7);
      if (url_domain.includes('.')) { // contains dot, assuming that input is a domain
        // extracts the subdomain and suggests gonnaorder.com
        const subdomain = url_domain.split('.')[0];
        if (STOREALIAS_REGEXP.test(subdomain)) {
          this.urlSuggestions.push(`https://${subdomain}.${environment.backend.domain}`);
        }
      } else { // not containing dot and the length is greater than 6 which means it might be store alias for gonnaorder.com
        if (STOREALIAS_REGEXP.test(url_domain)) {
          this.urlSuggestions.push(`https://${url_domain}.${environment.backend.domain}`);
        }
      }
    } else if (urlInput.startsWith('https://')) {
      let url_domain = urlInput.substr(8);
      if (url_domain.includes('.')) { // contains dot, assuming that input is a domain
        // extracts the subdomain and suggests gonnaorder.com
        const subdomain = url_domain.split('.')[0];
        if (STOREALIAS_REGEXP.test(subdomain)) {
          this.urlSuggestions.push(`https://${subdomain}.${environment.backend.domain}`);
        }
      } else { // not containing dot which means it might be store alias for gonnaorder.com
        if (STOREALIAS_REGEXP.test(url_domain)) {
          this.urlSuggestions.push(`https://${url_domain}.${environment.backend.domain}`);
        }
      }
    } else { // assumes that user is typing domain or store alias
      if (urlInput.includes('.')) { // contains dot, assuming that input is a domain
        // extracts the subdomain and suggests gonnaorder.com
        const subdomain = urlInput.split('.')[0];
        if (STOREALIAS_REGEXP.test(subdomain)) {
          this.urlSuggestions.push(`https://${subdomain}.${environment.backend.domain}`);
        }
      } else { // not containing dot which means it might be store alias
        if (STOREALIAS_REGEXP.test(urlInput)) {
          this.urlSuggestions.push(`https://${urlInput}.${environment.backend.domain}`);
        }
      }
    }
  }

  onClickCamera() {

    window.cordova.plugins.barcodeScanner.scan(
      (result) => {
        if (result.format === "QR_CODE" && result.text) {
          let urlScanned = result.text;
          urlScanned = urlScanned.replace("https://", '');
          urlScanned = urlScanned.replace("http://", '');
          urlScanned = urlScanned.split("#")[0];
          urlScanned = urlScanned.replace("/", '');
          let store_alias = urlScanned.indexOf('.') < 0 ? urlScanned : urlScanned.split('.')[0];
          if (URL_REGEXP.test(urlScanned)
            && ((urlScanned.endsWith(environment.backend.domain) && STOREALIAS_REGEXP.test(store_alias))
              || (!urlScanned.includes(".") && !urlScanned.includes("http://") && !urlScanned.includes("https://")))) {
            this.store.dispatch(new SaveStoreByAlias(store_alias, `https://${store_alias}.${environment.backend.domain}`, StoreSaveMode.QRSCAN));
            this.actions$.pipe(
              ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
              filter(action => action.saveMode === StoreSaveMode.QRSCAN),
              take(1),
            ).subscribe(action => {
              this.zone.run(() => {
                this.storeAlias = action.storeAlias;
                if (this.storeAlias) {
                  this.store.dispatch(new SetMobileStore(this.storeAlias));
                  this.router.navigate([`/public/customer/store/${this.storeAlias}`]);
                }
              });
            })

            this.actions$.pipe(
              ofType<SaveStoreByAliasFailed>(StoreActionType.SaveStoreByAliasFailed),
              take(1),
              delay(2000),
            ).subscribe(_ => {
              this.zone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
            })

          } else {
            this.zone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
          }
        }
      },
      (err) => {
        this.zone.run(() => this.toastr.error(this.translateSer.instant('public.global.errorQRScanner'), this.translateSer.instant('public.global.error')));
      },
      {
        showTorchButton: true,
        prompt: "Please place a barcode inside the scan area.",
        formats: "QR_CODE",
        resultDisplayDuration: 1500,
        disableSuccessBeep: false,
      }
    );
  }

  onClickGO() {
    let urlInput: string = this.getControl('url_input').value;
    // extract store alias
    urlInput = urlInput.replace("https://", '');
    urlInput = urlInput.replace("http://", '');
    let store_alias = urlInput.indexOf('.') < 0 ? urlInput : urlInput.split('.')[0];
    if (this.getControl('url_input').valid
      && ((urlInput.endsWith(environment.backend.domain) && STOREALIAS_REGEXP.test(store_alias))
        || (!urlInput.includes(".") && !urlInput.includes("http://") && !urlInput.includes("https://")))) {
      this.store.dispatch(new SaveStoreByAlias(store_alias, `https://${store_alias}.${environment.backend.domain}`, StoreSaveMode.URL));
      this.actions$.pipe(
        ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
        filter(action => action.saveMode === StoreSaveMode.URL),
        take(1),
      ).subscribe(action => {
        this.storeAlias = action.storeAlias;
        if (this.storeAlias) {
          this.store.dispatch(new SetMobileStore(this.storeAlias));
          this.router.navigate([`/public/customer/store/${this.storeAlias}`]);
        }
      });
      this.actions$.pipe(
        ofType<SaveStoreByAliasFailed>(StoreActionType.SaveStoreByAliasFailed),
        take(1),
      ).subscribe(_ => {
        this.zone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
      })
    } else {
      this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information'));
    }
  }

  getControl(name: string) {
    if (this.urlInputForm) {
      return this.urlInputForm.get(name);
    }
    return null;
  }
}
