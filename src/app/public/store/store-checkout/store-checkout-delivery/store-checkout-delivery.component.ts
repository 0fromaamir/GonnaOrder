import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LocationService } from 'src/app/public/location.service';
import { ClientStore, LocationValid, Order } from 'src/app/stores/stores';
import { UpdateDeliveryMethod, ValidateStoreLocations } from '../../+state/stores.actions';
import { Cart, OrderMetaData } from '../../+state/stores.reducer';
import {
  getCurrentOrderDeliveryMethod
} from '../../+state/stores.selectors';
import { CheckoutService, PICKUP_METHOD } from '../checkout.service';

@Component({
  selector: 'app-store-checkout-delivery',
  templateUrl: './store-checkout-delivery.component.html',
  styleUrls: ['./store-checkout-delivery.component.scss']
})
export class StoreCheckoutDeliveryComponent implements OnInit, OnDestroy {
  checkoutOptionsForm: FormGroup;
  checkoutStateData: {};
  selectedStore: ClientStore;
  cart$: Observable<Order>;
  cartData: Order;
  cartStatus: string;
  unsubscribe$: Subject<void> = new Subject<void>();
  orderMetaData: OrderMetaData;
  orderUuid: string;
  selectedPickupMethod: number;
  addToCartDisabled: boolean;
  addedToCart: boolean;
  storeLocation: string | number;
  validationTimer = null;
  validLocations: LocationValid = null;
  locationPersistedInMemory = false;
  PICKUP_METHOD = PICKUP_METHOD;
  isAdminOrderUpdate = true;
  deliveryMethod: string;

  @Output() scrollTo = new EventEmitter();
  @ViewChild('ShowMultipleChoice') ShowMultipleChoice: ElementRef;
  constructor(
    private fb: FormBuilder,
    private store: Store<Cart>,
    public checkoutService: CheckoutService,
    public location: LocationService,
    public router: Router,
  ) {
    this.isAdminOrderUpdate = this.location.isAdminOrderUpdate();
    this.checkoutOptionsForm = this.fb.group({
      receiveOrderType: [this.deliveryMethod, Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {

    if (this.checkoutService.ifOnlyInStore()
      || (this.checkoutService.showReadOnlyLocation())) {
      // I am sitting at a table/location
      if (
        isNaN(this.checkoutService.getPickupMethodAsInt()) ||
        this.checkoutService.getPickupMethodAsInt() !== PICKUP_METHOD.AT_LOCATION
      ) {
        this.setPickupMethod(PICKUP_METHOD.AT_LOCATION, true);
      }
    } else if (this.checkoutService.ifOnlySelfPickup()) {
      // I will pick it up my self
      if (
        isNaN(this.checkoutService.getPickupMethodAsInt()) ||
        this.checkoutService.getPickupMethodAsInt() !== PICKUP_METHOD.MY_SELF
      ) {
        this.setPickupMethod(PICKUP_METHOD.MY_SELF, true);
      }
    } else if (this.checkoutService.ifOnlyDeliveryToAddress()) {
      // delivery only to address
      if (
        isNaN(this.checkoutService.getPickupMethodAsInt()) ||
        this.checkoutService.getPickupMethodAsInt() !== PICKUP_METHOD.AT_ADDRESS
      ) {
        this.setPickupMethod(PICKUP_METHOD.AT_ADDRESS, true);
      }
    }

    if (
      isNaN(this.checkoutService.getPickupMethodAsInt()) &&
      this.location.getUrlStoreLocation() &&
      this.checkoutService.ifEnabledInStorePickup()
    ) {
      this.storeLocation = this.location.getUrlStoreLocation();
      // validate the location that is persisted in the  cart
      this.store.dispatch(new ValidateStoreLocations(this.checkoutService.selectedStore.id, this.storeLocation));

      this.checkoutService.setCheckoutState('storeLocation', this.storeLocation);

      this.setPickupMethod(PICKUP_METHOD.AT_LOCATION, true);
    }

    if (this.checkoutService.ifDeliveryMethodEnabled(this.checkoutService.selectedStore.settings.DEFAULT_DELIVERY_MODE)
      && isNaN(this.checkoutService.getPickupMethodAsInt())) {
        this.setPickupMethod(
          this.checkoutService.getPickupMethodAsIntFrom(this.checkoutService.selectedStore.settings.DEFAULT_DELIVERY_MODE),
          true
        );
      }

    if (this.checkoutService.orderMetaData && this.checkoutService.orderMetaData.data.deliveryMethod) {
      // deliveryMethod already persisted in OrderMetaData
      this.setPickupMethod(parseInt(this.checkoutService.orderMetaData.data.deliveryMethod, 10));
    }


    this.deliveryMethod = this.selectedPickupMethod?.toString();
    // set validation pickup rules:

    let slocation: string | number = '';
    if (this.checkoutService.orderMetaData && this.checkoutService.orderMetaData.data.deliveryMethod) {
      this.deliveryMethod = this.checkoutService.orderMetaData.data.deliveryMethod;
    }

    if (this.checkoutService.selectedPickupMethod === PICKUP_METHOD.AT_LOCATION
      && (this.checkoutService.getValidLocations() || this.checkoutService.storeLocation)) {
      this.deliveryMethod = PICKUP_METHOD.AT_LOCATION.toString();
      slocation = this.storeLocation;
      if (!location && this.checkoutService.getValidLocations()) {
        slocation = this.checkoutService.getValidLocations().label;
      }
    }

    this.checkoutOptionsForm = this.fb.group({
      receiveOrderType: [this.deliveryMethod, Validators.compose([Validators.required])],
    });

    this.store.pipe(
      takeUntil(this.unsubscribe$),
      select(getCurrentOrderDeliveryMethod))
      .subscribe((deliveryMethod) => {
        const receiveOrderTypeFormCtrl = this.getControl('receiveOrderType', 'checkoutOptionsForm') as FormControl;
        this.selectedPickupMethod = parseInt(deliveryMethod, 10);
        this.deliveryMethod = deliveryMethod;
        if (receiveOrderTypeFormCtrl && receiveOrderTypeFormCtrl.value !== this.selectedPickupMethod) {
          receiveOrderTypeFormCtrl.patchValue(this.deliveryMethod);
        }
      });

  } // EOF: ngOnInit


  setPickupMethod(id: number, persist = false, scrollto = false) {

    this.selectedPickupMethod = id;
    this.deliveryMethod = this.selectedPickupMethod.toString();

    if (persist && !this.isAdminOrderUpdate) {

      this.store.dispatch(new UpdateDeliveryMethod(id.toString(), {
        src: 'StoreCheckoutDeliveryComponent',
        description: 'Delivery method updated'
      }));

    }

    if (scrollto) {
      this.scrollTo.emit('');
    }

  }

  getControl(name: string, form: string = 'checkoutOptionsForm') {
    if (this[form]) {
      return this[form].get(name);
    }
    return null;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
