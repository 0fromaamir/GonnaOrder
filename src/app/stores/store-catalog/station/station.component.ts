import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { getCatalogOverview } from '../+state/stores-catalog.selectors';
import { CatalogState } from '../+state/stores-catalog.reducer';
import { getSelectedStore } from '../../+state/stores.selectors';
import { Station } from '../stores-catalog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-station',
  templateUrl: './station.component.html',
  styleUrls: ['./station.component.scss']
})
export class StationComponent implements OnInit, OnDestroy{
  stations: Station[];
  hideButtonForStandardUser: boolean;
  private destroy$ = new Subject();
  private storeId: number;
  private catalogId: number;
  constructor(
    private store: Store<any>,
    private catalog: Store<CatalogState>,
    private router: Router){}

  
  ngOnInit(): void {
    const catalog$ = this.catalog.pipe(select(getCatalogOverview));
    this.store.pipe(
      select(getSelectedStore),
      takeUntil(this.destroy$),
    ).subscribe(s => {
      this.storeId = s.id;
      catalog$.subscribe(data => {
        if (data) {
          this.catalogId = data.catalogId ? data.catalogId : 0;
          this.stations = data.stations ? data.stations : [];
        }
      });
    });

    this.store.pipe(
      select(getLoggedInUser),
      takeUntil(this.destroy$)
    ).subscribe(s => {
      if (s.storeRoles && this.storeId && s.storeRoles[+this.storeId] === 'STORE_STANDARD') {
        this.hideButtonForStandardUser = true;
      }
    });
  }

  addStationHandler(){
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/station/createStation`]);
  }

  onStationClick(station: Station) {
    this.router.navigate([`/manager/stores/${this.storeId}/catalog/${this.catalogId}/station/${station.stationId}`]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
