
// tslint:disable: member-ordering
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap, withLatestFrom, exhaustMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { StoresCatalogService } from '../stores-catalog.service';
import {
  StoresCatalogActionType,
  LoadCatalog,
  LoadCatalogSuccess,
  LoadCatalogFailed,
  SaveOffer,
  SaveOfferSuccess,
  SaveOfferFailed,
  LoadOffer,
  LoadOfferSuccess,
  LoadOfferFailed,
  SaveCategory,
  SaveCategorySuccess,
  SaveCategoryFailed,
  LoadCategory,
  LoadCategorySuccess,
  LoadCategoryFailed,
  SaveOfferPosition,
  SaveOfferPositionSuccess,
  SaveOfferPositionFailed,
  SaveCategoryPosition,
  SaveCategoryPositionSuccess,
  SaveCategoryPositionFailed,
  UploadOfferImageSuccess,
  SaveContentItem,
  SaveContentItemSuccess,
  SaveContentItemFailed,
  AssociateChildCategories,
  AssociateChildCategoriesSuccess,
  AssociateChildCategoriesFailed,
  AssociateChildOffers,
  AssociateChildOffersSuccess,
  AssociateChildOffersFailed,
  AssociateOfferVariants,
  AssociateOfferVariantsSuccess,
  AssociateOfferVariantsFailed,
  VerifyCatalogData,
  VerifyCatalogDataSuccess,
  VerifyCatalogDataFailed,
  UploadCatalogData,
  UploadCatalogDataSuccess,
  UploadCatalogDataFailed,
  DeleteCategory,
  DeleteCategorySuccess,
  DeleteCategoryFailed,
  DeleteOffer,
  DeleteOfferSuccess,
  DeleteOfferFailed,
  SaveAvailability,
  SaveAvailabilitySuccess,
  SaveAvailabilityFailed,
  VerifyCatalogImage,
  VerifyCatalogImageSuccess,
  VerifyCatalogImageFailed,
  DownloadTranslateCatalogXls,
  DownloadTranslateCatalogXlsSuccess,
  DownloadTranslateCatalogXlsFailed,
  DownloadToUpdateCatalogXls,
  DownloadToUpdateCatalogXlsSuccess,
  DownloadToUpdateCatalogXlsFailed,
  UploadCatalogTranslate,
  UploadCatalogTranslateSuccess,
  UploadCatalogTranslateFailed,
  DeleteOfferOrCategoryImageSuccess,
  DeleteOfferImage,
  DeleteOfferOrCategoryImageFailed,
  PatchSaveOffer,
  PatchSaveOfferSuccess,
  PatchSaveOfferFailed,
  ImportCatalog,
  ImportCatalogSuccess,
  ImportCatalogFailed,
  DownloadOfferOrCategoryImage,
  DownloadOfferOrCategoryImageSuccess,
  DownloadOfferOrCategoryImageFailed,
  ImportCatalogFromOtherStore,
  ImportCatalogFromOtherStoreSuccess,
  ImportCatalogFromOtherStoreFailed,
  UploadCategoryImageSuccess,
  UploadOfferOrCategoryImage,
  UploadOfferOrCategoryImageFailed,
  DeleteCategoryImage,
  BulkOfferChangeStatusSuccess,
  BulkOfferChangeStatus,
  DeleteMultipleOffer,
  DeleteMultipleOfferSuccess,
  LoadStation,
  LoadStationSuccess,
  LoadStationFailed,
  SaveStation,
  SaveStationSucces,
  SaveStationFailed,
  LoadStationCategory,
  LoadStationCategorySuccess,
  LoadStationCategoryFailed,
  UpdateStation,
  UpdateStationSuccess,
  UpdateStationFailed,
  DeleteStation,
  DeleteStationSuccess,
  DeleteStationFailed
} from './stores-catalog.actions';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { OfferState, CategoryState } from './stores-catalog.reducer';
import { getCategoryDetails, getOfferDetails } from './stores-catalog.selectors';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class StoresEffects {
  constructor(
    private actions$: Actions,
    private catalogService: StoresCatalogService,
    private toastr: ToastrService,
    private offer: Store<OfferState>,
    private category: Store<CategoryState>,
    private router: Router,
    private translateSer: TranslateService) {
    }

  
  onLoadCatalog = createEffect(() => this.actions$.pipe(
    ofType<LoadCatalog>(StoresCatalogActionType.LoadCatalog),
    switchMap(action => this.catalogService.getcatalog(action.id).pipe(
      map(s => new LoadCatalogSuccess(s)),
      catchError(a => of(new LoadCatalogFailed(a)))
    ))
  ));

  
  onLoadCatalogFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadCatalogFailed>(StoresCatalogActionType.LoadCatalogFailed),
    tap(a => this.toastr.error('Error occurred while fetching catalog!'))
  ), { dispatch: false });

  onLoadStation = createEffect(() => this.actions$.pipe(
    ofType<LoadStation>(StoresCatalogActionType.LoadStation),
    switchMap(action => this.catalogService.getStations(action.id).pipe(
      map(s => new LoadStationSuccess(s)),
      catchError(a => of(new LoadStationFailed(a)))
    ))
  ));

  
  onLoadStationFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadStationFailed>(StoresCatalogActionType.LoadStationFailed),
    tap(a => this.toastr.error('Error occurred while fetching catalog!'))
  ), { dispatch: false });

  
  onSaveOffer = createEffect(() => this.actions$.pipe(
    ofType<SaveOffer>(StoresCatalogActionType.SaveOffer),
    switchMap(action => this.catalogService.saveOffer(action.saveOffer, action.offerId, action.storeId, action.catalogId)
      .pipe(
        switchMap(s => {
          if (!!action.offerImage) {
            return this.catalogService.uploadOfferOrCategoryImage(action.offerImage, action.storeId, s.contentItemId)
            .pipe(
              switchMap(r => this.catalogService.saveImageToOfferOrCategory(s.contentItemId, r.fileDownloadUri + '?' + new Date().getTime(), action.storeId)
                .pipe(
                  map(c =>
                    new SaveOfferSuccess(
                      s, action.storeId, action.catalogId, action.childCategoryId, action.offerId,
                      action.nextPage, action.sourcePage, action.parentOfferId, action.parentOfferName,
                      action.mainOfferId, action.mainOfferName, action.variantOfferId, action.variantOfferName,
                      action.sourceOptionGroup)
                  )
                )
              ),
              catchError(e => {
                if (e.status === 400) {
                  const errorMsg = 'An error occured in Logo uploading, please try again';
                  if (e.error.errors == null) { e.error.errors = [{ message: errorMsg }]; }
                  return of(new UploadOfferOrCategoryImageFailed(e.error.errors.map(er => !!er ? !!er.message ? er.message : errorMsg : errorMsg)),
                  new SaveOfferFailed(true));
                } else if (e.status === 413) {
                  return of(new UploadOfferOrCategoryImageFailed('File size should not be more than 10 MB'), new SaveOfferFailed(true));
                }
                return of(new UploadOfferOrCategoryImageFailed('An error occured in Logo uploading, please try again '), new SaveOfferFailed(true));
              })
            );
          } else {
            return of(
              new SaveOfferSuccess(
                s, action.storeId, action.catalogId, action.childCategoryId, action.offerId,
                action.nextPage, action.sourcePage, action.parentOfferId, action.parentOfferName,
                action.mainOfferId, action.mainOfferName, action.variantOfferId, action.variantOfferName,
                action.sourceOptionGroup));
          }
        }),
        catchError(a => of(new SaveOfferFailed(false)))
      ))
  ));

  
  onPatchSaveOffer = createEffect(() => this.actions$.pipe(
    ofType<PatchSaveOffer>(StoresCatalogActionType.PatchSaveOffer),
    switchMap(action => this.catalogService.patchOffer(action.patchSaveOffer, action.offerId, action.storeId, action.catalogId)
      .pipe(
        map(s =>
          new PatchSaveOfferSuccess(
            s, action.storeId, action.catalogId, action.childCategoryId,
            action.offerId, action.parentOfferId, action.sourcePage, action.nextPage)),
        catchError(a => of(new PatchSaveOfferFailed()))
      ))
  ));

  onBulkOfferChangeStatus = createEffect(() => this.actions$.pipe(
    ofType<BulkOfferChangeStatus>(StoresCatalogActionType.BulkOfferChangeStatus),
    switchMap(action => this.catalogService.bulkOfferChangeStatus(action.offerIds, action.isOrderable, action.sellable, action.isStockCheckEnabled, action.stockLevel, action.storeId, action.catalogId)
    .pipe(map(s => new BulkOfferChangeStatusSuccess(action.storeId, action.selectedCategories)))
  )));

  
  onImportCatalogFromOtherStore = createEffect(() => this.actions$.pipe(
    ofType<ImportCatalogFromOtherStore>(StoresCatalogActionType.ImportCatalogFromOtherStore),
    switchMap(action => this.catalogService.importCatalogFromOtherStore(action.request).pipe(
      map(() => new ImportCatalogFromOtherStoreSuccess(action.request.toStore)),
      catchError((errorRes) => {
        return of(new ImportCatalogFromOtherStoreFailed(errorRes));
      })
    ))
  ));

  
  onImportCatalogFromOtherStoreSuccess = createEffect(() => this.actions$.pipe(
    ofType<ImportCatalogFromOtherStoreSuccess>(StoresCatalogActionType.ImportCatalogFromOtherStoreSuccess),
    tap(a =>  {
      this.router.navigate(['/manager/stores/' + a.storeId + '/catalog']);
      return this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogOfstoreimported'));
  })), { dispatch: false });

  
  onImportCatalogFromOtherStoreFailed = createEffect(() => this.actions$.pipe(
    ofType<ImportCatalogFromOtherStoreFailed>(StoresCatalogActionType.ImportCatalogFromOtherStoreFailed),
    tap(z => this.handleImportCatalogFromOtherStoreErrors(z))
  ), { dispatch: false });

  handleImportCatalogFromOtherStoreErrors(z) {
    const code = z?.error?.error?.errors[0]?.code;
    let message = this.translateSer.instant('admin.store.catalog.catalogUnabletoimport');
    if (code === 'STORE_NOT_EMPTY') {
      message = 'The target store is not empty. It may contain catalog offer items or options, menu viewings or orders';
    }
    this.toastr.error(message);
  }

  
  onPatchSaveOfferFailed = createEffect(() => this.actions$.pipe(
    ofType<PatchSaveOfferFailed>(StoresCatalogActionType.PatchSaveOfferFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  ), { dispatch: false });

  
  onPatchSaveOfferSuccess = createEffect(() => this.actions$.pipe(
    ofType<PatchSaveOfferSuccess>(StoresCatalogActionType.PatchSaveOfferSuccess),
    tap(z => this.toastr.success(this.translateSer.instant('admin.store.message.saveOfferSuccess'))),
    tap(z => this.navigateOfferToSourcePage(z))
  ), { dispatch: false });

  onBulkOfferChangeStatusSuccess = createEffect(() => this.actions$.pipe(
    ofType<BulkOfferChangeStatusSuccess>(StoresCatalogActionType.BulkOfferChangeStatusSuccess),
    tap(z => this.toastr.success(this.translateSer.instant('admin.store.message.saveMultipleOfferSuccess'))),
    tap(z => this.router.navigate([`/manager/stores/${z.storeId}/catalog/option-groups`]).then(_ => {
      this.router.navigate([`/manager/stores/${z.storeId}/catalog`])
    }))
  ), { dispatch: false });

  
  onSaveContentItem = createEffect(() => this.actions$.pipe(
    ofType<SaveContentItem>(StoresCatalogActionType.SaveContentItem),
    switchMap(action => this.catalogService.saveContentItem(action.contentItem, action.contentItemId, action.storeId)
      .pipe(
        map(s => new SaveContentItemSuccess(s)),
        catchError(a => of(new SaveContentItemFailed()))
      ))
  ));

  
  onSaveContentItemSuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveContentItemSuccess>(StoresCatalogActionType.SaveContentItemSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.translationsUpdateSuccess')))
  ), { dispatch: false });

  
  onSaveContentItemFailed = createEffect(() => this.actions$.pipe(
    ofType<SaveContentItemFailed>(StoresCatalogActionType.SaveContentItemFailed),
    tap(a => this.toastr.error('An error occured while saving translations'))
  ), { dispatch: false });

  
  onSaveOfferPosition = createEffect(() => this.actions$.pipe(
    ofType<SaveOfferPosition>(StoresCatalogActionType.SaveOfferPosition),
    switchMap(action => this.catalogService.saveOfferPosition(action.offers, action.storeId, action.catalogId)
      .pipe(
        map(s => new SaveOfferPositionSuccess(s)),
        catchError(a => of(new SaveOfferPositionFailed()))
      ))
  ));

  
  onSaveCategoryPosition = createEffect(() => this.actions$.pipe(
    ofType<SaveCategoryPosition>(StoresCatalogActionType.SaveCategoryPosition),
    switchMap(action => this.catalogService.saveCategoryPosition(action.categories, action.storeId, action.catalogId)
      .pipe(
        map(s => new SaveCategoryPositionSuccess(s)),
        catchError(a => of(new SaveCategoryPositionFailed()))
      ))
  ));

  
  onSaveOfferSuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveOfferSuccess>(StoresCatalogActionType.SaveOfferSuccess),
    tap(z => this.toastr.success(this.translateSer.instant('admin.store.message.saveOfferSuccess'))),
    tap(z => this.navigateOfferToSourcePage(z))
  ), { dispatch: false });

  navigateOfferToSourcePage(z) {
    const offer = z.saveOffer;
    if (offer.hierarchyLevel === 'PARENT') {
      if (z.nextPage === 'PARENT') {
        this.router.navigate([`/manager/stores/${z.storeId}/catalog`], { queryParams: { selectedId: z.saveOffer.categoryId } });
      } else if (z.nextPage === 'NEW') {
        // tslint:disable-next-line
        window.location.href = `/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/CREATE_OFFER?categoryId=${z.saveOffer.categoryId}`;
      } else if (z.nextPage === 'CURRENT' && z.mode === 'CREATE_OFFER') {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false; this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer`, z.saveOffer.offerId]);
      }
    } else if (offer.hierarchyLevel === 'CHILD') {
      if (z.nextPage === 'SAVE') {
        this.navigateAfterOfferSave(z);
      } else if (z.nextPage === 'CONTINUE') {
        const queryParams = {
          sourcePage: z.sourcePage,
          parentOfferId: z.parentOfferId,
          parentOfferName: z.parentOfferName,
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName,
          variantOfferId: z.variantOfferId,
          variantOfferName: z.variantOfferName,
          sourceOptionGroup: z.sourceOptionGroup
        };
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/childOffer/${offer.offerId}`], {
          queryParams
        });
      } else if (z.nextPage === 'NEW') {
        const queryParams = {
          sourcePage: z.sourcePage,
          parentOfferId: z.parentOfferId,
          parentOfferName: z.parentOfferName,
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName,
          variantOfferId: z.variantOfferId,
          variantOfferName: z.variantOfferName,
          categoryId: offer.categoryId,
          sourceOptionGroup: z.sourceOptionGroup
        };
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/childOffer/CREATE_OFFER`], {
          queryParams
        });
      }
    } else if (offer.hierarchyLevel === 'VARIANT') {
      if (z.nextPage === 'SAVE') {
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.mainOfferId}`]);
      } else if (z.nextPage === 'CONTINUE') {
        const queryParams = {
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName
        };
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offerVariant/${offer.offerId}`], { queryParams });
      } else if (z.nextPage === 'NEW') {
        const queryParams = {
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName
        };
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offerVariant/CREATE_OFFER`], { queryParams });
      }
    } else if (offer.hierarchyLevel === 'RULE') {
      // tslint:disable-next-line
      this.router.navigate([`/manager/stores/${z.storeId}/settings/ordering-rules/${z.parentOfferId}/option-group/${z.childCategoryId}`], { queryParams: { catalogId: z.catalogId } });
    }
  }

  private navigateAfterOfferSave(z: any) {
    if (z.sourcePage === 'OFFER') {
      if (z.sourceOptionGroup) {
        const queryParams = {
          parentOfferId: z.mainOfferId,
          parentOfferName: z.mainOfferName,
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName,
          sourcePage: z.sourcePage
        };
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/childCategory/${z.childCategoryId}`], {
          queryParams
        });
      } else {
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.mainOfferId}`]);
      }
    } else if (z.sourcePage === 'VARIANT') {
      if (z.sourceOptionGroup) {
        const queryParams = {
          parentOfferId: z.variantOfferId,
          parentOfferName: z.variantOfferName,
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName,
          sourcePage: z.sourcePage
        };
        this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/childCategory/${z.parentOfferId}`], {
          queryParams
        });
      } else {
        const queryParams = {
          mainOfferId: z.mainOfferId,
          mainOfferName: z.mainOfferName
        };
        this.router.navigate([
          `/manager/stores/${z.storeId}/catalog/${z.catalogId}/offerVariant/${z.parentOfferId}`
        ], { queryParams });
      }
    } else if (z.sourcePage === 'OPTION_GROUPS') {
      const queryParams = {
        sourcePage: z.sourcePage 
      }
      this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/childCategory/${z.childCategoryId}`],{
        queryParams
      });
    }
  }

  
  onSaveOfferFailed = createEffect(() => this.actions$.pipe(
    ofType<SaveOfferFailed>(StoresCatalogActionType.SaveOfferFailed),
    tap(a => !a ? this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')) : '')
  ), { dispatch: false });

  
  onLoadOffer = createEffect(() => this.actions$.pipe(
    ofType<LoadOffer>(StoresCatalogActionType.LoadOffer),
    switchMap(action => this.catalogService.loadOffer(action.offerId, action.storeId, action.catalogId).pipe(
      map(s => new LoadOfferSuccess(s)),
      catchError(a => of(new LoadOfferFailed()))
    ))
  ));

  onSaveStation = createEffect(() => this.actions$.pipe(
    ofType<SaveStation>(StoresCatalogActionType.SaveStation),
    switchMap(action => this.catalogService.saveStation(action.saveStationRequest, action.storeId)
      .pipe(
        map(s => {
          console.log(s);
          return new SaveStationSucces(s, action.storeId)
        }),
        catchError(a => of(new SaveStationFailed()))
      ))
  ));

  onSaveStationSuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveStationSucces>(StoresCatalogActionType.SaveStationSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.catalog.station.saveStationSuccess'))),
    tap(z => this.router.navigate([`/manager/stores/${z.storeId}/catalog/station`]))
  ), { dispatch: false })

  onSaveStationFailed = createEffect(() => this.actions$.pipe(
    ofType<SaveStationFailed>(StoresCatalogActionType.SaveStationFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain'))
  )),{ dispatch: false })

  onUpdateStation = createEffect(() => this.actions$.pipe(
    ofType<UpdateStation>(StoresCatalogActionType.UpdateStation),
    switchMap(action => this.catalogService.updateStation(action.saveStationRequest, action.storeId, action.stationId)
      .pipe(
        map(s => {
          console.log(s);
          return new UpdateStationSuccess(s, action.storeId)
        }),
        catchError(a => of(new UpdateStationFailed()))
      ))
  ));

  onUpdateStationSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateStationSuccess>(StoresCatalogActionType.UpdateStationSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.catalog.station.updateStationSuccess'))),
    tap(z => this.router.navigate([`/manager/stores/${z.storeId}/catalog/station`]))
  ), { dispatch: false })

  onUpdateStationFailed = createEffect(() => this.actions$.pipe(
    ofType<UpdateStationFailed>(StoresCatalogActionType.UpdateStationFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain'))
  )),{ dispatch: false })

  onDeleteStation = createEffect(() => this.actions$.pipe(
    ofType<DeleteStation>(StoresCatalogActionType.DeleteStation),
    switchMap(action => this.catalogService.deleteStation(action.storeId, action.stationId)
      .pipe(
        map(s => {
          return new DeleteStationSuccess(action.storeId)
        }),
        catchError(a => of(new DeleteStationFailed()))
      ))
  ));

  onDeleteStationSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteStationSuccess>(StoresCatalogActionType.DeleteStationSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.catalog.station.updateStationSuccess'))),
    tap(z => this.router.navigate([`/manager/stores/${z.storeId}/catalog/station`]))
  ), { dispatch: false })

  onDeleteStationFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteStationFailed>(StoresCatalogActionType.DeleteStationFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain'))
  )),{ dispatch: false })

  onSaveCategory = createEffect(() => this.actions$.pipe(
    ofType<SaveCategory>(StoresCatalogActionType.SaveCategory),
    switchMap(action => this.catalogService.saveCategory(action.saveCategory, action.categoryId, action.storeId, action.catalogId)
      .pipe(
        switchMap(s => {
          if (!!action.categoryImage) {
            return this.catalogService.uploadOfferOrCategoryImage(action.categoryImage, action.storeId, s.contentItemId)
            .pipe(
              switchMap(r => this.catalogService.saveImageToOfferOrCategory(s.contentItemId, r.fileDownloadUri + '?' + new Date().getTime(), action.storeId)
                .pipe(
                  map(c =>
                    new SaveCategorySuccess(s, action.storeId, action.catalogId, action.categoryId, action.sourcePage,
                      action.parentOfferId, action.parentOfferName, action.mainOfferId, action.mainOfferName))
                )
              ),
              catchError(e => {
                if (e.status === 400) {
                  const errorMsg = 'An error occured in Logo uploading, please try again';
                  if (e.error.errors == null) { e.error.errors = [{ message: errorMsg }]; }
                  return of(new UploadOfferOrCategoryImageFailed(e.error.errors.map(er => !!er ? !!er.message ? er.message : errorMsg : errorMsg)),
                  new SaveCategoryFailed());
                } else if (e.status === 413) {
                  return of(new UploadOfferOrCategoryImageFailed('File size should not be more than 10 MB'), new SaveCategoryFailed());
                }
                return of(new UploadOfferOrCategoryImageFailed('An error occured in Logo uploading, please try again '), new SaveCategoryFailed());
              })
            );
          } else {
            return of(new SaveCategorySuccess(s, action.storeId, action.catalogId, action.categoryId, action.sourcePage,
                action.parentOfferId, action.parentOfferName, action.mainOfferId, action.mainOfferName));
          }
        }),
        catchError(a => of(new SaveCategoryFailed()))
      ))
  ));

  
  onSaveCategorySuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveCategorySuccess>(StoresCatalogActionType.SaveCategorySuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.saveCategorySuccess'))),
    tap(z => this.navigateCategoryToSourcePage(z))
  ), { dispatch: false });

  navigateCategoryToSourcePage(z: SaveCategorySuccess) {
    const category = z.saveCategory;
    const { storeId, catalogId, mainOfferId, mainOfferName, parentOfferId, parentOfferName } = z;
    const queryParams = { categoryId: category.categoryId, name: category.name };
    switch (category.hierarchyLevel) {
      case 'PARENT':
        switch (z.sourcePage) {
          case 'CONTINUE':
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/category/${category.categoryId}`]);
            break;
          case 'NEW':
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/category/CREATE_CATEGORY`]);
            break;
          default:
            this.router.navigate([`/manager/stores/${storeId}/catalog`]);
            break;
        }
        break;
  
      case 'CHILD':
        let queryParams;
        switch (z.sourcePage) {
          case 'OFFER':
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/offer/${mainOfferId}`]);
            break;
          case 'OFFER-CONTINUE':
            queryParams = { parentOfferId, parentOfferName, mainOfferId, mainOfferName, sourcePage: 'OFFER' };
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/${category.categoryId}`], { queryParams });
            break;
          case 'VARIANT':
            queryParams = { mainOfferId, mainOfferName };
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/offerVariant/${parentOfferId}`], { queryParams });
            break;
          case 'OFFER-NEW':
            queryParams = { parentOfferId, parentOfferName, mainOfferId, mainOfferName, sourcePage: 'OFFER' };
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/CREATE_CATEGORY`], { queryParams });
            break;
          default:
            if (z.sourcePage.includes('OPTION_GROUPS')) {
              const queryParams = { sourcePage: 'OPTION_GROUPS' };
              if (z.sourcePage.includes('CONTINUE')) {
                this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/${category.categoryId}`], { queryParams });
              } else if (z.sourcePage.includes('NEW')) {
                this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/CREATE_CATEGORY`], { queryParams });
              } else {
                this.router.navigate([`/manager/stores/${storeId}/catalog/option-groups`]);
              }
            }
            break;
        }
        break;
  
      case 'RULE':
        this.router.navigate([`/manager/stores//${storeId}/settings/ordering-rules/${parentOfferId}`]);
        break;
  
      case 'TOP':
        switch (z.sourcePage) {
          case 'CONTINUE':
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/category/${category.categoryId}`]);
            break;
          case 'NEW':
            const queryParams = { type: 'top' };
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/category/CREATE_CATEGORY`], { queryParams });
            break;
          default:
            this.router.navigate([`/manager/stores/${storeId}/catalog/top`]);
            break;
        }
        break;
    }
  }

  
  onSaveCategoryFailed = createEffect(() => this.actions$.pipe(
    ofType<SaveCategoryFailed>(StoresCatalogActionType.SaveCategoryFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  ), { dispatch: false });

  
  onLoadCategory = createEffect(() => this.actions$.pipe(
    ofType<LoadCategory>(StoresCatalogActionType.LoadCategory),
    switchMap(action => this.catalogService.loadCategory(action.categoryId, action.storeId, action.catalogId).pipe(
      map(s => new LoadCategorySuccess(s)),
      catchError(a => of(new LoadCategoryFailed()))
    ))
  ));

  onLoadStationCategory = createEffect(() => this.actions$.pipe(
    ofType<LoadStationCategory>(StoresCatalogActionType.LoadStationCategory),
    switchMap(action => this.catalogService.loadStationCategory(action.id, action.storeId).pipe(
      map(s => new LoadStationCategorySuccess(s)),
      catchError(a => of(new LoadStationCategoryFailed()))
    ))
  ))

  
  onOfferOrCategoryImageUpload = createEffect(() => this.actions$.pipe(
    ofType<UploadOfferOrCategoryImage>(StoresCatalogActionType.UploadOfferOrCategoryImage),
    switchMap(a => this.catalogService.uploadOfferOrCategoryImage(a.file, a.storeId, a.contentItemId)
      .pipe(
        map(r => a.source === 'OFFER' ? new UploadOfferImageSuccess(r.fileDownloadUri + '?' + new Date().getTime(), a.storeId) :
          new UploadCategoryImageSuccess(r.fileDownloadUri + '?' + new Date().getTime(), a.storeId)),
        catchError(e => {
          if (e.status === 400) {
            const errorMsg = 'An error occured in Logo uploading, please try again';
            if (e.error.errors == null) { e.error.errors = [{ message: errorMsg }]; }
            return of(new UploadOfferOrCategoryImageFailed(e.error.errors.map(er => !!er ? !!er.message ? er.message : errorMsg : errorMsg)));
          } else if (e.status === 413) {
            return of(new UploadOfferOrCategoryImageFailed('File size should not be more than 10 MB'));
          }
          return of(new UploadOfferOrCategoryImageFailed('An error occured in Logo uploading, please try again '));
        }
        )
      )
    )));
  
  onUploadOfferImageSuccess = createEffect(() => this.actions$.pipe(
    ofType<UploadOfferImageSuccess>(StoresCatalogActionType.UploadOfferImageSuccess),
    withLatestFrom(this.offer.select(getOfferDetails)),
    switchMap(([a, s]) => this.catalogService.saveImageToOfferOrCategory(s.contentItemId, a.imageUrl, a.storeId).pipe(
      map(r => new SaveContentItemSuccess(r)),
      tap(r => this.toastr.success(this.translateSer.instant('admin.store.message.imageUploadSuccess'))))
    )), { dispatch: false });

  onUploadCategoryImageSuccess = createEffect(() => this.actions$.pipe(
    ofType<UploadCategoryImageSuccess>(StoresCatalogActionType.UploadCategoryImageSuccess),
    withLatestFrom(this.offer.select(getCategoryDetails)),
    switchMap(([a, s]) => this.catalogService.saveImageToOfferOrCategory(s.contentItemId, a.imageUrl, a.storeId).pipe(
      map(r => new SaveContentItemSuccess(r)),
      tap(r => this.toastr.success(this.translateSer.instant('admin.store.message.imageUploadSuccess'))))
    )), { dispatch: false });
  
  onStoreImageUploadFailed = createEffect(() => this.actions$.pipe(
    ofType<UploadOfferOrCategoryImageFailed>(StoresCatalogActionType.UploadOfferOrCategoryImageFailed),
    tap(e => this.toastr.error(e.errorMessage, 'Upload failed!'))
  ), { dispatch: false });
  
  onUploadCatalogTranslate = createEffect(() => this.actions$.pipe(
    ofType<UploadCatalogTranslate>(StoresCatalogActionType.UploadCatalogTranslate),
    switchMap(a => this.catalogService.uploadCatalogTranslate(a.file, a.storeId, a.catalogId)
      .pipe(
        map(r => new UploadCatalogTranslateSuccess(a.storeId)),
        catchError(e => {
          return of(new UploadCatalogTranslateFailed('An error occured in Logo uploading, please try again ', a.storeId));
        }
        )
      )
    )));

  
  onUploadCatalogTranslateSuccess = createEffect(() => this.actions$.pipe(
    ofType<UploadCatalogTranslateSuccess>(StoresCatalogActionType.UploadCatalogTranslateSuccess),
    tap(r => {
      this.router.navigate(['/manager/stores/' + r.storeId + '/catalog']);
      return this.toastr.success(this.translateSer.instant('admin.store.message.catalogDataUploadSuccess'));
    }
    )), { dispatch: false });

  
  onUploadCatalogTranslateFailed = createEffect(() => this.actions$.pipe(
    ofType<UploadCatalogTranslateFailed>(StoresCatalogActionType.UploadCatalogTranslateFailed),
    tap(e => {
      this.router.navigate(['/manager/stores/' + e.storeId + '/catalog']);
      this.toastr.error(this.translateSer.instant('admin.store.catalog.contentFailedError'));
    })
  ), { dispatch: false });

  
  onAssociateChildCategories = createEffect(() => this.actions$.pipe(
    ofType<AssociateChildCategories>(StoresCatalogActionType.AssociateChildCategories),
    switchMap(
      action => this.catalogService.associateChildCategories(
        action.categoriesView, action.offerId, action.storeId, action.catalogId
      ).pipe(
        map(s => new AssociateChildCategoriesSuccess(s, action.offerId, action.storeId,
          action.catalogId, action.isAssociate)),
        catchError(a => of(new SaveCategoryFailed()))
    ))
  ));

  
  onAssociateChildCategoriesSuccess = createEffect(() => this.actions$.pipe(
    ofType<AssociateChildCategoriesSuccess>(StoresCatalogActionType.AssociateChildCategoriesSuccess),
    tap(a => {
      this.offer.dispatch(new LoadOffer(a.offerId, a.storeId, a.catalogId));
      this.toastr.success(this.translateSer.instant(a.isAssociate ?
        'admin.store.message.childCategoryOffer.associate' :
        'admin.store.message.childCategoryOffer.disAssociate'));
    })
  ), { dispatch: false });

  
  onAssociateChildCategoriesFailed = createEffect(() => this.actions$.pipe(
    ofType<AssociateChildCategoriesFailed>(StoresCatalogActionType.AssociateChildCategoriesFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  ), { dispatch: false });

  
  onAssociateChildOffers = createEffect(() => this.actions$.pipe(
    ofType<AssociateChildOffers>(StoresCatalogActionType.AssociateChildOffers),
    switchMap(action => this.catalogService.associateChildOffers(action.offersView, action.categoryId, action.storeId, action.catalogId)
      .pipe(
        map(s => new AssociateChildOffersSuccess(s)),
        catchError(a => of(new AssociateChildOffersFailed()))
      ))
  ));

  
  onAssociateChildOffersSuccess = createEffect(() => this.actions$.pipe(
    ofType<AssociateChildCategoriesSuccess>(StoresCatalogActionType.AssociateChildOffersSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.childOfferCategory')))
  ), { dispatch: false });

  
  onAssociateChildOffersFailed = createEffect(() => this.actions$.pipe(
    ofType<AssociateChildOffersFailed>(StoresCatalogActionType.AssociateChildOffersFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  ), { dispatch: false });

  
  onAssociateOfferVariants = createEffect(() => this.actions$.pipe(
    ofType<AssociateOfferVariants>(StoresCatalogActionType.AssociateOfferVariants),
    switchMap(action => this.catalogService.associateOffersVariants(action.offersView, action.offerId, action.storeId, action.catalogId)
      .pipe(
        map(s => new AssociateOfferVariantsSuccess(s)),
        catchError(a => of(new AssociateOfferVariantsFailed()))
      ))
  ));

  
  onAssociateOfferVariantsSuccess = createEffect(() => this.actions$.pipe(
    ofType<AssociateOfferVariantsSuccess>(StoresCatalogActionType.AssociateOfferVariantsSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.offerVaryAToffer')))
  ), { dispatch: false });

  
  onAssociateOfferVariantsFailed = createEffect(() => this.actions$.pipe(
    ofType<AssociateOfferVariantsFailed>(StoresCatalogActionType.AssociateOfferVariantsFailed),
    tap(a => this.toastr.error(this.translateSer.instant('admin.store.message.errorTryAgain')))
  ), { dispatch: false });

  
  onVerifyCatalogData = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogData>(StoresCatalogActionType.VerifyCatalogData),
    switchMap(a => this.catalogService.verifyCatalogData(a.file, a.storeId, a.catalogId, a.isOptionGroup)
      .pipe(
        map(r => new VerifyCatalogDataSuccess(r)),
        catchError(e => of(new VerifyCatalogDataFailed(e)))
      )
    )
  ));

  
  onVerifyCatalogDataSuccess = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogDataSuccess>(StoresCatalogActionType.VerifyCatalogDataSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.catalogVerifySuccess')))
  ), { dispatch: false });

  
  onVerifyCatalogDataFailed = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogDataFailed>(StoresCatalogActionType.VerifyCatalogDataFailed),
    tap(a => this.handleCatalogErrors(a))
  ), { dispatch: false });

  
  onVerifyCatalogImage = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogImage>(StoresCatalogActionType.VerifyCatalogImage),
    switchMap(a => this.catalogService.verifyCatalogImage(a.file, a.storeId, a.catalogId)
      .pipe(
        map(r => new VerifyCatalogImageSuccess(r)),
        catchError(e => of(new VerifyCatalogImageFailed(e)))
      )
    )
  ));

  
  onVerifyCatalogImageSuccess = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogImageSuccess>(StoresCatalogActionType.VerifyCatalogImageSuccess),
    tap(a => this.handleVerifyImageUploadSuccess(a))
  ), { dispatch: false });

  handleVerifyImageUploadSuccess(r: VerifyCatalogImageSuccess) {
    if (r.catalog.categories.length > 0) {
      this.toastr.success(this.translateSer.instant('admin.store.message.verifyCatalogImageSuccess'));
    } else {
      this.toastr.error(this.translateSer.instant('admin.store.message.verifyCatalogImageFailed'));
    }
  }
  
  onVerifyCatalogImageFailed = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogImageFailed>(StoresCatalogActionType.VerifyCatalogImageFailed),
    tap(a => this.handleCatalogErrors(a, 'verifyCatalogImageFailed'))
  ), { dispatch: false });

  handleCatalogErrors(e, errorAt?: string) {
    if (e.errorMessages != null
      && e.errorMessages.error != null
      && e.errorMessages.error.errors != null) {
      if (errorAt && errorAt === 'verifyCatalogImageFailed') {
        this.toastr.error(this.translateSer.instant('admin.store.message.verifyCatalogImageFailed'));
      } else {
        const errorList = e.errorMessages.error.errors.map(err => err.message);
        errorList.forEach(err => this.toastr.error(err, 'Verify failed!'));
      }
    } else {
      if (errorAt && errorAt === 'verifyCatalogImageFailed') {
        this.toastr.error(this.translateSer.instant('admin.store.message.verifyCatalogImageFailed'));
      } else {
        this.toastr.error('Catalog Verify Failed!');
      }
    }
  }
  
  onUploadCatalogData = createEffect(() => this.actions$.pipe(
    ofType<UploadCatalogData>(StoresCatalogActionType.UploadCatalogData),
    switchMap(a => this.catalogService.UploadCatalogData(a.catalog, a.storeId, a.catalogId, a.isOptionGroup)
      .pipe(
        map(r => new UploadCatalogDataSuccess(r, a.storeId, a.isOptionGroup)),
        catchError(e => of(new UploadCatalogDataFailed(e, a.storeId, a.isOptionGroup)))
      )
    )
  ));

  onUploadCatalogDataSuccess = createEffect(() => this.actions$.pipe(
    ofType<UploadCatalogDataSuccess>(StoresCatalogActionType.UploadCatalogDataSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogOfstoreimported'))),
    tap(z => z.isOptionGroup ? this.router.navigate(['/manager/stores/', z.storeId, 'catalog', 'option-groups']) : this.router.navigate(['/manager/stores/', z.storeId, 'catalog']))
  ), { dispatch: false });


  
  onUploadCatalogDataFailed = createEffect(() => this.actions$.pipe(
    ofType<UploadCatalogDataFailed>(StoresCatalogActionType.UploadCatalogDataFailed),
    tap(a => this.toastr.error('Catalog import is failed, please try again')),
    tap(z => z.isOptionGroup ? this.router.navigate(['/manager/stores/', z.storeId, 'catalog', 'option-groups']) : this.router.navigate(['/manager/stores/', z.storeId, 'catalog']))
  ), { dispatch: false });

  onDeleteCategory = createEffect(() => this.actions$.pipe(
    ofType<DeleteCategory>(StoresCatalogActionType.DeleteCategory),
    switchMap(a => this.catalogService.deleteCategory(a.storeId, a.catalogId, a.categoryId)
      .pipe(
        map(r => new DeleteCategorySuccess(a.storeId, a.catalogId, a.sourcePage, a.parentOfferId, a.parentOfferName,
          a.mainOfferId, a.mainOfferName, a.variantOfferId, a.variantOfferName,
           a.sourceOptionGroup, a.ruleId, a.hierarchyLevel)),
        catchError(e => of(new DeleteCategoryFailed()))
      )
    )
  ));
  
  onDeleteCategorySuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteCategorySuccess>(StoresCatalogActionType.DeleteCategorySuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.categoryDeleteSuccess'))),
    tap(z => {
      if (z.ruleId) {
        this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'ordering-rules', z.ruleId]);
      } else {
        if (z.sourcePage === 'OFFER') {
          this.router.navigate([`/manager/stores/${z.storeId}/catalog/${z.catalogId}/offer/${z.mainOfferId}`]);
        } else if (z.sourcePage === 'VARIANT') {
          const queryParams = {
            mainOfferId: z.mainOfferId,
            mainOfferName: z.mainOfferName
          };
          this.router.navigate([
            `/manager/stores/${z.storeId}/catalog/${z.catalogId}/offerVariant/${z.parentOfferId}`
          ], { queryParams });
        } else if (z.sourcePage === 'OPTION_GROUPS') {
          this.router.navigate(['/manager/stores/', z.storeId, 'catalog', 'option-groups']);
        } else if (z.hierarchyLevel === 'PARENT') {
          this.router.navigate(['/manager/stores/', z.storeId, 'catalog']);
        } else if (z.hierarchyLevel === 'TOP') {
          this.router.navigate(['/manager/stores/', z.storeId, 'catalog', 'top']);
        }
      }

    })
  ), { dispatch: false });


  
  onDeleteCategoryFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteCategoryFailed>(StoresCatalogActionType.DeleteCategoryFailed),
    tap(a => this.toastr.error('Category Deletion Failed'))
  ), { dispatch: false });

  
  onDeleteOffer = createEffect(() => this.actions$.pipe(
    ofType<DeleteOffer>(StoresCatalogActionType.DeleteOffer),
    switchMap(a => this.catalogService.deleteOffer(a.storeId, a.catalogId, a.offerId)
      .pipe(
        map(r => new DeleteOfferSuccess(a.storeId, a.catalogId, a.sourcePage, a.parentOfferId, a.parentOfferName,
          a.mainOfferId, a.mainOfferName, a.variantOfferId, a.variantOfferName, a.sourceOptionGroup, a.ruleOptionGroupId)),
        catchError(e => of(new DeleteOfferFailed()))
      )
    )
  ));

  onDeleteMultipleOffer = createEffect(() => this.actions$.pipe(
    ofType<DeleteMultipleOffer>(StoresCatalogActionType.DeleteMultipleOffer),
    switchMap(a => this.catalogService.deleteMultipleOffer(a.storeId, a.catalogId, a.offerIds)
      .pipe(
        map(r => new DeleteMultipleOfferSuccess(a.storeId, a.selectedCatalogIds)),
        catchError(e => of(new DeleteOfferFailed()))
      )
    )
  ));

  onDeleteMultipleOfferSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteMultipleOfferSuccess>(StoresCatalogActionType.DeleteMultipleOfferSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.multipleOfferDeleteSuccess'))),
    tap(z => this.router.navigate([`/manager/stores/${z.storeId}/catalog/option-groups`]).then(_ => {
      this.router.navigate([`/manager/stores/${z.storeId}/catalog`])
    }))
  ), {dispatch: false})

  
  onDeleteOfferSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteOfferSuccess>(StoresCatalogActionType.DeleteOfferSuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.offerDeleteSuccess'))),
    tap(z => {
      const { storeId, catalogId, mainOfferId, mainOfferName, parentOfferId, sourcePage, sourceOptionGroup, variantOfferId, variantOfferName } = z;
      const queryParams: {[key:string] : string | number} = { mainOfferId, mainOfferName };
      if (z.ruleOptionGroupId) {
        // tslint:disable-next-line
        this.router.navigate(['/manager/stores/', z.storeId, 'settings', 'ordering-rules', z.parentOfferId, 'option-group', z.ruleOptionGroupId], { queryParams: { catalogId: z.catalogId } });
      } else {
        switch (sourcePage) {
          case 'OFFER':
            if (sourceOptionGroup) {
              queryParams.parentOfferId = mainOfferId;
              queryParams.parentOfferName = mainOfferName;
              queryParams.sourcePage = sourcePage;
              this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/${parentOfferId}`], { queryParams });
            } else {
              this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/offer/${mainOfferId}`]);
            }
            break;

          case 'VARIANT':
            if (sourceOptionGroup) {
              queryParams.parentOfferId = variantOfferId;
              queryParams.parentOfferName = variantOfferName;
              queryParams.sourcePage = sourcePage;
              this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/${parentOfferId}`], { queryParams });
            } else if (parentOfferId === mainOfferId) {
              this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/offer/${mainOfferId}`]);
            } else {
              this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/offerVariant/${parentOfferId}`], { queryParams });
            }
            break;

          case 'OPTION_GROUPS':
            queryParams.sourcePage = sourcePage;
            this.router.navigate([`/manager/stores/${storeId}/catalog/${catalogId}/childCategory/${parentOfferId}`], { queryParams });
            break;

          default:
            this.router.navigate([`/manager/stores/${storeId}/catalog`]);
            break;
        }
      }
    })
  ), { dispatch: false });

  
  onDeleteOfferFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteOfferFailed>(StoresCatalogActionType.DeleteOfferFailed),
    tap(a => this.toastr.error('Offer Deletion Failed'))
  ), { dispatch: false });

  
  onSaveAvailability = createEffect(() => this.actions$.pipe(
    ofType<SaveAvailability>(StoresCatalogActionType.SaveAvailability),
    switchMap(action => this.catalogService.saveAvailability(action.availability, action.storeId)
      .pipe(
        map(s => new SaveAvailabilitySuccess(s, action.storeId)),
        catchError(a => of(new SaveAvailabilityFailed()))
      ))
  ));

  
  onSaveAvailabilitySuccess = createEffect(() => this.actions$.pipe(
    ofType<SaveAvailabilitySuccess>(StoresCatalogActionType.SaveAvailabilitySuccess),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.createAvailabilitySuccess')))
  ), { dispatch: false });

  
  onSaveAvailabilityFailed = createEffect(() => this.actions$.pipe(
    ofType<SaveAvailabilityFailed>(StoresCatalogActionType.SaveAvailabilityFailed),
    tap(a => this.toastr.success(this.translateSer.instant('admin.store.message.createAvailabilityFail')))
  ), { dispatch: false });

  
  onDownloadTranslateCatalogXls = createEffect(() => this.actions$.pipe(
    ofType<DownloadTranslateCatalogXls>(StoresCatalogActionType.DownloadTranslateCatalogXls),
    switchMap(action => this.catalogService.downloadTranslateCatalogXls(action.storeId, action.catalogId)
      .pipe(
        map(s => new DownloadTranslateCatalogXlsSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadTranslateCatalogXlsFailed(this.translateSer.instant('admin.store.catalog.contentDownload'))))
      ))
  ));

  
  onDownloadTranslateCatalogXlsFailed = createEffect(() => this.actions$.pipe(
    ofType<DownloadTranslateCatalogXlsFailed>(
      StoresCatalogActionType.DownloadTranslateCatalogXlsFailed,
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  ), { dispatch: false });

  
  onDownloadToUpdateCatalogXls = createEffect(() => this.actions$.pipe(
    ofType<DownloadToUpdateCatalogXls>(StoresCatalogActionType.DownloadToUpdateCatalogXls),
    switchMap(action => this.catalogService.downloadToUpdateCatalogXls(action.storeId, action.catalogId, action.sourcePage)
      .pipe(
        map(s => new DownloadToUpdateCatalogXlsSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadToUpdateCatalogXlsFailed(this.translateSer.instant('admin.store.catalog.contentDownload'))))
      ))
  ));

  
  onDownloadToUpdateCatalogXlsFailed = createEffect(() => this.actions$.pipe(
    ofType<DownloadToUpdateCatalogXlsFailed>(
      StoresCatalogActionType.DownloadToUpdateCatalogXlsFailed,
    ),
    tap(a => this.toastr.error(a.error, 'Action failed!'))
  ), { dispatch: false });

  
  onDeleteOfferImage = createEffect(() => this.actions$.pipe(
    ofType<DeleteOfferImage>(StoresCatalogActionType.DeleteOfferImage),
    switchMap(a => this.catalogService.deleteOfferImage(a.storeId, a.catalogId, a.offerId)
      .pipe(
        map(r => new DeleteOfferOrCategoryImageSuccess(a.storeId, a.catalogId, a.offerId)),
        catchError(e => of(new DeleteOfferOrCategoryImageFailed()))
      )
    )
  ));

  onDeleteCategoryImage = createEffect(() => this.actions$.pipe(
    ofType<DeleteCategoryImage>(StoresCatalogActionType.DeleteCategoryImage),
    switchMap(a => this.catalogService.deleteCategoryImage(a.storeId, a.catalogId, a.categoryId)
      .pipe(
        map(r => new DeleteOfferOrCategoryImageSuccess(a.storeId, a.catalogId, a.categoryId)),
        catchError(e => of(new DeleteOfferOrCategoryImageFailed()))
      )
    )
  ));
  
  onDeleteOfferOrCategoryImageSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteOfferOrCategoryImageSuccess>(StoresCatalogActionType.DeleteOfferOrCategoryImageSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.imageRemoveSuccess')))
  ), { dispatch: false });

  
  onDeleteOfferOrCategoryImageFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteOfferOrCategoryImageFailed>(StoresCatalogActionType.DeleteOfferOrCategoryImageFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  ), { dispatch: false });

  
  onImportCatalog = createEffect(() => this.actions$.pipe(
    ofType<ImportCatalog>(StoresCatalogActionType.ImportCatalog),
    switchMap(
      action => this.catalogService.ImportCatalog(
        action.catalog.externalDomain,
        action.catalog.externalReference,
        action.storeId
      ).pipe(
        map(s => new ImportCatalogSuccess(s)),
        catchError(a => of(new ImportCatalogFailed(a)))
      ))
  ));

  
  onImportCatalogSuccess = createEffect(() => this.actions$.pipe(
    ofType<ImportCatalogSuccess>(StoresCatalogActionType.ImportCatalogSuccess),
    tap(z => {
      if (z && z.catalog && z.catalog.status) {
        if (z.catalog.status === 'IN_PROGRESS') {
          this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogFetching'));
          this.router.navigate(['/manager/stores/', window.location.href.split('/')[5], 'catalog']);
        }
        if (z.catalog.status === 'COMPLETED') {
          this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogOfstoreimported'));
          this.router.navigate(['/manager/stores/', window.location.href.split('/')[5], 'catalog']);
        }
      }
    })
  ), { dispatch: false });

  
  onImportCatalogFailed = createEffect(() => this.actions$.pipe(
    ofType<VerifyCatalogDataFailed>(StoresCatalogActionType.ImportCatalogFailed),
    tap(a => this.handleImportCatalogErrors(a))
  ), { dispatch: false });

  handleImportCatalogErrors(e) {
    if (e.errorMessages != null
      && e.errorMessages.error != null
      && e.errorMessages.error.errors != null) {

      if (Array.isArray(e.errorMessages.error.errors) && e.errorMessages.error.errors.length > 0) {
        if (e.errorMessages.error.errors[0].code === 'STORE_NOT_FOUND') {
          this.toastr.error(this.translateSer.instant('admin.store.storeNotfound'));
        }
        else {
          this.toastr.error(this.translateSer.instant('admin.store.catalog.catalogUnabletoimport'));
        }
      }
    }
  }

  
  onDownloadOfferOrCategoryImage = createEffect(() => this.actions$.pipe(
    ofType<DownloadOfferOrCategoryImage>(StoresCatalogActionType.DownloadOfferOrCategoryImage),
    switchMap(action => this.catalogService.downloadOfferImage(action.url)
      .pipe(
        map(s => new DownloadOfferOrCategoryImageSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadOfferOrCategoryImageFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  ));

}
