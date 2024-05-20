import {
  GetUser,
  AccountActionType,
  UpdateUser,
  UpdateUserEmail,
  UpdateUserFailed,
  GetUserSuccess,
  UpdateUserSuccess,
  GetUserFailed,
  ChangePassword,
  ChangePasswordSuccess,
  ChangePasswordFailed,
  LinkSocialAccount,
  LinkSocialAccountSuccess,
  LinkSocialAccountFailed,
  SendEmail,
  SendEmailSuccess,
  SendEmailFailed,
  DeleteUser,
  DeleteUserSuccess,
  DeleteUserFailed,
  CreatePassword,
  CreatePasswordSuccess,
  CreatePasswordFailed
} from './account.actions';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import {switchMap, mergeMap, catchError, map, tap, withLatestFrom} from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Store, select} from '@ngrx/store';
import { User } from '../../stores/stores';
import { TranslateService } from '@ngx-translate/core';
import { getUserId } from 'src/app/auth/+state/auth.selectors';
import { getSelectedStore } from 'src/app/stores/+state/stores.selectors';

@Injectable()
export class AccountEffects {

    constructor(
        private actions$: Actions,
        private accountService: AccountService,
        private store: Store<User>,
        private toastr: ToastrService,
        private router: Router,
        private translateSer: TranslateService) { }


    onGetUser = createEffect(() => this.actions$.pipe(
        ofType<GetUser>(AccountActionType.GetUser),
        switchMap(action => this.accountService.get()
        .pipe(
            map(u => new GetUserSuccess(u)),
            catchError(a => of(new GetUserFailed()))
        ))
    ));


    onGetUserFailed = createEffect(() => this.actions$.pipe(
        ofType<GetUserFailed>(AccountActionType.GetUserFailed),
        tap(a =>  this.toastr.error('We could not load your profile. Please try again later', 'An error occured!'))
    ), {dispatch: false});


    onUpdateUser = createEffect(() => this.actions$.pipe(
        ofType<UpdateUser>(AccountActionType.UpdateUser),
        switchMap(action =>
            this.accountService.update(action.user).pipe(
                mergeMap(u => {
                    const actions = [];
                    actions.push(new UpdateUserSuccess(u));
                    if (u.email !== action.user.email) {
                        actions.push(new UpdateUserEmail());
                    }
                    return actions;
                }),
                catchError(e => {
                    if (e.status === 400) {
                      return of(new UpdateUserFailed(e.error.errors.map(err => err.message)));
                    }
                    return of(new UpdateUserFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
                })
        ))
    ));


    onUserUpdated = createEffect(() => this.actions$.pipe(
        ofType<UpdateUserSuccess>(AccountActionType.UpdateUserSuccess),
        tap(a => this.router.navigate(['/manager']))
    ), {dispatch: false});


    onEmailUpdated = createEffect(() => this.actions$.pipe(
        ofType<UpdateUserEmail>(AccountActionType.UpdateUserEmail),
        tap(a =>  this.toastr.success(this.translateSer.instant('admin.store.message.receiveEmailMsg'), this.translateSer.instant('admin.store.message.profileUpdate')))
    ), {dispatch: false});


    onDeleteUser = createEffect(() => this.actions$.pipe(
        ofType<DeleteUser>(AccountActionType.DeleteUser),
        switchMap(action => {
            return this.accountService.deleteUser(action.userId)
          .pipe(
            map(() => new DeleteUserSuccess()
            ),
            catchError(() => {
                return of(new DeleteUserFailed());
            })
          ); }
        )
      ));

    onDeleteUserSuccess = createEffect(() =>  this.actions$.pipe(
        ofType<DeleteUserSuccess>(AccountActionType.DeleteUserSuccess),
        tap(() => {
            this.toastr.success(this.translateSer.instant('admin.store.account.deleteUserSuccess'));
            return this.router.navigate(['/login']);
        }),
      ), {dispatch: false});


    onDeleteuserFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteUserFailed>(AccountActionType.DeleteUserFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.message.acessRemoveFail')))
    ), { dispatch: false });


    onChangePassword = createEffect(() => this.actions$.pipe(
        ofType<ChangePassword>(AccountActionType.ChangePassword),
        switchMap(action => this.accountService.changePassword(action.password, action.newPassword)
            .pipe(
                map(u => new ChangePasswordSuccess()),
                catchError(e => {
                    if (e.status === 400) {
                      return of(new ChangePasswordFailed(e.error.errors.map(err => err.message)));
                    }
                    return of(new ChangePasswordFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
                })
        ))
    ));


    onPasswordChanged = createEffect(() => this.actions$.pipe(
        ofType<ChangePasswordSuccess>(AccountActionType.ChangePasswordSuccess),
        tap(a => this.router.navigate(['/manager']))
    ), {dispatch: false});


    onCreatePassword = createEffect(() => this.actions$.pipe(
      ofType<CreatePassword>(AccountActionType.CreatePassword),
      switchMap(action => this.accountService.createPassword(action.newPassword)
        .pipe(
          map(u => new CreatePasswordSuccess()),
          catchError(e => {
            if (e.status === 400) {
              return of(new CreatePasswordFailed(e.error.errors.map(err => err.message)));
            }
            return of(new CreatePasswordFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
          })
        ))
    ));


    onPasswordCreated = createEffect(() => this.actions$.pipe(
      ofType<CreatePasswordSuccess>(AccountActionType.CreatePasswordSuccess),
      tap(a => this.router.navigate(['/manager']))
    ), {dispatch: false});


    onLinkSocialAccount = createEffect(() => this.actions$.pipe(
        ofType<LinkSocialAccount>(AccountActionType.LinkSocialAccount),
        switchMap(action => this.accountService.linkSocialAccount(action.accessToken, action.authProvider, action.appleCode)
            .pipe(
                mergeMap(_ => {
                    const actions = [];
                    actions.push(new LinkSocialAccountSuccess());
                    return actions;
                }),
                catchError(e => {
                    if (e.status === 400 || e.status === 409) {
                        return of(new LinkSocialAccountFailed(e.error.errors.map(err => err.message)));
                    }
                    return of(new LinkSocialAccountFailed(e.error.errors.map(err => err.message)));
                })
        ))
    ));


    onSocialAccountLinked = createEffect(() => this.actions$.pipe(
        ofType<LinkSocialAccountSuccess>(AccountActionType.LinkSocialAccountSuccess),
        tap(() => this.toastr.success(this.translateSer.instant('admin.account.social.link.success'))),
        map(() => this.store.dispatch(new GetUser()))
    ), {dispatch: false});


    onSocialAccountLinkFailed = createEffect(() => this.actions$.pipe(
        ofType<LinkSocialAccountFailed>(AccountActionType.LinkSocialAccountFailed),
        tap(a =>  a.errors.forEach( e => this.toastr.error(e, this.translateSer.instant('admin.alerts.errorOccured') )))
    ), {dispatch: false});


    onSendEmail = createEffect(() => this.actions$.pipe(
        ofType<SendEmail>(AccountActionType.SendEmail),
        withLatestFrom(this.store.pipe(select(getUserId)), this.store.pipe(select(getSelectedStore))),
        switchMap(([action, userId, store]) =>
        this.accountService.sendEmail(userId, action.message, store.id).pipe(
            map(u => new SendEmailSuccess()),
            catchError(e => {
                if (e.status === 400) {
                    return of(new SendEmailFailed(e.error.errors.map(err => err.message)));
                }
                return of(new SendEmailFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
            })
        ))
    ));


    onSendEmailSuccess = createEffect(() => this.actions$.pipe(
        ofType<SendEmailSuccess>(AccountActionType.SendEmailSuccess),
        tap(a => this.router.navigate(['/manager/user/thankyou']))
    ), {dispatch: false});


    onSendEmailFailed = createEffect(() => this.actions$.pipe(
        ofType<SendEmailFailed>(AccountActionType.SendEmailFailed),
        tap(a =>  a.errors.forEach( e => this.toastr.error(e, this.translateSer.instant('admin.alerts.errorOccured') )))
    ), {dispatch: false});

}
