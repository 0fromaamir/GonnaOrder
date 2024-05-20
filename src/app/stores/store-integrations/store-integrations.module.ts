import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreIntegrationsRoutingModule } from './store-integrations-routing.module';
import { StoreLastMileWrapperComponent } from './store-last-mile-wrapper/store-last-mile-wrapper.component';
import { StoreLastMileLoginComponent } from './store-last-mile-login/store-last-mile-login.component';
import { StoreLastMileMynextComponent } from './store-last-mile-mynext/store-last-mile-mynext.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreIntegrationsHubriseComponent } from './store-integrations-hubrise/store-integrations-hubrise.component';
import { StoreIntegrationsComponent } from './store-integrations.component';
import { StoreIntegrationsPowersoftComponent } from './store-integrations-powersoft/store-integrations-powersoft.component';
import { StoreIntegrationsShopifyComponent } from './store-integrations-shopify/store-integrations-shopify.component';
import { StoreIntegrationsCustomComponent } from './store-integrations-custom/store-integrations-custom.component';
import { StoreIntegrationsInstadeliveryComponent } from './store-integrations-instadelivery/store-integrations-instadelivery.component';
import { StoreIntegrationsFlexDeliveryComponent } from './store-integrations-flex-delivery/store-integrations-flex-delivery.component';
import { StoreIntegrationsEposdirectComponent } from './store-integrations-eposdirect/store-integrations-eposdirect.component';
import { StoreIntegrationsSunsoftComponent } from './store-integrations-sunsoft/store-integrations-sunsoft.component';
import { StoreIntegrationsEposnowComponent } from './store-integrations-eposnow/store-integrations-eposnow.component';
import { StoreIntegrationsPosterComponent } from './store-integrations-poster/store-integrations-poster.component';
import { StoreIntegrationsHitComponent } from './store-integrations-hit/store-integrations-hit.component';
import { StoreIntegrationsTwinComponent } from './store-integrations-twinsoft/store-integrations-twinsoft.component';


@NgModule({
  declarations: [
    StoreIntegrationsComponent,
    StoreLastMileWrapperComponent,
    StoreLastMileLoginComponent,
    StoreLastMileMynextComponent,
    StoreIntegrationsHubriseComponent,
    StoreIntegrationsPowersoftComponent,
    StoreIntegrationsTwinComponent,
    StoreIntegrationsShopifyComponent,
    StoreIntegrationsCustomComponent,
    StoreIntegrationsInstadeliveryComponent,
    StoreIntegrationsFlexDeliveryComponent,
    StoreIntegrationsEposdirectComponent,
    StoreIntegrationsSunsoftComponent,
    StoreIntegrationsEposnowComponent,
    StoreIntegrationsPosterComponent,
    StoreIntegrationsHitComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    StoreIntegrationsRoutingModule,
    ReactiveFormsModule
  ]
})
export class StoreIntegrationsModule { }
