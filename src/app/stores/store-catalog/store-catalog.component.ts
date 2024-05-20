import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { helpPage } from 'src/app/shared/help-page.const';
import { Offer } from './stores-catalog';
import { Store, select } from '@ngrx/store';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { LoggedInUser } from 'src/app/auth/auth';
import { Observable } from 'rxjs';

export interface DialogData {
  offerItem: Offer;
  status: string;
}
@Component({
  selector: 'app-store-catalog',
  templateUrl: './store-catalog.component.html',
  styleUrls: ['./store-catalog.component.scss']
})
export class StoreCatalogComponent implements OnInit {
  catalogHelpPage = helpPage.catalog;
  catalogUrl: string;
  loggedInUser$: Observable<LoggedInUser>;
  isStandardUser: boolean = false;

  constructor(private route: ActivatedRoute, private store: Store<any>, private router: Router) { }

  ngOnInit() {
    this.loggedInUser$ = this.store.pipe(select(getLoggedInUser));
    const params = this.route.params as { [key: string]: any };
    this.catalogUrl = `/manager/stores/${params._value.id}/catalog`;
    this.loggedInUser$.subscribe(s => {
      if (s && s.storeRoles && params._value.id && (s.storeRoles[+params._value.id] === 'STORE_STANDARD')) {
        this.isStandardUser = true;
      }
    });
  }

  isButtonActive() {
    const currentUrl = this.router.url;
    const queryParams = this.route.snapshot.queryParams;
    const parts = currentUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return (lastPart === 'catalog' || (lastPart.includes('catalog') && Object.keys(queryParams).includes('selectedId'))) ? true : false;
  }

  isStationTabSelected() {
    const currentUrl = this.router.url;
    const queryParams = this.route.snapshot.queryParams;
    const parts = currentUrl.split('/');
    const lastPart = parts[parts.length - 1];
    return (lastPart === 'station' || (lastPart.includes('station') && Object.keys(queryParams).includes('stationId'))) ? true : false;
  }
}
