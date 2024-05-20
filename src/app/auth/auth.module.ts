import {ApiModule} from '../api/api.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {AuthRoutingModule} from './auth-routing.module';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {EffectsModule} from '@ngrx/effects';
import {AuthEffects} from './+state/auth.effects';
import {RegistrationLoginDetailsComponent} from './registration-login-details/registration-login-details.component';
import {EmailFormComponent} from './email-form/email-form.component';
import {AccountVerificationComponent} from './account-verification/account-verification.component';
import {PasswordResetComponent} from './password-reset/password-reset.component';
import {PasswordUpdateComponent} from './password-update/password-update.component';
import {SharedModule} from '../shared/shared.module';
import {HeaderComponent} from './header/header.component';
import {InvitationComponent} from './invitation/invitation.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import {PartnerRegistrationSuccessComponent} from './partner-registration-success/partner-registration-success.component';
import {RegisterSuccessComponent} from './register-success/register-success.component';
import {ResetSuccessComponent} from './reset-success/reset-success.component';
import {PartnerRegistrationComponent} from './partner-registration/partner-registration.component';
import {RegistrationLoginDetailsFormComponent} from './registration-login-details-form/registration-login-details-form.component';
import { RegistrationUserDetailsComponent } from './registration-user-details/registration-user-details.component';
import { RegistrationUserDetailsFormComponent } from './registration-user-details-form/registration-user-details-form.component';
import {PasswordAuthComponent} from './password-auth/password-auth.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegistrationLoginDetailsComponent,
    EmailFormComponent,
    AccountVerificationComponent,
    PasswordResetComponent,
    RegisterSuccessComponent,
    PartnerRegistrationComponent,
    ResetSuccessComponent,
    PasswordAuthComponent,
    PasswordUpdateComponent,
    InvitationComponent,
    HeaderComponent,
    PartnerRegistrationSuccessComponent,
    RegistrationLoginDetailsFormComponent,
    RegistrationUserDetailsComponent,
    RegistrationUserDetailsFormComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ApiModule,
    SharedModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatGridListModule,
    MatSelectModule,
    MatIconModule,
    EffectsModule.forFeature([AuthEffects]),
    EffectsModule.forFeature([AuthEffects])
  ],
  exports: [
    PasswordAuthComponent
  ]
})

export class AuthModule {
}
