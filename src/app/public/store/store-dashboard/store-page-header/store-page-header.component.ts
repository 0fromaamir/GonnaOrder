import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { ClientStore } from 'src/app/stores/stores';
import { SelectedStoreState } from '../../+state/stores.reducer';
import { getSelectedStore, getSelectedStoreLoadingFrequency } from '../../+state/stores.selectors';
import { filter, takeUntil } from 'rxjs/operators';
import { HelperService } from 'src/app/public/helper.service';
import { CheckoutService } from '../../store-checkout/checkout.service';

@Component({
  selector: 'app-store-page-header',
  templateUrl: './store-page-header.component.html',
  styleUrls: ['./store-page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorePageHeaderComponent implements OnInit, OnDestroy {
  selectedStore$: Observable<ClientStore>;
  selectedStore: ClientStore;
  unsubscribe$: Subject<void> = new Subject<void>();
  openTimeModal: Subject<any> = new Subject();

  backgroundMargin = 200;
  logoMargin = 60;
  logoBackgrondColor = 'rgba(0,0,0,1)';
  isDark = true;

  openTimeSchedule: any;

  constructor(private helper: HelperService, private store: Store<SelectedStoreState>, private checkoutService: CheckoutService) { }

  ngOnInit() {
    this.selectedStore$ = this.store.pipe(select(getSelectedStore));

    this.selectedStore$.pipe(takeUntil(this.unsubscribe$)).subscribe((selectedStore) => {
      this.selectedStore = selectedStore;

      const openingHoursSchedule = this.selectedStore?.specialSchedules?.find((s) => s.type === 'OPENING_HOURS');
      this.openTimeSchedule = openingHoursSchedule
        ? this.helper.processOpenTimeSchedule(openingHoursSchedule.schedule, this.selectedStore.timeZone)
        : undefined;
    });

    this.store
      .pipe(
        takeUntil(this.unsubscribe$),
        select(getSelectedStoreLoadingFrequency)
      )
      .subscribe((d) => {
        if (
          d &&
          this.checkoutService.ifStoreClosed() &&
          !this.checkoutService.isFutureOrderingEnabled()
        ) {
          this.openTimeModal.next(this.openTimeSchedule);
        }
      });
  }


  onOpenTimeModal(event: any) {
    event.preventDefault();
    this.openTimeModal.next(this.openTimeSchedule);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isClosedForOrdering() {
    return this.checkoutService.isClosedForOrdering();
  }
}
