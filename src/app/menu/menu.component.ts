import { TranslatableNavItem } from './+state/menu.reducer';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getLoggedInUser } from './../auth/+state/auth.selectors';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { getNavItems } from './+state/menu.selectors';
import { WindowRefService } from '../window.service';
import { TranslateService } from '@ngx-translate/core';
import { getSelectedStore } from '../stores/+state/stores.selectors';
import { HelperService } from '../public/helper.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  navItems: TranslatableNavItem[];
  public sidebarMinimized = false;
  private destroy$ = new Subject();
  constructor(
    private store: Store<any>, 
    private windowService: WindowRefService, 
    private translateService: TranslateService,
    private helperService: HelperService
  ) { }

  ngOnInit() {
    combineLatest([
        this.store.pipe(select(getLoggedInUser)),
        this.store.pipe(select(getNavItems)),
        this.store.pipe(select(getSelectedStore))
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([loggedInUser, items, selectedStore]) => {
        this.navItems = items.filter((item: any) => Object.prototype.hasOwnProperty.call(item, 'onlyMobile') ? (this.helperService.isMobileApp() ? item.onlyMobile : false) : true).map(x => Object.assign({}, x));
        this.navItems.forEach((item) => {

          if (item.storeRoles && !loggedInUser.superAdmin) {
            if (
              loggedInUser.storeRoles &&
              loggedInUser.storeRoles[selectedStore.id] &&
              item.storeRoles.includes(loggedInUser.storeRoles[selectedStore.id])
            ) {
              item.attributes = {};
            } else {
              item.attributes = {
                hidden: true
              };
            }
          }

          if (item.key === 'admin.global.partnerProgram.label' && loggedInUser.affiliate) {
            item.attributes = {};
          }

          if (item.key === 'admin.store.list.storesList' && !loggedInUser.superAdmin && loggedInUser.numberOfStores <= 1) {
            item.attributes = {
              hidden: true
            };
          }

          if (item.key === 'admin.users.userManage.label' && loggedInUser.superAdmin) {
            item.attributes = {};
          }

          if(item.key === 'Platform' && loggedInUser.platformAdmin) {
            item.attributes = {};
          }

          // if (item.key === 'admin.menu.preview') {
          //   item.url = (item.url as string)
          //     .replace('<protocol>', this.windowService.nativeWindowLocation.protocol)
          //     .replace('<domain>', this.windowService.nativeWindowLocation.host.replace('admin.', ''));
          // }
          if (item.key === 'admin.store.setting.billing') {
            if (
              selectedStore.subscription &&
              selectedStore.subscription.status &&
              (
                selectedStore.subscription.status === 'TRIAL' ||
                selectedStore.subscription.status === 'TRIAL_EXCEEDED'
              )
            ) {
              item.variant = 'warning';
              item.class = 'subscription-menu';
            } else {
              item.variant = '';
            }
          }
          if (item.key) {
            item.name = this.translateService.instant(item.key);
          }

        });

      });

    this.translateService.onLangChange.asObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => {
        this.navItems = this.navItems.map(x => Object.assign({}, x));
        this.navItems.forEach((item) => {
          if (item.key) {
            item.name = this.translateService.instant(item.key);
          }
          return item;
        });
      });
    this.updateSidebarState();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateSidebarState();
  }

  private updateSidebarState() {
    const width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    if (width < 576) {
      if (document.querySelector('body').classList.contains('sidebar-show')) {
        this.removeSideBarMinimized();
      } else {
        this.addSideBarMinimized();
      }
    } else if (width >= 576 && width < 1200) {
        if (document.querySelector('body').classList.contains('sidebar-show')) {
          this.removeSideBarMinimized();
        } else {
          this.addSideBarMinimized();
        }
    } else if (width >= 1200) {
      if (document.querySelector('body').classList.contains('sidebar-show')) {
        this.addSideBarMinimized();
      } else {
        this.removeSideBarMinimized();
      }
    }
  }

  removeSideBarMinimized() {
    document.querySelector('body').classList.remove('sidebar-minimized')
    document.querySelector('body').classList.remove('brand-minimized');
    this.sidebarMinimized = false;
  }

  addSideBarMinimized() {
    document.querySelector('body').classList.add('sidebar-minimized');
    document.querySelector('body').classList.add('brand-minimized');
    this.sidebarMinimized = true;
  }
}
