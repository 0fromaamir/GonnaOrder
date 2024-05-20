import {Component, OnInit, OnDestroy, Input, ElementRef, ViewChild, ContentChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {select, Store} from '@ngrx/store';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ImageUploadComponent} from 'src/app/shared/image-upload/image-upload.component';
import {
  RemoveStoreImage,
  UpdateStoreSettings,
  UpdateStoreVatPercentage,
  UploadStoreImage
} from '../+state/stores.actions';
import {StoresState} from '../+state/stores.reducer';
import {getSelectedStore, getStoreBackgroundImage} from '../+state/stores.selectors';
import {DownloadOfferOrCategoryImage} from '../store-catalog/+state/stores-catalog.actions';

@Component({
  selector: 'app-store-default-catalog',
  templateUrl: './store-default-catalog.component.html',
  styleUrls: ['./store-default-catalog.component.scss']
})
export class StoreDefaultCatalogComponent implements OnInit, OnDestroy {

  storeId: number;
  settingsForm: FormGroup = this.fb.group({});
  destroyed$ = new Subject<void>();
  backgroundImage = null;
  storeBackgroundImage$: Observable<string>;
  @ViewChild(ImageUploadComponent)
  private imageUploadComponent!: ImageUploadComponent;
  helpUrl: string;

  constructor(private fb: FormBuilder, private store: Store<StoresState>) {
  }

  ngOnInit() {
    this.helpUrl = 'manageStock';
    this.settingsForm = this.fb.group({
      DEFAULT_VAT_PERCENTAGE: [0, Validators.compose([Validators.min(0), Validators.max(100)])],
      CATALOG_CATEGORIES_COLLAPSE: [false],
      STOCK_MANAGEMENT: [''],
      CUSTOMER_UI_LANGUAGE_OPTION: [''],
      DISPLAY_OUT_OF_STOCK_ITEMS: ['']
    });
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroyed$)
    ).subscribe(s => {
      this.storeId = s.id;
      this.settingsForm.get('DEFAULT_VAT_PERCENTAGE').setValue(s.vatPercentage ? s.vatPercentage : 0);
      this.settingsForm.get('CATALOG_CATEGORIES_COLLAPSE').setValue(!s.settings.CATALOG_CATEGORIES_COLLAPSE);
      this.settingsForm.get('STOCK_MANAGEMENT').setValue(s.settings.STOCK_MANAGEMENT);
      this.settingsForm.get('CUSTOMER_UI_LANGUAGE_OPTION').setValue(s.settings.CUSTOMER_UI_LANGUAGE_OPTION);
      this.settingsForm.get('DISPLAY_OUT_OF_STOCK_ITEMS').setValue(s.settings.DISPLAY_OUT_OF_STOCK_ITEMS === 'GREYED_OUT' ? false : true);
    });
    this.storeBackgroundImage$ = this.store.pipe(
      select(getStoreBackgroundImage)
    );

    this.storeBackgroundImage$
      .pipe(
        takeUntil(this.destroyed$)
      ).subscribe(backgroundImageUrl => {
      this.backgroundImage = backgroundImageUrl;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onSubmit(isVatUpdate = false) {
    const formObj = this.settingsForm.getRawValue();
    this.settingsForm.patchValue(formObj);
    if (isVatUpdate) {
      if (this.settingsForm.valid) {
        this.store.dispatch(new UpdateStoreVatPercentage(formObj.DEFAULT_VAT_PERCENTAGE));
      }
    } else {
      delete formObj.DEFAULT_VAT_PERCENTAGE;
      formObj.CATALOG_CATEGORIES_COLLAPSE = !formObj.CATALOG_CATEGORIES_COLLAPSE;
      formObj.STOCK_MANAGEMENT = formObj.STOCK_MANAGEMENT;
      formObj.DISPLAY_OUT_OF_STOCK_ITEMS = formObj.DISPLAY_OUT_OF_STOCK_ITEMS ? 'HIDDEN' : 'GREYED_OUT';
      this.store.dispatch(new UpdateStoreSettings(formObj));
    }
  }

  getControl(name: string) {
    return this.settingsForm.get(name);
  }

  downloadImage() {
    this.store.dispatch(new DownloadOfferOrCategoryImage(this.backgroundImage));
  }

  onBackgroundImageUpload(file: File) {
    this.store.dispatch(new UploadStoreImage(file, true));

  }
  onStoreRemoveBackgroundImage(a) {
    this.store.dispatch(new RemoveStoreImage(this.storeId, true));
    if (this.imageUploadComponent.fileRef?.nativeElement?.value) {
      this.imageUploadComponent.fileRef.nativeElement.value = '';
    }
  }

  setCustomerUILanguage(){


  }

}
