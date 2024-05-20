import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreOrdersComponent } from './store-orders/store-orders.component';
import { StoreOrdersGuard } from './store-orders/store-orders.guard';
import { StoreOrderViewComponent } from './store-order-view/store-order-view.component';
import { StoreOrderGuard } from './store-order-view/store-order.guard';
import { mapToCanActivate } from 'src/app/functional-guards';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StoreOrdersComponent, canActivate: mapToCanActivate([StoreOrdersGuard]) },
  { path: ':orderUuid', component: StoreOrderViewComponent, canActivate: mapToCanActivate([StoreOrderGuard]) },
  { path: ':orderUuid/stationId/:stationId', component: StoreOrderViewComponent, canActivate: mapToCanActivate([StoreOrderGuard])},
  {
    path: 'capture',
    loadChildren: () => import('../../public/public.module').then(m => m.PublicModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreOrderRoutingModule { }
