import { ChangeAccountManager, ChangeAccountManagerSuccess, CustomEndPointValidate, CustomEndPointValidateFailed, CustomEndPointValidateSuccess, LoadAutoprintSubscriptionStatus, LoadAutoprintSubscriptionStatusFailed, LoadAutoprintSubscriptionStatusSuccess, LoadMenuViewingStatistics, LoadMenuViewingStatisticsFailed, LoadMenuViewingStatisticsSuccess, RequestAutoprintPermission, SynchronizePowersoftCatalog, SynchronizePowersoftCatalogFailed, SynchronizePowersoftCatalogSuccess, ToggleAutoprintPermitted, ToggleAutoprintSubscriptionStatus, ToggleAutoprintSubscriptionStatusSuccess } from './stores.actions';
// tslint:disable: member-ordering
import { STORES_LOCAL_STORAGE_KEY } from './../stores.tokens';
import { getSelectedStore, getUsersList } from './stores.selectors';
import { Router } from '@angular/router';
import { switchMap, map, catchError, tap, withLatestFrom, filter } from 'rxjs/operators';
import { Injectable, Inject, ApplicationRef } from '@angular/core';
import { createEffect, Actions, ofType, OnInitEffects } from '@ngrx/effects';
import { StoresService } from '../stores.service';
import {
  StoresActionType,
  LoadStores,
  LoadStoresSuccess,
  LoadStoresFailed,
  LoadStoresPage,
  LoadStore,
  LoadStoreSuccess,
  LoadStoreFailed,
  CreateStore,
  CreateStoreSuccess,
  CreateStoreFailed,
  PartialUpdateStore,
  PartialUpdateStoreSuccess,
  PartialUpdateStoreFailed,
  DeleteStore,
  DeleteStoreSuccess,
  DeleteStoreFailed,
  DeleteStoreParent,
  DeleteStoreParentSuccess,
  DeleteStoreParentFailed,
  UpdateStore,
  UpdateStoreSuccess,
  UpdateStoreFailed,
  UpdateStoreRelation,
  UpdateStoreRelationSuccess,
  UpdateStoreRelationFailed,
  UpdateStoreVatPercentage,
  UpdateStoreVatPercentageSuccess,
  UpdateStoreVatPercentageFailed,
  DownloadQRFullPdf,
  DownloadQRFullPdfSuccess,
  DownloadQRFullPdfFailed,
  DownloadQRImages,
  DownloadQRImagesSuccess,
  DownloadQRImagesFailed,
  DownloadQRImage,
  DownloadQRImageSuccess,
  DownloadQRImageFailed,
  DownloadQRPdf,
  DownloadQRPdfSuccess,
  DownloadQRPdfFailed,
  UpdateStoreSettings,
  UpdateStoreSettingsSuccess,
  UpdateStoreSettingsFailed,
  LoadUsers,
  LoadUsersSuccess,
  LoadUsersFailed,
  LoadUsersPage,
  InviteUser,
  InviteUserSuccess,
  InviteUserFailed,
  UploadStoreImage,
  UploadStoreImageFailed,
  UploadStoreImageSuccess,
  UploadStoreLogo,
  UploadStoreLogoSuccess,
  UploadStoreLogoFailed,
  SearchStores,
  SearchStoresSuccess,
  SearchStoresFailed,
  LoadStoreStatistics,
  LoadStoreStatisticsSuccess,
  LoadStoreStatisticsFailed,
  StoresAction,
  InitializeState,
  ValidateAliasAvailability,
  ValidateAliasAvailabilitySuccess,
  ValidateAliasAvailabilityFailed,
  RemoveUserStoreAccess,
  RemoveUserStoreAccessSuccess,
  RemoveUserStoreAccessFailed,
  LoadNotificationSubscriptionStatus,
  LoadNotificationSubscriptionStatusSuccess,
  LoadNotificationSubscriptionStatusFailed,
  RequestNotificationPermission,
  ToggleNotificationSubscriptionStatus,
  ToggleNotificationPermitted,
  ToggleNotificationSubscriptionStatusSuccess,
  CreateOrUpdateZoneSuccess,
  GetStatusOfZone,
  GetStatusOfZoneSuccess,
  GetStatusOfZoneFailed,
  LoadZonesSuccess,
  LoadZonesFailed,
  LoadZones,
  LoadZone,
  LoadZoneFailed,
  LoadZoneSuccess,
  CreateOrUpdateZone,
  CreateOrUpdateZoneFailed,
  RemoveZone,
  RemoveZoneSuccess,
  RemoveZoneFailed,
  RemoveStoreImage,
  RemoveStoreImageSuccess,
  RemoveStoreImageFailed,
  RemoveStoreLogoSuccess,
  RemoveStoreLogoFailed,
  RemoveStoreLogo,
  StartOrderNotificationSound,
  CheckStoreHasNewOrder,
  CheckStoreHasNewOrderSuccess,
  CheckStoreHasNewOrderFailed,
  DownloadOrderItemsXls,
  DownloadOrderItemsXlsSuccess,
  DownloadOrderItemsXlsFailed,
  UpdateStoreZoneSettings,
  UpdateStoreZoneSettingsSuccess,
  UpdateStoreZoneSettingsFailed,
  MynextLoginSuccess,
  MynextLoginFailed,
  MynextLogin,
  LoadCustomersSuccess,
  LoadCustomersFailed,
  LoadCustomersPage,
  DownloadCustomersList,
  DownloadCustomersListSuccess,
  DownloadCustomersListFailed,
  LoadOrderItemsStatisticsSuccess,
  LoadOrderItemsStatisticsFailed,
  LoadOrderItemsStatisticsPage,
  HubriseLogin,
  HubriseLoginSuccess,
  HubriseLoginFailed,
  HubriseLogout,
  HubriseLogoutSuccess,
  HubriseLogoutFailed,
  DownloadFlyerFile,
  DownloadFlyerFileSuccess,
  DownloadFlyerFileFailed,
  PowersoftLoginSuccess,
  PowersoftLoginFailed,
  PowersoftLogin,
  DisconnectPowersoftSuccess,
  DisconnectPowersoftFailed,
  DisconnectPowersoft
} from './stores.actions';
import { of, timer } from 'rxjs';
import { Paging } from 'src/app/api/types/Pageable';
import { ToastrService } from 'ngx-toastr';
import { StoresState, SelectedStoreState, AliasAvailabilityStatus } from './stores.reducer';
import { Store, select } from '@ngrx/store';
import { StoreStatistics, StoreZoneStatus, StoreZone } from '../stores';
import { LocalStorageService } from 'src/app/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotificationService } from 'src/app/shared/push-notification.service';

import { StoreOrderService } from '../store-order/store-order.service';
import { ThemeUtils } from 'src/app/public/store/utils/ThemeUtils';
import { MobilePushNotificationService } from 'src/app/shared/mobile-push-notification.service';
import { HelperService } from 'src/app/public/helper.service';
import { PrinterService } from 'src/app/printers/printer.service';
import { LogService } from 'src/app/shared/logging/LogService';

@Injectable()
export class StoresEffects implements OnInitEffects {
  ngrxOnInitEffects(): StoresAction {
    const storeFromLocalStorage = this.storageService.getSavedState(this.localStorageKey);
    const selectedStore = storeFromLocalStorage ? storeFromLocalStorage.selectedStore as SelectedStoreState : null;
    return selectedStore && selectedStore.store.id > 0 ? new LoadStore(selectedStore.store.id) : new InitializeState();
  }

  constructor(
    private actions$: Actions,
    private store: Store<StoresState>,
    private storesService: StoresService,
    private toastr: ToastrService,
    private storageService: LocalStorageService,
    @Inject(STORES_LOCAL_STORAGE_KEY) private localStorageKey,
    private router: Router,
    private translateSer: TranslateService,
    private pushNotificationService: PushNotificationService,
    private mobilePushNotificationService: MobilePushNotificationService,
    private helperService: HelperService,
    private orderService: StoreOrderService,
    private appRef: ApplicationRef,
    private printerService: PrinterService,
    private logger: LogService
  ) { }

  // Notification Sound effects start

  onLoadStoreSuccess = createEffect(() => this.actions$.pipe(
    ofType<LoadStoreSuccess>(StoresActionType.LoadStoreSuccess),
    map(s => new CheckStoreHasNewOrder())
  ));

  onCheckStoreHasNewOrder = createEffect(() => this.actions$.pipe(
    ofType<CheckStoreHasNewOrder>(StoresActionType.CheckStoreHasNewOrder),
    switchMap((action) =>
      timer(0, 10000).pipe(
        withLatestFrom(this.store.pipe(select(getSelectedStore))),
        filter(([t, store]) => !!store.settings.ORDER_NOTIFICATION_SOUND),
        switchMap(([t, store]) => this.orderService.list(store.id, ['SUBMITTED', 'RECEIVED'], { page: 0, size: 1 })),
        map((res) => new CheckStoreHasNewOrderSuccess(res)),
        catchError(e => {
          return of(new CheckStoreHasNewOrderFailed());
        })
      )
    ),
  ));

  onCheckStoreHasNewOrderSuccess = createEffect(() => this.actions$.pipe(
    ofType<CheckStoreHasNewOrderSuccess>(StoresActionType.CheckStoreHasNewOrderSuccess),
    map(action => {
      if (action.orders.data.length && action.orders.data[0].status === 'SUBMITTED') {
        return new StartOrderNotificationSound('https://www.gonnaorder.com/wp-content/uploads/2020/09/GonnaOrder-Notification-Bell.wav');
      }
    }),
    filter(a => !!a)
  ));

  onCheckStoreHasNewOrderFailed = createEffect(() => this.actions$.pipe(
    ofType<CheckStoreHasNewOrderFailed>(StoresActionType.CheckStoreHasNewOrderFailed),
    switchMap(s =>
      timer(10000).pipe(
        map(t => new CheckStoreHasNewOrder()))
    )
  ));
  // Notification Sound effects end

  onLoadStores = createEffect(() => this.actions$.pipe(
    ofType<LoadStores>(StoresActionType.LoadStores),
    switchMap(action => this.list(action.paging, action.aliasName))
  ));

  onLoadStore = createEffect(() => this.actions$.pipe(
    ofType<LoadStore>(StoresActionType.LoadStore),
    switchMap(action => this.storesService.load(action.id).pipe(
      map(s => {
        this.setUiStyles(s.settings);
        return new LoadStoreSuccess(s);
      }),
      catchError(() => of(new LoadStoreFailed()))
    ))
  ));

  onCreateStore = createEffect(() => this.actions$.pipe(
    ofType<CreateStore>(StoresActionType.CreateStore),
    switchMap(action => this.storesService.create(action.clientStore)
      .pipe(
        map(s => new CreateStoreSuccess(s.id)),
        catchError(e => {
          if (e.status === 400) {
            return of(new CreateStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new CreateStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onUpdateStore = createEffect(() => this.actions$.pipe(
    ofType<UpdateStore>(StoresActionType.UpdateStore),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.partialUpdate(id, action.clientStore)
      .pipe(
        map(s => new UpdateStoreSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new UpdateStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new UpdateStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onUpdateStoreRelation = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreRelation>(StoresActionType.UpdateStoreRelation),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.updateStoreRelation(id, action.storeRelationRequest, action.isUpdate)
      .pipe(
        map(s => new UpdateStoreRelationSuccess(id,
          {isIndependent:	s.isIndependent,
          storeAlias:	action.parentStoreDetail.alias,
          storeId: s.parentStoreId,
          storeName: action.parentStoreDetail.name})),
        catchError(e => {
          if (e.status === 400) {
            return of(new UpdateStoreRelationFailed(e.error.errors.map(err => err.message)));
          }
          return of(new UpdateStoreRelationFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onUpdateStoreRelationSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreRelationSuccess>(StoresActionType.UpdateStoreRelationSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.setting.multiStore.updateStatusMessage'),
     this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>
     this.router.navigate(['/manager/stores/' + a.storeId + '/settings/multi-store/relation-tree'])
    )
  ), { dispatch: false });

  onUpdateStoreSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreSuccess>(StoresActionType.UpdateStoreSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.storeUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>
      window.location.href.includes('billing')
        ? this.router.navigate(['/manager/stores/' + a.store.id + '/billing/billing-details'])
        : this.router.navigate(['/manager/stores', a.store.id, 'settings', 'store-edit'])
    )
  ), { dispatch: false });

  onUpdateStoreSettings = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreSettings>(StoresActionType.UpdateStoreSettings),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    map(([action, id]) => ({
      id,
      settings: Object.keys(action.settings).map(key => ({ key, value: action.settings[key] }))
    })),
    switchMap(r => this.storesService.updateSettings(r.id, r.settings)
      .pipe(
        map(s => new UpdateStoreSettingsSuccess(s)),
        catchError(e => {
          return of(new UpdateStoreSettingsFailed(r.id, e.error.errors.map(err => err.message)));
        })
      ))
  ));

  onUpdateStoreSettingsSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreSettingsSuccess>(StoresActionType.UpdateStoreSettingsSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
  ), { dispatch: false });

  onPartialUpdateStore = createEffect(() => this.actions$.pipe(
    ofType<PartialUpdateStore>(StoresActionType.PartialUpdateStore),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.partialUpdate(id, action.clientStore)
      .pipe(
        map(s => new PartialUpdateStoreSuccess(s, action.clientStore)),
        catchError(e => {
          if (e.status === 400) {
            return of(new PartialUpdateStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new PartialUpdateStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onDeleteStore = createEffect(() => this.actions$.pipe(
    ofType<DeleteStore>(StoresActionType.DeleteStore),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.deleteStore(id)
      .pipe(
        map(s => new DeleteStoreSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new DeleteStoreFailed(e.error.errors.map(err => err.message)));
          }
          return of(new DeleteStoreFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onDeleteStoreSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteStoreSuccess>(StoresActionType.DeleteStoreSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.deleteStoreSuccess'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a => this.router.navigateByUrl('/manager/stores/list'))
  ), { dispatch: false });

  onDeleteStoreFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteStoreFailed>(
      StoresActionType.DeleteStoreFailed),
    tap(a =>
      a.error.forEach(e => this.toastr.error(
        'The store cannot be deleted. It may contain catalog offer items or options, menu viewings or orders'
      ))
    ),
    tap(a => this.router.navigateByUrl('/manager/stores/list'))
  ), { dispatch: false });

  onDeleteStoreParent = createEffect(() => this.actions$.pipe(
    ofType<DeleteStoreParent>(StoresActionType.DeleteStoreParent),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.deleteStoreParent(id)
      .pipe(
        map(s => new DeleteStoreParentSuccess(id)),
        catchError(e => {
          if (e.status === 400) {
            return of(new DeleteStoreParentFailed(e.error.errors.map(err => err.message)));
          }
          return of(new DeleteStoreParentFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onDeleteStoreParentSuccess = createEffect(() => this.actions$.pipe(
    ofType<DeleteStoreParentSuccess>(StoresActionType.DeleteStoreParentSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.setting.multiStore.updateStatusMessage'),
    this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a => this.router.navigateByUrl('/manager/stores/' + a.storeId + '/settings/multi-store'))
  ), { dispatch: false });

  onDeleteStoreParentFailed = createEffect(() => this.actions$.pipe(
    ofType<DeleteStoreParentFailed>(
      StoresActionType.DeleteStoreParentFailed),
      tap(a =>
        a.error.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')))
      ),
    // tap(a => this.router.navigateByUrl('/manager/stores/list'))
  ), { dispatch: false });

  onPartialUpdateStoreSuccess = createEffect(() => this.actions$.pipe(
    ofType<PartialUpdateStoreSuccess>(StoresActionType.PartialUpdateStoreSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>{
      if(a.clientStore.crmCompanyId || a.clientStore.crmCompanyId === "") {
        this.router.navigate(
          [
            '/manager/stores',
            a.store.id,
            'users'
          ]
        )
      }else {
      this.router.navigate(
        [
          '/manager/stores',
          a.store.id,
          'settings',
          window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
        ]
      )
      }
    }
    )
  ), { dispatch: false });

  onUpdateStoreVatPercentage = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreVatPercentage>(StoresActionType.UpdateStoreVatPercentage),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    switchMap(([action, id]) => this.storesService.updateStoreVatPercentage(id, action.vatPercentage)
      .pipe(
        map(s => new UpdateStoreVatPercentageSuccess(s)),
        catchError(e => {
          if (e.status === 400) {
            return of(new UpdateStoreVatPercentageFailed(e.error.errors.map(err => err.message)));
          }
          return of(new UpdateStoreVatPercentageFailed([this.translateSer.instant('admin.store.message.errorTryAgain')]));
        })
      ))
  ));

  onUpdateStoreVatPercentageSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreVatPercentageSuccess>(StoresActionType.UpdateStoreVatPercentageSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    tap(a =>
      this.router.navigate(
        [
          '/manager/stores',
          a.store.id,
          'settings',
          window.location.href.substring(window.location.href.lastIndexOf('/') + 1)
        ]
      )
    )
  ), { dispatch: false });

  onCreateStoreSuccess = createEffect(() => this.actions$.pipe(
    ofType<CreateStoreSuccess>(StoresActionType.CreateStoreSuccess),
    tap(a => this.router.navigate(['/manager/stores', a.id, 'register-store-success']))
  ), { dispatch: false });

  onStoreActionFailed = createEffect(() => this.actions$.pipe(
    ofType<CreateStoreFailed | UpdateStoreFailed | UpdateStoreRelationFailed >(
      StoresActionType.CreateStoreFailed,
      StoresActionType.UpdateStoreFailed,
      StoresActionType.UpdateStoreRelationFailed
    ),
    tap(a =>
      a.error &&
        (
          a.error.includes('google') ||
          a.error.includes('facebook') ||
          a.error.includes('Invalid extenal domain')
        ) !== true
        ? a.error.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')))
        : this.logger.error('An error occurred')
    )
  ), { dispatch: false });

  onDownloadQRImage = createEffect(() => this.actions$.pipe(
    ofType<DownloadQRImage>(StoresActionType.DownloadQRImage),
    switchMap(action => this.storesService.downloadQRImage(action.id, action.url)
      .pipe(
        map(s => new DownloadQRImageSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRImageFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  ));

  onDownloadQRPdf = createEffect(() => this.actions$.pipe(
    ofType<DownloadQRPdf>(StoresActionType.DownloadQRPdf),
    switchMap(action => this.storesService.downloadQRPdf(action.id)
      .pipe(
        map(s => new DownloadQRPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRPdfFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  ));

  onDownloadQRImages = createEffect(() => this.actions$.pipe(
    ofType<DownloadQRImages>(StoresActionType.DownloadQRImages),
    switchMap(action => this.storesService.downloadQRImages(action.id)
      .pipe(
        map(s => new DownloadQRImagesSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRImagesFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  ));

  onDownloadQRFullPdf = createEffect(() => this.actions$.pipe(
    ofType<DownloadQRFullPdf>(StoresActionType.DownloadQRFullPdf),
    switchMap(action => this.storesService.downloadQRFullPdf(action.id)
      .pipe(
        map(s => new DownloadQRFullPdfSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(() => of(new DownloadQRFullPdfFailed(this.translateSer.instant('admin.store.message.errorTryAgain'))))
      ))
  ));

  onDownloadFailed = createEffect(() => this.actions$.pipe(
    ofType<DownloadQRImageFailed | DownloadQRPdfFailed | DownloadQRImagesFailed | DownloadQRFullPdfFailed>(
      StoresActionType.DownloadQRImageFailed,
      StoresActionType.DownloadQRPdfFailed,
      StoresActionType.DownloadQRImagesFailed,
      StoresActionType.DownloadQRFullPdfFailed
    ),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.downloadFail')))
  ), { dispatch: false });

  onStoreImageUpload = createEffect(() => this.actions$.pipe(
    ofType<UploadStoreImage>(StoresActionType.UploadStoreImage),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([a, s]) => this.storesService.uploadStoreImage(s.id, a.file, a.backgroundImage)
      .pipe(
        map(r =>  new UploadStoreImageSuccess(r, a.backgroundImage)),
        tap(() => {
          const message = !a.backgroundImage ? 'admin.store.message.imageUploadSuccess' : 'admin.store.message.imageUploadSuccess';
          this.toastr.success(this.translateSer.instant(message));
        }),
        catchError(e => {
          if (e.status === 400) {
            let error;
            try {
              error = JSON.parse(e.error);
              return of(new UploadStoreImageFailed(error.errors.map(er => er.message), a.backgroundImage));
            } catch (parseErr) {
              return of(new UploadStoreImageFailed(['An error occured in Image uploading, please try again'], a.backgroundImage));
            }

          } else if (e.status === 413) {
            return of(new UploadStoreImageFailed(['File size should not be more than 10 MB'], a.backgroundImage));
          }
          return of(new UploadStoreImageFailed(['An error occured in Image uploading, please try again'], a.backgroundImage));
        }
        )
      )
    )
  ));

  onStoreLogoUpload = createEffect(() => this.actions$.pipe(
    ofType<UploadStoreLogo>(StoresActionType.UploadStoreLogo),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([a, s]) => this.storesService.uploadStoreLogo(s.id, a.file)
      .pipe(
        map(r => new UploadStoreLogoSuccess(r)),
        tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.logoUploadSuccess'))),
        catchError(e => {
          if (e.status === 400) {
            let error;
            try {
              error = JSON.parse(e.error);
              return of(new UploadStoreLogoFailed(error.errors.map(er => er.message)));
            } catch (parseErr) {
              return of(new UploadStoreLogoFailed(['An error occured in Logo uploading, please try again']));
            }
          } else if (e.status === 413) {
            return of(new UploadStoreLogoFailed(['File size should not be more than 10 MB']));
          }
          return of(new UploadStoreLogoFailed(['An error occured in Logo uploading, please try again']));
        }
        )
      )
    )
  ));

  onStoreImageUploadFailed = createEffect(() => this.actions$.pipe(
    ofType<UploadStoreImageFailed | UploadStoreLogoFailed>(
      StoresActionType.UploadStoreImageFailed, StoresActionType.UploadStoreLogoFailed),
    tap(a => a.errorMessages.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.uploadFail'))))
  ), { dispatch: false });

  onInviteUser = createEffect(() => this.actions$.pipe(
    ofType<InviteUser>(StoresActionType.InviteUser),
    switchMap(action =>
      this.storesService.inviteUser(action.email, action.role, action.storeId).pipe(
        map(() => new InviteUserSuccess()),
        catchError(e => {
          return of(new InviteUserFailed(e.error.errors.map(err => err.message)));
        })
      )
    )
  ));

  onInviteUserSuccess = createEffect(() => this.actions$.pipe(
    ofType<InviteUserSuccess>(StoresActionType.InviteUserSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.inviteUserSuccess'), this.translateSer.instant('admin.alerts.headerSuccess'))),
    withLatestFrom(this.store.select(getUsersList), this.store.select(getSelectedStore)),
    map(([, users, store]) => new LoadUsersPage(store.id, users.paging))
  ));

  onInviteUserFailed = createEffect(() => this.actions$.pipe(
    ofType<InviteUserFailed>(StoresActionType.InviteUserFailed),
    tap(a => a.errorMessages.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.inviteUserFail'))))
  ), { dispatch: false });

  onGetStatusOfZone = createEffect(() => this.actions$.pipe(
    ofType<GetStatusOfZone>(StoresActionType.GetStatusOfZone),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.getStatusOfZone(s.id)
      .pipe(
        map((u: StoreZoneStatus) => new GetStatusOfZoneSuccess(u)),
        catchError(a =>
          of(
            new GetStatusOfZoneFailed(
              a.error.errors
                .map(err => err.message)
                .foreach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')))
            )
          )
        )
      ))
  ));

  onLoadUsers = createEffect(() => this.actions$.pipe(
    ofType<LoadUsers>(StoresActionType.LoadUsers),
    switchMap(action => this.userList(action.storeId, action.paging))
  ));


  onLoadUsersPage = createEffect(() => this.actions$.pipe(
    ofType<LoadUsersPage>(StoresActionType.LoadUsersPage),
    switchMap(action => this.userList(action.storeId, action.paging))
  ));

  onChangeAccountManager = createEffect(() => this.actions$.pipe(
    ofType<ChangeAccountManager>(StoresActionType.ChangeAccountManager),
    switchMap(action => this.storesService.changeAccountManager(action.storeId, action.userId)
    .pipe(
      map(() => new ChangeAccountManagerSuccess(action.storeId, action.paging))
    ))
  ))

  onChnageAccountManagerSuccess = createEffect(() => this.actions$.pipe(
    ofType<ChangeAccountManagerSuccess>(StoresActionType.ChangeAccountManagerSuccess),
    map(action => new LoadUsersPage(action.storeId, action.paging))
  ))

  onRemoveUserStoreAccess = createEffect(() => this.actions$.pipe(
    ofType<RemoveUserStoreAccess>(StoresActionType.RemoveUserStoreAccess),
    switchMap(a => this.storesService.removeUserStoreAccess(a.userId, a.storeId)
      .pipe(
        map(() => new RemoveUserStoreAccessSuccess(a.userId, a.storeId)),
        catchError(() => of(new RemoveUserStoreAccessFailed()))
      )
    )
  ));

  onRemoveUserStoreAccessSuccess = createEffect(() => this.actions$.pipe(
    ofType<RemoveUserStoreAccessSuccess>(StoresActionType.RemoveUserStoreAccessSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.acessRemoveSuccess'))),
    withLatestFrom(this.store.select(getUsersList), this.store.select(getSelectedStore)),
    map(([, users, store]) => new LoadUsersPage(store.id, users.paging))
  ));

  onRemoveZone = createEffect(() => this.actions$.pipe(
    ofType<RemoveZone>(StoresActionType.RemoveZone),
    switchMap(a => this.storesService.removeZone(a.zoneId, a.storeId)
      .pipe(
        map(() => new RemoveZoneSuccess(a.zoneId, a.storeId)),
        catchError(() => of(new RemoveZoneFailed()))
      )
    )
  ));

  onRemoveZoneSuccess = createEffect(() => this.actions$.pipe(
    ofType<RemoveZoneSuccess>(StoresActionType.RemoveZoneSuccess),
    tap((a) => {
      this.toastr.success(this.translateSer.instant('admin.store.message.zoneRemoveSuccess'));
      return this.router.navigate(['/manager/stores', a.storeId, 'settings', 'address']);
    }),
    map(a => new LoadStore(a.storeId))
  ));

  onRemoveZoneFailed = createEffect(() => this.actions$.pipe(
    ofType<RemoveZoneFailed>(StoresActionType.RemoveZoneFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.message.zoneRemoveFail')))
  ), { dispatch: false });

  onRemoveUserStoreAccessFailed = createEffect(() => this.actions$.pipe(
    ofType<RemoveUserStoreAccessFailed>(StoresActionType.RemoveUserStoreAccessFailed),
    tap(() => this.toastr.error(this.translateSer.instant('admin.store.message.zoneRemoveFail')))
  ), { dispatch: false });

  onSearchStore = createEffect(() => this.actions$.pipe(
    ofType<SearchStores>(StoresActionType.SearchStores),
    switchMap(action => this.storesService.searchStores(action.alias).pipe(
      map(s => new SearchStoresSuccess(s)),
      catchError(a => of(new SearchStoresFailed((!!a.error && !!a.error.errors) ? a.error.errors.map(err => err.message) : '')))
    ))
  ));

  onLoadStoreStatistics = createEffect(() => this.actions$.pipe(
    ofType<LoadStoreStatistics>(StoresActionType.LoadStoreStatistics),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.loadStoreStatistics(s.id, action.duration, action.from, action.to, action.periodicTerm)
      .pipe(
        map((u: StoreStatistics[]) => new LoadStoreStatisticsSuccess(u)),
        catchError(a => of(new LoadStoreStatisticsFailed(a.error.message)))
      ))
  ));

  onLoadStoreStatisticsFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadStoreStatisticsFailed | LoadStoresFailed | LoadUsersFailed>
      (StoresActionType.LoadStoreStatisticsFailed, StoresActionType.LoadStoresFailed,
        StoresActionType.LoadUsersFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  ), { dispatch: false });

  onLoadMenuViewingStatistics = createEffect(() => this.actions$.pipe(
    ofType<LoadMenuViewingStatistics>(StoresActionType.LoadMenuViewingStatistics),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.loadMenuViewingStatistics(s.id, action.duration, action.from, action.to, action.periodicTerm)
      .pipe(
        map((u: StoreStatistics[]) => new LoadMenuViewingStatisticsSuccess(u)),
        catchError(a => of(new LoadMenuViewingStatisticsFailed(a.error.message)))
      ))
  ));

  onLoadMenuViewingStatisticsFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadMenuViewingStatisticsFailed | LoadStoresFailed | LoadUsersFailed>
      (StoresActionType.LoadMenuViewingStatisticsFailed, StoresActionType.LoadStoresFailed,
        StoresActionType.LoadUsersFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  ), { dispatch: false });

  onValidateAliasAvailability = createEffect(() => this.actions$.pipe(
    ofType<ValidateAliasAvailability>(StoresActionType.ValidateAliasAvailability),
    switchMap(action => this.storesService.validateAliasAvailability(action.storeId, action.alias)
      .pipe(
        map((u: AliasAvailabilityStatus) => new ValidateAliasAvailabilitySuccess(u)),
        catchError(() => of(new ValidateAliasAvailabilityFailed(this.translateSer.instant('admin.store.message.downloadFail'))))
      ))
  ));

  onLoadNotificationSubscriptionStatus = createEffect(() => this.actions$.pipe(
    ofType<LoadNotificationSubscriptionStatus>(StoresActionType.LoadNotificationSubscriptionStatus),
    tap(_ => this.logger.debug('loading subscription status')),
    tap(action => this.logger.debug('action, subscription', action)),
    switchMap(action => {
      if (!action.pushSubscription) {
        this.logger.debug('no active subscription found');
        return of(new LoadNotificationSubscriptionStatusSuccess(false));
      } else {
        if (this.helperService.isMobileApp()) {
          return this.storesService.loadMobileNotificationSubscriptionStatus(action.storeId).pipe(
            map(res => new LoadNotificationSubscriptionStatusSuccess(res)),
            catchError(a => of(new LoadNotificationSubscriptionStatusFailed(a.error.errors.map(err => err.message)))));
        } else {
          return this.storesService.loadNotificationSubscriptionStatus(action.storeId, action.pushSubscription).pipe(
            map(res => new LoadNotificationSubscriptionStatusSuccess(res)),
            catchError(a => of(new LoadNotificationSubscriptionStatusFailed(a.error.errors.map(err => err.message)))));
        }
      }
    })
  ));

  onRequestNotificationPermission = createEffect(() => this.actions$.pipe(
    ofType<RequestNotificationPermission>(StoresActionType.RequestNotificationPermission),
    switchMap(() => {
      if (this.helperService.isMobileApp()) {
        return this.mobilePushNotificationService.requestPermission().pipe(
          map(permitted => new ToggleNotificationSubscriptionStatus(permitted, null)),
          catchError(e => { this.logger.debug('error requesting permissions', e); return of(new ToggleNotificationPermitted(false)); }))
      } else {
        return this.pushNotificationService.requestPermission().pipe(
          map(pushSubscription => new ToggleNotificationSubscriptionStatus(true, pushSubscription)),
          catchError(e => { this.logger.debug('error requesting permissions', e); return of(new ToggleNotificationPermitted(false)); }))
      }
    })
  ));

  onToggleNotificationSubscriptionStatus = createEffect(() => this.actions$.pipe(
    ofType<ToggleNotificationSubscriptionStatus>(StoresActionType.ToggleNotificationSubscriptionStatus),
    withLatestFrom(this.store.select(getSelectedStore)),
    filter(([action, store]) => (action.pushSubscription != null) || (this.helperService.isMobileApp())),
    switchMap(([action, store]) => {
      this.logger.debug('action, store', action, store);
      if (action.newStatus) {
        this.logger.debug('subscribing to notifications');
        if (this.helperService.isMobileApp()) {
          return this.storesService.subscribeMobileNotification(store.id, store.aliasName).pipe(
            map(_ => new ToggleNotificationSubscriptionStatusSuccess(true))
          );
        } else {
          return this.storesService.subscribeNotification(store.id, action.pushSubscription).pipe(
            map(_ => new ToggleNotificationSubscriptionStatusSuccess(true))
          );
        }
        
      } else {
        this.logger.debug('unsubscribing from notifications');
        if (this.helperService.isMobileApp()) {
          return this.storesService.unsubscribeMobileNotification(store.id).pipe(
            map(_ => new ToggleNotificationSubscriptionStatusSuccess(false))
          );
        } else {
          return this.storesService.unsubscribeNotification(store.id, action.pushSubscription).pipe(
            map(_ => new ToggleNotificationSubscriptionStatusSuccess(false))
          );
        }
      }
    })
  ));

  //START Auto Printing ---------------------------------------------------------------------------------------------------------------------------------------------//

  onLoadAutoprintSubscriptionStatus = createEffect(() => this.actions$.pipe(
    ofType<LoadAutoprintSubscriptionStatus>(StoresActionType.LoadAutoprintSubscriptionStatus),
    filter(action => action.storeId != null && action.storeId > 0),
    switchMap(action => {
      return this.storesService.loadAutoprintSubscriptionStatus(action.storeId).pipe(
        map(res => new LoadAutoprintSubscriptionStatusSuccess(res)),
        catchError(a => of(new LoadAutoprintSubscriptionStatusFailed(a.error.errors.map(err => err.message)))));
    })
  ));

  onRequestAutoprintPermission = createEffect(() => this.actions$.pipe(
    ofType<RequestAutoprintPermission>(StoresActionType.RequestAutoprintPermission),
    switchMap(() => this.printerService.requestPermission().pipe(
      map(s => new ToggleAutoprintSubscriptionStatus(s)),
      catchError(e => { this.logger.error('error requesting permissions', e); return of(new ToggleAutoprintPermitted(false)); })
    ))
  ));

  onToggleAutoprintSubscriptionStatus = createEffect(() => this.actions$.pipe(
    ofType<ToggleAutoprintSubscriptionStatus>(StoresActionType.ToggleAutoprintSubscriptionStatus),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => {
      this.logger.debug('action, store', action, store);
      if (action.newStatus) {
        this.logger.debug('subscribing to autoprint');
        return this.storesService.subscribeAutoprint(store.id).pipe(
          map(_ => new ToggleAutoprintSubscriptionStatusSuccess(true))
        );
      } else {
        this.logger.debug('unsubscribing from autoprint');
        return this.storesService.unsubscribeAutoprint(store.id).pipe(
          map(_ => new ToggleAutoprintSubscriptionStatusSuccess(false))
        );
      }
    })
  ));
  
  //END Auto Printing ---------------------------------------------------------------------------------------------------------------------------------------------//


  onCreateOrUpdateZone = createEffect(() => this.actions$.pipe(
    ofType<CreateOrUpdateZone>(StoresActionType.CreateOrUpdateZone),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, store]) => this.storesService.createOrUpdateZone(store.id, action.zoneSetting, action.id)
      .pipe(
        map(() => new CreateOrUpdateZoneSuccess(store.id, action.id)),
        catchError(e => {
          if (e.status === 400) {
            if (e.error == null) {
              return of(new CreateOrUpdateZoneFailed(e.statusText.split()));
            } else {
              return of(new CreateOrUpdateZoneFailed(e.error.errors.map(err => err.message)));
            }
          }
          if (e.status === 500) {
            return of(new CreateOrUpdateZoneFailed(e.error.errors.map(err => err.message)));
          }
          return of(new CreateOrUpdateZoneFailed(this.translateSer.instant('admin.store.message.errorTryAgain')));
        })
      ))
  ));

  onCreateOrUpdateZoneSuccess = createEffect(() => this.actions$.pipe(
    ofType<CreateOrUpdateZoneSuccess>(StoresActionType.CreateOrUpdateZoneSuccess),
    tap((a) => {
      if (a.storeId) {
        if (a.zoneId === 0) {
          this.toastr.success(this.translateSer.instant('admin.store.message.zoneAdded'));
        } else {
          this.toastr.success(this.translateSer.instant('admin.store.message.zoneUpdated'));
        }
        return this.router.navigate(['/manager/stores', a.storeId, 'settings', 'address']);
      }
    }),
    map(a => new LoadStore(a.storeId), new LoadZones())
  ));

  onCreateOrUpdateZoneFailed = createEffect(() => this.actions$.pipe(
    ofType<CreateOrUpdateZoneFailed>(
      StoresActionType.CreateOrUpdateZoneFailed,
    ),
    tap(a => a.error.forEach((e, index) => {
      if (e.includes('size must be between 3 ') || e.includes('Mandatory information not present')) {
        if (index === 0) {
          this.toastr.error(this.translateSer.instant('admin.store.settingsMaperrormsg'));
        }
      }
      else if (e.toLowerCase().includes('radius range')) {
        this.toastr.error(this.translateSer.instant('admin.store.invalidRadiusRange'), this.translateSer.instant('admin.store.message.actionFail'));
      }
      else {
        this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail'));
      }
    }
    ))), { dispatch: false });

  onLoadZone = createEffect(() => this.actions$.pipe(
    ofType<LoadZone>(StoresActionType.LoadZone),
    switchMap(action => this.storesService.loadZone(action.storeId, action.id).pipe(
      map(s => new LoadZoneSuccess(s)),
      catchError(a => of(new LoadZoneFailed()))
    ))
  ));

  onLoadZones = createEffect(() => this.actions$.pipe(
    ofType<LoadZones>(StoresActionType.LoadZones),
    withLatestFrom(this.store.select(getSelectedStore)),
    switchMap(([action, s]) => this.storesService.loadZones(s.id)
      .pipe(
        map((u: StoreZone[]) => new LoadZonesSuccess(u)),
        catchError(a => of(new LoadZonesFailed(a.error.errors.map(err => err.message))))
      ))
  ));

  onLoadZonesFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadZonesFailed>
      (StoresActionType.LoadZonesFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  ), { dispatch: false });

  onRemoveStoreLogo = createEffect(() => this.actions$.pipe(
    ofType<RemoveStoreLogo>(StoresActionType.RemoveStoreLogo),
    switchMap(a => this.storesService.removeStoreLogo(a.storeId)
      .pipe(
        map(r => new RemoveStoreLogoSuccess(a.storeId)),
        catchError(e => of(new RemoveStoreLogoFailed()))
      )
    )
  ));

  onRemoveStoreLogoSuccess = createEffect(() => this.actions$.pipe(
    ofType<RemoveStoreLogoSuccess>(StoresActionType.RemoveStoreLogoSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.logoRemoveSuccess')))
  ), { dispatch: false });

  onRemoveStoreLogoFailed = createEffect(() => this.actions$.pipe(
    ofType<RemoveStoreLogoFailed>(StoresActionType.RemoveStoreLogoFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  ), { dispatch: false });

  onRemoveStoreImage = createEffect(() => this.actions$.pipe(
    ofType<RemoveStoreImage>(StoresActionType.RemoveStoreImage),
    switchMap(a => this.storesService.removeStoreImage(a.storeId, a.backgroundImage)
      .pipe(
        map(r => new RemoveStoreImageSuccess(a.storeId)),
        catchError(e => of(new RemoveStoreImageFailed()))
      )
    )
  ));

  onRemoveStoreImageSuccess = createEffect(() => this.actions$.pipe(
    ofType<RemoveStoreImageSuccess>(StoresActionType.RemoveStoreImageSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.imageRemoveSuccess')))
  ), { dispatch: false });

  onRemoveStoreImageFailed = createEffect(() => this.actions$.pipe(
    ofType<RemoveStoreImageFailed>(StoresActionType.RemoveStoreImageFailed),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.actionFail')))
  ), { dispatch: false });

  onLoadOrderItemsStatisticsPage = createEffect(() => this.actions$.pipe(
    ofType<LoadOrderItemsStatisticsPage>(StoresActionType.LoadOrderItemsStatisticsPage),
    switchMap(action =>
      this.orderItemsStatisticsList(
        action.id,
        action.startDate,
        action.endDate,
        action.orderItemDateType,
        action.paging,
        action.sort
      )
    )
  ));

  onLoadOrderItemsStatisticsFailed = createEffect(() => this.actions$.pipe(
    ofType<LoadOrderItemsStatisticsFailed | LoadStoresFailed | LoadUsersFailed>
      (StoresActionType.LoadOrderItemsStatisticsFailed, StoresActionType.LoadStoresFailed,
        StoresActionType.LoadUsersFailed),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.loadFail')))
  ), { dispatch: false });

  onLoadStoresPage = createEffect(() => this.actions$.pipe(
    ofType<LoadStoresPage>(StoresActionType.LoadStoresPage),
    switchMap(action => this.list(action.paging, action.aliasName))
  ));

  private orderItemsStatisticsList(
    id: number,
    startDate: string,
    endDate: string,
    orderItemDateType: string,
    paging: Paging,
    sort: string,
  ) {
    return this.storesService.orderItemsStatisticsList(id, startDate, endDate, orderItemDateType, paging, sort)
      .pipe(
        map(s => new LoadOrderItemsStatisticsSuccess(s)),
        catchError(a => of(new LoadOrderItemsStatisticsFailed(a.error.errors.map(err => err.message))))
      );
  }

  private list(paging: Paging, aliasName: string) {
    return this.storesService.list(paging, aliasName).pipe(
      map(s => new LoadStoresSuccess(s)),
      catchError(a => of(new LoadStoresFailed((!!a.error && !!a.error.errors) ? a.error.errors.map(err => err.message) : '')))
    );
  }

  private userList(id: number, paging: Paging) {
    return this.storesService.userList(id, paging).pipe(
      map(s => new LoadUsersSuccess(s)),
      catchError(a => of(new LoadUsersFailed(a.error.errors.map(err => err.message))))
    );
  }



  onOrderItemsXls = createEffect(() => this.actions$.pipe(
    ofType<DownloadOrderItemsXls>(StoresActionType.DownloadOrderItemsXls),
    switchMap(action => this.storesService.downloadOrderItemXls(action.storeId, action.orderItemReportType, action.fromDate, action.toDate)
      .pipe(
        map(s => {
          return new DownloadOrderItemsXlsSuccess(s.blob, decodeURIComponent(s.filename));
        }),
        catchError(a => of(new DownloadOrderItemsXlsFailed(this.translateSer.instant('admin.store.catalog.contentDownload'))))
      ))
  ));

  onOrderItemsXlsFailed = createEffect(() => this.actions$.pipe(
    ofType<DownloadOrderItemsXlsFailed>(
      StoresActionType.DownloadOrderItemsXlsFailed,
    ),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.actionFail')))
  ), { dispatch: false });

  onUpdateStoreSettingsFailed = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreSettingsFailed>(
      StoresActionType.UpdateStoreSettingsFailed,
    ),
    tap(a => {
      if (a.error &&
      !(a.error.some(x => x.includes('google') ||
        x.includes('facebook') ||
        x.includes('Website') ||
        x.includes('Facebook') ||
        x.includes('Instagram') ||
        x.includes('Cardito') ||
        x.includes('Invalid iOS Store URL') ||
        x.includes('Invalid Android Store URL')))) {
          a.error.forEach(e => this.toastr.error(e, this.translateSer.instant('admin.store.message.actionFail')));
          if (a.storeId) {
            this.store.dispatch(new LoadStore(a.storeId));
          }
        } else {
          this.logger.error('An error occurred');
        }
      if (a.error) {}
    })
  ), { dispatch: false });

  onUpdateStoreZoneSettings = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreZoneSettings>(StoresActionType.UpdateStoreZoneSettings),
    withLatestFrom(this.store.pipe(select(getSelectedStore), map(s => s.id))),
    map(([action, id]) => ({
      zoneId: action.id,
      id,
      settings: Object.keys(action.settings).map(key => ({ key, value: action.settings[key] }))
    })),
    switchMap(r => this.storesService.updateZoneSettings(r.zoneId, r.id, r.settings)
      .pipe(
        map(s => new UpdateStoreZoneSettingsSuccess(s)),
        catchError(e => of(new UpdateStoreZoneSettingsFailed(e.error.errors.map(err => err.message))))
      ))
  ));

  onUpdateStoreZoneSettingsSuccess = createEffect(() => this.actions$.pipe(
    ofType<UpdateStoreZoneSettingsSuccess>(StoresActionType.UpdateStoreZoneSettingsSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess')))
  ), { dispatch: false });

  mynextLogin = createEffect(() => this.actions$.pipe(
    ofType<MynextLogin>(StoresActionType.MynextLogin),
    switchMap(action => (
      action.username && action.password ? this.storesService.mynextLogin(action.username, action.password) : (
        of(
          {
            ApiKey: undefined,
            MyNextId: undefined,
            Message: undefined
          }
        )
      )
    )
      .pipe(
        map(t => new MynextLoginSuccess(t)),
        catchError(a => of(new MynextLoginFailed()))
      ))
  ));

  powersoftLogin = createEffect(() => this.actions$.pipe(
    ofType<PowersoftLogin>(StoresActionType.PowersoftLogin),
    switchMap(action => (
      this.storesService.powersoftLogin(action.storeId, action.reqObj)
    )
      .pipe(
        map(t => new PowersoftLoginSuccess(t as any)),
        catchError(a => of(new PowersoftLoginFailed(a.error.errors.map(err => this.toastr.error(err.message)))
      ))
      ))
  ));

  onPowersoftLoginSuccess = createEffect(() => this.actions$.pipe(
    ofType<PowersoftLoginSuccess>(StoresActionType.PowersoftLoginSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate')))
  ), { dispatch: false });

  disconnectPowersoft = createEffect(() => this.actions$.pipe(
    ofType<DisconnectPowersoft>(StoresActionType.DisconnectPowersoft),
    switchMap(action => (
      this.storesService.disconnectPowersoft(action.storeId)
    )
      .pipe(
        map(t => new DisconnectPowersoftSuccess(t as any)),
        catchError(a => of(new DisconnectPowersoftFailed(a.error.errors.map(err => this.toastr.error(err.message)))
      ))
      ))
  ));

  onDisconnectPowersoftSuccess = createEffect(() => this.actions$.pipe(
    ofType<DisconnectPowersoftSuccess>(StoresActionType.DisconnectPowersoftSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate')))
  ), { dispatch: false });

  synchronizePowersoftCatalog = createEffect(() => this.actions$.pipe(
    ofType<SynchronizePowersoftCatalog>(StoresActionType.SynchronizePowersoftCatalog),
    switchMap(action => this.storesService.synchronizePowersoftCatalog(action.storeId)
    .pipe(
      map(t => new SynchronizePowersoftCatalogSuccess()),
      catchError(a => of(new SynchronizePowersoftCatalogFailed(a.error.errors.map(err => this.toastr.error(err.message)))
    ))
    ))
  ));

  onSynchronizePowersoftCatalogSuccess = createEffect(() => this.actions$.pipe(
    ofType<SynchronizePowersoftCatalogSuccess>(StoresActionType.SynchronizePowersoftCatalogSuccess),
    tap(() => this.toastr.success(this.translateSer.instant('admin.store.catalog.catalogOfstoreimported')))
  ), { dispatch: false });

  hubriseLogin = createEffect(() => this.actions$.pipe(
    ofType<HubriseLogin>(StoresActionType.HubriseLogin),
    switchMap(action => this.storesService.hubriseLogin(action.storeId, action.authCode)
      .pipe(
        map(t => new HubriseLoginSuccess(t)),
        catchError(() => of(new HubriseLoginFailed()))
      ))
  ));

  hubriseLogout = createEffect(() => this.actions$.pipe(
    ofType<HubriseLogout>(StoresActionType.HubriseLogout),
    switchMap(action => this.storesService.hubriseLogout(action.storeId)
      .pipe(
        map(t => new HubriseLogoutSuccess(t)),
        catchError(() => of(new HubriseLogoutFailed()))
      ))
  ));

  onLoadCustomersPage = createEffect(() => this.actions$.pipe(
    ofType<LoadCustomersPage>(StoresActionType.LoadCustomersPage),
    switchMap(
      action => this.storesService.customersList(
        action.storeId, action.email, action.name, action.phoneNumber, action.sortingColumn, action.paging
      ).pipe(
        map(s => new LoadCustomersSuccess(s)),
        catchError(
          a => of(new LoadCustomersFailed(a.error.errors.map(err => this.toastr.error(err.message)))
        ))
      ))
  ));

  onCustomersDownload = createEffect(() => this.actions$.pipe(
    ofType<DownloadCustomersList>(StoresActionType.DownloadCustomersList),
    switchMap(action => this.storesService.downloadCustomersList(action.storeId, action.email, action.name, action.phoneNumber)
      .pipe(
        map(s => new DownloadCustomersListSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadCustomersListFailed('Customers list Download Failed')))
      ))
  ));

  onCustomersDownloadFailed = createEffect(() => this.actions$.pipe(
    ofType<DownloadCustomersListFailed>(
      StoresActionType.DownloadCustomersListFailed,
    ),
    tap(a => this.toastr.error(a.error, this.translateSer.instant('admin.store.message.actionFail')))
  ), { dispatch: false });

  onDownloadFlyerPdf = createEffect(() => this.actions$.pipe(
    ofType<DownloadFlyerFile>(StoresActionType.DownloadFlyerFile),
    switchMap(action => this.storesService.downloadOrRenderFlyerImage(action.storeId, action.voucherCode)
      .pipe(
        map(s => new DownloadFlyerFileSuccess(s.blob, decodeURIComponent(s.filename))),
        catchError(a => of(new DownloadFlyerFileFailed('An error occured. Please try again')))
      ))
  ));

  OnCustomEndPointValidate = createEffect(() => this.actions$.pipe(
    ofType<CustomEndPointValidate>(StoresActionType.CustomEndPointValidate),
    switchMap(action => this.storesService.validateCustomEndPoint(
      action.storeId, action.method, action.customEndPointValidationRequest
      ).pipe(
      map(s => {
        if (action.method !== 'get') {
          this.toastr.success(this.translateSer.instant('admin.store.message.settingsUpdate'), this.translateSer.instant('admin.alerts.headerSuccess'));
        }
        return new CustomEndPointValidateSuccess((!!s) ? s.endpoint : null);
      }),
      catchError(error => {
        if (action.method !== 'get') {
          if (error && error.error && error.error.errors.length > 0 && error.error.errors[0].message) {
            this.toastr.error(error.error.errors[0].message, this.translateSer.instant('admin.store.message.actionFail'));
          } else {
            this.toastr.error('An error occured. Please try again', this.translateSer.instant('admin.store.message.actionFail'));
          }
        }
        return of(new CustomEndPointValidateFailed('An error occured. Please try again'));
      })
    ))
  ));

  setUiStyles(settings: { [key: string]: any; }): void {
    ThemeUtils.setDefaultStyle();
  }
}
