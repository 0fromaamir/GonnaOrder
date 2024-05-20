import { NgModule } from '@angular/core';
import { PrintersModule } from 'src/app/printers/printers.module';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [],
  imports: [
    PrintersModule,
  ]
})
export class AdminAppModule { }

export const adminAppMobuleImport = (environment.mode === 'Admin') ? [
  AdminAppModule
] : [];