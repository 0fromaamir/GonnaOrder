import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {
  StoreCatalog, SaveOfferPositionView, SaveCategoryPositionView, ContentItemView, SaveOfferView,
  SaveCategoryView, CategoriesListResponse, Availability, UploadFileResponse,
  AssociateCategoriesView, AssociateOffersView, TranslateCatalogXlsResponse,
  ToUpdateCatalogXlsResponse, PatchSaveOfferView, ImportCatalogResponse, OfferImageResponse, CloneCatalogRequest, Category, Station, SaveStationRequest, SaveStationResponse
} from './stores-catalog';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoresCatalogService {

  constructor(private http: HttpClient) { }

  importCatalogFromOtherStore(cloneRequest: CloneCatalogRequest): Observable<any> {
    return this.http.post(`/api/v1/stores/cloneCatalog`, cloneRequest);
  }

  getcatalog(id: string): Observable<StoreCatalog> {
    return this.http.get<StoreCatalog>(`/api/v1/user/stores/${id}/catalog`);
  }

  getStations(id: string): Observable<Station[]> {
    return this.http.get<Station[]>(`/api/v1/stores/${id}/stations`);
  }

  saveOffer(offer: SaveOfferView, offerId: any, storeId: number, catalogId: number): Observable<SaveOfferView> {
    if (offerId === 'CREATE_OFFER') {
      return this.http.post<SaveOfferView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer`, offer);
    } else {
      return this.http.post<SaveOfferView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}`, offer);
    }
  }

  patchOffer(offer: PatchSaveOfferView, offerId: any, storeId: number, catalogId: number): Observable<PatchSaveOfferView> {
    return this.http.patch<PatchSaveOfferView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}/lite`, offer);
  }

  bulkOfferChangeStatus(offerIds: number[], isOrderable: boolean, sellable: boolean, isStockCheckEnabled: boolean, stockLevel: number, storeId: number, catalogId: number): Observable<PatchSaveOfferView[]> {
    const request = {
      offerIds,
      isOrderable,
      sellable,
      isStockCheckEnabled,
      stockLevel
    }
    return this.http.patch<PatchSaveOfferView[]>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/changeStatus`, request);
  }

  saveImageToOfferOrCategory(contentItemId: number, imageUrl: any, storeId: number): Observable<ContentItemView> {
    const contentItem: ContentItemView = { standardImage: null };
    contentItem.standardImage = imageUrl;
    return this.saveContentItem(contentItem, contentItemId, storeId);
  }

  deleteOfferImage(storeId: number, catalogId: number, offerId: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}/delete-image`);
  }

  deleteCategoryImage(storeId: number, catalogId: number, categoryId: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/catalog/${catalogId}/category/${categoryId}/image`);
  }

  saveOfferPosition(offers: SaveOfferPositionView, storeId, catalogId): Observable<SaveOfferPositionView> {
    return this.http.post<SaveOfferPositionView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/position`, offers);
  }

  saveCategoryPosition(categories: SaveCategoryPositionView, storeId, catalogId): Observable<SaveCategoryPositionView> {
    return this.http.post<SaveCategoryPositionView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/category/position`, categories);
  }

  loadOffer(offerId: string, storeId: string, catalogId: string): Observable<SaveOfferView> {
    return this.http.get<SaveOfferView>(`/api/v1/user/stores/${storeId}/catalog/${catalogId}/offer/${offerId}`);
  }

  saveCategory(category: SaveCategoryView, categoryId: any, storeId: number, catalogId: number): Observable<SaveCategoryView> {
    if (categoryId === 'CREATE_CATEGORY') {
      return this.http.post<SaveCategoryView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/category`, category);
    } else {
      return this.http.post<SaveCategoryView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/category/${categoryId}`, category);
    }
  }

  saveStation(saveStationRequest:SaveStationRequest, storeId: number): Observable<SaveStationResponse> {
    return this.http.post<SaveStationResponse>(`/api/v1/stores/${storeId}/stations`, saveStationRequest);
  }

  updateStation(saveStationRequest:SaveStationRequest, storeId: number, stationId: number): Observable<SaveStationResponse> {
    return this.http.patch<SaveStationResponse>(`/api/v1/stores/${storeId}/stations/${stationId}`, saveStationRequest);
  }

  deleteStation(storeId: number, stationId: number): Observable<void>{
    return this.http.delete<void>(`/api/v1/stores/${storeId}/stations/${stationId}`); 
  }

  loadCategory(categoryId: string, storeId: string, catalogId: string): Observable<SaveCategoryView> {
    return this.http.get<SaveCategoryView>(`/api/v1/user/stores/${storeId}/catalog/${catalogId}/category/${categoryId}`);
  }

  loadStationCategory(stationId: number, storeId: number): Observable<SaveStationResponse> {
    return this.http.get<SaveStationResponse>(`/api/v1/stores/${storeId}/stations/${stationId}`)
  }

  listCatalogCategories(catalogId: number, storeId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`/api/v1/user/stores/${storeId}/catalog/${catalogId}/categories/name`);
  }

  listAvailability(storeId: number): Observable<Availability> {
    return this.http.get<Availability>(`/api/v1/stores/${storeId}/availability`);
  }

  saveAvailability(availability: Availability, storeId: number): Observable<Availability> {
    return this.http.post<Availability>(`/api/v1/stores/${storeId}/availability`, availability);
  }

  uploadOfferOrCategoryImage(file, storeId, contentItemId): Observable<UploadFileResponse> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<UploadFileResponse>(
      `/api/v1/files/stores/${storeId}/content-items/${contentItemId}/CONTENT_ITEM_PICTURE`,
      formdata
    );
  }
  uploadCatalogTranslate(file: any, storeId: number, catId: number): Observable<UploadFileResponse> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<UploadFileResponse>(`/api/v1/stores/${storeId}/catalog/${catId}/content`, formdata);
  }

  saveContentItem(contentItem: ContentItemView, contentItemId: number, storeId: number): Observable<ContentItemView> {
    return this.http.post<ContentItemView>(`/api/v1/stores/${storeId}/content-item/${contentItemId}`, contentItem);
  }

  associateChildCategories(categories, offerId, storeId, catalogId): Observable<AssociateCategoriesView> {
    return this.http.post<AssociateCategoriesView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}/associate`, categories);
  }

  associateChildOffers(offers, categoryId, storeId, catalogId): Observable<AssociateOffersView> {
    return this.http.post<AssociateOffersView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/category/${categoryId}/associate`, offers);
  }

  addChildOffer(storeId, catalogId, offer, childCategoryId, category: SaveCategoryView) {
    if (null != category && category.categoryId === childCategoryId && offer.hierarchyLevel === 'CHILD') {
      const offerList = [];
      if (null != category.offers) {
        category.offers.forEach(off => { offerList.push({ offerId: off.offerId }); });
      }
      offerList.push({ offerId: offer.offerId });
      const offers = { offers: offerList };
      this.associateChildOffers(offers, childCategoryId, storeId, catalogId).subscribe();
    }
  }

  associateOffersVariants(offers, offerId, storeId, catalogId): Observable<AssociateOffersView> {
    return this.http.post<AssociateOffersView>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}/variant/associate`, offers);
  }

  verifyCatalogData(file, storeId, catalogId, isOptionGroup): Observable<StoreCatalog> {
    const formdata = new FormData();
    formdata.append('file', file);
    if(isOptionGroup){
      return this.http.post<StoreCatalog>(`/api/v1/stores/${storeId}/catalog/${catalogId}/verify/optionGroup`, formdata);
    }
    return this.http.post<StoreCatalog>(`/api/v1/stores/${storeId}/catalog/${catalogId}/verify`, formdata);
  }

  verifyCatalogContentData(file, storeId, catalogId): Observable<StoreCatalog> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<StoreCatalog>(`/api/v1/stores/${storeId}/catalog/${catalogId}/content`, formdata);
  }

  verifyCatalogImage(file, storeId, catalogId): Observable<StoreCatalog> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<StoreCatalog>(`/api/v1/stores/${storeId}/catalog/${catalogId}/verifyimage`, formdata);
  }

  UploadCatalogData(catalog, storeId, catalogId, isOptionGroup): Observable<StoreCatalog> {
    if(isOptionGroup){
      return this.http.post<StoreCatalog>(`/api/v1/stores/${storeId}/catalog/${catalogId}/uploadOptionGroup`, catalog);
    }
    return this.http.post<StoreCatalog>(`/api/v1/stores/${storeId}/catalog/${catalogId}`, catalog);
  }

  ImportCatalog(externalDomain, externalReference, storeId): Observable<ImportCatalogResponse> {
    return this.http.post<ImportCatalogResponse>(
      `/api/v1/stores/${storeId}/import/scrapping-store`, { externalDomain, externalReference }
    );
  }

  addChildCategory(saveCategoryData: SaveCategoryView, offer: SaveOfferView, parentOfferId, storeId, catalogId) {
    if (null != offer
        && offer.offerId === parentOfferId
        && saveCategoryData.hierarchyLevel === 'CHILD'
        && offer.hierarchyLevel === 'PARENT'){
      const catList = [];
      if (null != offer.categories) {
        offer.categories.forEach(cat => { catList.push({ categoryId: cat.categoryId }); });
      }
      catList.push({ categoryId: saveCategoryData.categoryId });
      const categories = { categories: catList };
      this.associateChildCategories(categories, parentOfferId, storeId, catalogId).subscribe();
    }
  }

  downloadOfferImage(url: string): Observable<OfferImageResponse> {
    return this.http.get(url, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toOfferImageResponse(r))
    );
  }

  private toOfferImageResponse(response: HttpResponse<Blob>): OfferImageResponse {
    const blob = response.body;
    const filename = response.url.split('/').pop().split('?')[0];
    return { blob, filename };
  }

  deleteCategory(storeId, catalogId, categoryId): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/catalog/${catalogId}/category/${categoryId}`);
  }

  deleteOffer(storeId, catalogId, offerId): Observable<void> {
    return this.http.delete<void>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/${offerId}`);
  }

  deleteMultipleOffer(storeId, catalogId, offerIds): Observable<void> {
    const request = {
      body: {offerIds},
    }
    return this.http.delete<void>(`/api/v1/stores/${storeId}/catalog/${catalogId}/offer/deletedMultipleOffers`,request);
  }

  downloadTranslateCatalogXls(storeId: number, catalogId: number): Observable<TranslateCatalogXlsResponse> {
    return this.http.get(`/api/v1/stores/${storeId}/catalog/${catalogId}/content`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toTranslateCatalogXls(r))
    );
  }

  downloadToUpdateCatalogXls(storeId: number, catalogId: number, sourcePage: string): Observable<ToUpdateCatalogXlsResponse> {
    let api = `/api/v1/stores/${storeId}/catalog/${catalogId}/content/primary`;
    if(sourcePage && sourcePage === 'option-group') {
      api = `/api/v1/stores/${storeId}/catalog/${catalogId}/content/optionGroup`;
    }
    return this.http.get(api, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(r => this.toTranslateCatalogXls(r))
    );
  }

  private toTranslateCatalogXls(response: HttpResponse<Blob>): TranslateCatalogXlsResponse {
    const blob = response.body;
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition.slice(contentDisposition.indexOf('filename=') + 9).replace(/"/g, '');
    return { blob, filename };
  }
}
