import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformRoutingModule } from './platform-routing.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlatformListComponent } from './platform-list/platform-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChildPlatformComponent } from './child-platform/child-platform.component';
import { platformInitialState, platformsReducer } from './+state/platform.reducer';
import { PlatformEffects } from './+state/platform.effects';
import { ColorPickerModule } from 'ngx-color-picker';
import { UserListComponent } from './user-list/user-list.component';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [PlatformListComponent, ChildPlatformComponent, UserListComponent],
  imports: [
    CommonModule,
    SharedModule,
    PlatformRoutingModule,
    StoreModule.forFeature('platform', platformsReducer, { initialState: platformInitialState }),
    EffectsModule.forFeature([PlatformEffects]),
    ColorPickerModule,
    MatDialogModule
  ],
  exports: [PlatformListComponent]
})
export class PlatformModule { }
