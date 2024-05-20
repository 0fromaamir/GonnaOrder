import { NgModule } from '@angular/core';
import { GoAppsCommunModule } from './common-mobile-apps.module';
import { environment } from 'src/environments/environment';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@NgModule({
  declarations: [],
  imports: [
    GoAppsCommunModule
  ],
  providers: [
    Keyboard
  ]
})
export class GoAppModule { }

export const goAppImports = environment.mode === 'Customer' ? [
  GoAppModule
] : [];