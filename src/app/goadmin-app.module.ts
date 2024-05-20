import { NgModule } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';
import { GoAppsCommunModule } from './common-mobile-apps.module';
import { environment } from 'src/environments/environment';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Printer } from '@ionic-native/printer/ngx';

@NgModule({
  declarations: [],
  imports: [
    GoAppsCommunModule,
    IonicStorageModule.forRoot()
  ],
  providers: [
    FirebaseX,
    Printer,
  ]
})
export class GoAdminAppModule { }

export const goAdminAppImports = environment.mode === 'Admin' ? [
  GoAdminAppModule
] : [];