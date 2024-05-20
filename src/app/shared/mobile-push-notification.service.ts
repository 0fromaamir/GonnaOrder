import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { UpdateNotificationSubscriptions } from '../stores/+state/stores.actions';
import { Store } from '@ngrx/store';
import { LogService } from './logging/LogService';
import { ToastrService } from 'ngx-toastr';
import { NotificationSubscriptions } from './notifications';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';

@Injectable({
  providedIn: 'root'
})
export class MobilePushNotificationService {

  subscriptions: NotificationSubscriptions;
  firebaseX: FirebaseX;

  constructor(private store: Store<any>,
    private logger: LogService,
    private toastr: ToastrService,
    private swPush: SwPush
  ) {
    this.firebaseX = new FirebaseX();
    
    this.subscriptions = {};
  }

  isSupported(): boolean {
    try {
      return ('PushManager' in window || 'pushManager' in ServiceWorkerRegistration.prototype)
              && this.swPush.isEnabled
              && Notification.permission !== 'denied';
    } catch (e) {
      return false;
    }
  }

  isPermitted(): boolean {
    try {
      return ('PushManager' in window || 'pushManager' in ServiceWorkerRegistration.prototype)
              && this.swPush.isEnabled
              && Notification.permission === 'granted';
    } catch (e) {
      return false;
    }
  }

  checkPermission(): Observable<boolean> {
    return new Observable(observer => {
      this.firebaseX.hasPermission().then(hasPermission => {
        if (hasPermission) {
          this.firebaseX.getToken();
          observer.next(true);
          observer.complete();
        } else {
          this.firebaseX.grantPermission().then(result => {
            if (result) {
              observer.next(true);
              observer.complete();
            } else {
              observer.next(false);
              observer.complete();
            }
          });
        }
      }).catch(err => {
        observer.next(false);
        observer.complete();
      });
    })
  }

  requestPermission(): Observable<boolean> {
    return this.checkPermission();
  }

  init(subscriptions: any) {
    this.subscriptions = { ...subscriptions };
    for(let storeId in this.subscriptions) {
      this.logger.debug("subscribing to topic: ", environment.fcmTopicPrefix + this.subscriptions[storeId.toString()])
      this.firebaseX.subscribe(environment.fcmTopicPrefix + this.subscriptions[storeId.toString()]).then(result => {
        this.logger.debug("firebasex subscribe result: ", result)
      });
    }
    this.logger.debug('notification init: ', this.subscriptions);
  }

  addSubscription(storeId: number, storeAlias: string, subscriptions: any) {
    this.subscriptions = { ...subscriptions };
    
    if (Object.prototype.hasOwnProperty.call(this.subscriptions, storeId)) {
      this.logger.debug('notification duplicate subscription, removing subscription before add a new.', [this.subscriptions, storeId]);
      this.removeSubscription(storeId, subscriptions);
    }

    if (!Object.prototype.hasOwnProperty.call(this.subscriptions, storeId)) {
      this.logger.debug("subscribing to topic: ", environment.fcmTopicPrefix + storeAlias);
      this.firebaseX.subscribe(environment.fcmTopicPrefix + storeAlias).then(result => {
        this.logger.debug("firebasex subscribe result: ", result);
      });
      
      this.subscriptions[`${storeId}`] = storeAlias;
      this.store.dispatch(new UpdateNotificationSubscriptions(this.subscriptions));
      
    }
    return this.subscriptions;
  }

  removeSubscription(storeId: number, subscriptions: any) {
    this.subscriptions = { ...subscriptions };
    if (Object.prototype.hasOwnProperty.call(this.subscriptions, storeId)) {
      this.logger.debug("unsubscribing from topic: ", environment.fcmTopicPrefix + this.subscriptions[storeId.toString()]);
      this.firebaseX.unsubscribe(environment.fcmTopicPrefix + this.subscriptions[storeId.toString()]).then(result => {
        this.logger.debug("firebasex unsubscribe result: ", result)
      });
      
      delete this.subscriptions[`${storeId}`];

      this.logger.debug('notification subscription removed', this.subscriptions);
      this.store.dispatch(new UpdateNotificationSubscriptions(this.subscriptions));
    } else {
      this.logger.debug(`notification subscription with ${storeId} does not exist`, this.subscriptions);
    }
    return this.subscriptions;
  }
}
