import { Action } from '@ngrx/store';
import {
  StoreCatalog, SaveOfferView, SaveCategoryView, SaveOfferPositionView,
  SaveCategoryPositionView, ContentItemView, AssociateCategoriesView,
  AssociateOffersView, Availability, PatchSaveOfferView, ImportCatalogData, ImportCatalogResponse, CloneCatalogRequest, CategoriesListResponse, Station, SaveStationRequest, SaveStationResponse
} from '../stores-catalog';
import { ShowLoader, HideLoader } from 'src/app/shared/decorators';

export enum StoresCatalogActionType {
  LoadCatalog = '[stores] LoadCatalog',
  LoadCatalogSuccess = '[stores] LoadCatalogSuccess',
  LoadCatalogFailed = '[stores] LoadCatalogFailed',
  LoadStation = '[stores] LoadStation',
  LoadStationSuccess = '[stores] LoadStationSuccess',
  LoadStationFailed = '[stores] LoadStationFailed',
  LoadStationCategory = '[stores] LoadStationCategory',
  LoadStationCategorySuccess = '[stores] LoadStationCategorySuccess',
  LoadStationCategoryFailed = '[stores] LoadStationCategoryFailed',
  LoadOffer = '[stores] LoadOffer',
  LoadOfferSuccess = '[stores] LoadOfferSuccess',
  LoadOfferFailed = '[stores] LoadOfferFailed',
  SaveOffer = '[stores] SaveOffer',
  SaveOfferSuccess = '[stores] SaveOfferSuccess',
  SaveOfferFailed = '[stores] SaveOfferFailed',
  PatchSaveOffer = '[stores] PatchSaveOffer',
  PatchSaveOfferSuccess = '[stores] PatchSaveOfferSuccess',
  PatchSaveOfferFailed = '[stores] PatchSaveOfferFailed',
  BulkOfferChangeStatus = '[stores] BulkOfferChangeStatus',
  BulkOfferChangeStatusSuccess = '[stores] BulkOfferChangeStatusSuccess',
  BulkOfferChangeStatusFailed = '[stores] BulkOfferChangeStatusFailed',
  LoadCategory = '[stores] LoadCategory',
  LoadCategorySuccess = '[stores] LoadCategorySuccess',
  LoadCategoryFailed = '[stores] LoadCategoryFailed',
  SaveCategory = '[stores] SaveCategory',
  SaveCategorySuccess = '[stores] SaveCategorySuccess',
  SaveCategoryFailed = '[stores] SaveCategoryFailed',
  SaveStation = '[stores] SaveStation',
  SaveStationSuccess = '[stores] SaveStationSucces',
  SaveStationFailed = '[stores] SaveStationFailed',
  UpdateStation = '[stores] UpdateStation',
  UpdateStationSuccess = '[stores] UpdateStationSuccess',
  UpdateStationFailed = '[stores] UpdateStationFailed',
  DeleteStation = '[stores] DeleteStation',
  DeleteStationSuccess = '[stores] DeleteStationSuccess',
  DeleteStationFailed = '[stores] DeleteStationFailed',
  SaveOfferPosition = '[stores] SaveOfferPosition',
  SaveOfferPositionSuccess = '[stores] SaveOfferPositionSuccess',
  SaveOfferPositionFailed = '[stores] SaveOfferPositionFailed',
  SaveCategoryPosition = '[stores] SaveCategoryPosition',
  SaveCategoryPositionSuccess = '[stores] SaveCategoryPositionSuccess',
  SaveCategoryPositionFailed = '[stores] SaveCategoryPositionFailed',
  UploadOfferOrCategoryImage = '[stores] UploadOfferOrCategoryImage',
  UploadOfferImageSuccess = '[stores] UploadOfferImageSuccess',
  UploadCategoryImageSuccess = '[stores] UploadCategoryImageSuccess',
  UploadOfferOrCategoryImageFailed = '[stores] UploadOfferOrCategoryImageFailed',
  SaveContentItem = '[stores] SaveContentItem',
  SaveContentItemSuccess = '[stores] SaveContentItemSuccess',
  SaveContentItemFailed = '[stores] SaveContentItemFailed',
  AssociateChildCategories = '[stores] AssociateChildCategories',
  AssociateChildCategoriesSuccess = '[stores] AssociateChildCategoriesSuccess',
  AssociateChildCategoriesFailed = '[stores] AssociateChildCategoriesFailed',
  AssociateChildOffers = '[stores] AssociateChildOffers',
  AssociateChildOffersSuccess = '[stores] AssociateChildOffersSuccess',
  AssociateChildOffersFailed = '[stores] AssociateChildOffersFailed',
  AssociateOfferVariants = '[stores] AssociateOfferVariants',
  AssociateOfferVariantsSuccess = '[stores] AssociateOfferVariantsSuccess',
  AssociateOfferVariantsFailed = '[stores] AssociateOfferVariantsFailed',
  VerifyCatalogData = '[stores] VerifyCatalogData',
  VerifyCatalogDataSuccess = '[stores] VerifyCatalogDataSuccess',
  VerifyCatalogDataFailed = '[stores] VerifyCatalogDataFailed',
  UploadCatalogData = '[stores] UploadCatalogData',
  UploadCatalogDataSuccess = '[stores] UploadCatalogDataSuccess',
  UploadCatalogDataFailed = '[stores] UploadCatalogDataFailed',
  DeleteCategory = '[stores] DeleteCategory',
  DeleteCategorySuccess = '[stores] DeleteCategorySuccess',
  DeleteCategoryFailed = '[stores] DeleteCategoryFailed',
  DeleteOffer = '[stores] DeleteOffer',
  DeleteOfferSuccess = '[stores] DeleteOfferSuccess',
  DeleteOfferFailed = '[stores] DeleteOfferFailed',
  DeleteMultipleOffer = '[stores] DeleteMultipleOffer',
  DeleteMultipleOfferSuccess = '[stores] DeleteMultipleOfferSuccess',
  DeleteMultipleOfferFailed = '[stores] DeleteMultipleOfferFailed',
  SaveAvailability = '[stores] SaveAvailability',
  SaveAvailabilitySuccess = '[stores] SaveAvailabilitySuccess',
  SaveAvailabilityFailed = '[stores] SaveAvailabilityFailed',
  VerifyCatalogImage = '[stores] VerifyCatalogImage',
  VerifyCatalogImageSuccess = '[stores] VerifyCatalogImageSuccess',
  VerifyCatalogImageFailed = '[stores] VerifyCatalogImageFailed',
  DownloadTranslateCatalogXls = '[stores] DownloadTranslateCatalogXls',
  DownloadTranslateCatalogXlsSuccess = '[stores] DownloadTranslateCatalogXlsSuccess',
  DownloadTranslateCatalogXlsFailed = '[stores] DownloadTranslateCatalogXlsFailed',
  DownloadToUpdateCatalogXls = '[stores] DownloadToUpdateCatalogXls',
  DownloadToUpdateCatalogXlsSuccess = '[stores] DownloadToUpdateCatalogXlsSuccess',
  DownloadToUpdateCatalogXlsFailed = '[stores] DownloadToUpdateCatalogXlsFailed',
  UploadCatalogTranslate = '[stores] UploadCatalogTranslate',
  UploadCatalogTranslateSuccess = '[stores] UploadCatalogTranslateSuccess',
  UploadCatalogTranslateFailed = '[stores] UploadCatalogTranslateFailed',
  DeleteOfferImage = '[stores] DeleteOfferImage',
  DeleteOfferOrCategoryImageSuccess = '[stores] DeleteOfferOrCategoryImageSuccess',
  DeleteOfferOrCategoryImageFailed = '[stores] DeleteOfferOrCategoryImageFailed',
  ImportCatalog = '[stores] ImportCatalog',
  ImportCatalogSuccess = '[stores] ImportCatalogSuccess',
  ImportCatalogFailed = '[stores] ImportCatalogFailed',
  DownloadOfferOrCategoryImage = '[stores] DownloadOfferOrCategoryImage',
  DownloadOfferOrCategoryImageSuccess = '[stores] DownloadOfferOrCategoryImageSuccess',
  DownloadOfferOrCategoryImageFailed = '[stores] DownloadOfferOrCategoryImageFailed',
  ImportCatalogFromOtherStore = '[stores] ImportCatalogFromOtherStore',
  ImportCatalogFromOtherStoreSuccess = '[stores] ImportCatalogFromOtherStoreSuccess',
  ImportCatalogFromOtherStoreFailed = '[stores] ImportCatalogFromOtherStoreFailed',
  DeleteCategoryImage = '[stores] DeleteCategoryImage'
}
@ShowLoader()
export class ImportCatalogFromOtherStore implements Action {
  readonly type = StoresCatalogActionType.ImportCatalogFromOtherStore;
  constructor(public readonly request: CloneCatalogRequest) { }
}
@HideLoader(StoresCatalogActionType.ImportCatalogFromOtherStore)
export class ImportCatalogFromOtherStoreSuccess implements Action {
  readonly type = StoresCatalogActionType.ImportCatalogFromOtherStoreSuccess;
  constructor(public readonly storeId: number) { }
}
@HideLoader(StoresCatalogActionType.ImportCatalogFromOtherStore)
export class ImportCatalogFromOtherStoreFailed implements Action {
  readonly type = StoresCatalogActionType.ImportCatalogFromOtherStoreFailed;
  constructor(public readonly error: any) { }
}

export class LoadCatalog implements Action {
  readonly type = StoresCatalogActionType.LoadCatalog;
  constructor(public readonly id: string) { }
}

export class LoadCatalogSuccess implements Action {
  readonly type = StoresCatalogActionType.LoadCatalogSuccess;
  constructor(public readonly catalog: StoreCatalog) { }
}

export class LoadCatalogFailed implements Action {
  readonly type = StoresCatalogActionType.LoadCatalogFailed;
  constructor(public readonly error: any) { }
}

export class LoadStationCategory implements Action {
  readonly type = StoresCatalogActionType.LoadStationCategory;
  constructor(public readonly id: number, public readonly storeId: number) { }
}

export class LoadStationCategorySuccess implements Action {
  readonly type = StoresCatalogActionType.LoadStationCategorySuccess;
  constructor(public readonly station: SaveStationResponse) { }
}

export class LoadStationCategoryFailed implements Action {
  readonly type = StoresCatalogActionType.LoadStationCategoryFailed;
  constructor() { }
}

export class LoadStation implements Action {
  readonly type = StoresCatalogActionType.LoadStation;
  constructor(public readonly id: string) { }
}

export class LoadStationSuccess implements Action {
  readonly type = StoresCatalogActionType.LoadStationSuccess;
  constructor(public readonly stations: Station[]) { }
}

export class LoadStationFailed implements Action {
  readonly type = StoresCatalogActionType.LoadStationFailed;
  constructor(public readonly error: any) { }
}
@ShowLoader()
export class SaveOffer implements Action {
  readonly type = StoresCatalogActionType.SaveOffer;

  constructor(
    public readonly saveOffer: SaveOfferView,
    public readonly offerId: any,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly childCategoryId: number,
    public readonly nextPage: string,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean,
    public readonly offerImage?: File) { }

}
@HideLoader(StoresCatalogActionType.SaveOffer)
export class SaveOfferSuccess implements Action {
  readonly type = StoresCatalogActionType.SaveOfferSuccess;

  constructor(
    public readonly saveOffer: SaveOfferView,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly childCategoryId: number,
    public readonly mode: any,
    public readonly nextPage: string,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean) { }

}
@HideLoader(StoresCatalogActionType.SaveOffer)
export class SaveOfferFailed implements Action {
  readonly type = StoresCatalogActionType.SaveOfferFailed;

  constructor(public readonly uploadOfferImageError?: boolean) { }

}

export class PatchSaveOffer implements Action {
  readonly type = StoresCatalogActionType.PatchSaveOffer;

  constructor(
    public readonly patchSaveOffer: PatchSaveOfferView,
    public readonly offerId: any,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly childCategoryId: number,
    public readonly parentOfferId: number,
    public readonly sourcePage: string,
    public readonly nextPage: string) { }

}

export class PatchSaveOfferSuccess implements Action {
  readonly type = StoresCatalogActionType.PatchSaveOfferSuccess;

  constructor(
    public readonly saveOffer: PatchSaveOfferView,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly childCategoryId: number,
    public readonly mode: any,
    public readonly parentOfferId: number,
    public readonly sourcePage: string,
    public readonly nextPage: string) { }

}

export class PatchSaveOfferFailed implements Action {
  readonly type = StoresCatalogActionType.PatchSaveOfferFailed;

  constructor() { }

}

export class BulkOfferChangeStatus implements Action {
  readonly type = StoresCatalogActionType.BulkOfferChangeStatus;

  constructor(
    public readonly offerIds: number[],
    public readonly isOrderable: boolean,
    public readonly sellable: boolean,
    public readonly isStockCheckEnabled: boolean,
    public readonly stockLevel: number,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly selectedCategories: number[]
  ) {}
}

export class BulkOfferChangeStatusFailed implements Action {
  readonly type = StoresCatalogActionType.BulkOfferChangeStatusFailed;
  constructor() { }
}

export class BulkOfferChangeStatusSuccess implements Action {
  readonly type = StoresCatalogActionType.BulkOfferChangeStatusSuccess;

  constructor(public readonly storeId: number, public readonly selectedCatalogIds: number[]){}
}
export class LoadOffer implements Action {
  readonly type = StoresCatalogActionType.LoadOffer;
  constructor(public readonly offerId: string, public readonly storeId: string, public readonly catalogId: string) { }
}

export class LoadOfferSuccess implements Action {
  readonly type = StoresCatalogActionType.LoadOfferSuccess;
  constructor(public readonly offerView: SaveOfferView) { }
}

export class LoadOfferFailed implements Action {
  readonly type = StoresCatalogActionType.LoadOfferFailed;
  constructor() { }
}
@ShowLoader()
export class SaveCategory implements Action {
  readonly type = StoresCatalogActionType.SaveCategory;

  constructor(
    public readonly saveCategory: SaveCategoryView,
    public readonly categoryId: any,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly categoryImage?: File) { }

}
@HideLoader(StoresCatalogActionType.SaveCategory)
export class SaveCategorySuccess implements Action {
  readonly type = StoresCatalogActionType.SaveCategorySuccess;

  constructor(
    public readonly saveCategory: SaveCategoryView,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly mode: any,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string) { }

}

@HideLoader(StoresCatalogActionType.SaveCategory)
export class SaveCategoryFailed implements Action {
  readonly type = StoresCatalogActionType.SaveCategoryFailed;

  constructor() { }

}

@ShowLoader()
export class SaveStation implements Action {
  readonly type = StoresCatalogActionType.SaveStation;
  constructor (public readonly saveStationRequest: SaveStationRequest, public readonly storeId: number){}
}

@HideLoader(StoresCatalogActionType.SaveStation)
export class SaveStationSucces implements Action {
  readonly type = StoresCatalogActionType.SaveStationSuccess;
  constructor(public readonly saveStationResponse: SaveStationResponse, public readonly storeId: number){
  }
}

@HideLoader(StoresCatalogActionType.SaveStation)
export class SaveStationFailed implements Action {
  readonly type = StoresCatalogActionType.SaveStationFailed;
  constructor(){}
}

@ShowLoader()
export class UpdateStation implements Action {
  readonly type = StoresCatalogActionType.UpdateStation;
  constructor (public readonly saveStationRequest: SaveStationRequest, public readonly storeId: number, public readonly stationId: number){}
}

@HideLoader(StoresCatalogActionType.UpdateStation)
export class UpdateStationSuccess implements Action {
  readonly type = StoresCatalogActionType.UpdateStationSuccess;
  constructor(public readonly saveStationResponse: SaveStationResponse, public readonly storeId: number){
  }
}

@HideLoader(StoresCatalogActionType.UpdateStation)
export class UpdateStationFailed implements Action {
  readonly type = StoresCatalogActionType.UpdateStationFailed;
  constructor(){}
}

@ShowLoader()
export class DeleteStation implements Action {
  readonly type = StoresCatalogActionType.DeleteStation;
  constructor (public readonly storeId: number, public readonly stationId: number){}
}

@HideLoader(StoresCatalogActionType.DeleteStation)
export class DeleteStationSuccess implements Action {
  readonly type = StoresCatalogActionType.DeleteStationSuccess;
  constructor(public readonly storeId: number){}
}

@HideLoader(StoresCatalogActionType.DeleteStation)
export class DeleteStationFailed implements Action {
  readonly type = StoresCatalogActionType.DeleteStationFailed;
  constructor(){}
}

export class SaveOfferPosition implements Action {
  readonly type = StoresCatalogActionType.SaveOfferPosition;
  constructor(public readonly offers: SaveOfferPositionView, public readonly storeId: string, public readonly catalogId: string) { }
}

export class SaveOfferPositionSuccess implements Action {
  readonly type = StoresCatalogActionType.SaveOfferPositionSuccess;
  constructor(public readonly offers: SaveOfferPositionView) { }

}

export class SaveOfferPositionFailed implements Action {
  readonly type = StoresCatalogActionType.SaveOfferPositionFailed;
  constructor() { }
}

export class SaveCategoryPosition implements Action {
  readonly type = StoresCatalogActionType.SaveCategoryPosition;
  constructor(
    public readonly categories: SaveCategoryPositionView,
    public readonly storeId: string,
    public readonly catalogId: string) { }
}

export class SaveCategoryPositionSuccess implements Action {
  readonly type = StoresCatalogActionType.SaveCategoryPositionSuccess;
  constructor(public readonly categories: SaveCategoryPositionView) { }

}

export class SaveCategoryPositionFailed implements Action {
  readonly type = StoresCatalogActionType.SaveCategoryPositionFailed;
  constructor() { }

}

export class LoadCategory implements Action {
  readonly type = StoresCatalogActionType.LoadCategory;
  constructor(public readonly categoryId: string, public readonly storeId: string, public readonly catalogId: string) { }
}

export class LoadCategorySuccess implements Action {
  readonly type = StoresCatalogActionType.LoadCategorySuccess;
  constructor(public readonly categoryView: SaveCategoryView) { }
}

export class LoadCategoryFailed implements Action {
  readonly type = StoresCatalogActionType.LoadCategoryFailed;
  constructor() { }
}

export class UploadOfferOrCategoryImage implements Action {
  readonly type = StoresCatalogActionType.UploadOfferOrCategoryImage;

  constructor(public readonly file: File, public storeId: number, public contentItemId: number,
    public source: 'CATEGORY' | 'OFFER') { }
}

export class UploadOfferImageSuccess implements Action {
  readonly type = StoresCatalogActionType.UploadOfferImageSuccess;

  constructor(public readonly imageUrl: string, public readonly storeId: number) { }
}

export class UploadCategoryImageSuccess implements Action {
  readonly type = StoresCatalogActionType.UploadCategoryImageSuccess;

  constructor(public readonly imageUrl: string, public readonly storeId: number) { }
}

export class UploadOfferOrCategoryImageFailed implements Action {
  readonly type = StoresCatalogActionType.UploadOfferOrCategoryImageFailed;

  constructor(public readonly errorMessage: string) { }
}

export class UploadCatalogTranslate implements Action {
  readonly type = StoresCatalogActionType.UploadCatalogTranslate;

  constructor(public readonly file: File, public storeId: number, public catalogId: number) { }
}

export class UploadCatalogTranslateSuccess implements Action {
  readonly type = StoresCatalogActionType.UploadCatalogTranslateSuccess;

  constructor(public readonly storeId: number) { }
}

export class UploadCatalogTranslateFailed implements Action {
  readonly type = StoresCatalogActionType.UploadCatalogTranslateFailed;

  constructor(public readonly errorMessage: string, public readonly storeId: number) { }
}

export class SaveContentItem implements Action {
  readonly type = StoresCatalogActionType.SaveContentItem;

  constructor(public readonly contentItem: ContentItemView, public readonly contentItemId: any, public readonly storeId: number) { }

}

export class SaveContentItemSuccess implements Action {
  readonly type = StoresCatalogActionType.SaveContentItemSuccess;

  constructor(public readonly contentItem: ContentItemView) { }

}

export class SaveContentItemFailed implements Action {
  readonly type = StoresCatalogActionType.SaveContentItemFailed;

  constructor() { }

}

export class AssociateChildCategories implements Action {
  readonly type = StoresCatalogActionType.AssociateChildCategories;

  constructor(
    public readonly categoriesView: AssociateCategoriesView,
    public readonly offerId: number,
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly isAssociate: boolean) { }

}

export class AssociateChildCategoriesSuccess implements Action {
  readonly type = StoresCatalogActionType.AssociateChildCategoriesSuccess;

  constructor(
    public readonly categoriesView: AssociateCategoriesView,
    public readonly offerId: any,
    public readonly storeId: any,
    public readonly catalogId: any,
    public readonly isAssociate: boolean) { }

}

export class AssociateChildCategoriesFailed implements Action {
  readonly type = StoresCatalogActionType.AssociateChildCategoriesFailed;

  constructor() { }

}

export class AssociateChildOffers implements Action {
  readonly type = StoresCatalogActionType.AssociateChildOffers;

  constructor(
    public readonly offersView: AssociateOffersView,
    public readonly categoryId: number,
    public readonly storeId: number,
    public readonly catalogId: number) { }

}

export class AssociateChildOffersSuccess implements Action {
  readonly type = StoresCatalogActionType.AssociateChildOffersSuccess;

  constructor(public readonly offersView: AssociateOffersView) { }

}

export class AssociateChildOffersFailed implements Action {
  readonly type = StoresCatalogActionType.AssociateChildOffersFailed;

  constructor() { }

}

export class AssociateOfferVariants implements Action {
  readonly type = StoresCatalogActionType.AssociateOfferVariants;

  constructor(
    public readonly offersView: AssociateOffersView,
    public readonly offerId: number,
    public readonly storeId: number,
    public readonly catalogId: number) { }

}

export class AssociateOfferVariantsSuccess implements Action {
  readonly type = StoresCatalogActionType.AssociateOfferVariantsSuccess;

  constructor(public readonly offersView: AssociateOffersView) { }

}

export class AssociateOfferVariantsFailed implements Action {
  readonly type = StoresCatalogActionType.AssociateOfferVariantsFailed;

  constructor() { }

}

export class VerifyCatalogData implements Action {
  readonly type = StoresCatalogActionType.VerifyCatalogData;

  constructor(public readonly file: File, public storeId: number, public catalogId: number, public readonly isOptionGroup: boolean) { }
}

export class VerifyCatalogDataSuccess implements Action {
  readonly type = StoresCatalogActionType.VerifyCatalogDataSuccess;

  constructor(public readonly catalog: StoreCatalog) { }
}

export class VerifyCatalogDataFailed implements Action {
  readonly type = StoresCatalogActionType.VerifyCatalogDataFailed;

  constructor(public readonly errorMessages: any) { }
}

@ShowLoader()
export class VerifyCatalogImage implements Action {
  readonly type = StoresCatalogActionType.VerifyCatalogImage;

  constructor(public readonly file: File, public storeId: number, public catalogId: number) { }
}

@HideLoader(StoresCatalogActionType.VerifyCatalogImage)
export class VerifyCatalogImageSuccess implements Action {
  readonly type = StoresCatalogActionType.VerifyCatalogImageSuccess;

  constructor(public readonly catalog: StoreCatalog) { }
}

@HideLoader(StoresCatalogActionType.VerifyCatalogImage)
export class VerifyCatalogImageFailed implements Action {
  readonly type = StoresCatalogActionType.VerifyCatalogImageFailed;

  constructor(public readonly errorMessages: any) { }
}


export class UploadCatalogData implements Action {
  readonly type = StoresCatalogActionType.UploadCatalogData;

  constructor(public readonly catalog: StoreCatalog, public readonly storeId: number, public readonly catalogId: number, public readonly isOptionGroup: boolean) { }
}

export class UploadCatalogDataSuccess implements Action {
  readonly type = StoresCatalogActionType.UploadCatalogDataSuccess;

  constructor(public readonly catalog: StoreCatalog, public readonly storeId: number, public readonly isOptionGroup: boolean) { }
}

export class UploadCatalogDataFailed implements Action {
  readonly type = StoresCatalogActionType.UploadCatalogDataFailed;

  constructor(public readonly errorMessage: string, public readonly storeId: number, public readonly isOptionGroup: boolean) { }
}

export class DeleteCategory implements Action {
  readonly type = StoresCatalogActionType.DeleteCategory;

  constructor(
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly categoryId: number,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean,
    public readonly ruleId?: number,
    public readonly hierarchyLevel?: string) { }
}

export class DeleteCategorySuccess implements Action {
  readonly type = StoresCatalogActionType.DeleteCategorySuccess;

  constructor(
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean,
    public readonly ruleId?: number,
    public readonly hierarchyLevel?: string) { }
}

export class DeleteCategoryFailed implements Action {
  readonly type = StoresCatalogActionType.DeleteCategoryFailed;

  constructor() { }
}

export class DeleteOffer implements Action {
  readonly type = StoresCatalogActionType.DeleteOffer;

  constructor(
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly offerId: number,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean,
    public readonly ruleOptionGroupId?: number) { }
}

export class DeleteOfferSuccess implements Action {
  readonly type = StoresCatalogActionType.DeleteOfferSuccess;

  constructor(
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean,
    public readonly ruleOptionGroupId?: number) { }
}

export class DeleteOfferFailed implements Action {
  readonly type = StoresCatalogActionType.DeleteOfferFailed;

  constructor() { }
}

export class DeleteMultipleOffer implements Action {
  readonly type = StoresCatalogActionType.DeleteMultipleOffer;

  constructor(
    public readonly storeId: number,
    public readonly catalogId: number,
    public readonly offerIds: number[],
    public readonly sourcePage: string,
    public readonly parentOfferId: number,
    public readonly parentOfferName: string,
    public readonly mainOfferId: number,
    public readonly mainOfferName: string,
    public readonly variantOfferId: number,
    public readonly variantOfferName: string,
    public readonly sourceOptionGroup: boolean,
    public readonly selectedCatalogIds: number[],
    public readonly ruleOptionGroupId?: number,
    ) { }
}

export class DeleteMultipleOfferSuccess implements Action {
  readonly type = StoresCatalogActionType.DeleteMultipleOfferSuccess;

  constructor(public readonly storeId: number,public readonly selectedCatalogIds: number[]) { }
}

export class DeleteMultipleOfferFailed implements Action {
  readonly type = StoresCatalogActionType.DeleteMultipleOfferFailed;

  constructor() { }
}

export class SaveAvailability implements Action {
  readonly type = StoresCatalogActionType.SaveAvailability;

  constructor(public readonly availability: Availability, public readonly storeId: number) { }

}

export class SaveAvailabilitySuccess implements Action {
  readonly type = StoresCatalogActionType.SaveAvailabilitySuccess;

  constructor(public readonly availability: Availability, public readonly storeId: number) { }

}

export class SaveAvailabilityFailed implements Action {
  readonly type = StoresCatalogActionType.SaveAvailabilityFailed;

  constructor() { }

}

export class DownloadTranslateCatalogXls implements Action {
  readonly type = StoresCatalogActionType.DownloadTranslateCatalogXls;

  constructor(public readonly storeId: number, public readonly catalogId: number) { }

}

export class DownloadTranslateCatalogXlsSuccess implements Action {
  readonly type = StoresCatalogActionType.DownloadTranslateCatalogXlsSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadTranslateCatalogXlsFailed implements Action {
  readonly type = StoresCatalogActionType.DownloadTranslateCatalogXlsFailed;

  constructor(public readonly error: string) { }

}

export class DownloadToUpdateCatalogXls implements Action {
  readonly type = StoresCatalogActionType.DownloadToUpdateCatalogXls;

  constructor(public readonly storeId: number, public readonly catalogId: number, public readonly sourcePage?: string) { }

}

export class DownloadToUpdateCatalogXlsSuccess implements Action {
  readonly type = StoresCatalogActionType.DownloadToUpdateCatalogXlsSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadToUpdateCatalogXlsFailed implements Action {
  readonly type = StoresCatalogActionType.DownloadToUpdateCatalogXlsFailed;

  constructor(public readonly error: string) { }
}

@ShowLoader()
export class DeleteOfferImage implements Action {
  readonly type = StoresCatalogActionType.DeleteOfferImage;

  constructor(public readonly storeId: number, public readonly catalogId: number, public readonly offerId: number) { }
}

@HideLoader(StoresCatalogActionType.DeleteOfferImage)
export class DeleteOfferOrCategoryImageSuccess implements Action {
  readonly type = StoresCatalogActionType.DeleteOfferOrCategoryImageSuccess;

  constructor(public readonly storeId: number, public readonly catalogId: number, public readonly offerId: number) { }
}

@HideLoader(StoresCatalogActionType.DeleteOfferImage)
export class DeleteOfferOrCategoryImageFailed implements Action {
  readonly type = StoresCatalogActionType.DeleteOfferOrCategoryImageFailed;

  constructor() { }
}


export class ImportCatalog implements Action {
  readonly type = StoresCatalogActionType.ImportCatalog;
  constructor(public readonly catalog: ImportCatalogData, public readonly storeId: string) { }
}

export class ImportCatalogSuccess implements Action {
  readonly type = StoresCatalogActionType.ImportCatalogSuccess;
  constructor(public readonly catalog: ImportCatalogResponse) { }
}

export class ImportCatalogFailed implements Action {
  readonly type = StoresCatalogActionType.ImportCatalogFailed;
  constructor(public readonly errorMessages: any) { }
}

export class DownloadOfferOrCategoryImage implements Action {
  readonly type = StoresCatalogActionType.DownloadOfferOrCategoryImage;

  constructor(public readonly url: string) { }

}

export class DownloadOfferOrCategoryImageSuccess implements Action {
  readonly type = StoresCatalogActionType.DownloadOfferOrCategoryImageSuccess;

  constructor(public readonly blob: Blob, public readonly filename: string) { }

}

export class DownloadOfferOrCategoryImageFailed implements Action {
  readonly type = StoresCatalogActionType.DownloadOfferOrCategoryImageFailed;

  constructor(public readonly error: string) { }

}

export class DeleteCategoryImage implements Action {
  readonly type = StoresCatalogActionType.DeleteCategoryImage;

  constructor(public readonly storeId: number, public readonly catalogId: number, public readonly categoryId: number) { }
}

export type StoresCatalogAction =
  LoadCatalog
  | LoadCatalogSuccess
  | LoadCatalogFailed
  | LoadStationCategory
  | LoadStationCategorySuccess
  | LoadStationCategoryFailed
  | UpdateStation
  | UpdateStationSuccess
  | UpdateStationFailed
  | DeleteStation
  | DeleteStationSuccess
  | DeleteStationFailed
  | LoadStation
  | LoadStationSuccess
  | LoadStationFailed
  | SaveOffer
  | SaveOfferSuccess
  | SaveOfferFailed
  | LoadOffer
  | LoadOfferSuccess
  | LoadOfferFailed
  | SaveCategory
  | SaveCategorySuccess
  | SaveCategoryFailed
  | LoadCategory
  | LoadCategorySuccess
  | LoadCategoryFailed
  | UploadOfferOrCategoryImage
  | UploadOfferImageSuccess
  | UploadOfferOrCategoryImageFailed
  | SaveContentItem
  | SaveContentItemSuccess
  | SaveContentItemFailed
  | AssociateChildCategories
  | AssociateChildCategoriesSuccess
  | AssociateChildCategoriesFailed
  | AssociateChildOffers
  | AssociateChildOffersSuccess
  | AssociateChildOffersFailed
  | AssociateOfferVariants
  | AssociateOfferVariantsSuccess
  | AssociateOfferVariantsFailed
  | VerifyCatalogData
  | VerifyCatalogDataSuccess
  | VerifyCatalogDataFailed
  | UploadCatalogData
  | UploadCatalogDataSuccess
  | UploadCatalogDataFailed
  | DeleteCategory
  | DeleteCategorySuccess
  | DeleteCategoryFailed
  | DeleteOffer
  | DeleteOfferSuccess
  | DeleteOfferFailed
  | DeleteMultipleOffer
  | DeleteMultipleOfferSuccess
  | DeleteMultipleOfferFailed
  | SaveAvailability
  | SaveAvailabilitySuccess
  | SaveAvailabilityFailed
  | VerifyCatalogImage
  | VerifyCatalogImageSuccess
  | VerifyCatalogImageFailed
  | DownloadTranslateCatalogXls
  | DownloadTranslateCatalogXlsSuccess
  | DownloadTranslateCatalogXlsFailed
  | DownloadToUpdateCatalogXls
  | DownloadToUpdateCatalogXlsSuccess
  | DownloadToUpdateCatalogXlsFailed
  | UploadCatalogTranslate
  | UploadCatalogTranslateSuccess
  | UploadCatalogTranslateFailed
  | DeleteOfferImage
  | DeleteOfferOrCategoryImageSuccess
  | DeleteOfferOrCategoryImageFailed
  | ImportCatalog
  | ImportCatalogSuccess
  | ImportCatalogFailed
  | DownloadOfferOrCategoryImage
  | DownloadOfferOrCategoryImageSuccess
  | DownloadOfferOrCategoryImageFailed
  | ImportCatalogFromOtherStore
  | ImportCatalogFromOtherStoreSuccess
  | ImportCatalogFromOtherStoreFailed
  | UploadCategoryImageSuccess
  | DeleteCategoryImage
  | BulkOfferChangeStatusSuccess;
