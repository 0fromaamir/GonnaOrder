import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AuthState } from './+state/auth.reducer';
import { getTokens } from './+state/auth.selectors';
import { SocialAccountLoginDetails, UserRegistrationDetails } from './../api/types/User';
import { LoggedInUser, LoginResponse } from './auth';
import { InvitationSocialLogin, PartnerSocialLogin, SocialLogin } from './+state/auth.actions';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isRefreshToken = false;
  private passwordAuthUsers = false;
  private passwordAuthSub = new Subject<any>();
  constructor(private http: HttpClient, private route: ActivatedRoute, private store: Store<AuthState>) {
    this.onInit();
  }

  private onInit(): void {
    this.listenToLoginEvents();
  }

  private listenToLoginEvents() {
    window.addEventListener(
      'message',
      (event) => {
        const { data } = event;
        if (data?.mode === 'admin-login') {
          this.adminLogin(data);
        }

        if (data?.mode?.includes('registration')) {
          this.adminRegistration(data);
        }
      },
      false
    );
  }

  adminLogin(data: any) {
    if (data?.email) {
      const socialAccountDetails: SocialAccountLoginDetails = {
        provider: data.provider,
        accessToken: data.idToken ?? data.authToken ?? data.accessToken,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      this.store.dispatch(
        new SocialLogin(socialAccountDetails, {
          src: 'AuthService',
          description: 'Admin login event',
        })
      );
    }
  }

  adminRegistration(data: any) {
    if (data?.email) {
      const userRegistrationDetails: UserRegistrationDetails = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: undefined,
        social: {
          provider: data.provider,
          accessToken: data.idToken ?? data.authToken ?? data.accessToken,
          appleCode: data.appleCode,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName
        }
      };

      switch (data.mode) {
        case 'admin-registration':
          this.adminSocialRegistration(userRegistrationDetails);
          break;
        case 'partner-registration':
          this.partnerRegistration(userRegistrationDetails);
          break;
        case 'invite-registration':
          this.invitationRegistration(userRegistrationDetails);
          break;
      }
    }
  }

  private adminSocialRegistration(userSubmit: UserRegistrationDetails) {
    this.store.dispatch(new SocialLogin(userSubmit.social));
  }

  private partnerRegistration(userRegistrationDetails: UserRegistrationDetails) {
    this.store.dispatch(new PartnerSocialLogin(userRegistrationDetails.social));
  }

  private invitationRegistration(invUser: UserRegistrationDetails) {
    const token = this.route.snapshot.queryParams.token;
    const store = this.route.snapshot.queryParams.store;
    this.store.dispatch(new InvitationSocialLogin(invUser.social, token, store));
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/login', { username, password });
  }

  socialLogin(accessToken: string, authProvider: string, appleCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`/api/v1/auth/login/${authProvider}`, { accessToken, appleCode });
  }

  register(data: UserRegistrationDetails): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/register', data);
  }

  registerPartner(data: UserRegistrationDetails): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/register/partner', data);
  }

  registerByInvitation(data: UserRegistrationDetails, token: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/register/invitation', { ...data, token });
  }

  verify(email: string): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/email/verify', email);
  }

  activate(token: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/email/activate', token);
  }

  activatePartner(token: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/v1/auth/partner/activate', token);
  }

  resetPassword(email: string): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/password/reset', email);
  }

  verifyToken(token: string, type: string): Observable<string> {
    return this.http.get<string>(`/api/v1/auth/token/verify?token=${token}&type=${type}`, { responseType: 'text' as 'json' });
  }

  updatePassword(password: string, token: string): Observable<{}> {
    return this.http.post<{}>('/api/v1/auth/password/update', { password, token });
  }

  logout() {
    return this.http.post<any>('/api/v1/auth/logout', {});
  }

  isLoggedIn(): Observable<boolean> {
    return this.store.select(getTokens).pipe(
      first(),
      map((tokens) => !!tokens.jwt)
    );
  }

  refreshToken(refreshToken: string) {
    return this.http.post<any>('/api/v1/auth/token/refresh', refreshToken);
  }

  get isRefreshingToken() {
    return this.isRefreshToken;
  }
  set isRefreshingToken(isrefreshToken: boolean) {
    this.isRefreshToken = isrefreshToken;
  }

  get usersPasswordAuth() {
    return this.passwordAuthUsers;
  }
  set usersPasswordAuth(passAuth: boolean) {
    this.passwordAuthUsers = passAuth;
    this.passwordAuthSub.next(this.passwordAuthUsers);
  }
  getPasswordAuth(): Observable<any> {
    return this.passwordAuthSub.asObservable();
  }
  fetchLoggedInUser(): Observable<LoggedInUser> {
    return this.http.get<LoggedInUser>('/api/v1/auth/currentuser');
  }
  getLocationInfo(): Observable<any> {
    return this.http.get<any>('https://freeipapi.com/api/json');
  }
}
