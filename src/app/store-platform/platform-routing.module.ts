import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlatformListComponent } from './platform-list/platform-list.component';
import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';
import { mapToCanActivate, mapToCanActivateChild } from '../functional-guards';
import { LoggedInUserGuard } from '../admin/loggedinuser.guard';
import { ChildPlatformComponent } from './child-platform/child-platform.component';
import { PlatformGuard } from './platform.guard';
import { TenantViewGuard } from './tenant-view.guard';
import { UserListComponent } from './user-list/user-list.component';
import { TenantUserViewGuard } from './tenant-user-view.guard';
import { PlatformNavigationGuard } from './platform-navigation.guard';


const routes: Routes = [
  { path: 'platform',
    component: AdminLayoutComponent,
    canActivate: mapToCanActivate([LoggedInUserGuard]),
    canActivateChild: mapToCanActivateChild([PlatformNavigationGuard]),
    children: [
      {
        path: 'tenants',
        component: PlatformListComponent,
        canActivate: mapToCanActivate([PlatformGuard])
      },
      {
        path: 'tenant/:tenantCode',
        component: ChildPlatformComponent,
        canActivate: mapToCanActivate([TenantViewGuard])
      },
      {
        path: 'tenant/:tenantCode/users',
        component: UserListComponent,
        canActivate: mapToCanActivate([TenantUserViewGuard])
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class PlatformRoutingModule { }
