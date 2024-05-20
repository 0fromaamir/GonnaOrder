import { Component, OnInit, Inject, Renderer2, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getLoggedInUser } from 'src/app/auth/+state/auth.selectors';
import { getSelectedStore, getStoresList } from 'src/app/stores/+state/stores.selectors';
import { Logout } from 'src/app/auth/+state/auth.actions';
import { ClientStore } from 'src/app/stores/stores';
import { StoresList } from 'src/app/stores/+state/stores.reducer';
import { map, takeUntil } from 'rxjs/operators';
import { LoggedInUser } from 'src/app/auth/auth';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { isNewVersionAvailable } from 'src/app/application-state/+state/application-state.selectors';
import {WhitelabelService} from "../../shared/whitelabel.service";
import { HelperService } from 'src/app/public/helper.service';
import { StoresService } from 'src/app/stores/stores.service';
import { RequestNotificationPermission } from 'src/app/stores/+state/stores.actions';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

  username$: Observable<string>;
  store$: Observable<ClientStore>;
  storeList$: Observable<StoresList>;
  changeBtnVisible$: Observable<boolean>;
  hasPassword$: Observable<boolean>;
  isNewVersionAvailable$: Observable<boolean>;
  isPos = false;
  whiteLabelLogo: string
  whitelabelCommericalUrl: string;
  whiteLabelName: string

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store: Store<any>
    , private renderer: Renderer2
    , @Inject(DOCUMENT) private document: any
    , private router: Router
    , private whitelabelService: WhitelabelService
    , private helperService: HelperService
    , private storesService: StoresService
  ) { }

  ngOnInit() {
    this.document.documentElement.lang = 'en';
    this.isPos = this.router.url.includes('/capture/');
    this.router.events.subscribe(_ => {
      this.isPos = this.router.url.includes('/capture/');
    });

    const loggedInUser$: Observable<LoggedInUser> = this.store.pipe(
      select(getLoggedInUser)
    );

    this.username$ = loggedInUser$.pipe(
      map(u => u.username)
    );

    this.changeBtnVisible$ = loggedInUser$.pipe(
      map(u => u.superAdmin || u.numberOfStores > 1)
    );

    this.hasPassword$ = loggedInUser$.pipe(
      map(u => u.authenticationMethod === 'PASSWORD')
    );

    this.store$ = this.store.pipe(
      select(getSelectedStore)
    );
    this.storeList$ = this.store.pipe(
      select(getStoresList)
    );

    this.document.title = this.whitelabelService.getWhiteLabelName();

    this.isNewVersionAvailable$ = this.store.pipe(select(isNewVersionAvailable));

    this.whiteLabelLogo = this.whitelabelService.getWhitelabelLogo();
    this.whitelabelCommericalUrl = this.whitelabelService.getWhitelabelCommericalUrl();
    this.whiteLabelName = this.whitelabelService.getWhiteLabelName();

    this.store.select(getSelectedStore).pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((selectedStore) => {
      if (this.helperService.isMobileApp()) {
        this.storesService.getStorage('notificationSubscriptions')
          .then(subscriptions => {
            const notificationsEnabled = (!!selectedStore.id && !!subscriptions) ? (subscriptions[`${selectedStore.id}`] !== undefined ? true : false) || false : false;
            if (notificationsEnabled) {
              this.store.dispatch(new RequestNotificationPermission());
            }
          });
      }
    });
  }

  logout() {
    this.store.dispatch(new Logout({
      src: "AdminLayoutComponent",
      description: "Logout from admin layout"
    }));
  }

  isNotAdmin() {
    return false;
  }

  closeMobileMenu(event) {
    event.preventDefault();
    this.renderer.removeClass(this.document.body, 'sidebar-show');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
