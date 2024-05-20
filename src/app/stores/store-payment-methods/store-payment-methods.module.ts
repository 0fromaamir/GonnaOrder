import { StorePaymentSquareComponent } from './store-payment-square/store-payment-square.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorePaymentMethodsComponent } from './store-payment-methods.component';
import { StorePaymentStripeComponent } from './store-payment-stripe/store-payment-stripe.component';
import { EffectsModule } from '@ngrx/effects';
import { StorePaymentEffects } from './+state/payment.effects';
import { StorePaymentMethodsRoutingModule } from './store-payment-methods-routing.module';
import { StorePaymentPaypalComponent } from './store-payment-paypal/store-payment-paypal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StorePaymentVivaComponent } from './store-payments-viva/store-payment-viva.component';
import { StorePaymentsenseComponent } from './store-payment-sense/store-payment-sense.component';
import { StorePaymentRmsComponent } from './store-payment-rms/store-payment-rms.component';
import { StorePaymentTrustpaymentsComponent } from './store-payment-trustpayments/store-payment-trustpayments.component';
import { StorePaymentJccComponent } from './store-payment-jcc/store-payment-jcc.component';
import { StorePaymentPayablComponent } from './store-payment-payabl/store-payment-payabl.component';
import { StorePaymentOthersComponent } from './store-payment-others/store-payment-others.component';
import { StorePaymentGlobalpayComponent } from './store-payment-globalpay/store-payment-globalpay.component';
import { StorePaymentMollieComponent } from './store-payment-mollie/store-payment-mollie.component';
import { StorePaymentFygaroComponent } from './store-payment-fygaro/store-payment-fygaro/store-payment-fygaro.component';
import { StorePaymentEpayComponent } from './store-payment-epay/store-payment-epay.component';
import { StorePaymentApcopayComponent } from './store-payment-apcopay/store-payment-apcopay.component';
import { StorePaymentHobexComponent } from './store-payment-hobex/store-payment-hobex.component';


@NgModule({
  declarations: [
    StorePaymentMethodsComponent,
    StorePaymentStripeComponent,
    StorePaymentPaypalComponent,
    StorePaymentSquareComponent,
    StorePaymentVivaComponent,
    StorePaymentsenseComponent,
    StorePaymentRmsComponent,
    StorePaymentTrustpaymentsComponent,
    StorePaymentJccComponent,
    StorePaymentPayablComponent,
    StorePaymentOthersComponent,
    StorePaymentGlobalpayComponent,
    StorePaymentMollieComponent,
    StorePaymentFygaroComponent,
    StorePaymentEpayComponent,
    StorePaymentApcopayComponent,
    StorePaymentHobexComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StorePaymentMethodsRoutingModule,
    EffectsModule.forFeature([StorePaymentEffects])
  ]
})
export class StorePaymentMethodsModule { }
