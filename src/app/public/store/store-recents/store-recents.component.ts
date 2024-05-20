import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { DomSanitizer } from '@angular/platform-browser';
import { getStoreRecentsList } from '../+state/stores.selectors';
import { Router } from '@angular/router';
import { take, takeUntil, filter, delay } from 'rxjs/operators';
import { CatalogState } from '../+state/stores.reducer';
import { StoreRecentsInfo } from '../../../stores/stores';
import { SaveStoreByAlias, SetMobileStore } from '../+state/stores.actions';
import { StoreSaveMode } from '../../../stores/stores';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { Actions, ofType } from '@ngrx/effects';
import { environment } from '../../../../environments/environment';
import {
  StoreActionType,
  SaveStoreByAliasSuccess,
  SaveStoreByAliasFailed,
} from '../+state/stores.actions';

@Component({
  selector: 'app-store-recents',
  templateUrl: './store-recents.component.html',
  styleUrls: ['./store-recents.component.scss']
})
export class StoreRecentsComponent implements OnInit {

  unsubscribe$: Subject<void> = new Subject<void>();

  storeRecentsList: StoreRecentsInfo[] = [];

  constructor(private router: Router,
    private store: Store<CatalogState>,
    private actions$: Actions,
    private zone: NgZone,
    private toastr: ToastrService,
    private translateSer: TranslateService) { }

  ngOnInit() {
    this.store.select(getStoreRecentsList).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      this.storeRecentsList = s.sort((a, b) => {
        const aDate = new Date(a.lastOpen);
        const bDate = new Date(b.lastOpen);
        return (bDate.getTime() - aDate.getTime());
      });
    });

    this.actions$.pipe(
      ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
      filter(action => action.saveMode === StoreSaveMode.URL),
      take(1),
    ).subscribe(action => {
      this.zone.run(() => {
        if (action.storeAlias) {
          this.store.dispatch(new SetMobileStore(action.storeAlias));
          this.router.navigate([`/public/customer/store/${action.storeAlias}`]);
        }
      });
    });

    this.actions$.pipe(
      ofType<SaveStoreByAliasFailed>(StoreActionType.SaveStoreByAliasFailed),
      take(1),
      delay(2000),
    ).subscribe(_ => {
      this.zone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
    });
  }

  onClickStore(storeAlias: string) {
    this.store.dispatch(new SaveStoreByAlias(storeAlias, `https://${storeAlias}.${environment.backend.domain}`, StoreSaveMode.URL));
  }

}
