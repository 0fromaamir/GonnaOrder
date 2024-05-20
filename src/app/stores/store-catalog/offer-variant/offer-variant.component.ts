import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { SaveOffer, SaveContentItem, DeleteOffer } from '../+state/stores-catalog.actions';
import { ContentItemModel, SaveOfferView, ContentItemView, DeleteDialogData } from '../stores-catalog';
import { OfferState } from '../+state/stores-catalog.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { StoresCatalogService } from '../stores-catalog.service';
import { forkJoin, Observable, Subject } from 'rxjs';
import { takeUntil, tap, filter } from 'rxjs/operators';
import { getOfferDetails, getOfferStatus } from '../+state/stores-catalog.selectors';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { MatDialog } from '@angular/material/dialog';
import { helpPage } from 'src/app/shared/help-page.const';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';
import { StoresState } from '../../+state/stores.reducer';
import { PriceInputComponent } from 'src/app/shared/price-input/price-input.component';

@Component({
  selector: 'app-offer-variant',
  templateUrl: './offer-variant.component.html',
  styleUrls: ['./offer-variant.component.scss']
})
export class OfferVariantComponent implements OnInit, OnDestroy {

  offerVariantForm: FormGroup;
  characterCountPrice: number = 0;
  characterCountShort: number = 0;
  contentItem: ContentItemModel;
  saveOfferRequest: SaveOfferView;
  offer$: Observable<any>;
  private offerId;
  offerDetails: any;
  categoryList: any = [];
  offerContentItem: any = [];
  catalogId: any;
  private destroy$ = new Subject();
  isCreateOffer = false;
  scheduleList: any = [];
  storeId: any;
  contentItemId: number;
  saveContentItemRequest: ContentItemView;
  mainOfferId: number;
  mainOfferName: any;
  offerVariantHelpPage = helpPage.catalogPriceVariants;
  offerName: string;
  categoryId: number;
  offerStatus: string;
  scheduleId: number;
  discount: number;
  @ViewChild('priceInput') priceInput: PriceInputComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private offer: Store<OfferState>,
    private store: Store<StoresState>,
    private service: StoresCatalogService,
    private schedule: StoresScheduleService,
    private translate: TranslateService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe((data: any) => {
    this.offerId = data.offerId;
    this.catalogId = data && data.catalogId ? data.catalogId : 0;
    this.storeId = data.id;
    this.mainOfferId = this.route.snapshot.queryParams.mainOfferId;
    this.mainOfferName = this.route.snapshot.queryParams.mainOfferName;
    forkJoin([this.service.listCatalogCategories(this.catalogId, this.storeId), this.schedule.getAllSchedules(this.storeId)])
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        this.categoryList = results[0];
        this.scheduleList = results[1];
      });
    this.createOrResetForm();
    if (this.offerId !== 'CREATE_OFFER') {
      this.isCreateOffer = false;
      this.offer$ = this.offer.pipe(
        select(getOfferDetails),
        filter(offer => offer != null),
        tap(offer =>
          this.offerVariantForm.patchValue({
            categoryId: offer.categoryId,
            price: offer.price,
            discount: offer.discount ? offer.discount : 0,
            discountType: ((offer.discount == null) ? 'NODISCOUNT' : offer.discountType),
            scheduleId: offer.scheduleId ? offer.scheduleId : 0,
            sellable: offer.isSellable,
            priceDescription: offer.priceDescription,
            shortDescription: offer.shortDescription,
            externalProductId: offer.externalProductId,
            vatExternalId: offer.vatExternalId
          })
        ),
        tap(offer => this.offerName = offer.priceDescription),
        tap(offer => this.categoryId = offer.categoryId),
        tap(offer => this.offerContentItem = offer.languageTranslation),
        tap(offer => this.contentItemId = offer.contentItemId),
        tap(offer => this.discount = offer.discount ? offer.discount : 0),
        tap(offer => this.scheduleId = offer.scheduleId ? offer.scheduleId : 0)
      );

    } else {
      this.isCreateOffer = true;
      this.offerVariantForm.patchValue({
        discountType: 'NODISCOUNT'
      });
      this.discount = 0;
      this.scheduleId = 0;
    }
    this.saveOfferRequest = this.offerVariantForm.value;
    this.saveContentItemRequest = { languageTranslation: [], standardImage: null };

    this.offer
      .pipe(
        select(getOfferStatus),
        takeUntil(this.destroy$),
      )
      .subscribe(s => {
        this.offerStatus = s;
      });
    });
    this.offerVariantForm.get('priceDescription').valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {
      this.characterCountPrice = value ? value.length : 0; // Update character count
    });
    this.offerVariantForm.get('shortDescription').valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {
      this.characterCountShort = value ? value.length : 0; // Update character count
    });
  }

  getControl(name: string) {
    return this.offerVariantForm.get(name);
  }

  isSelected(name) {
    return this.offerVariantForm.value.discountType === name;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }

  setMonetary() {
    this.offerVariantForm.controls.discount.setValue('0', { onlySelf: true });
  }

   setPercentage() {
    this.offerVariantForm.controls.discount.setValue('0', { onlySelf: true });
    this.discount = 0;
  }

  private createOrResetForm(): void {
    if (this.priceInput) {
      this.priceInput.reset();
    }
    this.offerVariantForm = this.fb.group({
      price: [''],
      discount: [0, Validators.compose([Validators.pattern('^[0-9].*$')])],
      discountType: [''],
      scheduleId: [0],
      sellable: ['true', Validators.compose([Validators.required])],
      externalProductId: ['', Validators.compose([Validators.maxLength(100)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(200)])],
      priceDescription: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(200)])],
      vatExternalId: ['', Validators.compose([Validators.maxLength(100)])],
    }, { validator: [CustomValidators.checkForOnlySpaces('priceDescription'), CustomValidators.discountValidator('price', 'discount', 'discountType')] });
  }

  onOfferSave(nextPage: string) {
    this.offerVariantForm.markAllAsTouched();
    if (this.offerVariantForm.valid) {
    this.saveOfferRequest = this.offerVariantForm.value;
    this.saveOfferRequest.hierarchyLevel = 'VARIANT';
    if (this.offerVariantForm.value.discountType === 'NODISCOUNT') {
      delete this.saveOfferRequest.discount;
      delete this.saveOfferRequest.discountType;
    }
    if (+this.offerVariantForm.value.scheduleId === 0) {
      delete this.saveOfferRequest.scheduleId;
    }
    delete this.offerVariantForm.value.addRestriction;
    this.saveOfferRequest.parentOfferId = this.mainOfferId;
    this.offer.dispatch(new SaveOffer(
      this.saveOfferRequest,
      this.offerId,
      this.storeId,
      this.catalogId,
      null,
      nextPage,
      'VARIANT',
      this.mainOfferId,
      this.mainOfferName,
      this.mainOfferId,
      this.mainOfferName,
      null,
      null,
      null,
      null
    ));
    if (nextPage === 'NEW') {
      this.createOrResetForm();
      this.isCreateOffer = true;
      this.offerVariantForm.patchValue({
        discountType: 'NODISCOUNT'
      });
      this.discount = 0;
      this.scheduleId = 0;
    }
  }else {
    this.offerVariantForm.get('priceDescription').markAsTouched();
  }
}
  saveContentItem() {
    if (!this.isCreateOffer) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null == this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.offerContentItem;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      // console.log(JSON.stringify(this.saveContentItemRequest));

      this.offer.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }

  goBack(event) {
    if (event !== undefined) {
      event.preventDefault();
    }
    if (this.mainOfferId != null) {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/offer`, this.mainOfferId]);
    } else {
      this.router.navigate([`/manager/stores/${this.storeId}/catalog`]);
    }
  }


  deleteVariant() {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.catalog.variant.confirmDeleteVariant');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.offer.dispatch(new DeleteOffer(this.storeId, this.catalogId, this.offerId, 'VARIANT', this.mainOfferId,
        this.mainOfferName, this.mainOfferId, this.mainOfferName, null, null, null));
      }
    });
  }

  gotoAddSchedule(): void {
    const qParam = {
      offerId: this.offerId,
      offerName: this.offerName,
      parentOfferId: this.mainOfferId,
      catalogId: this.catalogId,
      categoryId: this.categoryId,
    };
    try {
      localStorage.setItem('backLink', this.router.url);
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], { queryParams: qParam });
    } catch (e) {
      console.log('localstorage disabled');
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam,
        state: { backLink: this.router.url }
      });
    }
  }

  selectDiscountHandler($event){
    this.discount = $event.target.value;
  }

  selectScheduleIdHandler($event){
    this.scheduleId = $event.target.value;
  }

  getCategoryList(type: string) {
    if (type === 'CHILD') {
      return this.categoryList.filter(x => x.hierarchyLevel === 'CHILD');
    } else {
      return this.categoryList.filter(x => x.hierarchyLevel === 'PARENT');
    }
  }
  isMaxLengthReached(): boolean {
    return this.characterCountPrice >= 200; 
  }
  isMaxLengthReached1(): boolean {
    return this.characterCountShort >= 200; 
  }

  onPriceDescriptionChange(value: string) {
    this.characterCountPrice = value.length;
  }

  onShortDescriptionChange(value: string) {
    this.characterCountShort = value.length;
  }
}
