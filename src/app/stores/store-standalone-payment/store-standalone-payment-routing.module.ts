import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StandalonePaymentOrdersComponent } from './standalone-payment-orders/standalone-payment-orders.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', component: StandalonePaymentOrdersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class StoreStandalonePaymentRoutingModule { }
