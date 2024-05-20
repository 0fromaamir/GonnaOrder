import { NgModule } from '@angular/core';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    StatusBar,
    FileOpener,
    Deeplinks,
    File
  ]
})
export class GoAppsCommunModule { }
