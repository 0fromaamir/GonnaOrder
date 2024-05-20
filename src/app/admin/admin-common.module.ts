import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@angular/cdk/layout';
import { MenuModule } from '../menu/menu.module';
import { AdminRoutingModule } from './admin-routing.module';
import { StoresModule } from '../stores/stores.module';
import { SharedModule } from '../shared/shared.module';
import { UsersModule } from '../users/users.module';
import { ApplicationStateModule } from '../application-state/application-state.module';
import { PlatformModule } from '@angular/cdk/platform';
import { AdminGlobalErrorComponent } from './admin-global-error/admin-global-error.component';

@NgModule({
  declarations: [AdminGlobalErrorComponent],
  imports: [
    CommonModule,
    LayoutModule,
    MenuModule,
    AdminRoutingModule,
    StoresModule,
    SharedModule,
    UsersModule,
    ApplicationStateModule,
    PlatformModule
  ]
})
export class AdminCommonModule { }
