import { CatalogOtherstoreComponent } from './catalog-otherstore/catalog-otherstore.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StoreCatalogComponent } from './store-catalog.component';
import { StoreCatalogGuard } from './store-catalog.guard';
import { StoreOfferComponent } from './store-offer/store-offer.component';
import { StoreOfferGuard } from './store-offer.guard';
import { StoreCategoryComponent } from './store-category/store-category.component';
import { StoreCategoryGuard } from './store-category.guard';
import { ChildCategoryComponent } from './child-category/child-category.component';
import { ChildOfferComponent } from './child-offer/child-offer.component';
import { OfferVariantComponent } from './offer-variant/offer-variant.component';
import { CatalogUploadComponent } from './catalog-upload/catalog-upload.component';
import { CatalogLinkComponent } from './catalog-link/catalog-link.component';
import { StoresListGuard } from '../stores-list.guard';
import { mapToCanActivate } from 'src/app/functional-guards';
import { StoreCatalogViewComponent } from './store-catalog-view/store-catalog-view.component';
import { OptionGroupsComponent } from './option-groups/option-groups.component';
import { TopLevelCategoryComponent } from './top-level-category/top-level-category.component';
import { StationComponent } from './station/station.component';
import { ChildStationComponent } from './child-station/child-station.component';

const routes: Routes = [
  { path: '', component: StoreCatalogComponent, canActivate: mapToCanActivate([StoreCatalogGuard]),
    children: [
      { path: '', component: StoreCatalogViewComponent, canActivate: mapToCanActivate([StoreCatalogGuard]) },
      { path: 'option-groups', component: OptionGroupsComponent },
      { path: 'top', component: TopLevelCategoryComponent },
      { path: 'station', component: StationComponent}
    ] },
  { path: ':catalogId/offer/:offerId', component: StoreOfferComponent, canActivate: mapToCanActivate([StoreOfferGuard]) },
  { path: ':catalogId/createFromLink', component: CatalogLinkComponent },
  { path: ':catalogId/station/:stationId', component: ChildStationComponent, canActivate:mapToCanActivate([StoreCategoryGuard])},
  { path: ':catalogId/category/:categoryId', component: StoreCategoryComponent, canActivate: mapToCanActivate([StoreCategoryGuard]) },
  { path: ':catalogId/childCategory/:categoryId', component: ChildCategoryComponent, canActivate: mapToCanActivate([StoreCategoryGuard]) },
  { path: ':catalogId/childOffer/:offerId', component: ChildOfferComponent, canActivate: mapToCanActivate([StoreOfferGuard]) },
  { path: ':catalogId/offerVariant/:offerId', component: OfferVariantComponent, canActivate: mapToCanActivate([StoreOfferGuard]) },
  { path: ':catalogId/upload', component: CatalogUploadComponent },
  { path: ':catalogId/createFromOtherStore', component: CatalogOtherstoreComponent, canActivate: mapToCanActivate([StoresListGuard]) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreCatalogRoutingModule { }
