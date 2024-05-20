import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService } from '@abacritt/angularx-social-login';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { SocialAccountLoginDetails, UserRegistrationDetails } from 'src/app/api/types/User';
import { SocialLogin, SocialLoginFailed } from 'src/app/auth/+state/auth.actions';
import { AuthState } from 'src/app/auth/+state/auth.reducer';
import { LogService } from 'src/app/shared/logging/LogService';
import { environment as envConst } from 'src/environments/environment';

declare var AppleID: any;

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent implements OnInit, AfterViewInit {
  jwtHelper = new JwtHelperService();
  @Input() authType: string;
  stacked = false;
  @Output() submitEvent = new EventEmitter<UserRegistrationDetails>();
  eventsSubject: Subject<any> = new Subject<any>();
  isInvitationUser = false;
  iconViewBreakpoint = 768;
  sideSpacing = 57;
  iconMode = false;
  googleRendered = false;
  mode: string;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private translate: TranslateService,
    private authService: SocialAuthService,
    private logger: LogService,
    private store: Store<AuthState>,
    private el: ElementRef
  ) {
    const urlParams = new URLSearchParams(window.location.search);
    this.mode = urlParams.get('mode');
    this.stacked = !(this.mode == 'customer-login');
  }

  ngOnInit() {
    this.document.documentElement.lang = 'en';
    if (this.mode && this.mode.includes('invite')) {
      this.isInvitationUser = true;
    }
    if (!this.authType) {
      window.addEventListener(
        'message',
        (event) => {
          const { data } = event;
          if (data.logout !== null && data.logout !== undefined) {
            if (data.logout === true) {
              this.logout();
            }
          }
        },
        false
      );
    }

    this.authService.authState.subscribe({
      next: (user) => {
        if (user?.provider === GoogleLoginProvider.PROVIDER_ID) {
          user.authToken = user.idToken;
            window.parent.postMessage({ ...user, mode: this.mode }, document.referrer);
        }
      },
      error: (err) => {
        console.error('Authentication subscription error', err);
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkIconMode(), 10);
    setTimeout(() => this.initGoogle(), 50);
  }

  initGoogle(): void {
    if (this.googleRendered) {
      return;
    }
    this.renderGoogleButton();
    setTimeout(() => this.initGoogle(), 50);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIconMode();
    this.renderGoogleButton();
  }

  renderGoogleButton() {
    const element = document.getElementById('google-btn-tab');
    const width = element.offsetWidth + (this.stacked ? 0 : -5);
    this.eventsSubject.next([width, this.iconMode]);
  }

  markRendered() {
    this.googleRendered = true;
  }

  googleText() {
    return this.mode?.includes('registration') ? 'signup_with' : 'signin_with';
  }

  checkIconMode() {
    this.iconMode =
      !this.stacked &&
      this.el.nativeElement.offsetWidth > 0 &&
      this.el.nativeElement.offsetWidth < this.iconViewBreakpoint - this.sideSpacing;
  }


  facebookLoginAction() {
    const provider = FacebookLoginProvider.PROVIDER_ID;
    this.authService
      .signIn(provider)
      .then((user) => {
        user.provider = FacebookLoginProvider.PROVIDER_ID;
        window.parent.postMessage({...user, mode: this.mode}, document.referrer);
      })
      .catch((e) => {
        this.logger.error(`onSocialLogin error during sign-in with provider ${provider}`, e);
        if (this.authType === 'login') {
          this.store.dispatch(
            new SocialLoginFailed({
              src: 'UserLoginComponent',
              description: 'Facebook Login action failed',
            })
          );
        }
      });
  }

  async signInWithApple() {
    const redirectURI = window.location.href.split('?')[0];
    AppleID.auth.init({
      clientId: envConst.appleClientId,
      scope: 'name email',
      redirectURI,
      state: 'origin:web',
      usePopup: true,
    });

    let response;
    try {
      response = await AppleID.auth.signIn();
    } catch (err) {
      console.error(err);
      this.logger.error(`onSocialLogin error during sign-in with provider Apple`, err);
    }
    if (
      response &&
      response.authorization &&
      response.authorization.state === 'origin:web' &&
      response.authorization.id_token &&
      response.authorization.code
    ) {
      const appleToken = this.jwtHelper.decodeToken(response.authorization.id_token);
      const userName = response.user ? response.user : {};
      const socialAccountDetails: SocialAccountLoginDetails = {
        provider: 'apple',
        accessToken: response.authorization.id_token,
        appleCode: response.authorization.code,
        email: appleToken.email,
        firstName: userName?.name?.firstName,
        lastName: userName?.name?.lastName,
        
      };
      socialAccountDetails.mode = this.mode;
      window.parent.postMessage(socialAccountDetails, document.referrer);
    } else if (response && response.error) {
      console.error(response.error);
      this.logger.error(`onSocialLogin error during sign-in with provider Apple`, response.error);
      if (this.authType === 'login') {
        this.store.dispatch(
          new SocialLoginFailed({
            src: 'UserLoginComponent',
            description: 'Apple Login action failed',
          })
        );
      }
    }
  }

  onLocaleChange($event) {
    this.translate.use($event.locale);
  }

  logout() {
    this.authService
      .signOut(false)
      .then(() => console.log('Logged out Successfully !!'))
      .catch((err) => console.error(err));
  }
}
