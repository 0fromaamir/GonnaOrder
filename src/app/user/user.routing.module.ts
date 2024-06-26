import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BecomeAffiliateComponent} from './/become-affiliate/become-affiliate.component';
import {VouchersComponent} from './/vouchers/vouchers.component';
import {VouchersGuard} from './/vouchers.guard';
import {UserGuard} from './user.guard';
import { UserAffiliateGuard } from './useraffiliate.guard';
import {PartnerProgramComponent} from './partner-program/partner-program.component';
import {VoucherPaymentMethodComponent} from './voucher-payment-method/voucher-payment-method.component';
import {VoucherPaymentMethodGuard} from './voucher-payment-method.guard';
import { CommissionsComponent } from './commissions/commissions.component';
import { CommissionsGuard } from './commissions.guard';
import { ThankyouComponent } from './thankyou/thankyou.component';
import { mapToCanActivate } from '../functional-guards';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'become-affiliate' },
  { path: 'become-affiliate', component: BecomeAffiliateComponent, canActivate: mapToCanActivate([UserGuard])},
  { path: 'thankyou', component: ThankyouComponent},
  {
    path: 'partner',
    component: PartnerProgramComponent,
    canActivate: mapToCanActivate([UserGuard, UserAffiliateGuard]),
    children: [
      { path: '', component: VouchersComponent, canActivate: mapToCanActivate([VouchersGuard]) },
      { path: 'vouchers', component: VouchersComponent, canActivate: mapToCanActivate([VouchersGuard]) },
      { path: 'commissions', component: CommissionsComponent, canActivate: mapToCanActivate([CommissionsGuard]) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
