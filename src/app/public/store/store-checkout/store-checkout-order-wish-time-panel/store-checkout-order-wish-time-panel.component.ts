import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CheckoutService } from '../checkout.service';
import { select, Store } from '@ngrx/store';
import { CatalogState } from '../../+state/stores.reducer';
import {
  getCurrentCartStatus,
  getCurrentOrderDeliveryMethod,
  getCurrentOrderWishTime,
  getSelectedStore,
  getSelectedStoreOpeningHours,
  getSlots,
  getStoreOpenInDate,
  getStoreOpeningInfo,
  getUserLanguage
} from '../../+state/stores.selectors';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Availability, ClientStore, SpecialSchedule } from 'src/app/stores/stores';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';
import { AddCheckoutState, FetchSlots, SlotSelected } from '../../+state/stores.actions';
import { AvailableSlotsResponse, Slot } from '../../types/AvailableSlotsResponse';
import { DELIVERY_METHODS } from '../../types/DeliveryMethod';
import StoreUtils from '../../utils/StoreUtils';


@Component({
  selector: 'app-store-checkout-order-wish-time-panel',
  templateUrl: './store-checkout-order-wish-time-panel.component.html',
  styleUrls: ['./store-checkout-order-wish-time-panel.component.scss']
})
export class StoreCheckoutOrderWishTimePanelComponent implements OnInit, OnDestroy {

  DAYS_OF_WEEK = [ 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN' ];

  private destroy$ = new Subject();
  selectedStore: ClientStore;
  userLang$: Observable<string>;
  deliveryTime: Slot;
  mstep: any;
  wishForm: FormGroup;

  storeOpeningHours: SpecialSchedule;
  disableOrderNow = true;
  @Input() showClosedStoreMessage: boolean;
  @Output() showClosedStoreMessageChange = new EventEmitter<boolean>();

  currentWishTime: string = null;

  orderDeliveryMethod: string;
  slots: AvailableSlotsResponse;
  availableSlots: Slot[];
  skipScroll = false;

  @Output() scrollToWishComponent = new EventEmitter();
  @ViewChild('wishWrapper') wishWrapper: ElementRef;
  constructor(private store: Store<CatalogState>, private fb: FormBuilder, public checkoutService: CheckoutService) {
  }

  ngOnInit() {

    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(isBetween);

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getSelectedStore),
      filter(s => s != null)
    ).subscribe(store => {
      this.selectedStore = store;
    });

    this.userLang$  = this.store.select(getUserLanguage);
    this.wishForm = this.fb.group({
      wishOrderDeliveryTime: [ this.isAsapOrderEnabled() && !this.checkoutService.getOrderMetaData('wishTime') ? '0' : '1',
        Validators.compose([Validators.required])
      ],
      deliveryTime: [{}, Validators.compose([Validators.required])],
    });
    this.store.pipe(
      takeUntil(this.destroy$),
      select(getCurrentOrderDeliveryMethod),
    ).subscribe((deliveryMethod) => {
      if (!this.shouldShowFutureOrder()) {
        this.setWishTime(false);
      }
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getStoreOpeningInfo)
    ).subscribe(storeOpeningInfo => {
      const slots = storeOpeningInfo.slots;
      if (slots.selectedSlot && slots.selectedSlot.startTime !== '') {
        this.deliveryTime = slots.selectedSlot;
        this.availableSlots = slots.availableSlots;
        this.wishForm.patchValue({deliveryTime: this.deliveryTime});
        const evt = {
          src: 'StoreCheckoutOrderWishTimePanelComponent',
          description: 'Store opening info changed | selectedSlot exists'
        };
        // Convert to store timezone before submitting to backend
        this.checkoutService.setOrderMetaState('wishTime', dayjs(this.deliveryTime.startTime).toISOString(), evt);
        this.store.dispatch(new AddCheckoutState('timeSelectionValid', true, evt));
      } else {
        this.deliveryTime = {
          startTime: storeOpeningInfo.date,
          endTime: null,
          totalOrders: 0,
          isDisabled: false
        };
        this.availableSlots = [];
        if (this.checkoutService.getOrderMetaData('wishTime')) {
          this.store.dispatch(new AddCheckoutState('timeSelectionValid', false, {
            src: 'StoreCheckoutOrderWishTimePanelComponent',
            description: 'Store opening info changed | selectedSlot does not exist'
          }));
        }
      }
    });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getStoreOpenInDate),
      filter((openInDate) => openInDate != null),
    ).subscribe(openInDate => {
      if (!openInDate) {
        this.showClosedStoreMessage = true;
        this.showClosedStoreMessageChange.emit(true);
        this.store.dispatch(new AddCheckoutState('timeSelectionValid', false, {
          src: 'StoreCheckoutOrderWishTimePanelComponent',
          description: 'Store not open in date'
        }));
      } else {
        this.showClosedStoreMessage = false;
        this.showClosedStoreMessageChange.emit(false);
        this.store.dispatch(new AddCheckoutState('timeSelectionValid', true, {
          src: 'StoreCheckoutOrderWishTimePanelComponent',
          description: 'Store open in date'
        }));
      }
    });

    combineLatest([
      this.store.select(getStoreOpeningInfo),
      this.store.select(getCurrentCartStatus),
      this.store.select(getCurrentOrderDeliveryMethod),
      this.store.select(getCurrentOrderWishTime),
    ])
      .pipe(
        takeUntil(this.destroy$),
        filter(
          ([opening, cartStatus, orderDeliveryMethod]) =>
            !opening?.slots?.availableSlots?.length
            && opening?.date == null
            && cartStatus === 'LOADED'
            && orderDeliveryMethod != null
        )
      )
      .subscribe(([opening, cartStatus, orderDeliveryMethod, wishTime]) => {
        if (this.shouldShowFutureOrder()) {
          this.store.dispatch(
            new FetchSlots(
              this.selectedStore.id,
              DELIVERY_METHODS[orderDeliveryMethod],
              dayjs(wishTime?.replace('0Z', '')).format('YYYY-MM-DD'),
              {
                src: 'StoreCheckoutOrderWishTimePanelComponent',
                description: 'Cart loaded and no slots available',
              }
            )
          );
        }
      });

    this.store.pipe(
      takeUntil(this.destroy$),
      select(getCurrentOrderDeliveryMethod),
      filter(deliveryMethod => deliveryMethod != null),
      withLatestFrom(
        this.store.select(getSelectedStoreOpeningHours)
      )
    ).subscribe(([orderDeliveryMethod, openingHours]) => {

      if (!this.orderDeliveryMethod && orderDeliveryMethod && this.shouldShowAsapOrder() && !this.checkoutService.getOrderMetaData('wishTime')) {
        this.wishForm.patchValue({wishOrderDeliveryTime: '0'});
      }

      this.orderDeliveryMethod = orderDeliveryMethod;
      this.storeOpeningHours = openingHours;

      if (!openingHours) {
        this.disableOrderNow = false;
        return;
      }

      const openNow = this.checkoutService.isStoreOpen();

      if (!this.shouldShowAsapOrder() && !this.shouldShowFutureOrder()) {
        if (!openNow) {
          this.store.dispatch(new AddCheckoutState('timeSelectionValid', false, {
            src: 'StoreCheckoutOrderWishTimePanelComponent',
            description: 'Store not open in date | no options for Asap or Future'
          }));
          this.showClosedStoreMessage = true;
          return;
        } else {
          this.store.dispatch(new AddCheckoutState('timeSelectionValid', true, {
            src: 'StoreCheckoutOrderWishTimePanelComponent',
            description: 'Store open in date | no options for Asap or Future'
          }));
          this.showClosedStoreMessage = false;
          return;
        }
      }

      if (this.shouldShowFutureOrder()) {

        if (!openNow) {
          this.disableOrderNow = true;

          this.getControl('wishOrderDeliveryTime').setValue('1');

        } else {
          this.disableOrderNow = false;
        }
      } else {
        if (!openNow) {
          this.disableOrderNow = true;
          return;
        } else {
          this.disableOrderNow = false;
        }
      }

    });

    this.store.select(getCurrentOrderWishTime).pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.store.select(getStoreOpeningInfo)),
    ).subscribe(([wishTime, storeOpeningInfo]) => {
      this.currentWishTime = wishTime;
      if (wishTime && storeOpeningInfo.date === null) {
        if (this.shouldShowFutureOrder()) {
          this.store.dispatch(new FetchSlots(
            this.selectedStore.id,
            DELIVERY_METHODS[this.orderDeliveryMethod],
            dayjs(wishTime).format('YYYY-MM-DD'),
            {
              src: 'StoreCheckoutOrderWishTimePanelComponent',
              description: 'Changes in wishTime, storeOpeningInfo'
            }));
        }
      }

      if(wishTime && (!this.shouldShowComponent() || this.wishForm?.controls['wishOrderDeliveryTime']?.value ==='0')){
        this.setWishTime(false);
      }
    });
  }

  compareSlotsFunction(optionOne: Slot, optionTwo: Slot) {
    return optionOne.startTime === optionTwo.startTime;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  shouldShowComponent(): boolean {
    // If wish date per order item is enabled then do not show the component
    if (this.selectedStore.settings.WISH_DATE_PER_ORDER_ITEM === 'ENABLED'){
      return false;
    }

    // If not delivery method selected yet then do not show the component
    if (this.checkoutService.getPickupMethod() === undefined) {
      return false;
    }
    if (!this.shouldShowFutureOrder()) {
      return false;
    }
    // If no options for Asap or Future is shown then by default ASAP is assumed and component should not be shown
    // except for the case where store is currently closed where we show the component to print out an error to the user
    if (!this.shouldShowAsapOrder() && this.showClosedStoreMessage) {
      return true;
    }
    return this.shouldShowAsapOrder() || this.shouldShowFutureOrder();
  }

  /**
   * Show asap order option if it applies
   */
  shouldShowAsapOrder(): boolean {
    // If no order receive option is selected, then do not show the component
    if (this.checkoutService.getPickupMethod() === undefined) {
      return false;
    }

    const result = this.isAsapOrderEnabled();
    if (!result && this.wishForm) {
      this.wishForm.patchValue({wishOrderDeliveryTime: '1'});
    }

    return result;

  }

  isAsapOrderEnabled() {
    return StoreUtils.isAsapOrderEnabled(this.selectedStore, DELIVERY_METHODS[this.checkoutService.getPickupMethodAsInt()]);
  }

  shouldShowFutureOrder(): boolean {
    // If no order receive option is selected, then do not show the component
    if (this.checkoutService.getPickupMethod() === undefined) {
      return false;
    }

    return StoreUtils.isFutureOrderEnabled(this.selectedStore, DELIVERY_METHODS[this.checkoutService.getPickupMethodAsInt()]);
  }

  onDateChanged(date: Slot) {
    this.deliveryTime = date;
    this.store.dispatch(new FetchSlots(
      this.selectedStore.id,
      DELIVERY_METHODS[this.orderDeliveryMethod],
      this.deliveryTime.startTime,
      {
        src: 'StoreCheckoutOrderWishTimePanelComponent',
        description: 'Date changed'
      }
      ));
  }

  onSelectedSlotChanged(selectedSlot: Slot) {
    this.deliveryTime = selectedSlot;
    if (!this.deliveryTime.startTime) {return; }
    this.checkoutService.setOrderMetaState('wishTime', dayjs(this.deliveryTime.startTime).toISOString(), {
      src: 'StoreCheckoutOrderWishTimePanelComponent',
      description: 'Selected slot changed'
    });
    this.store.dispatch(new SlotSelected(selectedSlot));
    !this.skipScroll && this.scrollToWishComponent.emit('');
    this.skipScroll = false;
  }

  setWishTime(enableWishTime: boolean) {
    if (enableWishTime) {
      if (!this.currentWishTime) {
        this.store.dispatch(new FetchSlots(
          this.selectedStore.id,
          DELIVERY_METHODS[this.orderDeliveryMethod],
          null,
          {
            src: 'StoreCheckoutOrderWishTimePanelComponent',
            description: 'Wish time set'
          }));
      }
      this.scrollToWishComponent.emit('');
    } else {
      const evt = {
        src: 'StoreCheckoutOrderWishTimePanelComponent',
        description: 'Set wish time to null'
      };
      this.checkoutService.setOrderMetaState('wishTime', null, evt);
      this.store.dispatch(new AddCheckoutState('timeSelectionValid', true, evt));
    }
  }

  getControl(name: string) {
    if (this.wishForm) {
      return this.wishForm.get(name);
    }
    return null;
  }

}
