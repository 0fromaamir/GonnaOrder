import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreLocationComponent } from './store-location.component';
import { StoreLocationsListGuard } from './store-locations-list.guard';
import { StoreLocationGuard } from './store-location.guard';
import { StoreLocationManageComponent } from './store-location-manage/store-location-manage.component';
import { mapToCanActivate } from 'src/app/functional-guards';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreLocationComponent, canActivate: mapToCanActivate([StoreLocationsListGuard]) },
  { path: ':locationId/manage', component: StoreLocationManageComponent, canActivate: mapToCanActivate([StoreLocationGuard]) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreLocationRoutingModule { }
