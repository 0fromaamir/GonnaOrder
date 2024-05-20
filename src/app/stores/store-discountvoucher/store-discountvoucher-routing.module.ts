import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiscountvoucherFormComponent } from './discountvoucher-form/discountvoucher-form.component';
import { DiscountvoucherFormGuard } from './discountvoucher-form/discountvoucher-form.guard';
import { StoreDiscountvoucherComponent } from './store-discountvoucher.component';
import { StoreDiscountvoucherGuard } from './store-discountvoucher.guard';
import { mapToCanActivate } from 'src/app/functional-guards';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreDiscountvoucherComponent, canActivate: mapToCanActivate([StoreDiscountvoucherGuard]) },
  { path: ':voucherId', component: DiscountvoucherFormComponent, canActivate: mapToCanActivate([DiscountvoucherFormGuard]) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreDiscountvoucherRoutingModule { }
