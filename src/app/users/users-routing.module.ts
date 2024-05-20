import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from '../layout/admin-layout/admin-layout.component';

import { LoggedInUserGuard } from '../admin/loggedinuser.guard';

import {UsersListGuard} from './users-list.guard';
import {UsersNavigationGuard} from './users-navigation.guard';
import {UsersViewGuard} from './users-view.guard';

import { UsersListComponent } from './users-list/users-list.component';
import { UserViewComponent } from './user-view/user-view.component';
import { mapToCanActivate, mapToCanActivateChild } from '../functional-guards';

const routes: Routes = [
  {
    path: 'users',
    component: AdminLayoutComponent,
    canActivate: mapToCanActivate([LoggedInUserGuard]),
    canActivateChild: mapToCanActivateChild([UsersNavigationGuard]),
    children: [
      {
        path: 'list',
        component: UsersListComponent,
        canActivate: mapToCanActivate([UsersListGuard]),
      },
      {
        path: ':id',
        component: UserViewComponent,
        canActivate: mapToCanActivate([UsersViewGuard]),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
