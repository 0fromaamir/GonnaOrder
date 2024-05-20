import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientStore } from '../stores';
import { StoresState } from '../+state/stores.reducer';
import { Store, select } from '@ngrx/store';
import { getSelectedStore } from '../+state/stores.selectors';
import { helpPage } from 'src/app/shared/help-page.const';
import { Router, ActivatedRoute, NavigationEnd, Scroll } from '@angular/router';


@Component({
  selector: 'app-store-settings-dashboard',
  templateUrl: './store-settings-dashboard.component.html',
  styleUrls: ['./store-settings-dashboard.component.scss']
})
export class StoreSettingsDashboardComponent implements OnInit {

  isActive = false;
  store$: Observable<ClientStore>;
  settingsHelpPage = helpPage.settingsStoreDetails;
  storeid = 0;
  defaultUrl = '';
  isHelpIconShow = true;
  multiStoreDefaultUrl = 'multi-store';
  isMultiStoreActive = false;
  constructor(private store: Store<StoresState>, private route: Router, private activeRoute: ActivatedRoute) {
  }
  ngOnInit() {
    this.storeid = this.activeRoute.snapshot.params.id;
    this.defaultUrl = '/manager/stores/' + this.storeid + '/settings';
    this.isActive = (this.defaultUrl === this.route.url);
    this.route.events.subscribe(val => {
      /*
        Router outlet ends navigation router events before component loaded it is breaking change in Angular 15( https://angular.io/guide/update-to-version-15#routeroutlet-instantiates-the-component-after-change-detection).
        scroll event emits after component is loaded hence we can also check that event which is triggered from app component window.scrollTo(0, 0);
        https://github.com/angular/angular/issues/49996
    */
      if (val instanceof NavigationEnd || val instanceof Scroll) {
        const navigationEndEvent: NavigationEnd = val instanceof NavigationEnd ? val : val.routerEvent;
        this.isActive = (navigationEndEvent.url === this.defaultUrl);
        if (navigationEndEvent.url.includes('multi-store')) {
          this.isMultiStoreActive = true;
          this.isHelpIconShow = false;
          setTimeout(() => {
            this.settingsHelpPage = helpPage.menuSettingsMultipleStore;
            this.isHelpIconShow = true;
          });
        } else {
          this.isMultiStoreActive = false;
        }
      }
    });
    const tempUrl = this.route.url.split('/');
    this.changeHelpTitle(tempUrl[tempUrl.length - 1]);
    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.store$.subscribe((selectedStore) => {
      if (selectedStore.relation && ((selectedStore.relation.parentStore && selectedStore.relation.parentStore.storeId > 0)
        || (selectedStore.relation.childStores && selectedStore.relation.childStores.length > 0))) {
        this.multiStoreDefaultUrl = 'multi-store/relation-tree';
      } else {
        this.multiStoreDefaultUrl = 'multi-store/parentStorelist';
      }
    });
    this.activeRoute.url.subscribe(() => {
      this.isMultiStoreActive = (this.route.url.includes('multi-store'));
    });
  }
  changeHelpTitle(type: string) {
    switch (type) {
      case 'details':
      case 'store-edit':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreDetails;
          this.isHelpIconShow = true;
        });
        break;
      case 'ordering':
      case 'edit':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreOrdering;
          this.isHelpIconShow = true;
        });
        break;
      case 'payment':
      case 'payment-methods':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStorePayment;
          this.isHelpIconShow = true;
        });
        break;
      case 'pickup':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStorePickup;
          this.isHelpIconShow = true;
        });
        break;
      case 'delivery':
      case 'address':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreDelivery;
          this.isHelpIconShow = true;
        });
        break;
      case 'locations':
      case 'table':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreLocations;
          this.isHelpIconShow = true;
        });
        break;
      case 'reservation':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsReservations;
          this.isHelpIconShow = true;
        });
        break;
      case 'catalog':
      case 'default-catalog':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreCatalog;
          this.isHelpIconShow = true;
        });
        break;
      case 'OrderingRule':
      case 'ordering-rules':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.settingsStoreOrderingRule;
          this.isHelpIconShow = true;
        });
        break;
      case 'schedules':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreSchedules;
          this.isHelpIconShow = true;
        });
        break;
      case 'discountvouchers':
      case 'discount-voucher':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreDiscountVouchers;
          this.isHelpIconShow = true;
        });
        break;
      case 'marketing':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreMarketing;
          this.isHelpIconShow = true;
        });
        break;
      case 'domainandapps':
      case 'store-domain':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreDomainsAndApps;
          this.isHelpIconShow = true;
        });
        break;
      case 'integrations':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreIntegrations;
          this.isHelpIconShow = true;
        });
        break;
      case 'branding':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreBranding;
          this.isHelpIconShow = true;
        });
        break;
      case 'loyalty':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreLoyalty;
          this.isHelpIconShow = true;
        });
        break;
      case 'order-management':
        this.isHelpIconShow = false;
        setTimeout(() => {
          this.settingsHelpPage = helpPage.SettingsStoreOrderManagement;
          this.isHelpIconShow = true;
        });
        break;
    }
  }
}
