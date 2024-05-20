import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import {
  Login,
  AuthActionType,
  LoginSuccess,
  LoginFailed,
  Register,
  RegisterSuccess,
  RegisterFailed,
  VerifyAccount,
  VerifyAccountSuccess,
  VerifyAccountFailed,
  ResetPassword,
  ResetPasswordSuccess,
  ResetPasswordFailed,
  UpdatePassword,
  UpdatePasswordSuccess,
  UpdatePasswordFailed,
  Logout,
  LogoutSuccess,
  LogoutFailed,
  RegisterByInvitation,
  RegisterByInvitationSuccess,
  RegisterByInvitationFailed,
  FetchLoggedInUser,
  FetchLoggedInUserSuccess,
  FetchLoggedInUserFailed,
  PasswordAuth,
  PasswordAuthSuccess,
  PasswordAuthFailed,
  RegisterPartner,
  RegisterPartnerSuccess,
  RegisterPartnerFailed,
  SocialLogin,
  SocialLoginFailed,
  RegisterLoginDetails,
  RegisterPartnerLoginDetails,
  PartnerSocialLogin, InvitationSocialLogin, RegisterByInvitationLoginDetails,
  GetLocationInfo,
  GetLocationInfoSuccess,
  GetLocationInfoFailed,
} from './auth.actions';
import { switchMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { getPasswordUpdate } from './auth.selectors';
import { ToastrService } from 'ngx-toastr';
import { RegistrationService } from '../registration.service';
import { Event } from 'src/app/stores/event';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { EventHelper } from 'src/app/shared/event.helper';

@Injectable()
export class AuthEffects {

  eventHelper = new EventHelper('AuthEffects');

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private socialAuthService: SocialAuthService,
    private router: Router,
    private store: Store<AuthState>,
    private translateService: TranslateService,
    private toastr: ToastrService,
    private registrationService: RegistrationService) { }

  
  login = createEffect(() => this.actions$.pipe(
    ofType<Login>(AuthActionType.Login),
    switchMap(action =>
      this.authService.login(action.username, action.password)
      .pipe(
        map(t => new LoginSuccess(t)),
        catchError(a => of(new LoginFailed()))
      ))
  ));

  
  loginSuccess = createEffect(() => this.actions$.pipe(
    ofType<LoginSuccess>(AuthActionType.LoginSuccess),
    tap(_ => this.router.navigate(['/manager']))
  ), {dispatch: false});

  
  socialLogin = createEffect(() => this.actions$.pipe(
    ofType<SocialLogin>(AuthActionType.SocialLogin),
    switchMap(action => this.doSocialLogin(action, details => new RegisterLoginDetails(details)))
  ));

  
  partnerSocialLogin = createEffect(() => this.actions$.pipe(
    ofType<PartnerSocialLogin>(AuthActionType.PartnerSocialLogin),
    switchMap(action => this.doSocialLogin(action, details => new RegisterPartnerLoginDetails(details)))
  ));

  
  invitationSocialLogin = createEffect(() => this.actions$.pipe(
    ofType<InvitationSocialLogin>(AuthActionType.InvitationSocialLogin),
    switchMap(action =>
      this.doSocialLogin(action, details => new RegisterByInvitationLoginDetails(details, action.token, action.store)))
  ));

  
  passwordAuth = createEffect(() => this.actions$.pipe(
    ofType<PasswordAuth>(AuthActionType.PasswordAuth),
    switchMap(action =>
      this.authService.login(action.username, action.password)
      .pipe(
        map(t => new PasswordAuthSuccess(t)),
        catchError(a => of(new PasswordAuthFailed()))
      ))
  ));
  
  passwordAuthSuccess = createEffect(() => this.actions$.pipe(
    ofType<PasswordAuthSuccess>(AuthActionType.PasswordAuthSuccess),
    tap(_ => this.authService.usersPasswordAuth = true)
  ), {dispatch: false});
  
  passwordAuthFailed = createEffect(() => this.actions$.pipe(
    ofType<PasswordAuthFailed>(AuthActionType.PasswordAuthFailed),
    tap(_ => this.authService.usersPasswordAuth = false)
  ), {dispatch: false});

  
  logout = createEffect(() => this.actions$.pipe(
    ofType<Logout>(AuthActionType.Logout),
    switchMap(action =>
      this.authService.logout()
      .pipe(
        tap(()=> this.socialAuthService.signOut().catch(() => {})),
        map(_ => new LogoutSuccess(this.eventHelper.getEvent(action, 'Logout successfull'))),
        catchError(_ => of(new LogoutFailed()))
      )
    )
  ));
  
  logoutSuccess = createEffect(() => this.actions$.pipe(
    ofType<LogoutSuccess>(AuthActionType.LogoutSuccess),
    tap(_ => this.router.navigate(['/login']))
  ), {dispatch: false});

  
  verify = createEffect(() => this.actions$.pipe(
    ofType<VerifyAccount>(AuthActionType.VerifyAccount),
    switchMap(action =>
      this.authService.verify(action.email)
      .pipe(
        map(t => new VerifyAccountSuccess()),
        catchError(a => of(new VerifyAccountFailed()))
      ))
  ));

  
  register = createEffect(() => this.actions$.pipe(
    ofType<Register>(AuthActionType.Register),
    switchMap(action =>
      this.authService.register(action.registration)
      .pipe(
        map(t => {
          if (!!action.registration.social) {
            return new SocialLogin(action.registration.social, this.eventHelper.getEvent(action, 'Social register successfull'));
          } else {
            return new RegisterSuccess();
          }
        }),
        catchError(e => {
          return of(new RegisterFailed(e.error.errors.map(err => err.message)));
        })
      ))
  ));

  
  registerLoginDetails = createEffect(() => this.actions$.pipe(
    ofType<RegisterLoginDetails>(AuthActionType.RegisterLoginDetails),
    map(action => this.registrationService.updateRegistrationData(action.registration)),
    tap(_ => this.router.navigate(['/register-user-details']))
  ), {dispatch: false});

  
  registerPartnerLoginDetails = createEffect(() => this.actions$.pipe(
    ofType<RegisterPartnerLoginDetails>(AuthActionType.RegisterPartnerLoginDetails),
    map(action => this.registrationService.updatePartnerRegistrationData(action.registration)),
    tap(_ => this.router.navigate(['/register-user-details']))
  ), {dispatch: false});

  
  registerByInvitationLoginDetails = createEffect(() => this.actions$.pipe(
    ofType<RegisterByInvitationLoginDetails>(AuthActionType.RegisterByInvitationLoginDetails),
    map(action => this.registrationService.updateRegistrationByInvitationData(action.registration, action.token, action.store)),
    tap(_ => this.router.navigate(['/register-user-details']))
  ), {dispatch: false});

  
  onRegisterSuccess = createEffect(() => this.actions$.pipe(
    ofType<RegisterSuccess>(AuthActionType.RegisterSuccess),
    map(_ => this.registrationService.clearData()),
    tap(a => this.router.navigate(['/register/success']))
  ), {dispatch: false});

  
  registerByInvitation = createEffect(() => this.actions$.pipe(
    ofType<RegisterByInvitation>(AuthActionType.RegisterByInvitation),
    switchMap(action =>
      this.authService.registerByInvitation(action.registration, action.token)
      .pipe(
        map(s => new RegisterByInvitationSuccess(s)),
        catchError(e => {
          return of(new RegisterByInvitationFailed(e.error.errors.map(err => err.message)));
        })
      ))
  ));

  
  registerByInvitationSuccess = createEffect(() => this.actions$.pipe(
    ofType<RegisterByInvitationSuccess>(AuthActionType.RegisterByInvitationSuccess),
    map(a => {
      this.registrationService.clearData();
      return new LoginSuccess(a.loginResponse);
    })
  ));

  
  registerByInvitationFailed = createEffect(() => this.actions$.pipe(
    ofType<RegisterByInvitationFailed>(AuthActionType.RegisterByInvitationFailed),
    tap(a => a.errors.forEach(e => this.toastr.error(e, this.translateService.instant('admin.store.message.actionFail'))))
  ), {dispatch: false});

  
  resetPassword = createEffect(() => this.actions$.pipe(
    ofType<ResetPassword>(AuthActionType.ResetPassword),
    switchMap(action =>
      this.authService.resetPassword(action.email)
      .pipe(
        map(t => new ResetPasswordSuccess()),
        catchError(e => {
          const errors = e.error.errors.map(err => err.message);
          if (errors.filter(err => err.includes('User with email'))) {
            return of(new ResetPasswordFailed('User with email does not exist in the system'));
          } else if (e.status === 400) {
            return of(new ResetPasswordFailed(errors.join()));
          }
          return of(new ResetPasswordFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
        })
      ))
  ));

  
  onResetPasswordSuccess = createEffect(() => this.actions$.pipe(
    ofType<ResetPasswordSuccess>(AuthActionType.ResetPasswordSuccess),
    tap(a => this.router.navigate(['/password/reset/success']))
  ), {dispatch: false});

  
  updatePassword = createEffect(() => this.actions$.pipe(
    ofType<UpdatePassword>(AuthActionType.UpdatePassword),
    withLatestFrom(this.store.pipe(select(getPasswordUpdate), map(s => s.token))),
    switchMap(([action, token]) =>
      this.authService.updatePassword(action.password, token)
      .pipe(
        map(t => new UpdatePasswordSuccess()),
        catchError(e => {
          if (e.error.status === 400) {
            return of(new UpdatePasswordFailed(e.error.errors[0].message));
          }
          return of(new UpdatePasswordFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
        })
      ))
  ));

  
  updatePasswordSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdatePasswordSuccess>(AuthActionType.UpdatePasswordSuccess),
    tap(_ => this.router.navigate(['/login'], {queryParams: {resetPassword: true}}))
  ), {dispatch: false});

  
  fetchLoggedInUser = createEffect(() => this.actions$.pipe(
    ofType<FetchLoggedInUser>(AuthActionType.FetchLoggedInUser),
    switchMap(action =>
      this.authService.fetchLoggedInUser()
      .pipe(
        map(t => new FetchLoggedInUserSuccess(t)),
        catchError(e => of(new FetchLoggedInUserFailed((!!e.error && !!e.error.errors) ? e.error.errors.map(err => err.message) : '')))
      ))
  ));

  
  fetchLoggedInUserSuccess = createEffect(() => this.actions$.pipe(
    ofType<FetchLoggedInUserSuccess>(AuthActionType.FetchLoggedInUserSuccess),
    tap(u => {
      if (this.translateService.getLangs().includes(u.loggedInUser.preferredLanguage.locale)) {
        this.translateService.use(u.loggedInUser.preferredLanguage.locale);
      } else {
        this.translateService.use('en');
      }
    })
  ), {dispatch: false});

  
  registerPartner = createEffect(() => this.actions$.pipe(
    ofType<RegisterPartner>(AuthActionType.RegisterPartner),
    switchMap(action =>
      this.authService.registerPartner(action.registration)
      .pipe(
        map(t => {
          if (!!action.registration.social) {
            return new SocialLogin(action.registration.social, this.eventHelper.getEvent(action, 'Social partner register successfull'));
          } else {
            return new RegisterPartnerSuccess();
          }
        }),
        catchError(e => {
          return of(new RegisterPartnerFailed(e.error.errors.map(err => err.message)));
        })
      ))
  ));

  
  registerPartnerSuccess = createEffect(() => this.actions$.pipe(
    ofType<RegisterPartnerSuccess>(AuthActionType.RegisterPartnerSuccess),
    map(_ => this.registrationService.clearData()),
    tap(a => this.router.navigate(['/partners/success']))
  ), {dispatch: false});

  
  getLocationInfo = createEffect(() => this.actions$.pipe(
    ofType<GetLocationInfo>(AuthActionType.GetLocationInfo),
    switchMap(_ =>
      this.authService.getLocationInfo()
      .pipe(
        map(locationInfo => {
          return new GetLocationInfoSuccess(locationInfo);
        }),
        catchError(e => of(new GetLocationInfoFailed((!!e.error && !!e.error.errors) ? e.error.errors.map(err => err.message) : '')))
      ))
  ));

  private doSocialLogin(action, redirectUsingDetails) {
    return this.authService.socialLogin(action.login.accessToken, action.login.provider.toLowerCase(), action.login.appleCode)
      .pipe(
        map(t => new LoginSuccess(t)),
        catchError(a => {
          if (a.status === 302) {
            // redirect to registration
            const details = {
              email: action.login.email,
              firstName: action.login.firstName,
              lastName: action.login.lastName,
              social: action.login
            };
            return of(redirectUsingDetails(details));
          }
          return of(new SocialLoginFailed(this.eventHelper.getEvent(action, 'Social Login failed')));
        })
      );
  }
}
