import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentRoutingRoutingModule } from './payment-routing-routing.module';
import { VivaComponent } from './viva/viva.component';
import { SharedModule } from "../shared/shared.module";
import { FygaroComponent } from "./fygaro/fygaro.component";
import {EpayComponent} from "./epay/epay.component";

@NgModule({
  declarations: [
    VivaComponent,
    FygaroComponent,
    EpayComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PaymentRoutingRoutingModule
  ]
})
export class PaymentRoutingModule { }
