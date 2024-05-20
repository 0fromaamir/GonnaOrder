import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { ContentItemModel, SaveCategoryView, ContentItemView, DeleteDialogData, Category, Station } from '../stores-catalog';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { SaveCategory, SaveContentItem, DeleteCategory, StoresCatalogAction, StoresCatalogActionType, SaveCategoryFailed, DeleteCategoryImage, UploadOfferOrCategoryImage, DownloadOfferOrCategoryImage } from '../+state/stores-catalog.actions';
import { CatalogState, CategoryState } from '../+state/stores-catalog.reducer';
import { getCatalogOverview, getCategoryDetails, getCategoryImage, getCategoryStatus, getStationData } from '../+state/stores-catalog.selectors';
import { takeUntil, tap, filter, map, catchError, switchMap } from 'rxjs/operators';
import { StoresCatalogService } from '../stores-catalog.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../overlay/delete-dialog/delete-dialog.component';
import { helpPage } from 'src/app/shared/help-page.const';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { TranslateService } from '@ngx-translate/core';
import { StoresScheduleService } from '../../store-schedule/stores-schedule.service';
import { Actions, ofType } from '@ngrx/effects';
import { DomSanitizer } from '@angular/platform-browser';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { StoresState } from '../../+state/stores.reducer';

@Component({
  selector: 'app-store-category',
  templateUrl: './store-category.component.html',
  styleUrls: ['./store-category.component.scss']
})
export class StoreCategoryComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  characterCountShort: number = 0; // Add characterCountShort variable
  contentItem: ContentItemModel;
  saveCategoryRequest: SaveCategoryView;
  categoryId: any;
  category$: Observable<any>;
  categoryDetails: any;
  categoryContentItem: any = [];
  catalogId: any;
  isCreateCategory = false;
  scheduleList: any = [];
  private destroy$ = new Subject();
  contentItemId: number;
  storeId: any;
  saveContentItemRequest: ContentItemView;
  hasOffers = false;
  storeCategoryHelpPage = helpPage.catalogCategory;
  categoryName: string;
  categoryStatus: string;
  scheduleId: number;
  isSubmitted = false;
  subscription: Subscription;
  isTopLevelCategory: boolean = false;
  isStoreOperator = false;
  categoryImageUrl$: Observable<any>;
  categoryStdImage: any;
  categoryImage: File;
  categories: Category[];
  topLevelCategoryId: number;
  stationId: number;
  stations: Station[];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private category: Store<CategoryState>,
    private service: StoresCatalogService,
    public dialog: MatDialog,
    private schedule: StoresScheduleService,
    private translate: TranslateService,
    private actions$: Actions,
    private sanitizer: DomSanitizer,
    private store: Store<StoresState>,
    private catalog: Store<CatalogState>,
  ) { }

  ngOnInit() {
    const catalog$ = this.catalog.pipe(select(getCatalogOverview));
    this.route.params
      .pipe(
        switchMap(params => {
          this.categoryId = params.categoryId;
          this.catalogId = params.catalogId;
          this.storeId = params.id;
          return [this.categoryId, this.catalogId, this.storeId];
        }),
        takeUntil(this.destroy$)
      ).subscribe(data => {
        catalog$.subscribe(data => {
          if (data) {
            this.catalogId = data.catalogId ? data.catalogId : this.catalogId;
          }
        });
        this.createOrResetForm();
        if (this.categoryId !== 'CREATE_CATEGORY') {
          this.isCreateCategory = false;
          this.category$ = this.category.pipe(
            select(getCategoryDetails),
            filter(category => category != null),
            tap(category => {
              this.categoryForm.patchValue({
                scheduleId: category.scheduleId ? category.scheduleId : 0,
                sellable: category.isSellable,
                name: category.name,
                shortDescription: category.shortDescription,
                externalId: category.externalId,
                topLevelCategoryId: category.topLevelCategoryId ? category.topLevelCategoryId : null,
                stationId: category.stationId ? category.stationId : null
              });
              this.isTopLevelCategory = category.hierarchyLevel === 'TOP';
            }),
            tap(category => this.topLevelCategoryId = category.topLevelCategoryId ? category.topLevelCategoryId : null),
            tap(category => this.stationId = category.stationId ? category.stationId : null),
            tap(category => this.categoryContentItem = category.languageTranslation),
            tap(category => this.categoryName = category.name),
            tap(category => this.contentItemId = category.contentItemId),
            tap(category => this.hasOffers = (category.offers && category.offers.length > 0) ? true : false),
            tap(category => this.scheduleId = category.scheduleId ? category.scheduleId : 0)
          );
          this.categoryImageUrl$ = this.category.pipe(select(getCategoryImage));
          this.categoryImageUrl$
            .pipe(
              takeUntil(this.destroy$)
            ).subscribe(imageUrl => {
              this.categoryStdImage = imageUrl;
            });
        } else {
          this.createCategory();
        }
      })

    this.schedule.getAllSchedules(this.storeId).pipe(takeUntil(this.destroy$))
      .subscribe(results => this.scheduleList = results);

    if (this.catalogId) {
      this.service.listCatalogCategories(this.catalogId, this.storeId)
        .pipe(takeUntil(this.destroy$)).subscribe(result => {
          this.categories = result.filter(c => c.hierarchyLevel === 'TOP');
        });
    }

    this.catalog.select(getCatalogOverview).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.stations = result?.stations;
      })
    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s && s.storeRoles && this.storeId && (s.storeRoles[+this.storeId] === 'STORE_STANDARD')) {
        this.isStoreOperator = true;
      }
    });

    this.saveCategoryRequest = this.categoryForm.value;
    this.saveContentItemRequest = { languageTranslation: [], standardImage: null };
    this.category
      .pipe(
        select(getCategoryStatus),
        takeUntil(this.destroy$),
      )
      .subscribe((s) => {
        this.categoryStatus = s;
      });
    this.subscription = this.actions$.pipe(
      ofType<StoresCatalogAction>(
        StoresCatalogActionType.SaveCategoryFailed
      ),
      map(_ => { this.isSubmitted = false; }),
    ).subscribe();

    this.categoryForm.get('shortDescription').valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(value => {
      this.characterCountShort = value ? value.length : 0; // Update character count
    });

  }

  createCategory() {
    this.isCreateCategory = true;
    this.scheduleId = 0;
    const type = this.route.snapshot.queryParams.type;
    this.isTopLevelCategory = type === 'top';
    this.topLevelCategoryId = null;
    this.stationId = null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getControl(name: string) {
    return this.categoryForm.get(name);
  }

  updateContentItem(contentItemModel: ContentItemModel) {
    this.contentItem = contentItemModel;
    this.saveContentItem();
  }

  onCategorySave(nextPage?: string) {
    const params = this.route.params as { [key: string]: any };
    this.categoryId = params._value.categoryId;
    if (this.isSubmitted) {
      return;
    }
    this.isSubmitted = true;
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.valid) {
      this.saveCategoryRequest = this.categoryForm.value;
      this.saveCategoryRequest.hierarchyLevel = this.isTopLevelCategory ? 'TOP' : 'PARENT';
      if (+this.categoryForm.value.scheduleId === 0) {
        delete this.saveCategoryRequest.scheduleId;
      }
      this.category.dispatch(new SaveCategory(this.saveCategoryRequest, this.categoryId, this.storeId, this.catalogId,
        nextPage, null, null, null, null, this.categoryImage));
      this.isSubmitted = false;

      if (nextPage === 'NEW') {
        this.categoryImageUrl$ = null;
        this.categoryStdImage = null;
        this.categoryImage = null;
        this.createOrResetForm();
      }
    } else {
      this.isSubmitted = false;
      this.categoryForm.get('name').markAsTouched();
    }
  }

  createOrResetForm(): void {
    this.categoryForm = this.fb.group({
      scheduleId: [0],
      sellable: ['true', Validators.compose([Validators.required])],
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      shortDescription: [null, Validators.compose([Validators.maxLength(200)])],
      externalId: [null, Validators.compose([Validators.maxLength(150)])],
      topLevelCategoryId: [null],
      stationId: null
    }, { validator: CustomValidators.checkForOnlySpaces('name') });
  }

  saveContentItem() {
    if (!this.isCreateCategory) {
      this.saveContentItemRequest.languageTranslation = [];
      if (null == this.contentItem || undefined === this.contentItem) {
        this.saveContentItemRequest.languageTranslation = this.categoryContentItem;
      } else {
        this.saveContentItemRequest.languageTranslation = this.saveContentItemRequest.languageTranslation.concat(this.contentItem);
      }
      this.category.dispatch(new SaveContentItem(this.saveContentItemRequest, this.contentItemId, this.storeId));
    }
  }

  gotoAddSchedule(): void {
    const qParam = { categoryId: this.categoryId, categoryName: this.categoryName, catalogId: this.catalogId };
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

  deleteCategory() {
    const input: DeleteDialogData = { mode: null, message: null };

    if (this.hasOffers) {
      input.mode = 'NODELETE';
      input.message = this.translate.instant('admin.store.catalog.category.infoDeleteCategory');
    } else {
      input.mode = 'DELETE';
      input.message = this.translate.instant('admin.store.catalog.category.confirmDeleteCategory');
    }
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '60%',
      data: input
    });
    dialogRef.afterClosed().subscribe(action => {
      if (action !== undefined) {
        if (action === 'DELETE') {
          this.category.dispatch(new DeleteCategory(this.storeId, this.catalogId, this.categoryId, null, null,
            null, null, null, null, null, null, null, this.isTopLevelCategory ? 'TOP' : 'PARENT'));
        }
      }
    });
  }
  selectScheduleIdHandler($event) {
    this.scheduleId = $event.target.value;
  }

  selectTopLevelCategoryHandler($event) {
    this.topLevelCategoryId = Number($event.target.value);
  }

  selectStationHandler($event) {
    this.stationId = Number($event.target.value);
  }

  getImage(image) {
    return this.sanitizer.bypassSecurityTrustStyle(`url('${image}')`);
  }

  fileUpload(fileInput: any) {
    this.categoryImage = fileInput.target.files[0] as File;
    if (this.categoryImage && !!this.storeId && !!this.contentItemId) {
      this.category.dispatch(new UploadOfferOrCategoryImage(this.categoryImage, this.storeId, this.contentItemId, 'CATEGORY'));
    } else if (this.categoryImage) {
      this.categoryStdImage = URL.createObjectURL(this.categoryImage);
    }
  }

  removeCategoryImage() {
    if (this.categoryId !== 'CREATE_CATEGORY') {
      this.category.dispatch(new DeleteCategoryImage(this.storeId, this.catalogId, this.categoryId));
    }
    this.categoryImageUrl$ = null;
    this.categoryStdImage = null;
    this.categoryImage = null;
  }

  downloadImage() {
    this.store.dispatch(new DownloadOfferOrCategoryImage(this.categoryStdImage));
  }
  isMaxLengthReached(): boolean {
    return this.characterCountShort >= 200; 
  }

  onShortDescriptionChange(value: string) {
    this.characterCountShort = value.length;
  }


}

