import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, tap, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { LocalStorageService } from 'src/app/local-storage.service';

import {
  LoadTenants,
  LoadTenantsSuccess,
  LoadTenantsFailed,
  PlatformActionType,
  CreateTenant,
  CreateTenantSuccess,
  CreateTenantFailed,
  LoadSelectedTenant,
  LoadSelectedTenantSuccess,
  LoadSelectedTenantFailed,
  UpdateTenant,
  UpdateTenantSuccess,
  UpdateTenantFailed,
  DownloadTenantLogo,
  DownloadTenantLogoSuccess,
  DownloadTenantLogoFailed,
  InviteTenantUser,
  InviteTenantUserSuccess,
  InviteTenantUserFailed,
  LoadTenantUsers,
  LoadTenantUsersSuccess,
  LoadTenantUsersFailed,
  RevokeTenantUserAccessSuccess,
  RevokeTenantUserAccess,
  RevokeTenantUserAccessFailed,
  DeleteTanentLogo,
  DeleteTanentLogoSuccess,
  DeleteTanentLogoFailed,
} from './platform.actions';
import { PlatformService } from '../platform.service';


@Injectable()
export class PlatformEffects {

  constructor(
    private actions$: Actions,
    private platformService: PlatformService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private router: Router,
    private translateSer: TranslateService,
  ) { }

  
  onLoadTenants = createEffect(() => this.actions$.pipe(
    ofType<LoadTenants>(PlatformActionType.LoadTenants),
    switchMap(action => this.platformService.getTenants(action.paging)
    .pipe(
      map(s => new LoadTenantsSuccess(s)),
      catchError(e => {
        if (e.status === 400) {
          return of(new LoadTenantsFailed(e.error.errors.map(err => err.message)));
        }
        return of(new LoadTenantsFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
      })
    ))
  ));

  onLoadTenantsFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadTenantsFailed>(PlatformActionType.LoadTenantsFailed),
    tap(a => this.toastr.error(a.error)),
    tap(a => this.router.navigateByUrl('/manager/stores/list'))
  ), { dispatch : false })

  onCreateTenant = createEffect(() => this.actions$.pipe(
    ofType<CreateTenant>(PlatformActionType.CreateTenant),
    switchMap(action => this.platformService.createTenant(action.tenant)
    .pipe(
      map(s => new CreateTenantSuccess()),
      catchError(e => {
        if (e.error.errors[0].code === 'TENANT_ALREADY_EXIST') {
          return of(new CreateTenantFailed(e.error.errors[0].message));
        }
        return of(new CreateTenantFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
      })
    ))
  ));

  onCreateTenantSuccess = createEffect(() => this.actions$.pipe(
    ofType<CreateTenantSuccess>(PlatformActionType.CreateTenantSuccess),
    tap(() => this.toastr.success("Settings Updated!")),
    tap(() => this.router.navigate(['/manager/platform/tenants']))
  ), { dispatch: false });

  onCreateTenantFailed = createEffect(() => this.actions$.pipe(
    ofType<CreateTenantFailed>(PlatformActionType.CreateTenantFailed),
    tap(a =>
      this.toastr.error(a.error)
    ),
  ), {dispatch: false})

  onLoadSelectedTenant = createEffect(() => this.actions$.pipe(
    ofType<LoadSelectedTenant>(PlatformActionType.LoadSelectedTenant),
    switchMap(action => this.platformService.getSelectedTenant(action.tenantCode)
    .pipe(
      map(s => new LoadSelectedTenantSuccess(s)),
      catchError(e => {
        if (e.status === 400) {
          return of(new LoadSelectedTenantFailed(e.error.errors.map(err => err.message)));
        }
        return of(new LoadSelectedTenantFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
      })
    ))
  ));

  onUpdateTenant = createEffect(() => this.actions$.pipe(
    ofType<UpdateTenant>(PlatformActionType.UpdateTenant),
    switchMap(action => this.platformService.updateTenant(action.tenantCode,action.tenant, action.file)
    .pipe(
      map(s => new UpdateTenantSuccess()),
      catchError(e => {
        if (e.status === 400) {
          return of(new UpdateTenantFailed(e.error.errors.map(err => err.message)));
        }
        return of(new UpdateTenantFailed(this.translateService.instant('admin.store.message.errorTryAgain')));
      })
    ))
  ));

  onUpdateTenantSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateTenantSuccess>(PlatformActionType.UpdateTenantSuccess),
    tap(() => this.toastr.success("Settings Updated!")),
    tap(() => this.router.navigate(['/manager/platform/tenants']))
  ), { dispatch: false });

  onUpdateTenantFailed = createEffect(() => this.actions$.pipe(
    ofType<UpdateTenantFailed>(PlatformActionType.UpdateTenantFailed),
    tap(a =>
      this.toastr.error(a.error)
    ),
  ))

  onDownloadTenantLogo = createEffect(() => this.actions$.pipe(
    ofType<DownloadTenantLogo>(PlatformActionType.DownloadTenantLogo),
    switchMap(action => this.platformService.downloadTenantLogo(action.url)
      .pipe(
        map(s => new DownloadTenantLogoSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadTenantLogoFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  ));

  onInviteTenantUser = createEffect(() => this.actions$.pipe(
    ofType<InviteTenantUser>(PlatformActionType.InviteTenantUser),
    switchMap(action => this.platformService.inviteTenantUser(action.email, action.tenantCode)
      .pipe(
        map(s => new InviteTenantUserSuccess()),
        catchError(() => of(new InviteTenantUserFailed()))
      ))
  ));

  onLoadTenantUsers = createEffect(() => this.actions$.pipe(
    ofType<LoadTenantUsers>(PlatformActionType.LoadTenantUsers),
    switchMap(action => this.platformService.getTenantUsers(action.tenantCode)
    .pipe(
      map(s => new LoadTenantUsersSuccess(s.data)),
      catchError((err) => of(new LoadTenantUsersFailed(err)))
    ))
  ))

  onRevokeTenantUserAccess = createEffect(() => this.actions$.pipe(
    ofType<RevokeTenantUserAccess>(PlatformActionType.RevokeTenantUserAccess),
    switchMap(action => this.platformService.removeTenantUserAccess(action.userId, action.tenantCode)
    .pipe(
      map(s => new RevokeTenantUserAccessSuccess(action.userId, action.tenantCode))
    ))
  ))

  onRevokeTenantUserAccessSuccess = createEffect(() => this.actions$.pipe(
    ofType<RevokeTenantUserAccessSuccess>(PlatformActionType.RevokeTenantUserAccessSuccess),
    tap((action) => {
      this.toastr.success(this.translateSer.instant('Access updated successfully'));
      return action;
    }),
    concatMap((action) => [
      new LoadTenantUsers(action.tenantCode)
    ])
  ));

  onRemoveUserStoreAccessFailed = createEffect(() => this.actions$.pipe(
    ofType<RevokeTenantUserAccessFailed>(PlatformActionType.RevokeTenantUserAccessFailed),
    tap(() => this.toastr.error(this.translateSer.instant('Access update failed')))
  ), { dispatch: false });

  onDeleteTenantLogo = createEffect(() => this.actions$.pipe(
    ofType<DeleteTanentLogo>(PlatformActionType.DeleteTanentLogo),
    switchMap(a => this.platformService.deleteLogo(a.tenantCode)
      .pipe(
        map(r => new DeleteTanentLogoSuccess()),
        catchError(e => of(new DeleteTanentLogoFailed()))
      )
    )
  ));
  
  onDeleteTenantLogoSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteTanentLogoSuccess>(PlatformActionType.DeleteTanentLogoSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.imageRemoveSuccess')))
  ), { dispatch: false });

  
  onDeleteTenantLogoFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteTanentLogoFailed>(PlatformActionType.DeleteTanentLogoFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  ), { dispatch: false });

}
