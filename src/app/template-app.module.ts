import { NgModule } from '@angular/core';
import { GoAppsCommunModule } from './common-mobile-apps.module';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [],
  imports: [
    GoAppsCommunModule
  ]
})
export class GoTemplateAppModule { }

export const goTemplateAppImports = environment.mode === 'Template' ? [
  GoTemplateAppModule
] : [];
