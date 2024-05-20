import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoresListComponent } from './stores-list/stores-list.component';
import { StoresListGuard } from './stores-list.guard';
import { StoreDashboardGuard } from './store-dashboard.guard';
import { StoresNavigationGuard } from './stores-navigation.guard';
import { StoreCreateComponent } from './store-create/store-create.component';
import { StoreSettingsDashboardComponent } from './store-settings-dashboard/store-settings-dashboard.component';
import { StoreUpdateComponent } from './store-update/store-update.component';
import { StoreUsersComponent } from './store-users/store-users.component';
import { StoreUsersGuard } from './store-users.guard';
import { StoreSettingsUpdateComponent } from './store-settings-update/store-settings-update.component';
import { SubscriptionPurchaseComponent } from './store-subscriptions/subscription-purchase/subscription-purchase.component';
import { SubscriptionPurchaseGuard } from './store-subscriptions/subscription-purchase/subscription-purchase.guard';
import { StoreStatisticsComponent } from './store-statistics/store-statistics.component';
import { StoreStatisticsGuard } from './store-statistics.guard';
import { StoreSubscriptionsComponent } from './store-subscriptions/store-subscriptions.component';
import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';
import { LoggedInUserGuard } from '../admin/loggedinuser.guard';
import { StoreSubscriptionGuard } from './store-subscriptions/store-subscription.guard';
import { StoreShareComponent } from './store-share/store-share.component';
import { StorePickupMethodsComponent } from './store-pickup-methods/store-pickup-methods.component';
import { StoreZoneViewGuard } from './store-zone-view/store-zone-view.guard';
import { StoreAddressDeliveryComponent } from './store-address-delivery/store-address-delivery.component';
import { StoreAddressDeliveryGuard } from './store-address-delivery/store-address-delivery.guard';
import { StoreZoneComponent } from './store-zone/store-zone.component';
import { StoreZoneViewComponent } from './store-zone-view/store-zone-view.component';
import { StoreRoleGuard } from './store-role.guard';
import { StoreSuccessComponent } from './store-success/store-success.component';
import { StoreDefaultCatalogComponent } from './store-default-catalog/store-default-catalog.component';
import { ExtendSubscriptionPurchaseComponent } from './store-subscriptions/extend-subscription-purchase/extend-subscription-purchase.component';
import { ExtendSubscriptionGuard } from './store-subscriptions/extend-subscription-purchase/extend-subscription.guard';
import { StoreInvoiceComponent } from './store-subscriptions/store-invoice/store-invoice.component';
import { StoreMarketingComponent } from './store-marketing/store-marketing.component';
import { StoreTableOrderingComponent } from './store-table-ordering/store-table-ordering.component';
import { StoreBillingComponent } from './store-billing/store-billing.component';
import { BillingDetailsComponent } from './billing-details/billing-details.component';
import { BillingInvoicesComponent } from './billing-invoices/billing-invoices.component';
import { StoreDomainComponent } from './store-domain/store-domain.component';
import { StoreInvoiceGuard } from './store-subscriptions/store-invoice/store-invoice.guard';
import { StoreCustomerComponent } from './store-customer/store-customer.component';
import { StoreDeletePopupComponent } from './store-delete-popup/store-delete-popup.component';
import { StorePaymentMethodsGuard } from './store-payment-methods/store-payment-methods.guard';
import { StoreRelationComponent } from './store-relation/store-relation.component';
import { StoreRelationParentListComponent } from './store-relation-parent-list/store-relation-parent-list.component';
import { StoreRelationTreeGuard } from './store-relation-tree.guard';
import { StoreRelationTreeComponent } from './store-relation-tree/store-relation-tree.component';
import { StoresRelationGuard } from './stores-relation.guard';
import { mapToCanActivate, mapToCanActivateChild } from '../functional-guards';
import { map } from 'rxjs/operators';
import { StoreBrandingComponent } from './store-branding/store-branding.component';
import { UpdatePricingComponent } from './store-subscriptions/update-pricing/update-pricing.component';
import { UpdatePricingGuard } from './store-subscriptions/update-pricing/update-pricing.guard';
import { StoreLoyaltyComponent } from './store-loyalty/store-loyalty.component';
import { StoreOrderManagementComponent } from './store-order-management/store-order-management.component';
import { StoresReservationsComponent } from './stores-reservations/stores-reservations.component';
import { ReservationDetailsComponent } from './stores-reservations/reservation-details/reservation-details.component';
import { StoreDiscountvoucherGuard } from './store-discountvoucher/store-discountvoucher.guard';
import { StoreReservationsComponent } from './store-reservations/store-reservations.component';

const routes: Routes = [
  {
    path: 'stores',
    component: AdminLayoutComponent,
    canActivate: mapToCanActivate([LoggedInUserGuard]),
    children: [
      { path: '', pathMatch: 'full', canActivate: mapToCanActivate([StoresListGuard, StoresNavigationGuard]), children: [] },
      { path: 'list', component: StoresListComponent, canActivate: mapToCanActivate([StoresListGuard]) },

      { path: 'init', component: StoreCreateComponent },
      {
        path: ':id',
        canActivate: mapToCanActivate([StoreDashboardGuard]),
        canActivateChild: mapToCanActivate([StoreRoleGuard]),
        children: [
          {
            path: 'capture',
            loadChildren: () => import('../public/public.module').then(m => m.PublicModule),
          },
          { path: 'delete', component: StoreDeletePopupComponent },
          {
            path: 'locations',
            loadChildren: () => import('./store-location/store-location.module').then(m => m.StoreLocationModule),
            data: { rolesAllowed: ['STORE_ADMIN', 'STORE_STANDARD'] }
          },
          { path: 'share', component: StoreShareComponent, data: { rolesAllowed: ['STORE_ADMIN', 'STORE_STANDARD'] } },
          { path: 'register-store-success', component: StoreSuccessComponent },
          {
            path: 'settings',
            component: StoreSettingsDashboardComponent,
            data: { rolesAllowed: ['STORE_ADMIN'] },
            children: [
              {
                path: '',
                component: StoreUpdateComponent,
              },
              { path: 'edit', component: StoreSettingsUpdateComponent },
              { path: 'order-management', component: StoreOrderManagementComponent },
              {
                path: 'payment-methods',
                canActivate: mapToCanActivate([StorePaymentMethodsGuard]),
                loadChildren: () => import('./store-payment-methods/store-payment-methods.module').then(m => m.StorePaymentMethodsModule)
              },
              { path: 'pickup', component: StorePickupMethodsComponent },
              { path: 'address', component: StoreAddressDeliveryComponent, canActivate: mapToCanActivate([StoreAddressDeliveryGuard]) },
              { path: 'table', component: StoreTableOrderingComponent },
              { path: 'store-edit', component: StoreUpdateComponent },
              { path: 'zone/:zoneid', component: StoreZoneComponent },
              { path: 'zoneview/:zoneid', component: StoreZoneViewComponent, canActivate: mapToCanActivate([StoreZoneViewGuard]) },
              { path: 'default-catalog', component: StoreDefaultCatalogComponent },
              { path: 'store-domain', component: StoreDomainComponent },
              {
                path: 'ordering-rules',
                loadChildren: () => import('./store-ordering-rules/store-ordering-rules.module').then(m => m.StoreOrderingRulesModule),
              },
              {
                path: 'schedules',
                loadChildren: () => import('./store-schedule/store-schedule.module').then(m => m.StoreSchedulesModule),
              },
              {
                path: 'discount-voucher',
                loadChildren: () => import('./store-discountvoucher/store-discountvoucher.module').then(m => m.StoreDiscountvoucherModule),
              },
              {
                path: 'integrations',
                loadChildren: () => import('./store-integrations/store-integrations.module')
                  .then(m => m.StoreIntegrationsModule),
              },
              { path: 'marketing', component: StoreMarketingComponent },
              {
                path: 'multi-store', component: StoreRelationComponent,
                children: [
                  { path: '', pathMatch: 'full', canActivate: mapToCanActivate([StoresRelationGuard]), children: [] },
                  { path: 'parentStorelist', component: StoreRelationParentListComponent, canActivate: mapToCanActivate([StoresListGuard]) },
                  { path: 'relation-tree', component: StoreRelationTreeComponent, canActivate: mapToCanActivate([StoreRelationTreeGuard]) },
                ]
              },
              { path: 'branding', component: StoreBrandingComponent },
              { path: 'loyalty', component: StoreLoyaltyComponent, canActivate: mapToCanActivate([StoreDiscountvoucherGuard]) },
              { path: 'reservation', component: StoreReservationsComponent },
            ]
          },
          {
            path: 'customers',
            component: StoreCustomerComponent,
            data: { rolesAllowed: ['STORE_ADMIN'] }
          },
          { path: 'users', component: StoreUsersComponent, canActivate: mapToCanActivate([StoreUsersGuard]), data: { rolesAllowed: ['STORE_ADMIN'] } },
          {
            path: 'catalog',
            loadChildren: () => import('./store-catalog/store-catalog.module').then(m => m.StoreCatalogModule),
            data: { rolesAllowed: ['STORE_ADMIN', 'STORE_STANDARD'] }
          },
          {
            path: 'orders',
            loadChildren: () => import('./store-order/store-order.module').then(m => m.StoreOrderModule),
            data: { rolesAllowed: ['STORE_ADMIN', 'STORE_STANDARD'] }
          },
          {
            path: 'standalonePayments',
            loadChildren: () => import('./store-standalone-payment/store-standalone-payment.module')
              .then(m => m.StoreStandalonePaymentModule),
            data: { rolesAllowed: ['STORE_ADMIN', 'STORE_STANDARD'] }
          },
          {
            path: 'billing', component: StoreBillingComponent,
            canActivate: mapToCanActivate([StoreSubscriptionGuard]),
            data: { rolesAllowed: ['STORE_ADMIN'] },
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'subscriptions' },
              { path: 'invoices', component: BillingInvoicesComponent },
              { path: 'subscriptions', component: StoreSubscriptionsComponent },
              {
                path: 'billing-details', component: BillingDetailsComponent
              }
            ]
          },
          {
            path: 'invoices', component: StoreInvoiceComponent
          },
          {
            path: 'reservations', component: StoresReservationsComponent
          },
          {
            path: 'reservations/details', component: ReservationDetailsComponent
          },
          {
            path: 'billing/subscriptions/extend-subscription', component: ExtendSubscriptionPurchaseComponent,
            canActivate: mapToCanActivate([ExtendSubscriptionGuard])
          },
          {
            path: 'billing/subscriptions/update-pricing', component: UpdatePricingComponent,
            canActivate: mapToCanActivate([UpdatePricingGuard])
          },
          {
            path: 'billing/subscriptions/invoice/:invoiceId', component: StoreInvoiceComponent,
            canActivate: mapToCanActivate([StoreInvoiceGuard])
          },
          { path: 'statistics', component: StoreStatisticsComponent, canActivate: mapToCanActivate([StoreStatisticsGuard]), data: { rolesAllowed: ['STORE_ADMIN', 'STORE_STANDARD'] } },
          {
            path: 'billing/subscriptions/purchase',
            component: SubscriptionPurchaseComponent,
            canActivate: mapToCanActivate([SubscriptionPurchaseGuard]),
            data: { rolesAllowed: ['STORE_ADMIN'] }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})

export class StoresRoutingModule { }
