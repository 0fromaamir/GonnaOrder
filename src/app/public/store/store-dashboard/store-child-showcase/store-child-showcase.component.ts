import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { ClientStore, StoreSaveMode } from 'src/app/stores/stores';
import { SelectedStoreState } from '../../+state/stores.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { HelperService } from '../../../helper.service';
import { WINDOW } from '../../../window-providers';
import { StoreService } from '../../store.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofType } from '@ngrx/effects';
import { LoadStore, SaveStoreByAlias, SaveStoreByAliasFailed, SaveStoreByAliasSuccess, SetMobileStore, StoreActionType } from '../../+state/stores.actions';
import { LocationService } from 'src/app/public/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store-child-showcase',
  templateUrl: './store-child-showcase.component.html',
  styleUrls: ['./store-child-showcase.component.scss'],
})
export class StoreChildShowcaseComponent implements OnInit, OnDestroy {
  childStores = [];
  openTimeSchedule: any;
  isDark = true;
  selectedStore$: Observable<ClientStore>;
  unsubscribe$: Subject<void> = new Subject<void>();
  openTimeModal: Subject<any> = new Subject();
  logoMargin = 70;

  constructor(
    private store: Store<SelectedStoreState>,
    private locationService: LocationService,
    private storeService: StoreService,
    private router: Router,
    private helper: HelperService,
    @Inject(WINDOW) public window: Window,
    private _ref: ChangeDetectorRef,
    private toastr: ToastrService,
    private translateSer: TranslateService,
    private actions$: Actions,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.selectedStore$ = this.store.pipe(select(getSelectedStore));

    this.selectedStore$.pipe(takeUntil(this.unsubscribe$)).subscribe((selectedStore) => {
      selectedStore.relation?.childStores?.map((store) =>
        this.storeService
          .load(store.storeAlias)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((childStore) => {
            const openingHoursSchedule = childStore.specialSchedules?.find((s) => s.type === 'OPENING_HOURS');
            childStore.openTimeSchedule = openingHoursSchedule
              ? this.helper.processOpenTimeSchedule(openingHoursSchedule.schedule, childStore.timeZone)
              : undefined;

            childStore.locationUrl = this.storeService.getSiblingUrl(childStore.id, childStore.aliasName, this.helper.getDomainUrl());

            this.childStores = this.childStores.concat(childStore);
            this._ref.detectChanges();
          })
      );
    });
  }

  onOpenTimeModal(event: any, openTimeChildSchedule?: any) {
    event.preventDefault();
    this.openTimeModal.next(openTimeChildSchedule);
  }


  onChildStoreClick(selectedChildStore: ClientStore) {
    if (this.helper.isMobileApp()) {
      this.actions$.pipe(
        ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
        filter(action => action.saveMode === StoreSaveMode.URL),
        take(1),
      ).subscribe(action => {
        if (this.locationService.isOrderCapture()) {
          this.router.navigateByUrl(`/manager/stores/${selectedChildStore.id}/capture/${selectedChildStore.aliasName}`);
          this.store.dispatch(new LoadStore(selectedChildStore.aliasName));
          this.locationService.setOrderUuid(null);
        } else {
          if (action.storeAlias) {
            this.store.dispatch(new SetMobileStore(action.storeAlias));
            this.router.navigate([`/public/customer/store/${action.storeAlias}`]);
          }
        }
      });
      this.actions$.pipe(
        ofType<SaveStoreByAliasFailed>(StoreActionType.SaveStoreByAliasFailed),
        take(1),
      ).subscribe(_ => {
        this.zone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
      });
      this.store.dispatch(new SaveStoreByAlias(selectedChildStore.aliasName, selectedChildStore.locationUrl, StoreSaveMode.URL));
    } else {
      window.open(selectedChildStore.locationUrl, '_self');
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
