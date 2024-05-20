import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { SelectedStoreState } from '../+state/stores.reducer';
import { getSelectedStore } from '../+state/stores.selectors';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ClientStore } from 'src/app/stores/stores';

@Component({
  selector: 'app-store-dashboard',
  templateUrl: './store-dashboard.component.html',
  styleUrls: ['./store-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreDashboardComponent implements OnInit, OnDestroy {
  @Input() acceptTermVisible = false;
  selectedStore: ClientStore;
  hasChild: boolean = true;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store: Store<SelectedStoreState>) {}

  ngOnInit() {
    this.store
      .pipe(select(getSelectedStore))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((selectedStore) => {
        this.selectedStore = selectedStore;
        this.hasChild = selectedStore?.relation?.childStores?.length > 0;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
