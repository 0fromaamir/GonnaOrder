import { ApplicationRef, Component, OnInit, NgZone } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Store } from '@ngrx/store';
import { concat, from, interval } from 'rxjs';
import { filter, first, take, map } from 'rxjs/operators';
import { NewServiceWorkerVersion } from './application-state/+state/application-state.actions';
import { ViewportService } from "./shared/viewport.service";
import { Platform } from '@ionic/angular';
import { environment } from '../environments/environment';
import { Actions, ofType } from '@ngrx/effects';
import { SaveStoreByAlias, SaveStoreByAliasFailed, SaveStoreByAliasSuccess, SetMobileStore, StoreActionType } from './public/store/+state/stores.actions';
import { StoreSaveMode } from './stores/stores';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { HelperService } from './public/helper.service';
import { APPMODE } from 'src/environments/appmode.enum';
import {WhitelabelService} from "./shared/whitelabel.service";
import { ClearOrderPayment } from './public/payments/+state/payment.actions';
import { LogService } from './shared/logging/LogService';
import { StoresService } from './stores/stores.service';
import { defaultPaging } from './api/types/Pageable';
import { GoToast } from './shared/go-toast.component';
import { OrderDirectPrint } from './printers/+state/printers.actions';
import { getNotificationSubscriptionsByStoreId } from './stores/+state/stores.selectors';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Deeplinks } from '@awesome-cordova-plugins/deeplinks/ngx';

export let browserRefresh = false;
@Component({
  // tslint:disable-next-line
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'GonnaOrder';
  deeplinks: Deeplinks; 
  firebaseX: FirebaseX;
  statusBar: StatusBar;

  constructor(private router: Router,
    private swUpdate: SwUpdate,
    private appRef: ApplicationRef,
    private store: Store<any>,
    private viewportService: ViewportService,
    private actions$: Actions,
    private ngZone: NgZone,
    private toastr: ToastrService,
    private translateSer: TranslateService,
    private platform: Platform,
    private helperService: HelperService,
    private whitelabelService: WhitelabelService,
    private logger: LogService,
    private storesService: StoresService,
    ) {

    if (environment.mode !== APPMODE.Web) {
      this.platform.ready().then(() => {

        this.deeplinks = new Deeplinks();
        this.statusBar = new StatusBar();

        if (helperService.isMobileApp()) {
          this.statusBar.overlaysWebView(false);
          this.statusBar.backgroundColorByHexString('#000000');
        }
        
        if (helperService.isGoAdminApp()) {
          this.firebaseX = new FirebaseX();
          this.firebaseX.onMessageReceived().subscribe((payload) => {
            this.logger.debug("fcm: onNotification", payload);
            if (payload) {
              this.storesService.list(defaultPaging, payload.storeAlias).pipe(
                take(1),
                filter(result => result.data.length > 0),
                map(result => result.data[0])
              ).subscribe(clientStore => {
                if (clientStore) {
                  this.store.select(getNotificationSubscriptionsByStoreId, { storeId: clientStore.id }).pipe(take(1))
                  .subscribe(notificationEnabled => {
                    this.logger.debug('message_callback', notificationEnabled)
                    if (this.helperService.isAndroid()) {
                      if (notificationEnabled && (!payload.tap || (payload.tap && payload.tap == "foreground"))) {
  
                        const toast = this.toastr.success(null, `New order ${payload.orderToken} just received!`, {
                          toastComponent: GoToast,
                        })
                        if (!toast.toastRef.componentInstance) toast.toastRef.componentInstance = {}
                        toast.toastRef.componentInstance.storeId = clientStore.id;
                        toast.toastRef.componentInstance.orderUuid = payload.uuid;
                        
                      } else if(payload.tap && payload.tap == "background") {
                        this.ngZone.run(() => {
                          this.router.navigate([`/manager/stores/${clientStore.id}/orders`]).then(() => {
                            this.router.navigate([`/manager/stores/${clientStore.id}/orders/${payload.uuid}`])
                          })
                        });
                      }
                      this.store.dispatch(new OrderDirectPrint(payload, clientStore.id));
                    } else if (this.helperService.isIOS()) {
                      if (notificationEnabled && (!payload.tap || (payload.tap && payload.tap == "foreground"))) {
  
                        const toast = this.toastr.success(null, `New order ${payload.orderToken} just received!`, {
                          toastComponent: GoToast,
                        })
                        toast.toastRef.componentInstance.storeId = clientStore.id;
                        toast.toastRef.componentInstance.orderUuid = payload.uuid;
                      } else if(payload.tap && payload.tap == "background") {
                        this.ngZone.run(() => {
                          this.router.navigate([`/manager/stores/${clientStore.id}/orders`]).then(() => {
                            this.router.navigate([`/manager/stores/${clientStore.id}/orders/${payload.uuid}`])
                          })
                        });
                      }
                      this.logger.debug("triggering direct print...", payload);
                      this.store.dispatch(new OrderDirectPrint(payload, clientStore.id));
                    } else {
                      this.logger.error('Not supported device');
                      return;
                    }
                  });
                } else {
                  this.logger.debug("ignores received message as this does not belong to the current user...");
                }
              });
            } else {
              this.logger.debug("ignores received notification as there is no payload...");
            }
          },
          (err) => {
            this.logger.error("fcm onMessageReceivedError: ", err);
          });
        }

        this.deeplinks.route({
          '/stripe/verification': {
            type: 'stripe-verification'
          },
          '/public/customer/store/:storeAlias': {
            type: 'customer-app'
          },
          '/public/template/:storeAlias': {
            type: 'template-app'
          },
          '/manager/stores/:storeId/capture/:storeAlias': {
            type: 'admin-app'
          },
          ':storeAlias/payment-redirect/:provider/:storeId/:orderUuid': {
            type: 'payment-redirect'
          },
          '/public': '',
          '/': ''
        }).subscribe((match) => {          
          // match.$route - the route we matched, which is the matched entry from the arguments to route()
          // match.$args - the args passed in the link
          // match.$link - the full link data
          console.log(match)
          if (match.$route.type == "stripe-verification") {
            this.ngZone.run(() => this.router.navigate([ match.$link.path ], {
              queryParams: {
                payment_intent: match.$args.payment_intent,
                payment_intent_client_secret: match.$args.payment_intent_client_secret,
                storeId: match.$args.storeId,
                orderUuid: match.$args.orderUuid,
                redirect_status: match.$args.redirect_status,
              }
            }));
          } else if (this.helperService.isGoApp() && match.$route.type == "customer-app" && match.$args.storeAlias) {
            const storeAlias = match.$args.storeAlias;

            this.actions$.pipe(
              ofType<SaveStoreByAliasSuccess>(StoreActionType.SaveStoreByAliasSuccess),
              filter(action => action.saveMode === StoreSaveMode.DEEPLINK),
              take(1),
            ).subscribe(action => {
              if (action.storeAlias) {
                this.ngZone.run(() => {
                  this.store.dispatch(new SetMobileStore(action.storeAlias));
                  this.router.navigateByUrl('/public/customer', { skipLocationChange: true }).then(() => {
                    this.router.navigateByUrl(`/public/customer/store/${action.storeAlias}${match.$link.fragment ? `#${match.$link.fragment}` : ''}`);
                  })
                });
              }
            });
            this.actions$.pipe(
              ofType<SaveStoreByAliasFailed>(StoreActionType.SaveStoreByAliasFailed),
              take(1),
            ).subscribe(action => {
              this.ngZone.run(() => this.toastr.info(this.translateSer.instant('public.main.storeNotFound'), this.translateSer.instant('public.global.information')));
            })

            if (match.$link.url.includes('#thankyou') || match.$link.url.includes('#cart')) {
              this.store.dispatch(new ClearOrderPayment({
                src: 'StoreCheckoutPaymentComponent',
                description: `Payment Status: INITIAL`
              }));
            }

            this.store.dispatch(new SaveStoreByAlias(storeAlias, `https://${storeAlias}.${environment.backend.domain}`, StoreSaveMode.DEEPLINK));

          } else if (this.helperService.isGoTemplateApp() && match.$route.type == "template-app" && match.$args.storeAlias) {
            if (environment.templateStoreAlias && environment.templateStoreAlias == match.$args.storeAlias) {
              this.ngZone.run(() => this.router.navigate([`/public/template/${match.$args.storeAlias}`]));
            }
          } else if (this.helperService.isGoTemplateApp() && match.$route.type == "payment-redirect") {
            this.ngZone.run(() => {
              this.router.navigateByUrl(match.$link.path);
            });
          } else if (this.helperService.isGoApp() && match.$route.type == "payment-redirect") {
            this.ngZone.run(() => {
              this.router.navigateByUrl(match.$link.path);
            });
          } else if (match.$link.url.includes('thankyou')) {
            this.ngZone.run(() => {
              this.router.navigateByUrl(`${match.$link.path}${match.$link.fragment ? `#${match.$link.fragment}` : ''}`);
            });
          } else if (match.$link.url.includes('#cart')) {
            this.ngZone.run(() => {
              this.store.dispatch(new ClearOrderPayment({
                src: 'StoreCheckoutPaymentComponent',
                description: `Payment Status: INITIAL`
              }));
              let baseUrl = '/';

              if (match.$link.url.includes('/capture')) {
                baseUrl = '/manager'
              }
              
              this.router.navigateByUrl(baseUrl, { skipLocationChange: true }).then(() => {                
                this.router.navigateByUrl(`${match.$link.path}${match.$link.fragment ? `#${match.$link.fragment}` : ''}`);
              }); 
            });
          }
        },
        (nomatch) => {
          // nomatch.$link - the full link data
          console.error('Got a deeplink that didn\'t match', nomatch);
        })
      });
    }

    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
  }

  ngOnInit() {
    console.log('checking for app version');
    if (this.swUpdate.isEnabled) {
      console.log('service worker enabled');

      const every30Seconds$ = interval(30 * 1000);
      const appIsStable$ = this.appRef.isStable.pipe(
        first(isStable => isStable === true)
      );

      concat(appIsStable$, every30Seconds$)
        .subscribe(() => {
          console.log('checking for updates');
          this.swUpdate.checkForUpdate();
        });

      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map(evt => {
          console.log('current version is', evt.currentVersion);
          console.log('available version is', evt.latestVersion);
          this.store.dispatch(new NewServiceWorkerVersion(evt.currentVersion.hash, evt.latestVersion.hash));
        })
      );

      this.swUpdate.activateUpdate().then(() => {
          console.log('update activated');
        });

      /*
      this.swUpdate.available.subscribe(event => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        this.store.dispatch(new NewServiceWorkerVersion(event.current.hash, event.available.hash));
      });


      this.swUpdate.activated.subscribe(event => {
        console.log('old version was', event.previous);
        console.log('new version is', event.current);
      });
      */
    }

    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });

    // disable zoom in for ios
    this.viewportService.applyCustomViewportForIOS();

    if (environment.mode == APPMODE.Web || environment.mode == APPMODE.Admin) {
      this.title = this.whitelabelService.getWhiteLabelName();
      if(document.readyState !== 'loading') {
        this.setBrandColors();
      }
      else {
        document.addEventListener('DOMContentLoaded',  () => this.setBrandColors());
      }
    }
  }

  private setBrandColors() {
    const primaryBrandColour = this.whitelabelService.getWhiteLabelPrimaryBrandColour();
    const secondaryBrandColour = this.whitelabelService.getWhiteLabelSecondaryBrandColour();
    // Set the custom properties for the current domain
    document.documentElement.style.setProperty('--primary-brand-color', primaryBrandColour, 'important');
    document.documentElement.style.setProperty('--secondary-brand-color', secondaryBrandColour, 'important');
  }
}
