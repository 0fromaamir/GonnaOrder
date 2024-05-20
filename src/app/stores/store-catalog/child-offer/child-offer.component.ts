import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OfferState } from '../+state/stores-catalog.reducer';
import { ActivatedRoute, Router } from '@angular/router';
import { SaveOffer, SaveContentItem, LoadCategory, DeleteOffer, DownloadOfferOrCategoryImage, UploadOfferOrCategoryImage, DeleteOfferImage, } from '../+state/stores-catalog.actions';
import { ContentItemModel, SaveOfferView, ContentItemView, DeleteDialogData } from '../stores-catalog';
import { Store, select } from '@ngrx/store';
import { takeUntil, tap, filter } from 'rxjs/operators';
import { getOfferDetails, getOfferImage, getOfferStatus } from '../+state/stores-catalog.selectors';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { helpPage } from 'src/app/shared/help-page.const';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { TranslateService } from '@ngx-translate/core';
import { StoresState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';
import { PriceInputComponent } from 'src/app/shared/price-input/price-input.component';

@Component({
  selector: 'app-child-offer',
  templateUrl: './child-offer.component.html',
  styleUrls: ['./child-offer.component.scss']
})
export class ChildOfferComponent implements OnInit, OnDestroy {
  childOfferForm: FormGroup;
  characterCountShort: number = 0;
  offerContentItem: any = [];
  contentItem: ContentItemModel;
  saveOfferRequest: SaveOfferView;
  catalogId: any;
  storeId: any;
  offerId: any;
  isCreateOffer = false;
  offer$: Observable<any>;
  offerImageUrl$: Observable<any>;
  isStoreOperator = false;
  offerStdImage: any;
  offerImage: File;
  standardImage: string;
  contentItemId: number;
  saveContentItemRequest: ContentItemView;
  childCategoryId: any;
  parentOfferId: number;
  sourcePage: string;
  sourceOptionGroup: boolean;
  parentOfferName: any;
  stockManagementEnabled: boolean;
  private destroy$ = new Subject();
  childOfferHelpPage = helpPage.catalogOptionGroup;
  scheduleList: any = [];
  offerName: number;
  categoryId: number;
  offerStatus: string;
  mainOfferId: number;
  mainOfferName: string;
  variantOfferId: number;
  variantOfferName: string;
  private readonly stockLevelValidators = [
    Validators.pattern('^[0-9].*$'), Validators.min(0), Validators.max(100000)
  ];
  @ViewChild('priceInput') priceInput: PriceInputComponent;

  constructor(
    private fb: FormBuilder,
    private offer: Store<OfferState>,
    private store: Store<StoresState>,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private storeService: StoresScheduleService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((data: any) => {
      this.offerId = data.offerId;
      this.catalogId = data.catalogId;
      this.storeId = data.id;
      this.childCategoryId = this.route.snapshot.queryParams.categoryId;
      this.parentOfferId = this.route.snapshot.queryParams.parentOfferId;
      this.sourcePage = this.route.snapshot.queryParams.sourcePage;
      this.sourceOptionGroup = this.route.snapshot.queryParams.sourceOptionGroup;
      this.parentOfferName = this.route.snapshot.queryParams.parentOfferName;
      this.mainOfferId = this.route.snapshot.queryParams.mainOfferId;
      this.mainOfferName = this.route.snapshot.queryParams.mainOfferName;
      this.variantOfferId = this.route.snapshot.queryParams.variantOfferId;
      this.variantOfferName = this.route.snapshot.queryParams.variantOfferName;

      this.storeService.getAllSchedules(this.storeId).pipe(takeUntil(this.destroy$)).
        subscribe(res => this.scheduleList = res);
      this.createOrResetForm();
      if (this.offerId !== 'CREATE_OFFER') {
        this.isCreateOffer = false;
        this.offer$ = this.offer.pipe(select(getOfferDetails), filter(offer => offer != null),
          tap(offer =>
            this.childOfferForm.patchValue({
              name: offer.name,
              shortDescription: offer.shortDescription,
              price: offer.price,
              externalProductId: offer.externalProductId,
              scheduleId: offer.scheduleId ? offer.scheduleId : 0,
              sellable: offer.isSellable,
              isStockCheckEnabled: offer.isStockCheckEnabled,
              stockLevel: offer.stockLevel,
              preselected: offer.attributeDtos && offer.attributeDtos
                .findIndex((at) => at.key === 'PRESELECTED' && at.value === true) !== -1,
              vatExternalId: offer.vatExternalId
            })
          ),
          tap(offer => this.offerContentItem = offer.languageTranslation),
          tap(offer => this.contentItemId = offer.contentItemId),
          tap(offer => this.categoryId = offer.categoryId),
          tap(offer => this.offerName = offer.offerName)),

          this.offerImageUrl$ = this.offer.pipe(select(getOfferImage));
      this.offerImageUrl$
        .pipe(
          takeUntil(this.destroy$)
        ).subscribe(imageUrl => {
          this.offerStdImage = imageUrl;
      });
           } else {
        this.isCreateOffer = true;
      }

this.saveContentItemRequest = { languageTranslation: [], standardImage: null };
      if (this.childCategoryId !== undefined) {
        this.offer.dispatch(new LoadCategory(this.childCategoryId, this.storeId, this.catalogId));
      }

      this.store.pipe(
        select(getSelectedStore),
        takeUntil(this.destroy$))
      .subscribe(s => {
        this.stockManagementEnabled = s.settings.STOCK_MANAGEMENT;
        if (!this.isCreateOffer && this.stockManagementEnabled) {
          this.childOfferForm.get('stockLevel').setValidators(this.stockLevelValidators.concat(Validators.required));
        } else {
          this.childOfferForm.get('stockLevel').setValidators(this.stockLevelValidators);
        }
      });

      this.store.pipe(
        select(getOfferStatus),
        takeUntil(this.destroy$))
      .subscribe(s => {
        this.offerStatus = s;
      });
    });
    this.childOfferForm.get('shortDescription').valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {
      this.characterCountShort = value ? value.length : 0; // Update character count
    });

  }

  createOrResetForm(): void  {
    if (this.priceInput) {
      this.priceInput.reset();
    }
    this.childOfferForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(200)])],
      price: [''],
      scheduleId: [0],
      externalProductId: ['', Validators.compose([Validators.maxLength(100)])],
      isStockCheckEnabled: [''],
      stockLevel: ['', Validators.compose(this.stockLevelValidators)],
      sellable: ['true', Validators.compose([Validators.required])],
      preselected: [false, Validators.compose([Validators.required])],
      vatExternalId: ['', Validators.compose([Validators.maxLength(100)])],
    }, { validator: CustomValidators.checkForOnlySpaces('name') });
  }

  getControl(name: string) {
    return this.childOfferForm.get(name);
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }

  onChildOfferSave(nextPage: string) {
    this.childOfferForm.markAllAsTouched();
    if (this.childOfferForm.valid) {
      if(!this.childCategoryId && nextPage === 'SAVE'){
       this.childCategoryId = this.parentOfferId;
      }
    this.saveOfferRequest = this.childOfferForm.value;
    this.saveOfferRequest.hierarchyLevel = 'CHILD';
    this.saveOfferRequest.categoryId = this.childCategoryId;
    if (!this.saveOfferRequest.attributeDtos) {
      this.saveOfferRequest.attributeDtos = [];
    }
    if (this.saveOfferRequest.preselected !== undefined) {
      this.saveOfferRequest.attributeDtos = this.saveOfferRequest.attributeDtos.filter((at) => at.key !== 'PRESELECTED');
      this.saveOfferRequest.attributeDtos.push({ key: 'PRESELECTED', value: this.saveOfferRequest.preselected });
      delete this.saveOfferRequest.preselected;
    }
    if (this.childOfferForm.value.scheduleId === 0) {
      delete this.saveOfferRequest.scheduleId;
    }
    this.offer.dispatch(new SaveOffer(
      this.saveOfferRequest,
      this.offerId,
      this.storeId,
      this.catalogId,
      this.childCategoryId,
      nextPage,
      this.sourcePage,
      this.parentOfferId,
      this.parentOfferName,
      this.mainOfferId,
      this.mainOfferName,
      this.variantOfferId,
      this.variantOfferName,
      this.sourceOptionGroup,
      this.offerImage
    ));
    if (nextPage === 'NEW') {
      this.createOrResetForm();
    }
  } else {
    this.childOfferForm.get('name').markAsTouched();
  }
}

  saveContentItem() {
    if (!this.isCreateOffer) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null === this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.offerContentItem;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      this.offer.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }

  goBack(event) {
    if (event !== undefined) {
      event.preventDefault();
    }
    if (this.sourcePage === 'OFFER') {
      if (this.sourceOptionGroup) {
        const queryParams = {
          parentOfferId: this.mainOfferId,
          parentOfferName: this.mainOfferName,
          mainOfferId: this.mainOfferId,
          mainOfferName: this.mainOfferName,
          sourcePage: this.sourcePage
        };
        this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory/${this.parentOfferId}`], {
          queryParams
        });
      } else {
        this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/offer`, this.mainOfferId]);
      }
    } else if (this.sourcePage === 'VARIANT') {
      if (this.sourceOptionGroup) {
        const queryParams = {
          parentOfferId: this.variantOfferId,
          parentOfferName: this.variantOfferName,
          mainOfferId: this.mainOfferId,
          mainOfferName: this.mainOfferName,
          sourcePage: this.sourcePage
        };
        this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory/${this.parentOfferId}`], {
          queryParams
        });
      } else {
        const queryParams = {
          mainOfferId: this.mainOfferId,
          mainOfferName: this.mainOfferName
        };
        this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/offerVariant/${this.parentOfferId}`], {
          queryParams
        });
      }
    } else {
      const queryParams = {
        parentOfferId: this.parentOfferId
      };
      this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/childCategory/${this.childCategoryId}`], {
        queryParams
      });
    }
  }

  deleteOffer() {
    const input: DeleteDialogData = { mode: null, message: null };
    input.mode = 'DELETE';
    input.message = this.translate.instant('admin.store.catalog.option.confirmDeleteOption');
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'DELETE') {
        this.offer.dispatch(new DeleteOffer(this.storeId, this.catalogId, this.offerId, this.sourcePage, this.parentOfferId,
          this.parentOfferName, this.mainOfferId, this.mainOfferName, this.variantOfferId, this.variantOfferName,
          this.sourceOptionGroup));
      }
    });
  }

  gotoAddSchedule(): void {
    const qParam = {
      offerId: this.offerId,
      offerName: this.offerName,
      parentOfferId: this.parentOfferId,
      catalogId: this.catalogId,
      categoryId: this.categoryId,
    };
    try {
      localStorage.setItem('backLink', this.router.url);
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam
      });
    } catch (e) {
      console.log('localstorage disabled');
      this.router.navigate([`/manager/stores/${this.storeId}/settings/schedules/create`], {
        queryParams: qParam,
        state: { backLink: this.router.url }
      });
    }

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  isMaxLengthReached(): boolean {
    return this.characterCountShort >= 200; 
  }

  onShortDescriptionChange(value: string) {
    this.characterCountShort = value.length;
  }
  downloadImage() {
    this.store.dispatch(new DownloadOfferOrCategoryImage(this.offerStdImage));
  }

  fileUpload(fileInput: any) {
    this.offerImage = fileInput.target.files[0] as File;
    if (this.offerImage && !!this.storeId && !!this.contentItemId) {
      this.offer.dispatch(new UploadOfferOrCategoryImage(this.offerImage, this.storeId, this.contentItemId, 'OFFER'));
    } else if (this.offerImage && this.isCreateOffer) {
     this.offerStdImage = URL.createObjectURL(this.offerImage);
    }
  }

  getImage(image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${image}')`);
  }

  removeOfferImage() {
    if (!this.isCreateOffer) {
      this.offer.dispatch(new DeleteOfferImage(this.storeId, this.catalogId, this.offerId));
    }
    this.offerImageUrl$ = null;
    this.offerStdImage = null;
    this.offerImage = null;
  }


}
