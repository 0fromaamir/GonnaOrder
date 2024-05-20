import { Component, OnInit, Inject, OnDestroy, AfterViewChecked } from '@angular/core';
import { WINDOW } from '../../public/window-providers';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/public/helper.service';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { SaveStoreByAliasSuccess, SetCustomerFooterHeight, StoreActionType } from 'src/app/public/store/+state/stores.actions';
import { Platform } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent implements OnInit, OnDestroy, AfterViewChecked {
  isRecentsActive = false;
  isHomeActive = false;
  isStoreActive = false;
  subdomain: string;
  isGoApp: boolean = false;
  storeDetails: any;
  customerFooterHeight: number;
  isKeyboardOpen: boolean = false;

  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    @Inject(WINDOW) private window: Window,
    private helper: HelperService,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private platform: Platform,
    private keyboard: Keyboard
  ) { }

  ngOnInit() {
    this.isHomeActive = true;

    this.isGoApp = this.helper.isGoApp();
    this.getSubdomain();

    this.actions$.pipe(
      ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
      takeUntil(this.unsubscribe$),
    ).subscribe(action => {
      this.storeDetails = action;
      this.resetActiveStates();
      this.isStoreActive = true;
    });

    if (this.isGoApp) {
      this.platform.ready().then(() => {
        this.keyboard.onKeyboardWillShow().pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(() => {
          this.isKeyboardOpen = true;
        });

        this.keyboard.onKeyboardWillHide().pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(() => {
          this.isKeyboardOpen = false;
        });
      });
    }
  }

  ngAfterViewChecked(): void {
    this.setCustomerFooterHeight();
  }

  getSubdomain() {
    const domain = this.window.location.hostname;
    if (domain.indexOf('.') < 0 ||
      domain.split('.')[0] === 'example' || domain.split('.')[0] === 'lvh' || domain.split('.')[0] === 'www') {
      this.subdomain = '';
    } else {
      this.subdomain = domain.split('.')[0];
    }
  }

  OnClickRecents() {
    this.resetActiveStates();
    this.isRecentsActive = true;
    this.router.navigate(['public/customer/recents']);
  }

  onClickPlus() {
    this.resetActiveStates();
    this.isHomeActive = true;
    this.storeDetails = null;
    this.router.navigate(['public/customer']);
  }

  OnclickCurrent(storeAlias) {
    this.resetActiveStates();
    this.isStoreActive = true;
    this.router.navigate([`public/customer/store/${storeAlias}`]);
  }

  resetActiveStates() {
    this.isRecentsActive = false;
    this.isHomeActive = false;
    this.isStoreActive = false;
  }

  setCustomerFooterHeight() {
    let customerFooter = document.getElementById('customer-footer-wrapper');

    if (customerFooter.offsetHeight !== this.customerFooterHeight) {
      this.customerFooterHeight = this.isKeyboardOpen ? 0 : customerFooter.offsetHeight;
      this.store.dispatch(new SetCustomerFooterHeight(this.customerFooterHeight));
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
