import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule.withConfig({
      callSetDisabledState: 'whenDisabledForLegacyCode',
    }),
    ReactiveFormsModule.withConfig({
      callSetDisabledState: 'whenDisabledForLegacyCode',
    }),
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CommonFormModule {
}
