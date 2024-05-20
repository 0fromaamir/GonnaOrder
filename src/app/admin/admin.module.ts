import { NgModule } from '@angular/core';
import { adminAppMobuleImport } from './admin-app.module';
import { AdminCommonModule } from './admin-common.module';

@NgModule({
  declarations: [],
  imports: [
    AdminCommonModule,
    ...adminAppMobuleImport
  ]
})
export class AdminModule {

 }

