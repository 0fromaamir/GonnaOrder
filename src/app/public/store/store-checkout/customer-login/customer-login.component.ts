import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { CustomerAuthService } from 'src/app/public/customer-auth.service';
import { HelperService } from 'src/app/public/helper.service';
import { CustomValidators } from 'src/app/shared/custom.validators';
import { environment } from 'src/environments/environment';
import { getSelectedStore } from '../../+state/stores.selectors';

@Component({
  selector: 'app-customer-login',
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.scss'],
})
export class CustomerLoginComponent implements OnInit, AfterViewInit {
  userLoginSrc: SafeResourceUrl;
  loyaltyEnabled = false;
  @ViewChild('emailLogin') emailLogin: TemplateRef<any>;
  emailPhase: 'login' | 'register' | 'verify' | 'change-password' | 'reset' = 'login';

  loginForm: FormGroup;
  registerResetForm: FormGroup;
  verifyForm: FormGroup;
  changePasswordForm: FormGroup;
  hide = true;
  loading = false;
  errorStatus: String;
  selectedStore;
  selectedStoreLocale: string;
  selectedStoreCurrency: string;
  selectedStoreCurrencySymbol: string;

  constructor(
    private fb: FormBuilder,
    private store: Store<any>,
    public customerAuthService: CustomerAuthService,
    public helper: HelperService,
    public sanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userLoginSrc = this.sanitizer.bypassSecurityTrustResourceUrl(environment.adminHostURL + '/user-login?mode=customer-login');

    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidators.email])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });

    this.registerResetForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, CustomValidators.email])],
    });

    this.verifyForm = this.fb.group({
      code: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])],
    });

    this.changePasswordForm = this.fb.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
    });

    this.store
      .select(getSelectedStore)
      .pipe(filter((selectedStore) => !!selectedStore))
      .subscribe((selectedStore) => {
        this.selectedStore = selectedStore;
        this.loyaltyEnabled = !!selectedStore.settings.LOYALTY_SCHEME;
        if (selectedStore?.address && selectedStore?.currency) {
          this.selectedStoreLocale = `${selectedStore.address.country.defaultLocale}-${selectedStore.address.country.code}`;
          this.selectedStoreCurrency = selectedStore.currency.isoCode;
          this.selectedStoreCurrencySymbol = selectedStore.currency.symbol;
        }
      });
  }

  ngAfterViewInit(): void {
    this.customerAuthService.checkCurrentSession();
  }

  isMobile() {
    return this.helper.isMobileApp();
  }

  logout() {
    this.customerAuthService.logout();
  }

  customerSocialSignIn(customerDetail: any) {
    console.log('customerSocialSignIn', customerDetail);  
  }

  openLoginDialog() {
    this.emailPhase = 'login';
    const dialogRef = this.dialog.open(this.emailLogin);
    dialogRef.afterClosed().subscribe(() => {
      this.loginForm.reset();
      this.registerResetForm.reset();
      this.verifyForm.reset();
      this.changePasswordForm.reset();
      this.errorStatus = null;
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  goto(phase) {
    this.emailPhase = phase;
    this.errorStatus = null;
  }

  login() {
    this.errorStatus = null;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.loading = true;
      this.customerAuthService.passwordLogin(
        { email: this.loginForm.value.email, password: this.loginForm.value.password },
        {
          onSuccess: () => {
            this.loading = false;
            this.closeDialog();
          },
          onError: this.onError,
        }
      );
    }
  }

  sendRegistrationCode() {
    this.errorStatus = null;
    if (this.registerResetForm.invalid) {
      this.registerResetForm.markAllAsTouched();
    } else {
      this.loading = true;
      this.customerAuthService.customerRegistration(
        { email: this.registerResetForm.value.email },
        {
          onSuccess: () => {
            this.loading = false;
            this.emailPhase = 'verify';
          },
          onError: this.onError,
        }
      );
    }
  }

  verifyCode() {
    this.errorStatus = null;
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
    } else {
      this.loading = true;
      this.customerAuthService.customerVerification(
        { email: this.registerResetForm.value.email, code: this.verifyForm.value.code },
        {
          onSuccess: () => {
            this.loading = false;
            this.emailPhase = 'change-password';
          },
          onError: this.onError,
        }
      );
    }
  }

  changePassword() {
    this.errorStatus = null;
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
    } else if (this.changePasswordForm.value.password !== this.changePasswordForm.value.confirmPassword) {
      this.changePasswordForm.get('confirmPassword').setErrors({ mismatch: true });
    } else {
      this.loading = true;
      this.customerAuthService.changePassword(
        { code: this.verifyForm.value.code, password: this.changePasswordForm.value.password },
        {
          onSuccess: () => {
            this.loading = false;
            this.closeDialog();
          },
          onError: this.onError,
        }
      );
    }
  }

  resetPassword() {
    this.errorStatus = null;
    if (this.registerResetForm.invalid) {
      this.registerResetForm.markAllAsTouched();
    } else {
      this.loading = true;
      this.customerAuthService.customerResetByCode(
        { email: this.registerResetForm.value.email },
        {
          onSuccess: () => {
            this.loading = false;
            this.emailPhase = 'verify';
          },
          onError: this.onError,
        }
      );
    }
  }

  onError = (error: any) => {
    this.loading = false;
    this.errorStatus = error.error?.status;
  };

}
