import { Router, ActivatedRoute } from '@angular/router';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { AuthState } from '../+state/auth.reducer';
import { Login, ResetPasswordInitial, SocialLogin, SocialLoginFailed } from '../+state/auth.actions';
import { Observable } from 'rxjs';
import { getInvalidCredentials, getSocialAccountLoginFailed } from '../+state/auth.selectors';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { RegistrationService } from '../registration.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/public/helper.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  invalidCredentials$: Observable<boolean>;
  socialAccountLoginFailed$: Observable<boolean>;
  userVerified = false;
  userPasswordReset = false;
  emailUpdated = false;
  userInvited = false;
  partnerVerified = false;
  storeName = '';
  hide = true;
  userLoginSrc: SafeResourceUrl;

  constructor(
    private fb: FormBuilder,
    private store: Store<AuthState>,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    private translate: TranslateService,
    private registrationService: RegistrationService, 
    public sanitizer: DomSanitizer,
    public helper: HelperService) { }


  ngOnInit() {
    this.userLoginSrc = this.sanitizer.bypassSecurityTrustResourceUrl(environment.adminHostURL + '/user-login?mode=admin-login');
    this.loginForm = this.fb.group({
      username: ['', Validators.compose([Validators.required, Validators.maxLength(254)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(100)])]
    });

    this.invalidCredentials$ = this.store.pipe(
      select(getInvalidCredentials)
    );

    this.socialAccountLoginFailed$ = this.store.pipe(
      select(getSocialAccountLoginFailed)
    );

    this.userVerified = this.route.snapshot.queryParams.token;
    this.userPasswordReset = this.route.snapshot.queryParams.resetPassword;
    this.emailUpdated = this.route.snapshot.queryParams.emailUpdated;
    this.userInvited = this.route.snapshot.queryParams.userInvited;
    this.storeName = this.route.snapshot.queryParams.storeName;
    this.partnerVerified = this.route.snapshot.queryParams.partnerVerified;

    this.document.documentElement.lang = 'en';
  }

  loginAction() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.store.dispatch(new Login(this.username.value, this.password.value));
    }
  }

  onLocaleChange($event) {
    this.translate.use($event.locale);
  }
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  goToRegistration() {
    this.registrationService.clearData();
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.store.dispatch(new ResetPasswordInitial());
    this.router.navigate(['/password/reset']);
  }

  get storeNameTraslationToken() {
    return { storeName: this.storeName };
  }
}
