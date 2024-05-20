import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { Router } from '@angular/router';
import { UserRegistrationDetails } from 'src/app/api/types/User';
import { RegistrationService } from '../registration.service';
import { WhitelabelService } from "../../shared/whitelabel.service";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/public/helper.service';

@Component({
  selector: 'app-registration-login-details-form',
  templateUrl: './registration-login-details-form.component.html',
  styleUrls: ['./registration-login-details-form.component.scss']
})

export class RegistrationLoginDetailsFormComponent implements OnInit, OnDestroy {

  @Input() newLoginDetails: UserRegistrationDetails;
  @Input() mode = '';
  @Input() languageId: any;
  @Output() submitEvent = new EventEmitter<UserRegistrationDetails>();
  @Input() registration = false;
  @Input() registerOption: string;
  registerForm: FormGroup;
  passwordHide = true;
  whiteLabelName = '';
  userLoginSrc: SafeResourceUrl;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registrationService: RegistrationService,
    private whitelabelService: WhitelabelService, 
    public sanitizer: DomSanitizer,
    public helper: HelperService
    ) {
  }

  ngOnInit() {
    switch (this.registerOption) {
      case 'partner':
        this.userLoginSrc = this.sanitizer.bypassSecurityTrustResourceUrl(environment.adminHostURL + '/user-login?mode=partner-registration');
        break;
      case 'invite':
        this.userLoginSrc = this.sanitizer.bypassSecurityTrustResourceUrl(environment.adminHostURL + '/user-login?mode=invite-registration');
        break;
      default:
        this.userLoginSrc = this.sanitizer.bypassSecurityTrustResourceUrl(environment.adminHostURL + '/user-login?mode=admin-registration');
    }

    this.registerForm = this.fb.group({
      email: [
        {
          value: this.newLoginDetails.email, disabled: this.mode === 'INVITE'
        },
        Validators.compose([CustomValidators.required, CustomValidators.email, Validators.maxLength(254)])
      ],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])],
    });
    this.registrationService.addHubspotScriptForAdminRegisterPage();
    this.whiteLabelName = this.whitelabelService.getWhiteLabelName();
  }


  goToLogin() {
    this.router.navigate(['/login']);
  }

  registerFormAction() {
    if (this.registerForm.invalid) {
      this.registerForm.get('email').markAsTouched();
      this.registerForm.get('password').markAsTouched();
    }
    else {
      const userRegistrationDetails: {
        email,
        password
      } = Object.assign({}, this.registerForm.getRawValue());

      const userSubmit: UserRegistrationDetails = {
        email: userRegistrationDetails.email,
        password: userRegistrationDetails.password,
        social: undefined
      };

      this.submitEvent.emit(userSubmit);
    }
  }

  registerSocialSignIn(userRegistrationDetails) {
    this.submitEvent.emit(userRegistrationDetails);
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }


  ngOnDestroy() {
    this.registrationService.removeHubspotScriptForAdminRegisterPage();
  }
}
