import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { SelectedStoreState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';

import { LocationService } from '../../location.service';

import { LoadStore,
  SaveStoreByAlias,
  SaveStoreByAliasFailed,
  SaveStoreByAliasSuccess,
  StoreActionType,
  SetMobileStore
} from '../+state/stores.actions';

import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofType } from '@ngrx/effects';
import { HelperService } from '../../helper.service';
import { StoreService } from '../store.service';
import { StoreSaveMode } from 'src/app/stores/stores';

@Component({
  selector: 'app-store-sibling-selector',
  templateUrl: './store-sibling-selector.component.html',
  styleUrls: ['./store-sibling-selector.component.scss']
})
export class StoreSiblingSelectorComponent implements OnInit, OnDestroy {

  siblings: any[] = [];
  selectedSibling = {
    storeId: 0,
    storeAlias: null,
    storeName: null,
  };
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store: Store<SelectedStoreState>,
    private locationService: LocationService,
    private storeService: StoreService,
    private router: Router,
    private toastr: ToastrService,
    private translateSer: TranslateService,
    private actions$: Actions,
    private zone: NgZone,
    private helper: HelperService
  ) { }

  ngOnInit(): void {
    this.store
      .select(getSelectedStore)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((store) => {
        this.selectedSibling = {storeId: store.id, storeAlias: store.aliasName, storeName: store.name};
        this.siblings = [
          this.selectedSibling,
          ...store.relation.siblingStores.filter((sibling) => !sibling.isIndependent),
        ];
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  siblingSelected() {
    if (this.helper.isMobileApp()) {
      this.actions$.pipe(
        ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
        filter(action => action.saveMode === StoreSaveMode.URL),
        take(1), 
      ).subscribe(action => {
        if (this.locationService.isOrderCapture()) {
          this.router.navigateByUrl(`/manager/stores/${this.selectedSibling.storeId}/capture/${this.selectedSibling.storeAlias}`);
          this.store.dispatch(new LoadStore(this.selectedSibling.storeAlias));
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
      ).subscribe(action => {
        this.zone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
      });
      this.store.dispatch(new SaveStoreByAlias(this.selectedSibling.storeAlias, `https://${this.selectedSibling.storeAlias}.${environment.backend.domain}`, StoreSaveMode.URL));
    } else {
      if (this.locationService.isOrderCapture()) {
        this.router.navigateByUrl(`/manager/stores/${this.selectedSibling.storeId}/capture/${this.selectedSibling.storeAlias}`);
        this.store.dispatch(new LoadStore(this.selectedSibling.storeAlias));
        this.locationService.setOrderUuid(null);
      } else {
        window.location.href = this.storeService.getSiblingUrl(this.selectedSibling.storeId,
                                                                this.selectedSibling.storeAlias,
                                                                this.helper.getDomainUrl());
      }
    }
  }
}
